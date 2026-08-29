/**
 * @file page.tsx
 * @description Admin Metadata & Tagging Management Hub (MVC - View/Page).
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useState } from "react";
import { useTags } from "@/hooks/useTags";
import { TagStatsBanner } from "@/components/module/MetadataTagging/TagStatsBanner";
import { TagTable } from "@/components/module/MetadataTagging/TagTable";
import { TagModals } from "@/components/module/MetadataTagging/TagModals";
import { TagInputAutocomplete } from "@/components/module/MetadataTagging/TagInputAutocomplete";
import { QuestionCreatorWithTags } from "@/components/module/MetadataTagging/QuestionCreatorWithTags";
import { TagFilterExplorer } from "@/components/module/MetadataTagging/TagFilterExplorer";
import { TagBadge } from "@/components/module/MetadataTagging/TagBadge";
import { Tag } from "@/types/tag.types";
import {
  Tags,
  Sparkles,
  FileQuestion,
  SlidersHorizontal,
  RotateCw,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MetadataTagsPage() {
  const {
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
  } = useTags();

  // Sandbox demo state for Tab 2
  const [sandboxTags, setSandboxTags] = useState<Tag[]>([
    {
      id: "sb-1",
      name: "Dhaka Board 2024",
      slug: "dhaka-board-2024",
      category: "BOARD_EXAM",
      usageCount: 14,
      isActive: true,
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "sb-2",
      name: "Cadet College",
      slug: "cadet-college",
      category: "CADET_COLLEGE",
      usageCount: 28,
      isActive: true,
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "sb-3",
      name: "Hard",
      slug: "hard",
      category: "DIFFICULTY",
      usageCount: 42,
      isActive: true,
      createdAt: "",
      updatedAt: "",
    },
  ]);

  const tabs = [
    { id: "tags", label: "Tag Directory", icon: Tags, count: stats?.totalTags },
    { id: "autocomplete", label: "Auto-Complete Input Sandbox", icon: Sparkles },
    { id: "creator", label: "Question Creator with Tags", icon: FileQuestion },
    { id: "filter", label: "Multi-Tag Query Explorer", icon: SlidersHorizontal },
  ] as const;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Tags className="h-7 w-7 text-primary" />
            Metadata & Tagging Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Attach reusable custom tags to questions (Board exams like Dhaka Board 2024, Cadet colleges, difficulty tiers) for fast indexed filtering.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            className="h-9 gap-1.5 text-xs rounded-xl"
            title="Refresh Data"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          {/* Quick Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-9 gap-1.5 bg-primary text-primary-foreground font-medium text-xs rounded-xl shadow-xs">
                <Plus className="h-4 w-4" />
                Add Tags
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => openCreateModal()} className="cursor-pointer gap-2">
                <Plus className="h-4 w-4 text-primary" />
                Create Single Tag
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openBulkModal} className="cursor-pointer gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                Bulk Add Tags
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <TagStatsBanner stats={stats} loading={loadingStats} />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b pb-px scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeViewTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveViewTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {"count" in tab && tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Tag Directory Table */}
      {activeViewTab === "tags" && (
        <TagTable
          tags={tags}
          loading={loadingTags}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          activeFilter={activeFilter}
          onSelectActiveFilter={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
          onOpenCreate={openCreateModal}
          onOpenBulk={openBulkModal}
          onOpenEdit={openEditModal}
          onOpenDelete={openDeleteModal}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Tab 2: Auto-Complete Sandbox Demo */}
      {activeViewTab === "autocomplete" && (
        <div className="space-y-6 max-w-4xl">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-xs text-muted-foreground flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-amber-500 shrink-0" />
            <div>
              <span className="font-semibold text-foreground">Interactive Auto-Complete Tag Component:</span>{" "}
              This standalone component provides instant debounced search across indexed tags, category-themed color chips, keyboard navigation (Arrow Up/Down, Enter), and on-the-fly custom tag creation.
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-xs">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">Test the Auto-Complete Tag Input</h3>
              <p className="text-xs text-muted-foreground">
                Type existing tag names (e.g., <em>Dhaka</em>, <em>Cadet</em>, <em>Hard</em>) or type a brand new tag to create it on the fly.
              </p>
            </div>

            <TagInputAutocomplete
              value={sandboxTags}
              onChange={setSandboxTags}
              placeholder="Search or type custom tags (e.g. Dhaka Board 2024, Cadet College, Hard)..."
            />

            <div className="p-4 rounded-xl bg-muted/40 border space-y-2">
              <span className="text-xs font-semibold text-foreground">Currently Selected Tag Data State:</span>
              <div className="flex flex-wrap gap-1.5">
                {sandboxTags.map((t) => (
                  <TagBadge key={t.id || t.slug} tag={t} size="sm" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Question Creator with Tags */}
      {activeViewTab === "creator" && <QuestionCreatorWithTags />}

      {/* Tab 4: Multi-Tag Query Explorer */}
      {activeViewTab === "filter" && <TagFilterExplorer />}

      {/* Universal Modals */}
      <TagModals
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        tag={modalState.tag}
        defaultCategory={modalState.defaultCategory}
        actionLoading={actionLoading}
        onClose={closeModal}
        onSave={handleSaveTag}
        onBulkSave={handleBulkCreate}
        onDelete={handleDeleteTag}
      />
    </div>
  );
}
