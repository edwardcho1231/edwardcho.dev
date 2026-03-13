"use client";

import type { CSSProperties } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

type MarkdownPreviewProps = {
  content: string;
  className?: string;
  clampLines?: number;
  fallback?: string;
};

export function MarkdownPreview({
  content,
  className = "",
  clampLines,
  fallback,
}: MarkdownPreviewProps) {
  const normalized = content?.trim() ?? "";
  const fallbackText = fallback?.trim() || "No content";
  const maxHeight = clampLines
    ? {
        maxHeight: `${clampLines * 1.25}rem`,
        overflow: "hidden",
      } as CSSProperties
    : undefined;

  if (!normalized) {
    return (
      <p className={`text-sm text-[var(--app-muted)] ${className}`}>{fallbackText}</p>
    );
  }

  return (
    <div
      className={`markdown-preview prose prose-sm max-w-none ${className}`}
      style={maxHeight}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeSanitize]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
