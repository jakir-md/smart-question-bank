/**
 * @file useTags.ts
 * @description Controller hook managing state, pagination, filtering, and CRUD operations for Tags (MVC - Controller).
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BulkCreateTagsInput,
  CreateTagInput,
  Tag,
  TagCategory,
  TAG_CATEGORIES_CONFIG,
  TagStats,
  UpdateTagInput,
} from "@/types/tag.types";
import { TagService } from "@/services/tag.service";

export interface TagModalState {
  isOpen: boolean;
  mode: "create" | "edit" | "bulk" | "delete";
  tag?: Tag | null;
  defaultCategory?: TagCategory;
}

export function useTags() {
  // Navigation / View Tabs
  const [activeViewTab, setActiveViewTab] = useState<"tags" | "autocomplete" | "creator" | "filter">("tags");

  // Data states
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<TagStats | null>(null);
  const [popularTags, setPopularTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TagCategory | "ALL">("ALL");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Loading states
  const [loadingTags, setLoadingTags] = useState<boolean>(false);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Modal State
  const [modalState, setModalState] = useState<TagModalState>({
    isOpen: false,
    mode: "create",
    tag: null,
  });

  // Modal controllers
  const openCreateModal = (defaultCategory?: TagCategory) => {
    setModalState({
      isOpen: true,
      mode: "create",
      tag: null,
      defaultCategory: defaultCategory || (selectedCategory !== "ALL" ? selectedCategory : undefined),
    });
  };

  const openEditModal = (tag: Tag) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      tag,
    });
  };

  const openBulkModal = () => {
    setModalState({
      isOpen: true,
      mode: "bulk",
      tag: null,
    });
  };

  const openDeleteModal = (tag: Tag) => {
    setModalState({
      isOpen: true,
      mode: "delete",
      tag,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: "create",
      tag: null,
    });
  };

  // Fetch Tags with query filters
  const fetchTags = useCallback(async () => {
    setLoadingTags(true);
    try {
      const isActiveParam =
        activeFilter === "active" ? true : activeFilter === "inactive" ? false : undefined;
      const categoryParam = selectedCategory !== "ALL" ? selectedCategory : undefined;

      const res = await TagService.getTags({
        search: searchQuery.trim() || undefined,
        category: categoryParam,
        isActive: isActiveParam,
        page,
        limit,
        sortBy: "usageCount",
        sortOrder: "desc",
      });

      setTags(res.data);
      if (res.meta) {
        setTotalPages(res.meta.totalPages);
        setTotalCount(res.meta.total);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch tags");
    } finally {
      setLoadingTags(false);
    }
  }, [searchQuery, selectedCategory, activeFilter, page, limit]);

  // Fetch Stats & Analytics
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [statsRes, popularRes] = await Promise.all([
        TagService.getTagStats(),
        TagService.getPopularTags(8),
      ]);
      setStats(statsRes.data);
      setPopularTags(popularRes.data);
    } catch (err: any) {
      console.error("Failed to fetch tag stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchTags();
    fetchStats();
  }, [fetchTags, fetchStats]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // CRUD Handlers
  const handleSaveTag = async (data: CreateTagInput) => {
    setActionLoading(true);
    try {
      if (modalState.mode === "edit" && modalState.tag) {
        await TagService.updateTag(modalState.tag.id, data);
        toast.success(`Tag '${data.name}' updated successfully`);
      } else {
        await TagService.createTag(data);
        toast.success(`Tag '${data.name}' created successfully`);
      }
      closeModal();
      refreshAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to save tag");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkCreate = async (payload: BulkCreateTagsInput) => {
    setActionLoading(true);
    try {
      const res = await TagService.bulkCreateTags(payload);
      toast.success(`Successfully processed ${res.data.length} tags`);
      closeModal();
      refreshAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to bulk create tags");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await TagService.toggleTagStatus(id);
      setTags((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isActive: res.data.isActive } : t)),
      );
      toast.success(`Tag '${res.data.name}' marked as ${res.data.isActive ? "Active" : "Inactive"}`);
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle tag status");
    }
  };

  const handleDeleteTag = async (id: string) => {
    setActionLoading(true);
    try {
      await TagService.deleteTag(id);
      toast.success("Tag deleted successfully");
      closeModal();
      refreshAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete tag");
    } finally {
      setActionLoading(false);
    }
  };

  return {
    activeViewTab,
    setActiveViewTab,
    tags,
    stats,
    popularTags,
    selectedCategory,
    setSelectedCategory,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    totalCount,
    loadingTags,
    loadingStats,
    actionLoading,
    modalState,
    openCreateModal,
    openEditModal,
    openBulkModal,
    openDeleteModal,
    closeModal,
    refreshAll,
    handleSaveTag,
    handleBulkCreate,
    handleToggleStatus,
    handleDeleteTag,
  };
}
