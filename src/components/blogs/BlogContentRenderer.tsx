"use client";

import React from "react";
import { Lightbulb, CheckCircle2 } from "lucide-react";

interface BlogContentRendererProps {
  content?: string;
  className?: string;
}

// Helper to format inline bold (**text**) and italics (*text*)
function renderFormattedInlineText(text: string) {
  if (!text) return null;

  // Split by **bold** markers
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export const BlogContentRenderer: React.FC<BlogContentRendererProps> = ({
  content,
  className = "",
}) => {
  if (!content || !content.trim()) {
    return <p className="text-xs text-slate-400 italic">No content entered yet.</p>;
  }

  // Split by double linebreaks or markdown section headers
  const rawBlocks = content.split(/\n\n+/);

  return (
    <div className={`space-y-4 text-slate-700 font-sans ${className}`}>
      {rawBlocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // 1. Heading 2 / 3
        if (trimmed.startsWith("### ") || trimmed.startsWith("## ")) {
          const headingText = trimmed.replace(/^###?\s+/, "");
          return (
            <div key={bIdx} className="pt-2">
              <h3 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E] leading-snug flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0"></span>
                <span>{headingText}</span>
              </h3>
            </div>
          );
        }

        // 2. Callout / Pro Tip (> 💡 or >)
        if (trimmed.startsWith(">")) {
          const calloutText = trimmed.replace(/^>\s*(💡\s*)?/, "");
          return (
            <div
              key={bIdx}
              className="my-3 p-3.5 sm:p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 flex items-start gap-3 shadow-2xs"
            >
              <div className="p-1.5 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div className="text-xs sm:text-sm font-medium leading-relaxed">
                <p className="font-bold text-amber-900 text-xs mb-0.5 uppercase tracking-wide">Pro Tip / Key Insight</p>
                <p>{renderFormattedInlineText(calloutText)}</p>
              </div>
            </div>
          );
        }

        // 3. Bullet Point List (multiple lines starting with - or * or •)
        const lines = trimmed.split("\n");
        const isBulletList = lines.every((l) => {
          const lt = l.trim();
          return !lt || lt.startsWith("- ") || lt.startsWith("* ") || lt.startsWith("• ");
        });

        if (isBulletList) {
          const bullets = lines
            .map((l) => l.trim().replace(/^[-*•]\s*/, ""))
            .filter((l) => l.length > 0);

          return (
            <ul key={bIdx} className="space-y-2 my-3 pl-1 sm:pl-2">
              {bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100/90 text-orange-600 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                  <span className="flex-1">{renderFormattedInlineText(bullet)}</span>
                </li>
              ))}
            </ul>
          );
        }

        // 4. Standard Paragraph
        return (
          <p key={bIdx} className="text-xs sm:text-sm leading-relaxed text-slate-700">
            {renderFormattedInlineText(trimmed)}
          </p>
        );
      })}
    </div>
  );
};
