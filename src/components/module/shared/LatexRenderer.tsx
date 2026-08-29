/**
 * @file LatexRenderer.tsx
 * @description High-performance KaTeX renderer for math & science formulas and rich text.
 * Supports inline `$ ... $` / `\( ... \)` and block `$$ ... $$` / `\[ ... \]` LaTeX equations.
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface LatexRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * Renders LaTeX formulas within text safely using KaTeX.
 */
export function LatexRenderer({ content, className = "", inline = false }: LatexRendererProps) {
  const renderedElements = useMemo(() => {
    if (!content) return null;

    // Tokenize text to extract block math ($$ ... $$ or \[ ... \]), inline math ($ ... $ or \( ... \)), and plain text
    const parts: { type: "text" | "inline-math" | "block-math"; value: string }[] = [];

    // Regex to match block math ($$...$$ or \[...\]) and inline math ($...$ or \(...\))
    // Note: avoid matching escaped dollars \$, or double dollars as single
    const mathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$(?!\$)(?:\\\$|[^\$])+?\$|\\\([\s\S]*?\\\))/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = mathRegex.exec(content)) !== null) {
      // Push preceding text
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          value: content.substring(lastIndex, match.index),
        });
      }

      const matchStr = match[0];
      if (matchStr.startsWith("$$") && matchStr.endsWith("$$")) {
        parts.push({
          type: "block-math",
          value: matchStr.slice(2, -2).trim(),
        });
      } else if (matchStr.startsWith("\\[") && matchStr.endsWith("\\]")) {
        parts.push({
          type: "block-math",
          value: matchStr.slice(2, -2).trim(),
        });
      } else if (matchStr.startsWith("$") && matchStr.endsWith("$")) {
        parts.push({
          type: "inline-math",
          value: matchStr.slice(1, -1).trim(),
        });
      } else if (matchStr.startsWith("\\(") && matchStr.endsWith("\\)")) {
        parts.push({
          type: "inline-math",
          value: matchStr.slice(2, -2).trim(),
        });
      }

      lastIndex = match.index + matchStr.length;
    }

    // Push remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        value: content.substring(lastIndex),
      });
    }

    return parts.map((part, index) => {
      if (part.type === "block-math" || part.type === "inline-math") {
        const isDisplayMode = part.type === "block-math" && !inline;
        try {
          const html = katex.renderToString(part.value, {
            displayMode: isDisplayMode,
            throwOnError: false,
            output: "htmlAndMathml",
          });

          return (
            <span
              key={index}
              className={isDisplayMode ? "my-2 block overflow-x-auto text-center" : "inline-block px-0.5"}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          // Fallback if KaTeX fails
          return (
            <code key={index} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-rose-500">
              {part.value}
            </code>
          );
        }
      }

      // Plain text with line breaks handling
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part.value}
        </span>
      );
    });
  }, [content, inline]);

  if (!content) return null;

  return <span className={`inline-latex-container ${className}`}>{renderedElements}</span>;
}
