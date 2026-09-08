"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Sparkles,
  Star,
  Award,
  Heart,
  Leaf,
  Zap,
  CheckCircle2,
  ThumbsUp,
  Tag,
  Package,
  Info,
  Plus,
  Trash2,
} from "lucide-react";
import { ProductHighlight } from "@/types/admin-product";

export interface HighlightsEditorProps {
  highlights: ProductHighlight[];
  onChange: (highlights: ProductHighlight[]) => void;
}

const VISUAL_ICONS = [
  { id: "ShieldCheck", label: "Safety & Quality", icon: ShieldCheck },
  { id: "Sparkles", label: "Special Feature", icon: Sparkles },
  { id: "Star", label: "Top Rated", icon: Star },
  { id: "Award", label: "Certified", icon: Award },
  { id: "Heart", label: "Pet Loved", icon: Heart },
  { id: "Leaf", label: "Natural & Organic", icon: Leaf },
  { id: "Zap", label: "Fast Action", icon: Zap },
  { id: "CheckCircle2", label: "Verified", icon: CheckCircle2 },
  { id: "ThumbsUp", label: "Recommended", icon: ThumbsUp },
  { id: "Tag", label: "Best Value", icon: Tag },
  { id: "Package", label: "Premium Pack", icon: Package },
  { id: "Info", label: "Key Note", icon: Info },
];

export function HighlightsEditor({ highlights, onChange }: HighlightsEditorProps) {
  const [openPickerIdx, setOpenPickerIdx] = useState<number | null>(null);

  const addHighlight = () => {
    onChange([
      ...highlights,
      {
        title: "",
        description: "",
        icon: "Sparkles",
      },
    ]);
  };

  const updateHighlight = (
    index: number,
    field: keyof ProductHighlight,
    value: string
  ) => {
    const updated = [...highlights];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  const removeHighlight = (index: number) => {
    onChange(highlights.filter((_, i) => i !== index));
    if (openPickerIdx === index) {
      setOpenPickerIdx(null);
    }
  };

  const getIconComponent = (iconId?: string) => {
    const found = VISUAL_ICONS.find((item) => item.id === iconId);
    return found ? found.icon : Sparkles;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Highlights
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Add key benefits and features shown in visual cards on the product page.
          </p>
        </div>
        <button
          type="button"
          onClick={addHighlight}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-[#FF7A00] hover:bg-orange-100 text-xs font-bold cursor-pointer transition select-none"
        >
          <Plus className="h-3.5 w-3.5 stroke-[3]" />
          <span>Add Highlight</span>
        </button>
      </div>

      {highlights.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
          No highlights added. Click &quot;Add Highlight&quot; to add key product benefits.
        </div>
      ) : (
        <div className="space-y-3">
          {highlights.map((item, idx) => {
            const CurrentIcon = getIconComponent(item.icon);
            const isPickerOpen = openPickerIdx === idx;

            return (
              <div
                key={idx}
                className="relative p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5 transition hover:border-slate-300"
              >
                <div className="flex items-start gap-2.5">
                  {/* Visual Icon Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenPickerIdx(isPickerOpen ? null : idx)}
                      title="Select visual icon"
                      aria-label="Select visual icon"
                      className="h-10 w-10 rounded-xl bg-orange-100/80 text-[#FF7A00] hover:bg-orange-200/80 flex items-center justify-center transition cursor-pointer shadow-xs border border-orange-200/70"
                    >
                      <CurrentIcon className="h-5 w-5" />
                    </button>

                    {/* Visual Icon Picker Popover */}
                    {isPickerOpen && (
                      <div className="absolute left-0 top-12 z-30 w-64 p-3 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-2">
                        <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          Choose an Icon
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {VISUAL_ICONS.map((v) => {
                            const VIcon = v.icon;
                            const isSelected = item.icon === v.id;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => {
                                  updateHighlight(idx, "icon", v.id);
                                  setOpenPickerIdx(null);
                                }}
                                title={v.label}
                                aria-label={v.label}
                                className={`h-11 w-11 rounded-xl flex items-center justify-center transition cursor-pointer ${
                                  isSelected
                                    ? "bg-[#FF7A00] text-white shadow-xs"
                                    : "bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                                }`}
                              >
                                <VIcon className="h-5 w-5" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Title & Description Inputs */}
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateHighlight(idx, "title", e.target.value)}
                      placeholder="Highlight Title (e.g., Real Deboned Chicken #1)"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-[#FF7A00]"
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateHighlight(idx, "description", e.target.value)}
                      placeholder="Description (e.g., Premium quality protein for healthy growth)"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 placeholder-slate-400 outline-none focus:border-[#FF7A00]"
                    />
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeHighlight(idx)}
                    title="Remove highlight"
                    aria-label="Remove highlight"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
