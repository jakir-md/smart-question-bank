/**
 * @file SubjectTable.tsx
 * @description Data table component for Subject management (MVC - View).
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useState } from "react";
import { EducationLevel, Subject } from "@/types/taxonomy.types";
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
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Power,
  Search,
  Layers,
  MoveUp,
  MoveDown,
  GraduationCap,
} from "lucide-react";

interface SubjectTableProps {
  subjects: Subject[];
  levels: EducationLevel[];
  selectedLevelId: string;
  onSelectLevelId: (id: string) => void;
  loading: boolean;
  onOpenCreate: (levelId?: string) => void;
  onOpenEdit: (subject: Subject) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (items: { id: string; orderIndex: number }[]) => void;
}

/**
 * Management Table for Subjects (Tier 2).
 */
export function SubjectTable({
  subjects,
  levels,
  selectedLevelId,
  onSelectLevelId,
  loading,
  onOpenCreate,
  onOpenEdit,
  onToggleStatus,
  onDelete,
  onReorder,
}: SubjectTableProps) {
  const [search, setSearch] = useState("");

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      (s.paper && s.paper.toLowerCase().includes(search.toLowerCase())) ||
      (s.educationLevel?.name && s.educationLevel.name.toLowerCase().includes(search.toLowerCase())),
  );

  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= subjects.length) return;

    const newSubjects = [...subjects];
    const temp = newSubjects[index];
    newSubjects[index] = newSubjects[targetIndex];
    newSubjects[targetIndex] = temp;

    const reordered = newSubjects.map((s, idx) => ({
      id: s.id,
      orderIndex: idx,
    }));
    onReorder(reordered);
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Table Header & Cascade Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border-b bg-muted/20">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Level Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-background border rounded-lg px-2.5 py-1 text-xs">
            <GraduationCap className="h-4 w-4 text-blue-500 shrink-0" />
            <select
              value={selectedLevelId}
              onChange={(e) => onSelectLevelId(e.target.value)}
              className="bg-transparent border-0 outline-none text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="">All Education Levels</option>
              {levels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.name} ({lvl.code})
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background h-9 text-sm"
            />
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => onOpenCreate(selectedLevelId || undefined)}
          className="h-9 gap-1.5 bg-primary text-primary-foreground font-medium shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Subject Name</TableHead>
              <TableHead>Education Level</TableHead>
              <TableHead>Code / Paper</TableHead>
              <TableHead>Chapters</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Reorder</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Loading subjects...
                </TableCell>
              </TableRow>
            ) : filteredSubjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-medium text-foreground">No Subjects Found</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedLevelId
                      ? "No subjects in this level. Click 'Add Subject' to create one."
                      : "Create an Education Level first, then add subjects."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredSubjects.map((subject, index) => (
                <TableRow key={subject.id} className="hover:bg-muted/30">
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">{subject.name}</div>
                        {subject.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                            {subject.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-normal">
                      <GraduationCap className="h-3 w-3 mr-1 text-blue-500" />
                      {subject.educationLevel?.name || "Unassigned"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline" className="font-mono text-xs">
                        {subject.code}
                      </Badge>
                      {subject.paper && (
                        <div className="text-[11px] text-muted-foreground">{subject.paper}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Layers className="h-3.5 w-3.5 text-amber-500" />
                      <span className="font-medium">{subject._count?.chapters ?? 0}</span>
                      <span className="text-muted-foreground">chapters</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge
                        variant={subject.isActive ? "default" : "secondary"}
                        className={`text-[10px] ${
                          subject.isActive
                            ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/30"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {subject.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {subject.isPublished && (
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
                        disabled={index === filteredSubjects.length - 1}
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
                        onClick={() => onOpenEdit(subject)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${
                          subject.isActive ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground"
                        }`}
                        title={subject.isActive ? "Deactivate" : "Activate"}
                        onClick={() => onToggleStatus(subject.id)}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        title="Delete"
                        onClick={() => onDelete(subject.id)}
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
