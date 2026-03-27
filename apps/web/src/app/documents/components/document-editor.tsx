"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type DocumentDto, type DocumentKind } from "@/types/documents";
import {
  type CreateDocumentPayload,
  type PublishDocumentPayload,
} from "../payload-types";
import { DocumentEditorUI } from "./document-editor-ui";

const MAX_CONTENT_LENGTH = 10000;
const MAX_EXCERPT_LENGTH = 300;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type DocumentEditorProps = {
  canSubmit: boolean;
  isBusy: boolean;
  isSubmitting: boolean;
  isPublishing: boolean;
  isUnpublishing: boolean;
  isPublisher: boolean;
  editorDocument: DocumentDto | null;
  error: string | null;
  onSubmitDocument: (
    payload: CreateDocumentPayload,
    documentId?: string,
  ) => Promise<boolean>;
  onPublishDocument: (
    documentId: string,
    payload: PublishDocumentPayload,
  ) => Promise<boolean>;
  onUnpublishDocument: (documentId: string) => Promise<boolean>;
  onCancelEdit: () => void;
};

export function DocumentEditor({
  canSubmit,
  isBusy,
  isSubmitting,
  isPublishing,
  isUnpublishing,
  isPublisher,
  editorDocument,
  error,
  onSubmitDocument,
  onPublishDocument,
  onUnpublishDocument,
  onCancelEdit,
}: DocumentEditorProps) {
  const [title, setTitle] = useState(
    () => editorDocument?.latestRevision?.title ?? "",
  );
  const [content, setContent] = useState(
    () => editorDocument?.latestRevision?.content ?? "",
  );
  const [kind, setKind] = useState<DocumentKind>(
    editorDocument?.kind ?? "BLOG",
  );
  const [slug, setSlug] = useState(
    () =>
      editorDocument?.slug ??
      slugify(editorDocument?.latestRevision?.title ?? ""),
  );
  const [excerpt, setExcerpt] = useState(() => editorDocument?.excerpt ?? "");

  const isEditing = editorDocument !== null;
  const normalizedSlug = slug.trim().toLowerCase();
  const normalizedExcerpt = excerpt.trim();
  const isSlugValid = SLUG_REGEX.test(normalizedSlug);
  const isSubmitDisabled =
    !canSubmit ||
    isBusy ||
    title.trim().length === 0 ||
    content.trim().length === 0 ||
    content.length > MAX_CONTENT_LENGTH;
  const isPublishDisabled =
    !isEditing ||
    !isPublisher ||
    isBusy ||
    normalizedSlug.length === 0 ||
    !isSlugValid ||
    normalizedExcerpt.length > MAX_EXCERPT_LENGTH;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitDisabled) {
      return;
    }

    const normalizedTitle = title.trim();
    const normalizedContent = content.trim();
    const didSave = await onSubmitDocument(
      {
        title: normalizedTitle,
        content: normalizedContent,
      },
      editorDocument?.id,
    );

    if (!didSave) {
      return;
    }
    setTitle("");
    setContent("");
  };

  const handlePublish = async () => {
    if (!editorDocument || isPublishDisabled) {
      return;
    }

    await onPublishDocument(editorDocument.id, {
      kind,
      slug: normalizedSlug,
      excerpt: normalizedExcerpt.length > 0 ? normalizedExcerpt : undefined,
    });
  };

  const handleUnpublish = async () => {
    if (!editorDocument || !isEditing || !isPublisher || isBusy) {
      return;
    }

    await onUnpublishDocument(editorDocument.id);
  };

  return (
    <div className="space-y-4">
      <DocumentEditorUI
        title={title}
        content={content}
        isEditing={isEditing}
        isBusy={isBusy}
        isSubmitDisabled={isSubmitDisabled}
        submitting={isSubmitting}
        error={error}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onSubmit={handleSubmit}
        onCancelEdit={isEditing ? onCancelEdit : undefined}
        submitButtonText={isEditing ? "Update Document" : "Create Document"}
        submitBusyText={isEditing ? "Updating..." : "Creating..."}
        maxLength={MAX_CONTENT_LENGTH}
      />

      {isEditing && isPublisher && editorDocument ? (
        <section className="space-y-4 rounded-md border border-[var(--app-border)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--app-muted)]">
              Publishing
            </h3>
            <Badge
              variant={
                editorDocument.status === "PUBLISHED" ? "success" : "muted"
              }
              className="py-1 text-xs"
            >
              {editorDocument.status}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="publish-kind">Kind</Label>
              <select
                id="publish-kind"
                className="h-9 w-full rounded-md border border-[var(--app-border)] bg-transparent px-3 text-sm"
                value={kind}
                onChange={(event) =>
                  setKind(event.target.value as DocumentKind)
                }
                disabled={isBusy}
              >
                <option value="BLOG">Blog</option>
                <option value="PROJECT">Project</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="publish-slug">Slug</Label>
              <Input
                id="publish-slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value.toLowerCase())}
                placeholder="my-post-slug"
                disabled={isBusy}
              />
              {!isSlugValid && normalizedSlug.length > 0 ? (
                <p className="text-xs text-red-600">
                  Use lowercase letters, numbers, and single hyphens only.
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="publish-excerpt">Excerpt (optional)</Label>
            <Textarea
              id="publish-excerpt"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              rows={3}
              maxLength={MAX_EXCERPT_LENGTH}
              placeholder="Short summary shown in blog/project listings."
              disabled={isBusy}
            />
            <p className="text-xs text-[var(--app-muted)]">
              {excerpt.length}/{MAX_EXCERPT_LENGTH}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handlePublish}
              disabled={isPublishDisabled}
            >
              {isPublishing ? "Publishing..." : "Publish"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleUnpublish}
              disabled={isBusy}
            >
              {isUnpublishing ? "Unpublishing..." : "Unpublish"}
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
