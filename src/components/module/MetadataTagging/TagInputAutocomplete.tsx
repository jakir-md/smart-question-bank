/**
 * @file TagInputAutocomplete.tsx
 * @description Auto-complete Tag Input component for question creation and metadata management.
 * Complies with Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useRef, useEffect } from "react";
import { Tag, TagCategory, TAG_CATEGORIES_CONFIG } from "@/types/tag.types";
import { TagBadge } from "./TagBadge";
import { useTagAutocomplete } from "@/hooks/useTagAutocomplete";
import {
  Search,
  Plus,
  Loader2,
  X,
  Sparkles,
  ChevronDown,
  Check,
  Tag as TagIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface TagInputAutocompleteProps {
  value?: Tag[];
  onChange?: (tags: Tag[]) => void;
  placeholder?: string;
  maxTags?: number;
  categoryFilter?: TagCategory;
  allowCreate?: boolean;
  disabled?: boolean;
  className?: string;
}

export function TagInputAutocomplete({
  value = [],
  onChange,
  placeholder = "Search or type custom tags (e.g. Dhaka Board 2024, Cadet College, Hard)...",
  maxTags,
  categoryFilter,
  allowCreate = true,
  disabled = false,
  className = "",
}: TagInputAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    selectedTags,
    inputValue,
    setInputValue,
    suggestions,
    loading,
    isOpen,
    setIsOpen,
    highlightedIndex,
    creationCategory,
    setCreationCategory,
    addTag,
    createAndAddTag,
    removeTag,
    clearAllTags,
    handleKeyDown,
  } = useTagAutocomplete({
    value,
    onChange,
    maxTags,
    categoryFilter,
    allowCreate,
  });

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  const categoryOptions = Object.values(TAG_CATEGORIES_CONFIG);

  return (
    <div ref={containerRef} className={`relative w-full space-y-1.5 ${className}`}>
      {/* Main Tag Input Box */}
      <div
        onClick={() => {
          if (!disabled) {
            inputRef.current?.focus();
            setIsOpen(true);
          }
        }}
        className={`min-h-[46px] w-full rounded-xl border bg-background px-3 py-2 text-sm transition-all duration-200 flex flex-wrap items-center gap-1.5 cursor-text ${
          isOpen
            ? "border-primary ring-2 ring-primary/20 shadow-xs"
            : "border-input hover:border-muted-foreground/40"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-muted/30" : ""}`}
      >
        <Search className="h-4 w-4 text-muted-foreground shrink-0 ml-0.5 mr-1" />

        {/* Selected Tags Badges */}
        {selectedTags.map((tag) => (
          <TagBadge
            key={tag.id || tag.slug}
            tag={tag}
            size="sm"
            onRemove={disabled ? undefined : () => removeTag(tag.id || tag.slug)}
            showUsageCount={false}
          />
        ))}

        {/* Text Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          disabled={disabled}
          placeholder={selectedTags.length === 0 ? placeholder : ""}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[140px] bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/70 text-xs sm:text-sm py-1"
        />

        {/* Loading Spinner */}
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0 mr-1" />}

        {/* Clear All Button */}
        {selectedTags.length > 0 && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clearAllTags();
            }}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Clear all tags"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Suggestions & On-the-fly Creator Popover */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-[320px] overflow-y-auto rounded-xl border bg-popover text-popover-foreground shadow-xl p-1.5 space-y-1 animate-in fade-in-0 zoom-in-95 scrollbar-thin">
          {/* Header indicator */}
          <div className="px-2.5 py-1 text-[11px] font-semibold text-muted-foreground flex items-center justify-between border-b pb-1.5 mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-500" />
              {inputValue.trim() ? "Matching Tag Suggestions" : "Popular & Recommended Tags"}
            </span>
            {maxTags && (
              <span className="text-[10px] text-muted-foreground">
                {selectedTags.length}/{maxTags} selected
              </span>
            )}
          </div>

          {/* Suggestions List */}
          {suggestions.length > 0 ? (
            <div className="space-y-0.5">
              {suggestions.map((suggestion, index) => {
                const isSelected = selectedTags.some(
                  (t) => t.id === suggestion.id || t.slug === suggestion.slug,
                );
                const isHighlighted = index === highlightedIndex;
                const catInfo =
                  TAG_CATEGORIES_CONFIG[suggestion.category] || TAG_CATEGORIES_CONFIG.CUSTOM;

                return (
                  <div
                    key={suggestion.id || suggestion.slug}
                    onClick={() => addTag(suggestion)}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-xs ${
                      isHighlighted
                        ? "bg-accent text-accent-foreground font-medium"
                        : "hover:bg-muted/70 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <TagBadge tag={suggestion} size="xs" />
                      {suggestion.description && (
                        <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                          {suggestion.description}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted font-mono text-muted-foreground">
                        {suggestion.usageCount} {suggestion.usageCount === 1 ? "use" : "uses"}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            !loading && (
              <div className="px-3 py-3 text-center text-xs text-muted-foreground">
                No matching existing tags found.
              </div>
            )
          )}

          {/* On-The-Fly Tag Creation Option */}
          {allowCreate && inputValue.trim() && (
            <div
              onClick={() => createAndAddTag(inputValue.trim(), creationCategory)}
              className={`flex items-center justify-between px-2.5 py-2.5 rounded-lg border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 cursor-pointer transition-colors text-xs ${
                highlightedIndex === suggestions.length ? "ring-2 ring-primary/30" : ""
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 rounded-full bg-primary/20 text-primary">
                  <Plus className="h-3.5 w-3.5" />
                </div>
                <div className="truncate">
                  <span className="text-muted-foreground">Create new tag: </span>
                  <span className="font-semibold text-foreground">"{inputValue.trim()}"</span>
                </div>
              </div>

              {/* Category Picker for on-the-fly created tag */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 shrink-0 ml-2"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md bg-background border hover:bg-muted text-foreground cursor-pointer shadow-2xs"
                    >
                      <span>{TAG_CATEGORIES_CONFIG[creationCategory].label}</span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground border-b mb-1">
                      Select Tag Category
                    </div>
                    {categoryOptions.map((opt) => (
                      <DropdownMenuItem
                        key={opt.category}
                        onClick={() => setCreationCategory(opt.category)}
                        className="cursor-pointer gap-2 text-xs"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: opt.color }}
                        />
                        <span>{opt.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
