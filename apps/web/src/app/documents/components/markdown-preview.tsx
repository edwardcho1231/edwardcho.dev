"use client";

import type { CSSProperties } from "react";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

type MarkdownPreviewProps = {
  content: string;
  className?: string;
  clampLines?: number;
  fallback?: string;
};

const markdownSanitizeSchema = {
  ...defaultSchema,
  protocols: {
    ...defaultSchema.protocols,
    src: [...(defaultSchema.protocols?.src ?? []), "blob"],
  },
};

function markdownUrlTransform(
  url: string,
  key: string,
  node: { tagName?: string },
) {
  if (key === "src" && node.tagName === "img" && /^blob:/i.test(url)) {
    return url;
  }

  return defaultUrlTransform(url);
}

export function MarkdownPreview({
  content,
  className = "",
  clampLines,
  fallback,
}: MarkdownPreviewProps) {
  const normalized = content?.trim() ?? "";
  const fallbackText = fallback?.trim() || "No content";
  const maxHeight = clampLines
    ? ({
        maxHeight: `${clampLines * 1.25}rem`,
        overflow: "hidden",
      } as CSSProperties)
    : undefined;

  if (!normalized) {
    return (
      <p className={`text-sm text-[var(--app-muted)] ${className}`}>
        {fallbackText}
      </p>
    );
  }

  return (
    <div
      className={`markdown-preview prose prose-sm max-w-none break-words [overflow-wrap:anywhere] prose-code:before:content-none prose-code:after:content-none ${className}`}
      style={maxHeight}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[[rehypeSanitize, markdownSanitizeSchema]]}
        urlTransform={markdownUrlTransform}
        components={{
          pre: ({ node: _node, ...props }) => (
            <pre
              className="overflow-x-auto rounded-md bg-[var(--app-surface-alt)] p-3 text-sm leading-6 text-[var(--app-foreground)]"
              {...props}
            />
          ),
          h1: ({ node: _node, ...props }) => (
            <h1 className="mt-4 mb-2 text-2xl font-semibold" {...props} />
          ),
          h2: ({ node: _node, ...props }) => (
            <h2 className="mt-3 mb-2 text-xl font-semibold" {...props} />
          ),
          h3: ({ node: _node, ...props }) => (
            <h3 className="mt-3 mb-1.5 text-lg font-semibold" {...props} />
          ),
          p: ({ node: _node, ...props }) => (
            <p className="mt-2 leading-7" {...props} />
          ),
          a: ({ node: _node, ...props }) => (
            <a
              className="text-[var(--app-link-hover)] underline underline-offset-2"
              {...props}
            />
          ),
          img: ({ node: _node, alt, ...props }) => (
            <img
              alt={alt || ""}
              loading="lazy"
              className="my-4 h-auto max-w-full rounded-md"
              {...props}
            />
          ),
          ul: ({ node: _node, ...props }) => (
            <ul className="my-3 list-disc pl-6" {...props} />
          ),
          ol: ({ node: _node, ...props }) => (
            <ol className="my-3 list-decimal pl-6" {...props} />
          ),
          li: ({ node: _node, ...props }) => <li className="mt-1" {...props} />,
          blockquote: ({ node: _node, ...props }) => (
            <blockquote
              className="my-3 border-l-2 border-[var(--app-border)] pl-3 text-[var(--app-muted)]"
              {...props}
            />
          ),
          code: ({ node: _node, className, ...props }) => (
            <code
              className={`break-words [overflow-wrap:anywhere] rounded bg-[var(--app-surface-alt)] px-1.5 py-0.5 font-mono text-sm text-[var(--app-foreground)] ${
                className ?? ""
              }`}
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
