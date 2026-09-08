"use client";

import React, { useRef, useState } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export interface PhotoGalleryUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  onFilesSelected?: (files: File[]) => void;
  onRemove?: (index: number) => void;
  error?: string;
}

export function PhotoGalleryUploader({
  images,
  onChange,
  onFilesSelected,
  onRemove,
  error,
}: PhotoGalleryUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    const availableSlots = 9 - images.length;
    if (availableSlots <= 0) {
      setUploadError("Maximum 9 product photos allowed. Please remove a photo before adding more.");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);

    const allowedMime = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];

    const validFiles: File[] = [];
    for (const f of filesToProcess) {
      if (!allowedMime.includes(f.type)) {
        setUploadError(`"${f.name}" is not a supported image format. Please select JPG, PNG, WebP, GIF, or SVG.`);
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        setUploadError(`"${f.name}" exceeds the 10MB size limit.`);
        return;
      }
      validFiles.push(f);
    }

    if (onFilesSelected) {
      onFilesSelected(validFiles);
    } else {
      // Local preview fallback if parent doesn't provide onFilesSelected
      const newUrls = validFiles.map((f) => URL.createObjectURL(f));
      onChange([...images, ...newUrls]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemove = (index: number) => {
    if (onRemove) {
      onRemove(index);
    } else {
      const updated = images.filter((_, i) => i !== index);
      onChange(updated);
    }
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
            Product Photo Gallery
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Add high-resolution photos of your product. The first photo serves as the primary cover photo.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold transition ${
              images.length === 9
                ? "bg-rose-100 text-rose-700"
                : images.length > 0
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {images.length} / 9 photos
          </span>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            (9 photos maximum)
          </span>
        </div>
      </div>

      {/* Upload & Drop Zone */}
      {images.length < 9 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition cursor-pointer select-none ${
            dragOver
              ? "border-[#FF7A00] bg-orange-50/60"
              : "border-slate-200/90 bg-[#FDFBF7] hover:border-orange-300 hover:bg-orange-50/20"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="h-12 w-12 rounded-2xl bg-orange-100/70 text-[#FF7A00] flex items-center justify-center shadow-xs">
              <UploadCloud className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">
                Click to add photos or drag &amp; drop
              </p>
              <p className="text-xs text-slate-400">
                PNG, JPG, WEBP, GIF, SVG up to 10MB per image
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-800 text-[11px] font-medium">
              <Sparkles className="h-3 w-3 text-amber-600 shrink-0" />
              <span>Instant local preview &bull; Uploads to DB only when you finish and save</span>
            </div>
          </div>
        </div>
      )}

      {/* Error messages */}
      {(uploadError || error) && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{uploadError || error}</span>
        </div>
      )}

      {/* Photos Grid */}
      {images.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Selected Photos ({images.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {images.map((url, idx) => {
              const isCover = idx === 0;
              return (
                <div
                  key={url + idx}
                  className={`group relative rounded-2xl overflow-hidden bg-white border transition shadow-xs flex flex-col ${
                    isCover
                      ? "border-[#FF7A00] ring-2 ring-[#FF7A00]/20 shadow-md"
                      : "border-slate-200/90 hover:border-slate-300"
                  }`}
                >
                  {/* Image Container */}
                  <div className="aspect-square w-full bg-slate-50 relative flex items-center justify-center overflow-hidden p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Product photo ${idx + 1}`}
                      className="h-full w-full object-contain transition duration-200 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Cover Photo Badge */}
                    {isCover && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#FF7A00] text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                        <Star className="h-2.5 w-2.5 fill-white" />
                        <span>Cover Photo</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="p-1.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "left")}
                        disabled={idx === 0}
                        title="Move Left"
                        aria-label="Move photo left"
                        className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "right")}
                        disabled={idx === images.length - 1}
                        title="Move Right"
                        aria-label="Move photo right"
                        className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(idx)}
                        title="Make Main Photo"
                        aria-label="Make main product photo"
                        className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-slate-600 hover:text-[#FF7A00] hover:bg-orange-50 cursor-pointer"
                      >
                        Set Cover
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      title="Remove photo"
                      aria-label="Remove photo"
                      className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200/60">
          <div className="h-10 w-10 mx-auto rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
            <ImageIcon className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-slate-600">No photos added yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Add at least 1 photo to showcase your product in the catalog.
          </p>
        </div>
      )}
    </div>
  );
}
