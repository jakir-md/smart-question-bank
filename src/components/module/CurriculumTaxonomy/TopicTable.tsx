/**
 * @file TopicTable.tsx
 * @description Data table component for Topic management (MVC - View).
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useState } from "react";
import { Chapter, DifficultyLevel, EducationLevel, ImportanceLevel, Subject, Topic } from "@/types/taxonomy.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Power,
  Search,
  Sparkles,
  MoveUp,
  MoveDown,
  Layers,
  BookOpen,
  GraduationCap,
  Target,
} from "lucide-react";

interface TopicTableProps {
  topics: Topic[];
  levels: EducationLevel[];
  subjects: Subject[];
  chapters: Chapter[];
  selectedLevelId: string;
  onSelectLevelId: (id: string) => void;
  selectedSubjectId: string;
  onSelectSubjectId: (id: string) => void;
  selectedChapterId: string;
  onSelectChapterId: (id: string) => void;
  loading: boolean;
  onOpenCreate: (chapterId?: string) => void;
  onOpenEdit: (topic: Topic) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (items: { id: string; orderIndex: number }[]) => void;
}

/**
 * Management Table for Topics (Tier 4).
 */
export function TopicTable({
  topics,
  levels,
  subjects,
  chapters,
  selectedLevelId,
  onSelectLevelId,
  selectedSubjectId,
  onSelectSubjectId,
  selectedChapterId,
  onSelectChapterId,
  loading,
  onOpenCreate,
  onOpenEdit,
  onToggleStatus,
  onDelete,
  onReorder,
}: TopicTableProps) {
  const [search, setSearch] = useState("");

  const filteredSubjects = selectedLevelId
    ? subjects.filter((s) => s.educationLevelId === selectedLevelId)
    : subjects;

  const filteredChapters = selectedSubjectId
    ? chapters.filter((c) => c.subjectId === selectedSubjectId)
    : selectedLevelId
      ? chapters.filter((c) => c.subject?.educationLevel?.id === selectedLevelId)
      : chapters;

  const filteredTopics = topics.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.topicNumber && t.topicNumber.toLowerCase().includes(search.toLowerCase())) ||
      (t.chapter?.name && t.chapter.name.toLowerCase().includes(search.toLowerCase())),
  );

  const difficultyColors: Record<DifficultyLevel, string> = {
    EASY: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    MEDIUM: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    HARD: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };

  const importanceColors: Record<ImportanceLevel, string> = {
    LOW: "text-muted-foreground bg-muted/60",
    MEDIUM: "text-blue-600 bg-blue-500/10 border-blue-500/20",
    HIGH: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    VERY_HIGH: "text-rose-600 bg-rose-500/10 border-rose-500/20 font-semibold",
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= topics.length) return;

    const newTopics = [...topics];
    const temp = newTopics[index];
    newTopics[index] = newTopics[targetIndex];
    newTopics[targetIndex] = temp;

    const reordered = newTopics.map((t, idx) => ({
      id: t.id,
      orderIndex: idx,
    }));
    onReorder(reordered);
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Table Header & 3-Step Cascade Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border-b bg-muted/20">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Level Filter */}
          <div className="flex items-center gap-1.5 bg-background border rounded-lg px-2.5 py-1 text-xs">
            <GraduationCap className="h-4 w-4 text-blue-500 shrink-0" />
            <select
              value={selectedLevelId}
              onChange={(e) => {
                onSelectLevelId(e.target.value);
                onSelectSubjectId("");
                onSelectChapterId("");
              }}
              className="bg-transparent border-0 outline-none text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="">All Levels</option>
              {levels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 bg-background border rounded-lg px-2.5 py-1 text-xs">
            <BookOpen className="h-4 w-4 text-emerald-500 shrink-0" />
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                onSelectSubjectId(e.target.value);
                onSelectChapterId("");
              }}
              className="bg-transparent border-0 outline-none text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="">All Subjects</option>
              {filteredSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chapter Filter */}
          <div className="flex items-center gap-1.5 bg-background border rounded-lg px-2.5 py-1 text-xs">
            <Layers className="h-4 w-4 text-amber-500 shrink-0" />
            <select
              value={selectedChapterId}
              onChange={(e) => onSelectChapterId(e.target.value)}
              className="bg-transparent border-0 outline-none text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="">All Chapters</option>
              {filteredChapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.chapterNumber ? `Ch ${c.chapterNumber}: ` : ""}
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background h-9 text-sm"
            />
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => onOpenCreate(selectedChapterId || undefined)}
          className="h-9 gap-1.5 bg-primary text-primary-foreground font-medium shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Topic
        </Button>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Topic Name</TableHead>
              <TableHead>Chapter / Subject</TableHead>
              <TableHead>Difficulty & Importance</TableHead>
              <TableHead>Objectives</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Reorder</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Loading topics...
                </TableCell>
              </TableRow>
            ) : filteredTopics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-medium text-foreground">No Topics Found</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedChapterId
                      ? "No topics in this chapter. Click 'Add Topic' to create one."
                      : "Select a Chapter and click 'Add Topic'."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredTopics.map((topic, index) => (
                <TableRow key={topic.id} className="hover:bg-muted/30">
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
                          {topic.topicNumber && (
                            <span className="text-purple-600 dark:text-purple-400 font-mono text-xs">
                              {topic.topicNumber}
                            </span>
                          )}
                          <span>{topic.name}</span>
                        </div>
                        {topic.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                            {topic.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <Badge variant="outline" className="text-xs font-normal">
                        <Layers className="h-3 w-3 mr-1 text-amber-500" />
                        {topic.chapter?.name || "Unassigned"}
                      </Badge>
                      {topic.chapter?.subject && (
                        <div className="text-[10px] text-muted-foreground">
                          {topic.chapter.subject.name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-medium px-1.5 py-0 ${difficultyColors[topic.difficultyLevel]}`}
                      >
                        {topic.difficultyLevel}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 py-0 ${importanceColors[topic.importanceLevel]}`}
                      >
                        <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                        {topic.importanceLevel}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {topic.learningObjectives && topic.learningObjectives.length > 0 ? (
                      <div className="flex items-center gap-1 text-xs">
                        <Target className="h-3.5 w-3.5 text-cyan-500" />
                        <span className="font-medium">{topic.learningObjectives.length}</span>
                        <span className="text-muted-foreground">goals</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge
                        variant={topic.isActive ? "default" : "secondary"}
                        className={`text-[10px] ${
                          topic.isActive
                            ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/30"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {topic.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {topic.isPublished && (
                        <Badge variant="outline" className="text-[9px] text-blue-500 border-blue-500/30">
                          Published
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={index === 0}
                        onClick={() => moveItem(index, "up")}
                        title="Move Up"
                      >
                        <MoveUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={index === filteredTopics.length - 1}
                        onClick={() => moveItem(index, "down")}
                        title="Move Down"
                      >
                        <MoveDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Edit"
                        onClick={() => onOpenEdit(topic)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${
                          topic.isActive ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground"
                        }`}
                        title={topic.isActive ? "Deactivate" : "Activate"}
                        onClick={() => onToggleStatus(topic.id)}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        title="Delete"
                        onClick={() => onDelete(topic.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
