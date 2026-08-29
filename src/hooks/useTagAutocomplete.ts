/**
 * @file useTagAutocomplete.ts
 * @description Specialized hook for managing debounced tag suggestions, keyboard navigation, and tag selection.
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Tag, TagCategory } from "@/types/tag.types";
import { TagService } from "@/services/tag.service";

export interface UseTagAutocompleteProps {
  value?: Tag[];
  onChange?: (tags: Tag[]) => void;
  maxTags?: number;
  categoryFilter?: TagCategory;
  allowCreate?: boolean;
}

export function useTagAutocomplete({
  value = [],
  onChange,
  maxTags,
  categoryFilter,
  allowCreate = true,
}: UseTagAutocompleteProps = {}) {
  const [selectedTags, setSelectedTags] = useState<Tag[]>(value);
  const [inputValue, setInputValue] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [creationCategory, setCreationCategory] = useState<TagCategory>("BOARD_EXAM");

  // Keep internal selected state in sync with external value
  useEffect(() => {
    setSelectedTags(value);
  }, [value]);

  const updateSelectedTags = (newTags: Tag[]) => {
    setSelectedTags(newTags);
    if (onChange) {
      onChange(newTags);
    }
  };

  // Debounced query fetching
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(
    async (search: string) => {
      if (!search.trim()) {
        // When input is empty, fetch popular tags as initial recommendations
        try {
          setLoading(true);
          const res = await TagService.getPopularTags(8);
          // Filter out already selected tags
          const filtered = res.data.filter(
            (item) => !selectedTags.some((s) => s.id === item.id || s.slug === item.slug),
          );
          setSuggestions(filtered);
        } catch {
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const res = await TagService.autocompleteTags({
          query: search.trim(),
          category: categoryFilter,
          limit: 10,
          onlyActive: true,
        });

        // Filter out already selected tags
        const filtered = res.data.filter(
          (item) => !selectedTags.some((s) => s.id === item.id || s.slug === item.slug),
        );
        setSuggestions(filtered);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [selectedTags, categoryFilter],
  );

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      if (isOpen) {
        fetchSuggestions(inputValue);
      }
    }, 200);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [inputValue, isOpen, fetchSuggestions]);

  // Actions
  const addTag = (tag: Tag) => {
    if (maxTags && selectedTags.length >= maxTags) return;
    if (selectedTags.some((t) => t.id === tag.id || t.slug === tag.slug)) return;

    const updated = [...selectedTags, tag];
    updateSelectedTags(updated);
    setInputValue("");
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const createAndAddTag = async (name: string, category: TagCategory = creationCategory) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      setLoading(true);
      const res = await TagService.createTag({
        name: trimmed,
        category,
        isActive: true,
      });

      addTag(res.data);
    } catch {
      // If tag exists, try to find it
      const fallbackTag: Tag = {
        id: `temp-${Date.now()}`,
        name: trimmed,
        slug: trimmed.toLowerCase().replace(/\s+/g, "-"),
        category,
        usageCount: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addTag(fallbackTag);
    } finally {
      setLoading(false);
    }
  };

  const removeTag = (tagIdOrSlug: string) => {
    const updated = selectedTags.filter((t) => t.id !== tagIdOrSlug && t.slug !== tagIdOrSlug);
    updateSelectedTags(updated);
  };

  const clearAllTags = () => {
    updateSelectedTags([]);
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const totalOptions = suggestions.length + (allowCreate && inputValue.trim() ? 1 : 0);
      setHighlightedIndex((prev) => (prev + 1 < totalOptions ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) return;
      const totalOptions = suggestions.length + (allowCreate && inputValue.trim() ? 1 : 0);
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalOptions - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }

      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        // Selected existing suggestion
        addTag(suggestions[highlightedIndex]);
      } else if (highlightedIndex === suggestions.length && allowCreate && inputValue.trim()) {
        // Selected "Create new tag"
        createAndAddTag(inputValue.trim(), creationCategory);
      } else if (inputValue.trim()) {
        // Enter pressed with text: if matches first suggestion exactly or top item
        if (suggestions.length > 0) {
          addTag(suggestions[0]);
        } else if (allowCreate) {
          createAndAddTag(inputValue.trim(), creationCategory);
        }
      }
    } else if (e.key === "Backspace" && !inputValue && selectedTags.length > 0) {
      // Remove last tag
      removeTag(selectedTags[selectedTags.length - 1].id);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return {
    selectedTags,
    inputValue,
    setInputValue,
    suggestions,
    loading,
    isOpen,
    setIsOpen,
    highlightedIndex,
    setHighlightedIndex,
    creationCategory,
    setCreationCategory,
    addTag,
    createAndAddTag,
    removeTag,
    clearAllTags,
    handleKeyDown,
  };
}
