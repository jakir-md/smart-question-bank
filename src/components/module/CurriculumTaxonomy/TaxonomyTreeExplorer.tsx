/**
 * @file TaxonomyTreeExplorer.tsx
 * @description Interactive hierarchical tree explorer component for curriculum taxonomy (MVC - View).
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useState } from "react";
import {
  TaxonomyChapterNode,
  TaxonomyLevelNode,
  TaxonomySubjectNode,
  TaxonomyTopicNode,
  TaxonomyTreeResponse,
} from "@/types/taxonomy.types";
import {
  ChevronRight,
  ChevronDown,
  GraduationCap,
  BookOpen,
  Layers,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Power,
  Search,
  Maximize2,
  Minimize2,
  Circle,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TaxonomyTreeExplorerProps {
  treeData: TaxonomyTreeResponse | null;
  loading: boolean;
  onOpenCreate: (tier: "level" | "subject" | "chapter" | "topic", parentId?: string) => void;
  onOpenEdit: (tier: "level" | "subject" | "chapter" | "topic", data: any) => void;
  onToggleStatus: (tier: "level" | "subject" | "chapter" | "topic", id: string) => void;
  onDelete: (tier: "level" | "subject" | "chapter" | "topic", id: string) => void;
}

/**
 * Visual interactive tree view for exploring and manipulating the 4-tier curriculum taxonomy hierarchy.
 */
export function TaxonomyTreeExplorer({
  treeData,
  loading,
  onOpenCreate,
  onOpenEdit,
  onToggleStatus,
  onDelete,
}: TaxonomyTreeExplorerProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState<string>("");

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const expandAll = () => {
    if (!treeData) return;
    const allIds: Record<string, boolean> = {};
    treeData.tree.forEach((level) => {
      allIds[`level-${level.id}`] = true;
      level.subjects.forEach((subject) => {
        allIds[`subject-${subject.id}`] = true;
        subject.chapters.forEach((chapter) => {
          allIds[`chapter-${chapter.id}`] = true;
          chapter.topics.forEach((topic) => {
            allIds[`topic-${topic.id}`] = true;
          });
        });
      });
    });
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  if (loading || !treeData) {
    return (
      <div className="rounded-xl border bg-card p-6 space-y-4 animate-pulse">
        <div className="h-10 bg-muted/60 rounded-lg w-full max-w-sm" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-muted/40 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Filter tree based on search query
  const matchesSearch = (text?: string | null) => {
    if (!search) return true;
    return text?.toLowerCase().includes(search.toLowerCase()) ?? false;
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b bg-muted/20">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search levels, subjects, chapters, topics..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-9 bg-background h-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            className="h-8 text-xs gap-1.5"
            title="Expand All Nodes"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className="h-8 text-xs gap-1.5"
            title="Collapse All Nodes"
          >
            <Minimize2 className="h-3.5 w-3.5" />
            Collapse All
          </Button>
          <Button
            size="sm"
            onClick={() => onOpenCreate("level")}
            className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Level
          </Button>
        </div>
      </div>

      {/* Tree Content */}
      <div className="p-4 divide-y divide-border/40">
        {treeData.tree.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="font-semibold text-foreground">No Curriculum Levels Found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Get started by creating your first Education Level or Exam Category.
            </p>
            <Button size="sm" onClick={() => onOpenCreate("level")}>
              <Plus className="h-4 w-4 mr-1.5" />
              Create Education Level
            </Button>
          </div>
        ) : (
          treeData.tree.map((level) => (
            <LevelNode
              key={level.id}
              level={level}
              isExpanded={!!expandedNodes[`level-${level.id}`] || !!search}
              onToggle={() => toggleNode(`level-${level.id}`)}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              matchesSearch={matchesSearch}
              onOpenCreate={onOpenCreate}
              onOpenEdit={onOpenEdit}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ==========================================
// Level Node Component
// ==========================================

function LevelNode({
  level,
  isExpanded,
  onToggle,
  expandedNodes,
  toggleNode,
  matchesSearch,
  onOpenCreate,
  onOpenEdit,
  onToggleStatus,
  onDelete,
}: {
  level: TaxonomyLevelNode;
  isExpanded: boolean;
  onToggle: () => void;
  expandedNodes: Record<string, boolean>;
  toggleNode: (id: string) => void;
  matchesSearch: (text?: string | null) => boolean;
  onOpenCreate: (tier: "level" | "subject" | "chapter" | "topic", parentId?: string) => void;
  onOpenEdit: (tier: "level" | "subject" | "chapter" | "topic", data: any) => void;
  onToggleStatus: (tier: "level" | "subject" | "chapter" | "topic", id: string) => void;
  onDelete: (tier: "level" | "subject" | "chapter" | "topic", id: string) => void;
}) {
  const filteredSubjects = level.subjects.filter(
    (s) =>
      matchesSearch(s.name) ||
      matchesSearch(s.code) ||
      s.chapters.some(
        (c) =>
          matchesSearch(c.name) ||
          c.topics.some((t) => matchesSearch(t.name) || matchesSearch(t.topicNumber)),
      ),
  );

  return (
    <div className="py-2">
      <div className="flex items-center justify-between group rounded-lg p-2 hover:bg-muted/40 transition-colors border border-transparent hover:border-border/60">
        <div className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
          <button className="p-1 rounded hover:bg-muted text-muted-foreground">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">{level.name}</span>
              <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                {level.code}
              </Badge>
              {!level.isActive && (
                <Badge variant="secondary" className="text-[10px] bg-destructive/10 text-destructive">
                  Inactive
                </Badge>
              )}
            </div>
            {level.description && (
              <p className="text-xs text-muted-foreground truncate">{level.description}</p>
            )}
          </div>
        </div>

        {/* Level Stats & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
            <span className="bg-muted px-2 py-0.5 rounded-full font-medium">
              {level.subjectCount} subjects
            </span>
            <span className="bg-muted px-2 py-0.5 rounded-full font-medium">
              {level.chapterCount} chapters
            </span>
            <span className="bg-muted px-2 py-0.5 rounded-full font-medium">
              {level.topicCount} topics
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
              title="Add Subject to this Level"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onOpenCreate("subject", level.id);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Edit Level"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onOpenEdit("level", level);
              }}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${
                level.isActive ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground"
              }`}
              title={level.isActive ? "Deactivate" : "Activate"}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onToggleStatus("level", level.id);
              }}
            >
              <Power className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:bg-destructive/10"
              title="Delete Level"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onDelete("level", level.id);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Subjects nested */}
      {isExpanded && (
        <div className="pl-6 sm:pl-8 mt-1 space-y-1 border-l-2 border-border/40 ml-4">
          {filteredSubjects.length === 0 ? (
            <div className="py-2 text-xs text-muted-foreground italic flex items-center justify-between">
              <span>No subjects added yet under this level.</span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[11px]"
                onClick={() => onOpenCreate("subject", level.id)}
              >
                <Plus className="h-3 w-3 mr-1" /> Add Subject
              </Button>
            </div>
          ) : (
            filteredSubjects.map((subject) => (
              <SubjectNode
                key={subject.id}
                subject={subject}
                isExpanded={!!expandedNodes[`subject-${subject.id}`]}
                onToggle={() => toggleNode(`subject-${subject.id}`)}
                expandedNodes={expandedNodes}
                toggleNode={toggleNode}
                matchesSearch={matchesSearch}
                onOpenCreate={onOpenCreate}
                onOpenEdit={onOpenEdit}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// Subject Node Component
// ==========================================

function SubjectNode({
  subject,
  isExpanded,
  onToggle,
  expandedNodes,
  toggleNode,
  matchesSearch,
  onOpenCreate,
  onOpenEdit,
  onToggleStatus,
  onDelete,
}: {
  subject: TaxonomySubjectNode;
  isExpanded: boolean;
  onToggle: () => void;
  expandedNodes: Record<string, boolean>;
  toggleNode: (id: string) => void;
  matchesSearch: (text?: string | null) => boolean;
  onOpenCreate: (tier: "level" | "subject" | "chapter" | "topic", parentId?: string) => void;
  onOpenEdit: (tier: "level" | "subject" | "chapter" | "topic", data: any) => void;
  onToggleStatus: (tier: "level" | "subject" | "chapter" | "topic", id: string) => void;
  onDelete: (tier: "level" | "subject" | "chapter" | "topic", id: string) => void;
}) {
  const filteredChapters = subject.chapters.filter(
    (c) =>
      matchesSearch(c.name) ||
      c.topics.some((t) => matchesSearch(t.name) || matchesSearch(t.topicNumber)),
  );

  return (
    <div className="py-1">
      <div className="flex items-center justify-between group rounded-md p-1.5 hover:bg-muted/40 transition-colors border border-transparent hover:border-border/50">
        <div className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
          <button className="p-1 rounded hover:bg-muted text-muted-foreground">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <BookOpen className="h-3.5 w-3.5" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-medium text-xs sm:text-sm text-foreground">{subject.name}</span>
              <Badge variant="outline" className="text-[9px] font-mono px-1 py-0">
                {subject.code}
              </Badge>
              {subject.paper && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-muted">
                  {subject.paper}
                </Badge>
              )}
              {!subject.isActive && (
                <Badge variant="secondary" className="text-[9px] bg-destructive/10 text-destructive">
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Subject Stats & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
            <span className="text-[11px] bg-muted/60 px-2 py-0.5 rounded-full">
              {subject.chapterCount} chapters
            </span>
            <span className="text-[11px] bg-muted/60 px-2 py-0.5 rounded-full">
              {subject.topicCount} topics
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-emerald-600 hover:bg-emerald-500/10"
              title="Add Chapter to Subject"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onOpenCreate("chapter", subject.id);
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              title="Edit Subject"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onOpenEdit("subject", subject);
              }}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${
                subject.isActive ? "text-blue-500" : "text-muted-foreground"
              }`}
              title={subject.isActive ? "Deactivate" : "Activate"}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onToggleStatus("subject", subject.id);
              }}
            >
              <Power className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:bg-destructive/10"
              title="Delete Subject"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onDelete("subject", subject.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chapters nested */}
      {isExpanded && (
        <div className="pl-6 sm:pl-8 mt-1 space-y-1 border-l-2 border-border/40 ml-3">
          {filteredChapters.length === 0 ? (
            <div className="py-1.5 text-xs text-muted-foreground italic flex items-center justify-between">
              <span>No chapters added yet under this subject.</span>
              <Button
                variant="outline"
                size="sm"
                className="h-5 text-[10px]"
                onClick={() => onOpenCreate("chapter", subject.id)}
              >
                <Plus className="h-2.5 w-2.5 mr-1" /> Add Chapter
              </Button>
            </div>
          ) : (
            filteredChapters.map((chapter) => (
              <ChapterNode
                key={chapter.id}
                chapter={chapter}
                isExpanded={!!expandedNodes[`chapter-${chapter.id}`]}
                onToggle={() => toggleNode(`chapter-${chapter.id}`)}
                expandedNodes={expandedNodes}
                toggleNode={toggleNode}
                matchesSearch={matchesSearch}
                onOpenCreate={onOpenCreate}
                onOpenEdit={onOpenEdit}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// Chapter Node Component
// ==========================================

function ChapterNode({
  chapter,
  isExpanded,
  onToggle,
  expandedNodes,
  toggleNode,
  matchesSearch,
  onOpenCreate,
  onOpenEdit,
  onToggleStatus,
  onDelete,
}: {
  chapter: TaxonomyChapterNode;
  isExpanded: boolean;
  onToggle: () => void;
  expandedNodes: Record<string, boolean>;
  toggleNode: (id: string) => void;
  matchesSearch: (text?: string | null) => boolean;
  onOpenCreate: (tier: "level" | "subject" | "chapter" | "topic", parentId?: string) => void;
  onOpenEdit: (tier: "level" | "subject" | "chapter" | "topic", data: any) => void;
  onToggleStatus: (tier: "level" | "subject" | "chapter" | "topic", id: string) => void;
  onDelete: (tier: "level" | "subject" | "chapter" | "topic", id: string) => void;
}) {
  const filteredTopics = chapter.topics.filter(
    (t) =>
      matchesSearch(t.name) ||
      matchesSearch(t.topicNumber) ||
      t.subTopics?.some((st) => matchesSearch(st.name) || matchesSearch(st.topicNumber)),
  );

  return (
    <div className="py-1">
      <div className="flex items-center justify-between group rounded-md p-1.5 hover:bg-muted/40 transition-colors border border-transparent hover:border-border/50">
        <div className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
          <button className="p-1 rounded hover:bg-muted text-muted-foreground">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Layers className="h-3 w-3" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              {chapter.chapterNumber && (
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  Ch {chapter.chapterNumber}:
                </span>
              )}
              <span className="font-medium text-xs sm:text-sm text-foreground">{chapter.name}</span>
              {chapter.weightage && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 text-muted-foreground">
                  {chapter.weightage}% weight
                </Badge>
              )}
              {!chapter.isActive && (
                <Badge variant="secondary" className="text-[9px] bg-destructive/10 text-destructive">
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Chapter Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-muted-foreground mr-1 hidden sm:inline">
            {chapter.topicCount} topics
          </span>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-purple-600 hover:bg-purple-500/10"
              title="Add Topic to Chapter"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onOpenCreate("topic", chapter.id);
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              title="Edit Chapter"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onOpenEdit("chapter", chapter);
              }}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${
                chapter.isActive ? "text-blue-500" : "text-muted-foreground"
              }`}
              title={chapter.isActive ? "Deactivate" : "Activate"}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onToggleStatus("chapter", chapter.id);
              }}
            >
              <Power className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:bg-destructive/10"
              title="Delete Chapter"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onDelete("chapter", chapter.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Topics nested */}
      {isExpanded && (
        <div className="pl-6 sm:pl-8 mt-1 space-y-1 border-l-2 border-border/40 ml-3">
          {filteredTopics.length === 0 ? (
            <div className="py-1.5 text-xs text-muted-foreground italic flex items-center justify-between">
              <span>No topics added yet under this chapter.</span>
              <Button
                variant="outline"
                size="sm"
                className="h-5 text-[10px]"
                onClick={() => onOpenCreate("topic", chapter.id)}
              >
                <Plus className="h-2.5 w-2.5 mr-1" /> Add Topic
              </Button>
            </div>
          ) : (
            filteredTopics.map((topic) => (
              <TopicNode
                key={topic.id}
                topic={topic}
                isExpanded={!!expandedNodes[`topic-${topic.id}`]}
                onToggle={() => toggleNode(`topic-${topic.id}`)}
                onOpenEdit={onOpenEdit}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// Topic Node Component
// ==========================================

function TopicNode({
  topic,
  isExpanded,
  onToggle,
  onOpenEdit,
  onToggleStatus,
  onDelete,
}: {
  topic: TaxonomyTopicNode;
  isExpanded: boolean;
  onToggle: () => void;
  onOpenEdit: (tier: "level" | "subject" | "chapter" | "topic", data: any) => void;
  onToggleStatus: (tier: "level" | "subject" | "chapter" | "topic", id: string) => void;
  onDelete: (tier: "level" | "subject" | "chapter" | "topic", id: string) => void;
}) {
  const hasSubTopics = topic.subTopics && topic.subTopics.length > 0;

  const difficultyColors: Record<string, string> = {
    EASY: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    MEDIUM: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    HARD: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };

  const importanceColors: Record<string, string> = {
    LOW: "text-muted-foreground",
    MEDIUM: "text-blue-500",
    HIGH: "text-amber-500",
    VERY_HIGH: "text-rose-500 font-semibold",
  };

  return (
    <div className="py-0.5">
      <div className="flex items-center justify-between group rounded p-1 hover:bg-muted/40 transition-colors">
        <div className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer" onClick={hasSubTopics ? onToggle : undefined}>
          {hasSubTopics ? (
            <button className="p-0.5 rounded hover:bg-muted text-muted-foreground">
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          ) : (
            <Circle className="h-2 w-2 text-muted-foreground/50 ml-1 mr-0.5" />
          )}

          <FileText className="h-3.5 w-3.5 text-purple-500 shrink-0" />

          <div className="truncate flex items-center gap-2">
            {topic.topicNumber && (
              <span className="text-[11px] font-mono font-medium text-purple-600 dark:text-purple-400">
                {topic.topicNumber}
              </span>
            )}
            <span className="text-xs text-foreground font-medium">{topic.name}</span>
            <Badge
              variant="outline"
              className={`text-[9px] px-1 py-0 font-normal ${difficultyColors[topic.difficultyLevel] || ""}`}
            >
              {topic.difficultyLevel}
            </Badge>
            <span className={`text-[10px] flex items-center gap-0.5 ${importanceColors[topic.importanceLevel]}`}>
              <Sparkles className="h-2.5 w-2.5" />
              {topic.importanceLevel}
            </span>
            {!topic.isActive && (
              <Badge variant="secondary" className="text-[9px] bg-destructive/10 text-destructive px-1 py-0">
                Inactive
              </Badge>
            )}
          </div>
        </div>

        {/* Topic Actions */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground hover:text-foreground"
            title="Edit Topic"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onOpenEdit("topic", topic);
            }}
          >
            <Edit2 className="h-2.5 w-2.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-5 w-5 ${topic.isActive ? "text-blue-500" : "text-muted-foreground"}`}
            title={topic.isActive ? "Deactivate" : "Activate"}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onToggleStatus("topic", topic.id);
            }}
          >
            <Power className="h-2.5 w-2.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-destructive hover:bg-destructive/10"
            title="Delete Topic"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onDelete("topic", topic.id);
            }}
          >
            <Trash2 className="h-2.5 w-2.5" />
          </Button>
        </div>
      </div>

      {/* Subtopics */}
      {hasSubTopics && isExpanded && (
        <div className="pl-6 space-y-0.5 border-l border-border/40 ml-3 mt-0.5">
          {topic.subTopics?.map((subTopic: TaxonomyTopicNode) => (
            <div
              key={subTopic.id}
              className="flex items-center justify-between p-1 rounded hover:bg-muted/30 text-[11px] group"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Circle className="h-1.5 w-1.5 text-muted-foreground" />
                {subTopic.topicNumber && (
                  <span className="font-mono text-muted-foreground">{subTopic.topicNumber}</span>
                )}
                <span className="text-foreground">{subTopic.name}</span>
              </div>
              <div className="flex items-center gap-1 opacity-75 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 text-muted-foreground hover:text-foreground"
                  onClick={() => onOpenEdit("topic", subTopic)}
                >
                  <Edit2 className="h-2 w-2" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 text-destructive"
                  onClick={() => onDelete("topic", subTopic.id)}
                >
                  <Trash2 className="h-2 w-2" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
