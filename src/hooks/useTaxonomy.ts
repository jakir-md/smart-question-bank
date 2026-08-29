/**
 * @file useTaxonomy.ts
 * @description Controller hook managing state and mutations for Curriculum Taxonomy (MVC - Controller).
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Chapter,
  CreateChapterInput,
  CreateEducationLevelInput,
  CreateSubjectInput,
  CreateTopicInput,
  EducationLevel,
  ReorderItemInput,
  Subject,
  TaxonomyStats,
  TaxonomyTier,
  TaxonomyTreeResponse,
  Topic,
} from "@/types/taxonomy.types";
import { TaxonomyService } from "@/services/taxonomy.service";

/**
 * Modal state configuration for Taxonomy forms.
 */
export interface TaxonomyModalState {
  isOpen: boolean;
  tier: "level" | "subject" | "chapter" | "topic" | null;
  mode: "create" | "edit";
  initialData?: any;
  parentId?: string; // Pre-selected parent ID
}

/**
 * Main Controller hook for Curriculum Taxonomy management.
 */
export function useTaxonomy() {
  const [activeTab, setActiveTab] = useState<TaxonomyTier>("tree");

  // Data states
  const [treeData, setTreeData] = useState<TaxonomyTreeResponse | null>(null);
  const [stats, setStats] = useState<TaxonomyStats | null>(null);
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Filter & Selection states
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Loading states
  const [loadingTree, setLoadingTree] = useState<boolean>(false);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [loadingLevels, setLoadingLevels] = useState<boolean>(false);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(false);
  const [loadingChapters, setLoadingChapters] = useState<boolean>(false);
  const [loadingTopics, setLoadingTopics] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Modal State
  const [modalState, setModalState] = useState<TaxonomyModalState>({
    isOpen: false,
    tier: null,
    mode: "create",
  });

  // ==========================================
  // Fetch Functions
  // ==========================================

  const fetchTree = useCallback(async (onlyActive: boolean = false) => {
    try {
      setLoadingTree(true);
      const res = await TaxonomyService.getTaxonomyTree(onlyActive);
      setTreeData(res.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load taxonomy tree");
    } finally {
      setLoadingTree(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await TaxonomyService.getTaxonomyStats();
      setStats(res.data);
    } catch (err: any) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchLevels = useCallback(async () => {
    try {
      setLoadingLevels(true);
      const res = await TaxonomyService.getEducationLevels({
        search: searchQuery || undefined,
        limit: 100,
      });
      setLevels(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch education levels");
    } finally {
      setLoadingLevels(false);
    }
  }, [searchQuery]);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoadingSubjects(true);
      const res = await TaxonomyService.getSubjects({
        educationLevelId: selectedLevelId || undefined,
        search: searchQuery || undefined,
        limit: 100,
      });
      setSubjects(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch subjects");
    } finally {
      setLoadingSubjects(false);
    }
  }, [selectedLevelId, searchQuery]);

  const fetchChapters = useCallback(async () => {
    try {
      setLoadingChapters(true);
      const res = await TaxonomyService.getChapters({
        subjectId: selectedSubjectId || undefined,
        educationLevelId: selectedLevelId || undefined,
        search: searchQuery || undefined,
        limit: 100,
      });
      setChapters(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch chapters");
    } finally {
      setLoadingChapters(false);
    }
  }, [selectedSubjectId, selectedLevelId, searchQuery]);

  const fetchTopics = useCallback(async () => {
    try {
      setLoadingTopics(true);
      const res = await TaxonomyService.getTopics({
        chapterId: selectedChapterId || undefined,
        subjectId: selectedSubjectId || undefined,
        educationLevelId: selectedLevelId || undefined,
        search: searchQuery || undefined,
        limit: 100,
      });
      setTopics(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch topics");
    } finally {
      setLoadingTopics(false);
    }
  }, [selectedChapterId, selectedSubjectId, selectedLevelId, searchQuery]);

  // Initial load
  useEffect(() => {
    fetchTree();
    fetchStats();
  }, [fetchTree, fetchStats]);

  // Tab-driven data load
  useEffect(() => {
    if (activeTab === "levels") fetchLevels();
    else if (activeTab === "subjects") {
      fetchLevels();
      fetchSubjects();
    } else if (activeTab === "chapters") {
      fetchLevels();
      fetchSubjects();
      fetchChapters();
    } else if (activeTab === "topics") {
      fetchLevels();
      fetchSubjects();
      fetchChapters();
      fetchTopics();
    } else if (activeTab === "tree") {
      fetchTree();
    }
  }, [activeTab, fetchLevels, fetchSubjects, fetchChapters, fetchTopics, fetchTree]);

  // Refresh all active views
  const refreshAll = useCallback(() => {
    fetchTree();
    fetchStats();
    if (activeTab === "levels") fetchLevels();
    if (activeTab === "subjects") fetchSubjects();
    if (activeTab === "chapters") fetchChapters();
    if (activeTab === "topics") fetchTopics();
  }, [activeTab, fetchTree, fetchStats, fetchLevels, fetchSubjects, fetchChapters, fetchTopics]);

  // ==========================================
  // Modal Actions
  // ==========================================

  const openCreateModal = (tier: "level" | "subject" | "chapter" | "topic", parentId?: string) => {
    setModalState({
      isOpen: true,
      tier,
      mode: "create",
      parentId,
    });
  };

  const openEditModal = (tier: "level" | "subject" | "chapter" | "topic", data: any) => {
    setModalState({
      isOpen: true,
      tier,
      mode: "edit",
      initialData: data,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      tier: null,
      mode: "create",
    });
  };

  // ==========================================
  // Mutation Handlers
  // ==========================================

  // Level Handlers
  const handleSaveLevel = async (data: CreateEducationLevelInput) => {
    try {
      setActionLoading(true);
      if (modalState.mode === "create") {
        await TaxonomyService.createEducationLevel(data);
        toast.success("Education Level created successfully");
      } else {
        await TaxonomyService.updateEducationLevel(modalState.initialData.id, data);
        toast.success("Education Level updated successfully");
      }
      closeModal();
      refreshAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to save Education Level");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleLevel = async (id: string) => {
    try {
      const res = await TaxonomyService.toggleEducationLevelStatus(id);
      toast.success(res.message);
      refreshAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    }
  };

  const handleDeleteLevel = async (id: string) => {
    if (!confirm("Are you sure? This will delete the level and all associated subjects, chapters, and topics.")) return;
    try {
      await TaxonomyService.deleteEducationLevel(id);
      toast.success("Education Level deleted successfully");
      refreshAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete Education Level");
    }
  };

  // Subject Handlers
  const handleSaveSubject = async (data: CreateSubjectInput) => {
    try {
      setActionLoading(true);
      if (modalState.mode === "create") {
        await TaxonomyService.createSubject(data);
        toast.success("Subject created successfully");
      } else {
        await TaxonomyService.updateSubject(modalState.initialData.id, data);
        toast.success("Subject updated successfully");
      }
      closeModal();
      refreshAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to save Subject");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSubject = async (id: string) => {
    try {
      const res = await TaxonomyService.toggleSubjectStatus(id);
      toast.success(res.message);
      refreshAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Are you sure? This will delete the subject and all its chapters and topics.")) return;
    try {
      await TaxonomyService.deleteSubject(id);
      toast.success("Subject deleted successfully");
      refreshAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete Subject");
    }
  };

  // Chapter Handlers
  const handleSaveChapter = async (data: CreateChapterInput) => {
    try {
      setActionLoading(true);
      if (modalState.mode === "create") {
        await TaxonomyService.createChapter(data);
        toast.success("Chapter created successfully");
      } else {
        await TaxonomyService.updateChapter(modalState.initialData.id, data);
        toast.success("Chapter updated successfully");
      }
      closeModal();
      refreshAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to save Chapter");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleChapter = async (id: string) => {
    try {
      const res = await TaxonomyService.toggleChapterStatus(id);
      toast.success(res.message);
      refreshAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    }
  };

  const handleDeleteChapter = async (id: string) => {
    if (!confirm("Are you sure? This will delete the chapter and all its topics.")) return;
    try {
      await TaxonomyService.deleteChapter(id);
      toast.success("Chapter deleted successfully");
      refreshAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete Chapter");
    }
  };

  // Topic Handlers
  const handleSaveTopic = async (data: CreateTopicInput) => {
    try {
      setActionLoading(true);
      if (modalState.mode === "create") {
        await TaxonomyService.createTopic(data);
        toast.success("Topic created successfully");
      } else {
        await TaxonomyService.updateTopic(modalState.initialData.id, data);
        toast.success("Topic updated successfully");
      }
      closeModal();
      refreshAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to save Topic");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleTopic = async (id: string) => {
    try {
      const res = await TaxonomyService.toggleTopicStatus(id);
      toast.success(res.message);
      refreshAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;
    try {
      await TaxonomyService.deleteTopic(id);
      toast.success("Topic deleted successfully");
      refreshAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete Topic");
    }
  };

  // Reorder Handlers
  const handleReorder = async (
    tier: "level" | "subject" | "chapter" | "topic",
    items: ReorderItemInput[],
  ) => {
    try {
      if (tier === "level") await TaxonomyService.reorderEducationLevels(items);
      else if (tier === "subject") await TaxonomyService.reorderSubjects(items);
      else if (tier === "chapter") await TaxonomyService.reorderChapters(items);
      else if (tier === "topic") await TaxonomyService.reorderTopics(items);
      toast.success("Order updated successfully");
      refreshAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
    }
  };

  return {
    activeTab,
    setActiveTab,
    treeData,
    stats,
    levels,
    subjects,
    chapters,
    topics,
    selectedLevelId,
    setSelectedLevelId,
    selectedSubjectId,
    setSelectedSubjectId,
    selectedChapterId,
    setSelectedChapterId,
    searchQuery,
    setSearchQuery,
    loadingTree,
    loadingStats,
    loadingLevels,
    loadingSubjects,
    loadingChapters,
    loadingTopics,
    actionLoading,
    modalState,
    openCreateModal,
    openEditModal,
    closeModal,
    refreshAll,
    handleSaveLevel,
    handleToggleLevel,
    handleDeleteLevel,
    handleSaveSubject,
    handleToggleSubject,
    handleDeleteSubject,
    handleSaveChapter,
    handleToggleChapter,
    handleDeleteChapter,
    handleSaveTopic,
    handleToggleTopic,
    handleDeleteTopic,
    handleReorder,
  };
}
