/**
 * @file ChapterTable.tsx
 * @description Data table component for Chapter management (MVC - View).
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useState } from "react";
import { Chapter, EducationLevel, Subject } from "@/types/taxonomy.types";
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
  Layers,
  Plus,
  Edit2,
  Trash2,
  Power,
  Search,
  FileText,
  Clock,
  Percent,
  MoveUp,
  MoveDown,
  BookOpen,
  GraduationCap,
} from "lucide-react";

interface ChapterTableProps {
  chapters: Chapter[];
  levels: EducationLevel[];
  subjects: Subject[];
  selectedLevelId: string;
  onSelectLevelId: (id: string) => void;
  selectedSubjectId: string;
  onSelectSubjectId: (id: string) => void;
  loading: boolean;
  onOpenCreate: (subjectId?: string) => void;
  onOpenEdit: (chapter: Chapter) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (items: { id: string; orderIndex: number }[]) => void;
}

/**
 * Management Table for Chapters (Tier 3).
 */
export function ChapterTable({
  chapters,
  levels,
  subjects,
  selectedLevelId,
  onSelectLevelId,
  selectedSubjectId,
  onSelectSubjectId,
  loading,
  onOpenCreate,
  onOpenEdit,
  onToggleStatus,
  onDelete,
  onReorder,
}: ChapterTableProps) {
  const [search, setSearch] = useState("");

  const filteredSubjects = selectedLevelId
    ? subjects.filter((s) => s.educationLevelId === selectedLevelId)
    : subjects;

  const filteredChapters = chapters.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.subject?.name && c.subject.name.toLowerCase().includes(search.toLowerCase())),
  );

  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chapters.length) return;

    const newChapters = [...chapters];
    const temp = newChapters[index];
    newChapters[index] = newChapters[targetIndex];
    newChapters[targetIndex] = temp;

    const reordered = newChapters.map((c, idx) => ({
      id: c.id,
      orderIndex: idx,
    }));
    onReorder(reordered);
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Table Header & Cascade Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border-b bg-muted/20">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Level Filter */}
          <div className="flex items-center gap-1.5 bg-background border rounded-lg px-2.5 py-1 text-xs">
            <GraduationCap className="h-4 w-4 text-blue-500 shrink-0" />
            <select
              value={selectedLevelId}
              onChange={(e) => {
                onSelectLevelId(e.target.value);
                onSelectSubjectId(""); // Reset child subject
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
              onChange={(e) => onSelectSubjectId(e.target.value)}
              className="bg-transparent border-0 outline-none text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="">All Subjects</option>
              {filteredSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chapters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background h-9 text-sm"
            />
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => onOpenCreate(selectedSubjectId || undefined)}
          className="h-9 gap-1.5 bg-primary text-primary-foreground font-medium shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Chapter
        </Button>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Chapter Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Weight / Hours</TableHead>
              <TableHead>Topics</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Reorder</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Loading chapters...
                </TableCell>
              </TableRow>
            ) : filteredChapters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <Layers className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-medium text-foreground">No Chapters Found</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedSubjectId
                      ? "No chapters in this subject. Click 'Add Chapter' to create one."
                      : "Select a Subject and click 'Add Chapter'."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredChapters.map((chapter, index) => (
                <TableRow key={chapter.id} className="hover:bg-muted/30">
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
                          {chapter.chapterNumber && (
                            <span className="text-amber-600 dark:text-amber-400 font-mono text-xs">
                              Ch {chapter.chapterNumber}:
                            </span>
                          )}
                          <span>{chapter.name}</span>
                        </div>
                        {chapter.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                            {chapter.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <Badge variant="outline" className="text-xs font-normal">
                        <BookOpen className="h-3 w-3 mr-1 text-emerald-500" />
                        {chapter.subject?.name || "Unassigned"}
                      </Badge>
                      {chapter.subject?.educationLevel && (
                        <div className="text-[10px] text-muted-foreground">
                          {chapter.subject.educationLevel.name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      {chapter.weightage !== null && chapter.weightage !== undefined && (
                        <div className="flex items-center gap-1">
                          <Percent className="h-3 w-3 text-amber-500" />
                          <span className="font-medium text-foreground">{chapter.weightage}%</span>
                          <span>weight</span>
                        </div>
                      )}
                      {chapter.totalEstimatedHours && (
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock className="h-3 w-3 text-blue-500" />
                          <span>{chapter.totalEstimatedHours} hrs</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs">
                      <FileText className="h-3.5 w-3.5 text-purple-500" />
                      <span className="font-medium">{chapter._count?.topics ?? 0}</span>
                      <span className="text-muted-foreground">topics</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge
                        variant={chapter.isActive ? "default" : "secondary"}
                        className={`text-[10px] ${
                          chapter.isActive
                            ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/30"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {chapter.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {chapter.isPublished && (
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
                        disabled={index === filteredChapters.length - 1}
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
                        onClick={() => onOpenEdit(chapter)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${
                          chapter.isActive ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground"
                        }`}
                        title={chapter.isActive ? "Deactivate" : "Activate"}
                        onClick={() => onToggleStatus(chapter.id)}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        title="Delete"
                        onClick={() => onDelete(chapter.id)}
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
