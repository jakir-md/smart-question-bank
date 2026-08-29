/**
 * @file page.tsx
 * @description Admin Curriculum Taxonomy Management Hub (MVC - View/Page).
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React from "react";
import { useTaxonomy } from "@/hooks/useTaxonomy";
import { TaxonomyStatsBanner } from "@/components/module/CurriculumTaxonomy/TaxonomyStatsBanner";
import { TaxonomyTreeExplorer } from "@/components/module/CurriculumTaxonomy/TaxonomyTreeExplorer";
import { EducationLevelTable } from "@/components/module/CurriculumTaxonomy/EducationLevelTable";
import { SubjectTable } from "@/components/module/CurriculumTaxonomy/SubjectTable";
import { ChapterTable } from "@/components/module/CurriculumTaxonomy/ChapterTable";
import { TopicTable } from "@/components/module/CurriculumTaxonomy/TopicTable";
import { TaxonomyModals } from "@/components/module/CurriculumTaxonomy/TaxonomyModals";
import { CascadeTaxonomySelector } from "@/components/module/CurriculumTaxonomy/CascadeTaxonomySelector";
import {
  GraduationCap,
  BookOpen,
  Layers,
  FileText,
  Network,
  RotateCw,
  Plus,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Main Admin page for managing the 4-tier Curriculum Taxonomy (Education Level -> Subject -> Chapter -> Topic).
 */
export default function CurriculumTaxonomyPage() {
  const {
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
  } = useTaxonomy();

  const tabs = [
    { id: "tree", label: "Tree Explorer", icon: Network },
    { id: "levels", label: "Education Levels", icon: GraduationCap, count: stats?.totalLevels },
    { id: "subjects", label: "Subjects", icon: BookOpen, count: stats?.totalSubjects },
    { id: "chapters", label: "Chapters", icon: Layers, count: stats?.totalChapters },
    { id: "topics", label: "Topics & Objectives", icon: FileText, count: stats?.totalTopics },
    { id: "selector", label: "Student Selector Preview", icon: Compass },
  ] as const;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Network className="h-7 w-7 text-primary" />
            Curriculum Taxonomy Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize and manage the 4-tier educational hierarchy: Education Level / Class &rarr; Subject &rarr; Chapter &rarr; Topic.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            className="h-9 gap-1.5 text-xs"
            title="Refresh Data"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          {/* Quick Create Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-9 gap-1.5 bg-primary text-primary-foreground font-medium text-xs">
                <Plus className="h-4 w-4" />
                Add Taxonomy Item
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => openCreateModal("level")} className="cursor-pointer gap-2">
                <GraduationCap className="h-4 w-4 text-blue-500" />
                Add Education Level
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openCreateModal("subject")} className="cursor-pointer gap-2">
                <BookOpen className="h-4 w-4 text-emerald-500" />
                Add Subject
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openCreateModal("chapter")} className="cursor-pointer gap-2">
                <Layers className="h-4 w-4 text-amber-500" />
                Add Chapter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openCreateModal("topic")} className="cursor-pointer gap-2">
                <FileText className="h-4 w-4 text-purple-500" />
                Add Topic
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <TaxonomyStatsBanner stats={stats} loading={loadingStats} />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b pb-px scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
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

      {/* Tab Content Views */}
      {activeTab === "tree" && (
        <TaxonomyTreeExplorer
          treeData={treeData}
          loading={loadingTree}
          onOpenCreate={openCreateModal}
          onOpenEdit={openEditModal}
          onToggleStatus={(tier, id) => {
            if (tier === "level") handleToggleLevel(id);
            else if (tier === "subject") handleToggleSubject(id);
            else if (tier === "chapter") handleToggleChapter(id);
            else if (tier === "topic") handleToggleTopic(id);
          }}
          onDelete={(tier, id) => {
            if (tier === "level") handleDeleteLevel(id);
            else if (tier === "subject") handleDeleteSubject(id);
            else if (tier === "chapter") handleDeleteChapter(id);
            else if (tier === "topic") handleDeleteTopic(id);
          }}
        />
      )}

      {activeTab === "levels" && (
        <EducationLevelTable
          levels={levels}
          loading={loadingLevels}
          onOpenCreate={() => openCreateModal("level")}
          onOpenEdit={(level) => openEditModal("level", level)}
          onToggleStatus={handleToggleLevel}
          onDelete={handleDeleteLevel}
          onReorder={(items) => handleReorder("level", items)}
        />
      )}

      {activeTab === "subjects" && (
        <SubjectTable
          subjects={subjects}
          levels={levels}
          selectedLevelId={selectedLevelId}
          onSelectLevelId={setSelectedLevelId}
          loading={loadingSubjects}
          onOpenCreate={(lvlId) => openCreateModal("subject", lvlId)}
          onOpenEdit={(subject) => openEditModal("subject", subject)}
          onToggleStatus={handleToggleSubject}
          onDelete={handleDeleteSubject}
          onReorder={(items) => handleReorder("subject", items)}
        />
      )}

      {activeTab === "chapters" && (
        <ChapterTable
          chapters={chapters}
          levels={levels}
          subjects={subjects}
          selectedLevelId={selectedLevelId}
          onSelectLevelId={setSelectedLevelId}
          selectedSubjectId={selectedSubjectId}
          onSelectSubjectId={setSelectedSubjectId}
          loading={loadingChapters}
          onOpenCreate={(subId) => openCreateModal("chapter", subId)}
          onOpenEdit={(chapter) => openEditModal("chapter", chapter)}
          onToggleStatus={handleToggleChapter}
          onDelete={handleDeleteChapter}
          onReorder={(items) => handleReorder("chapter", items)}
        />
      )}

      {activeTab === "topics" && (
        <TopicTable
          topics={topics}
          levels={levels}
          subjects={subjects}
          chapters={chapters}
          selectedLevelId={selectedLevelId}
          onSelectLevelId={setSelectedLevelId}
          selectedSubjectId={selectedSubjectId}
          onSelectSubjectId={setSelectedSubjectId}
          selectedChapterId={selectedChapterId}
          onSelectChapterId={setSelectedChapterId}
          loading={loadingTopics}
          onOpenCreate={(chId) => openCreateModal("topic", chId)}
          onOpenEdit={(topic) => openEditModal("topic", topic)}
          onToggleStatus={handleToggleTopic}
          onDelete={handleDeleteTopic}
          onReorder={(items) => handleReorder("topic", items)}
        />
      )}

      {activeTab === "selector" && (
        <div className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-xs text-muted-foreground flex items-center gap-3">
            <Compass className="h-5 w-5 text-primary shrink-0" />
            <div>
              <span className="font-semibold text-foreground">Interactive Student Selector Demo:</span>{" "}
              This component is used in student apps to select Class/Level &rarr; Subject &rarr; Chapter &rarr; Topic for practice questions and mock tests.
            </div>
          </div>
          <CascadeTaxonomySelector
            onSelectionComplete={(selection) => {
              alert(
                `Selected:\nLevel: ${selection.level?.name || "N/A"}\nSubject: ${
                  selection.subject?.name || "N/A"
                }\nChapter: ${selection.chapter?.name || "N/A"}\nTopic: ${
                  selection.topic?.name || "All Chapter Topics"
                }`,
              );
            }}
          />
        </div>
      )}

      {/* Universal Modals */}
      <TaxonomyModals
        isOpen={modalState.isOpen}
        tier={modalState.tier}
        mode={modalState.mode}
        initialData={modalState.initialData}
        parentId={modalState.parentId}
        levels={levels}
        subjects={subjects}
        chapters={chapters}
        actionLoading={actionLoading}
        onClose={closeModal}
        onSaveLevel={handleSaveLevel}
        onSaveSubject={handleSaveSubject}
        onSaveChapter={handleSaveChapter}
        onSaveTopic={handleSaveTopic}
      />
    </div>
  );
}
