"use client";

import { FormEvent, useState } from "react";
import { type CreateDocumentPayload, type Document } from "../types";
import { DocumentEditorUI } from "./document-editor-ui";

const MAX_CONTENT_LENGTH = 5000;

type DocumentEditorProps = {
  canSubmit: boolean;
  isBusy: boolean;
  isSubmitting: boolean;
  editorDocument: Document | null;
  error: string | null;
  onSubmitDocument: (
    payload: CreateDocumentPayload,
    documentId?: string,
  ) => Promise<boolean>;
  onCancelEdit: () => void;
};

export function DocumentEditor({
  canSubmit,
  isBusy,
  isSubmitting,
  editorDocument,
  error,
  onSubmitDocument,
  onCancelEdit,
}: DocumentEditorProps) {
  const [title, setTitle] = useState(() => editorDocument?.latestRevision?.title ?? "");
  const [content, setContent] = useState(() => editorDocument?.latestRevision?.content ?? "");

  const isEditing = editorDocument !== null;
  const isSubmitDisabled =
    !canSubmit ||
    isBusy ||
    title.trim().length === 0 ||
    content.trim().length === 0 ||
    content.length > MAX_CONTENT_LENGTH;

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

  return (
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
  );
}
