/**
 * @file TagModals.tsx
 * @description Modals for creating, editing, bulk-creating, and deleting metadata tags.
 * Complies with Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  BulkCreateTagsInput,
  CreateTagInput,
  Tag,
  TagCategory,
  TAG_CATEGORIES_CONFIG,
} from "@/types/tag.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagBadge } from "./TagBadge";
import { Loader2, Plus, Sparkles, AlertTriangle } from "lucide-react";

interface TagModalsProps {
  isOpen: boolean;
  mode: "create" | "edit" | "bulk" | "delete";
  tag?: Tag | null;
  defaultCategory?: TagCategory;
  actionLoading: boolean;
  onClose: () => void;
  onSave: (data: CreateTagInput) => Promise<void>;
  onBulkSave: (payload: BulkCreateTagsInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const PRESET_COLORS = [
  "#2563eb", // Blue
  "#7c3aed", // Purple
  "#d97706", // Amber
  "#0891b2", // Cyan
  "#e11d48", // Rose
  "#059669", // Emerald
  "#db2777", // Pink
  "#475569", // Slate
  "#4f46e5", // Indigo
  "#16a34a", // Green
];

export function TagModals({
  isOpen,
  mode,
  tag,
  defaultCategory,
  actionLoading,
  onClose,
  onSave,
  onBulkSave,
  onDelete,
}: TagModalsProps) {
  // Form states for Single Create/Edit
  const [name, setName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [category, setCategory] = useState<TagCategory>("BOARD_EXAM");
  const [description, setDescription] = useState<string>("");
  const [color, setColor] = useState<string>("#2563eb");
  const [isActive, setIsActive] = useState<boolean>(true);

  // Form states for Bulk Create
  const [bulkCategory, setBulkCategory] = useState<TagCategory>("BOARD_EXAM");
  const [bulkText, setBulkText] = useState<string>("");

  useEffect(() => {
    if (mode === "edit" && tag) {
      setName(tag.name);
      setSlug(tag.slug);
      setCategory(tag.category);
      setDescription(tag.description || "");
      setColor(tag.color || TAG_CATEGORIES_CONFIG[tag.category]?.color || "#2563eb");
      setIsActive(tag.isActive);
    } else if (mode === "create") {
      setName("");
      setSlug("");
      const initialCat = defaultCategory || "BOARD_EXAM";
      setCategory(initialCat);
      setDescription("");
      setColor(TAG_CATEGORIES_CONFIG[initialCat]?.color || "#2563eb");
      setIsActive(true);
    } else if (mode === "bulk") {
      setBulkCategory(defaultCategory || "BOARD_EXAM");
      setBulkText("");
    }
  }, [mode, tag, defaultCategory, isOpen]);

  // Automatically compute slug from name during creation
  const handleNameChange = (val: string) => {
    setName(val);
    if (mode === "create") {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "");
      setSlug(generated);
    }
  };

  const handleCategoryChange = (cat: TagCategory) => {
    setCategory(cat);
    if (mode === "create") {
      setColor(TAG_CATEGORIES_CONFIG[cat]?.color || "#2563eb");
    }
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onSave({
      name: name.trim(),
      slug: slug.trim() || undefined,
      category,
      description: description.trim() || undefined,
      color,
      isActive,
    });
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawItems = bulkText
      .split(/[,\n]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (rawItems.length === 0) return;

    const tagsToCreate = rawItems.map((item) => ({
      name: item,
      category: bulkCategory,
      color: TAG_CATEGORIES_CONFIG[bulkCategory]?.color,
    }));

    await onBulkSave({ tags: tagsToCreate });
  };

  const categoryOptions = Object.values(TAG_CATEGORIES_CONFIG);

  return (
    <>
      {/* 1. Single Create / Edit Modal */}
      {(mode === "create" || mode === "edit") && (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="sm:max-w-[520px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {mode === "create" ? "Create New Metadata Tag" : `Edit Tag: ${tag?.name}`}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Define reusable tags for question filtering (Board exams, Cadet colleges, difficulty tiers, and custom topics).
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSingleSubmit} className="space-y-4 py-2">
              {/* Name & Preview */}
              <div className="space-y-1.5">
                <Label htmlFor="tag-name" className="text-xs font-semibold">
                  Tag Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="tag-name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Dhaka Board 2024, Cadet College, Hard"
                  className="h-9 text-sm rounded-xl"
                  required
                />
              </div>

              {/* Tag Live Preview */}
              {name.trim() && (
                <div className="p-2.5 rounded-xl bg-muted/40 border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Badge Preview:</span>
                  <TagBadge
                    tag={{
                      name: name.trim(),
                      category,
                      color,
                    }}
                    size="sm"
                  />
                </div>
              )}

              {/* Category Domain */}
              <div className="space-y-1.5">
                <Label htmlFor="tag-category" className="text-xs font-semibold">
                  Metadata Domain / Category
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.category}
                      type="button"
                      onClick={() => handleCategoryChange(cat.category)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                        category === cat.category
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                          : "border-input bg-background hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slug Identifier */}
              <div className="space-y-1.5">
                <Label htmlFor="tag-slug" className="text-xs font-semibold">
                  Slug (URL / API Key)
                </Label>
                <Input
                  id="tag-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="dhaka-board-2024"
                  className="h-9 text-xs font-mono rounded-xl"
                />
              </div>

              {/* Color Presets */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Tag Theme Color</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-6 w-6 rounded-full transition-transform cursor-pointer ${
                        color === c ? "ring-2 ring-primary ring-offset-2 scale-110" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-7 w-24 text-xs font-mono rounded-lg px-2"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="tag-desc" className="text-xs font-semibold">
                  Description / Notes (Optional)
                </Label>
                <textarea
                  id="tag-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Context regarding this tag's usage..."
                  rows={2}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <Label className="text-xs font-semibold">Active for Autocomplete</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Inactive tags will be hidden from student filters and autocomplete.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                />
              </div>

              <DialogFooter className="pt-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={actionLoading || !name.trim()}
                  className="rounded-xl text-xs gap-1.5 bg-primary text-primary-foreground"
                >
                  {actionLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  {mode === "create" ? "Create Tag" : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* 2. Bulk Create Modal */}
      {mode === "bulk" && (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Bulk Add Metadata Tags
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Paste multiple tags separated by commas or line breaks. Existing tags will be skipped or updated.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleBulkSubmit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Target Domain / Category</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.category}
                      type="button"
                      onClick={() => setBulkCategory(cat.category)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                        bulkCategory === cat.category
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                          : "border-input bg-background hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bulk-tags" className="text-xs font-semibold">
                  Tag List (Comma or Line Separated) <span className="text-rose-500">*</span>
                </Label>
                <textarea
                  id="bulk-tags"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`Dhaka Board 2024\nRajshahi Board 2024\nChattogram Board 2024\nBarishal Board 2024`}
                  rows={6}
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              {/* Preview Chips */}
              {bulkText.trim() && (
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Parsed Tags ({bulkText.split(/[,\n]/).filter((t) => t.trim().length > 0).length}):
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 bg-muted/40 rounded-xl border">
                    {bulkText
                      .split(/[,\n]/)
                      .map((t) => t.trim())
                      .filter((t) => t.length > 0)
                      .map((t, idx) => (
                        <TagBadge
                          key={idx}
                          tag={{ name: t, category: bulkCategory }}
                          size="xs"
                        />
                      ))}
                  </div>
                </div>
              )}

              <DialogFooter className="pt-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={actionLoading || !bulkText.trim()}
                  className="rounded-xl text-xs gap-1.5 bg-primary text-primary-foreground"
                >
                  {actionLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  Process Bulk Tags
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* 3. Delete Confirmation Modal */}
      {mode === "delete" && tag && (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="sm:max-w-[420px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-rose-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Delete Tag Confirmation
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Are you sure you want to permanently delete the tag <strong>"{tag.name}"</strong>?
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 text-xs text-muted-foreground bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              This will remove this tag from <strong>{tag._count?.questions ?? tag.usageCount ?? 0}</strong> questions. This action cannot be undone.
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={actionLoading}
                onClick={() => onDelete(tag.id)}
                className="rounded-xl text-xs gap-1.5"
              >
                {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Yes, Delete Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
