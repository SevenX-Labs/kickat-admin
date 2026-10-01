"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Layers,
  Code,
  Eye,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  Sparkles,
  Lightbulb,
  ListPlus,
  X,
  AlignLeft,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { BlogContentRenderer } from "./BlogContentRenderer";

export interface BlogSectionItem {
  id: string;
  heading: string;
  body: string;
  bullets: string[];
  callout: string;
  hasCallout?: boolean;
}

interface BlogSectionEditorProps {
  value: string;
  onChange: (content: string) => void;
  required?: boolean;
}

function generateId(): string {
  return `sec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function createEmptySection(headingPrefix: string = ""): BlogSectionItem {
  return {
    id: generateId(),
    heading: headingPrefix,
    body: "",
    bullets: [""],
    callout: "",
    hasCallout: false,
  };
}

// Convert Structured Sections to clean Markdown string
export function sectionsToMarkdown(sections: BlogSectionItem[]): string {
  const chunks: string[] = [];

  for (const sec of sections) {
    const parts: string[] = [];

    // 1. Heading
    if (sec.heading && sec.heading.trim()) {
      parts.push(`### ${sec.heading.trim()}`);
    }

    // 2. Paragraph Body
    if (sec.body && sec.body.trim()) {
      parts.push(sec.body.trim());
    }

    // 3. Bullet Points
    const cleanBullets = (sec.bullets || [])
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    if (cleanBullets.length > 0) {
      parts.push(cleanBullets.map((b) => `- ${b}`).join("\n"));
    }

    // 4. Pro Tip / Callout
    if (sec.callout && sec.callout.trim()) {
      const cleanCallout = sec.callout.trim().replace(/^>\s*(💡\s*)?/, "");
      parts.push(`> 💡 ${cleanCallout}`);
    }

    if (parts.length > 0) {
      chunks.push(parts.join("\n\n"));
    }
  }

  return chunks.join("\n\n");
}

// Parse Markdown string into Structured Sections
export function markdownToSections(markdown: string): BlogSectionItem[] {
  if (!markdown || !markdown.trim()) {
    return [createEmptySection()];
  }

  // Split content by headings (### or ##)
  const blocks = markdown.split(/(?=^###?\s+)/m);
  const result: BlogSectionItem[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    let heading = "";
    const bodyParts: string[] = [];
    const bullets: string[] = [];
    let callout = "";

    const lines = trimmed.split("\n");
    let lineIdx = 0;

    // Check heading
    if (lines[0].startsWith("### ") || lines[0].startsWith("## ")) {
      heading = lines[0].replace(/^###?\s+/, "").trim();
      lineIdx = 1;
    }

    let currentParagraph: string[] = [];

    for (; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        if (currentParagraph.length > 0) {
          bodyParts.push(currentParagraph.join(" "));
          currentParagraph = [];
        }
        continue;
      }

      if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ") || trimmedLine.startsWith("• ")) {
        if (currentParagraph.length > 0) {
          bodyParts.push(currentParagraph.join(" "));
          currentParagraph = [];
        }
        bullets.push(trimmedLine.replace(/^[-*•]\s*/, "").trim());
      } else if (trimmedLine.startsWith(">")) {
        if (currentParagraph.length > 0) {
          bodyParts.push(currentParagraph.join(" "));
          currentParagraph = [];
        }
        const tipText = trimmedLine.replace(/^>\s*(💡\s*)?/, "").trim();
        callout = callout ? `${callout} ${tipText}` : tipText;
      } else {
        currentParagraph.push(trimmedLine);
      }
    }

    if (currentParagraph.length > 0) {
      bodyParts.push(currentParagraph.join(" "));
    }

    result.push({
      id: generateId(),
      heading,
      body: bodyParts.join("\n\n"),
      bullets: bullets.length > 0 ? bullets : [""],
      callout,
      hasCallout: Boolean(callout.trim()),
    });
  }

  return result.length > 0 ? result : [createEmptySection()];
}

export const BlogSectionEditor: React.FC<BlogSectionEditorProps> = ({
  value,
  onChange,
  required = false,
}) => {
  const [activeTab, setActiveTab] = useState<"sections" | "raw" | "preview">("sections");
  const [sections, setSections] = useState<BlogSectionItem[]>(() => markdownToSections(value));
  const isInternalChange = useRef(false);

  // Sync external value -> internal sections
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    setSections(markdownToSections(value));
  }, [value]);

  const updateSectionsAndEmit = useCallback(
    (newSections: BlogSectionItem[]) => {
      setSections(newSections);
      isInternalChange.current = true;
      const md = sectionsToMarkdown(newSections);
      onChange(md);
    },
    [onChange]
  );

  // Section Manipulation Handlers
  const handleAddSection = () => {
    const nextNum = sections.length + 1;
    const newSec = createEmptySection(`Section ${nextNum}: `);
    updateSectionsAndEmit([...sections, newSec]);
  };

  const handleDeleteSection = (index: number) => {
    if (sections.length <= 1) {
      // Keep at least one empty section
      updateSectionsAndEmit([createEmptySection()]);
      return;
    }
    const updated = sections.filter((_, i) => i !== index);
    updateSectionsAndEmit(updated);
  };

  const handleDuplicateSection = (index: number) => {
    const target = sections[index];
    const duplicated: BlogSectionItem = {
      ...target,
      id: generateId(),
      heading: target.heading ? `${target.heading} (Copy)` : "",
      bullets: [...(target.bullets || [""])],
    };
    const updated = [...sections];
    updated.splice(index + 1, 0, duplicated);
    updateSectionsAndEmit(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(index - 1, 0, moved);
    updateSectionsAndEmit(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const updated = [...sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(index + 1, 0, moved);
    updateSectionsAndEmit(updated);
  };

  const handleSectionFieldChange = (
    index: number,
    field: keyof BlogSectionItem,
    fieldVal: unknown
  ) => {
    const updated = sections.map((sec, i) => {
      if (i === index) {
        return { ...sec, [field]: fieldVal };
      }
      return sec;
    });
    updateSectionsAndEmit(updated);
  };

  // Bullet Point handlers for a specific section
  const handleBulletChange = (secIndex: number, bulletIndex: number, bulletVal: string) => {
    const sec = sections[secIndex];
    const newBullets = [...(sec.bullets || [])];
    newBullets[bulletIndex] = bulletVal;
    handleSectionFieldChange(secIndex, "bullets", newBullets);
  };

  const handleAddBullet = (secIndex: number) => {
    const sec = sections[secIndex];
    const newBullets = [...(sec.bullets || []), ""];
    handleSectionFieldChange(secIndex, "bullets", newBullets);
  };

  const handleRemoveBullet = (secIndex: number, bulletIndex: number) => {
    const sec = sections[secIndex];
    const newBullets = (sec.bullets || []).filter((_, bIdx) => bIdx !== bulletIndex);
    handleSectionFieldChange(
      secIndex,
      "bullets",
      newBullets.length > 0 ? newBullets : [""]
    );
  };

  const handleApplyTemplate = () => {
    const starterSections: BlogSectionItem[] = [
      {
        id: generateId(),
        heading: "1. Overview & Key Nutritional Context",
        body: "Provide a clear introduction explaining why this topic is essential for pet wellness and daily care.",
        bullets: [
          "Supports optimal digestion and gut microbiome balance",
          "Fortified with essential vitamins, minerals, and taurine",
          "Free from artificial fillers, corn, and soy byproducts",
        ],
        callout: "Always consult your certified veterinary nutritionist before making sudden switches to your pet diet.",
        hasCallout: true,
      },
      {
        id: generateId(),
        heading: "2. Step-by-Step Feeding & Daily Routine Guide",
        body: "Break down the exact steps pet parents should follow to achieve the best results.",
        bullets: [
          "Day 1-3: 75% previous food + 25% new food",
          "Day 4-6: 50% previous food + 50% new food",
          "Day 7+: 100% new wholesome food transition complete",
        ],
        callout: "Keep plenty of fresh, filtered water available at all times throughout the transition.",
        hasCallout: true,
      },
      {
        id: generateId(),
        heading: "3. Key Takeaways & Summary",
        body: "Summarize the core recommendations and invite readers to explore related nutrition guides.",
        bullets: [
          "Monitor weight and coat vitality weekly",
          "Store all dry kibble in airtight containers away from humidity",
        ],
        callout: "",
        hasCallout: false,
      },
    ];
    updateSectionsAndEmit(starterSections);
  };

  return (
    <div className="space-y-3">
      {/* Editor Top Bar & View Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-orange-600" />
            <span>Article Body & Sections {required && "*"}</span>
          </span>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {sections.length} {sections.length === 1 ? "Section" : "Sections"}
          </span>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("sections")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === "sections"
                ? "bg-white text-orange-600 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Structured Sections</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("raw")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === "raw"
                ? "bg-white text-orange-600 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            <span>Raw Markdown</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === "preview"
                ? "bg-white text-orange-600 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          TAB 1: STRUCTURED SECTIONS BUILDER
          ========================================================= */}
      {activeTab === "sections" && (
        <div className="space-y-3.5">
          {/* Quick Starter Helper if empty */}
          {sections.length === 1 && !sections[0].heading && !sections[0].body && (
            <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-xs text-orange-950 font-medium">
                <Sparkles className="h-4 w-4 text-orange-600 shrink-0" />
                <span>Want a pre-structured template with headings, bullets, and pro-tips?</span>
              </div>
              <button
                type="button"
                onClick={handleApplyTemplate}
                className="clay-button px-3 py-1.5 text-xs font-bold text-orange-700 hover:text-orange-900 transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Sparkles className="h-3 w-3" />
                <span>Load Starter Template</span>
              </button>
            </div>
          )}

          {/* List of Sections */}
          <div className="space-y-3.5">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                className="rounded-2xl bg-[#FCFAF8] border border-orange-100/90 p-3.5 sm:p-4 shadow-xs space-y-3 relative transition-all hover:border-orange-200"
              >
                {/* Section Header Controls */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-orange-100/60">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-600 text-white text-[11px] font-black shadow-2xs">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {sec.heading ? sec.heading : `Section #${idx + 1}`}
                    </span>
                  </div>

                  {/* Move, Duplicate, Delete Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveUp(idx)}
                      title="Move Section Up"
                      className="h-7 w-7 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={idx === sections.length - 1}
                      onClick={() => handleMoveDown(idx)}
                      title="Move Section Down"
                      className="h-7 w-7 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicateSection(idx)}
                      title="Duplicate Section"
                      className="h-7 w-7 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-orange-600 flex items-center justify-center transition cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSection(idx)}
                      title="Delete Section"
                      className="h-7 w-7 rounded-lg bg-white border border-rose-200 text-rose-500 hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* 1. Section Heading */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Section Heading / Title (H3)
                  </label>
                  <input
                    type="text"
                    value={sec.heading}
                    onChange={(e) => handleSectionFieldChange(idx, "heading", e.target.value)}
                    placeholder={`e.g. ${idx + 1}. Why Raw & Kibble Balance Matters`}
                    className="w-full rounded-xl bg-white border border-slate-200/90 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition min-h-[38px]"
                  />
                </div>

                {/* 2. Section Body Paragraph */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Section Body Paragraph (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={sec.body}
                    onChange={(e) => handleSectionFieldChange(idx, "body", e.target.value)}
                    placeholder="Write detailed explanations, background insights, or narrative for this section..."
                    className="w-full rounded-xl bg-white border border-slate-200/90 p-2.5 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition leading-relaxed"
                  />
                </div>

                {/* 3. Bullet Points List */}
                <div className="space-y-2 pt-1 border-t border-orange-100/50">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <ListPlus className="h-3.5 w-3.5 text-orange-600" />
                      <span>Key Highlights & Bullet Points</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAddBullet(idx)}
                      className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Bullet</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {(sec.bullets && sec.bullets.length > 0 ? sec.bullets : [""]).map(
                      (bullet, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0 ml-1"></span>
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => handleBulletChange(idx, bIdx, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddBullet(idx);
                              }
                            }}
                            placeholder={`e.g. Point ${bIdx + 1}: High quality protein with zero preservatives...`}
                            className="flex-1 rounded-xl bg-white border border-slate-200/90 px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition min-h-[34px]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveBullet(idx, bIdx)}
                            title="Remove bullet"
                            className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer shrink-0"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* 4. Optional Pro Tip / Callout Box */}
                <div className="pt-1 border-t border-orange-100/50">
                  {!sec.hasCallout && !sec.callout ? (
                    <button
                      type="button"
                      onClick={() => handleSectionFieldChange(idx, "hasCallout", true)}
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer py-1"
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      <span>+ Add Highlight Note / Pro-Tip Box</span>
                    </button>
                  ) : (
                    <div className="space-y-1.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                          <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                          <span>Pro-Tip / Highlight Note</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            handleSectionFieldChange(idx, "callout", "");
                            handleSectionFieldChange(idx, "hasCallout", false);
                          }}
                          className="text-[10px] font-bold text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        >
                          Remove Note
                        </button>
                      </div>
                      <input
                        type="text"
                        value={sec.callout}
                        onChange={(e) => handleSectionFieldChange(idx, "callout", e.target.value)}
                        placeholder="e.g. Always consult your veterinarian before altering portion sizes."
                        className="w-full rounded-lg bg-white border border-amber-200 px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition min-h-[34px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Section Button */}
          <button
            type="button"
            onClick={handleAddSection}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/40 hover:bg-orange-50/80 text-orange-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.99]"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Another Section to Article</span>
          </button>
        </div>
      )}

      {/* =========================================================
          TAB 2: RAW MARKDOWN EDITOR
          ========================================================= */}
      {activeTab === "raw" && (
        <div className="space-y-2">
          <textarea
            rows={12}
            value={value}
            onChange={(e) => {
              isInternalChange.current = true;
              onChange(e.target.value);
              setSections(markdownToSections(e.target.value));
            }}
            placeholder="Write markdown with ### Headings, - Bullet points, and > Pro Tips..."
            className="w-full rounded-2xl bg-[#F8F5F1] border border-slate-200/90 p-3.5 text-xs font-mono text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition leading-relaxed"
            required={required}
          />
          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Code className="h-3.5 w-3.5 text-slate-500" />
            <span>Supports <strong>### Headings</strong>, <strong>- Bullets</strong>, <strong>**Bold**</strong>, and <strong>&gt; Callouts</strong>. Seamlessly syncs with Structured Sections.</span>
          </p>
        </div>
      )}

      {/* =========================================================
          TAB 3: LIVE PREVIEW
          ========================================================= */}
      {activeTab === "preview" && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-inner max-h-[380px] overflow-y-auto no-scrollbar">
          <div className="pb-2 mb-3 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Article Preview</span>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Live Render
            </span>
          </div>
          <BlogContentRenderer content={value} />
        </div>
      )}
    </div>
  );
};
