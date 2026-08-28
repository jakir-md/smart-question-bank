/**
 * @file EducationLevelTable.tsx
 * @description Data table component for Education Level management (MVC - View).
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useState } from "react";
import { EducationLevel } from "@/types/taxonomy.types";
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
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Power,
  Search,
  BookOpen,
  ArrowUpDown,
  MoveUp,
  MoveDown,
} from "lucide-react";

interface EducationLevelTableProps {
  levels: EducationLevel[];
  loading: boolean;
  onOpenCreate: () => void;
  onOpenEdit: (level: EducationLevel) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (items: { id: string; orderIndex: number }[]) => void;
}

/**
 * Management Table for Education Levels (Tier 1).
 */
export function EducationLevelTable({
  levels,
  loading,
  onOpenCreate,
  onOpenEdit,
  onToggleStatus,
  onDelete,
  onReorder,
}: EducationLevelTableProps) {
  const [search, setSearch] = useState("");

  const filteredLevels = levels.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase()) ||
      l.slug.toLowerCase().includes(search.toLowerCase()),
  );

  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= levels.length) return;

    const newLevels = [...levels];
    const temp = newLevels[index];
    newLevels[index] = newLevels[targetIndex];
    newLevels[targetIndex] = temp;

    const reordered = newLevels.map((lvl, idx) => ({
      id: lvl.id,
      orderIndex: idx,
    }));
    onReorder(reordered);
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b bg-muted/20">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search education levels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background h-9 text-sm"
          />
        </div>
        <Button
          size="sm"
          onClick={onOpenCreate}
          className="h-9 gap-1.5 bg-primary text-primary-foreground font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Education Level
        </Button>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Level / Exam Category</TableHead>
              <TableHead>Code & Slug</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Reorder</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading education levels...
                </TableCell>
              </TableRow>
            ) : filteredLevels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-medium text-foreground">No Education Levels Found</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Click &apos;Add Education Level&apos; to create one.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredLevels.map((lvl, index) => (
                <TableRow key={lvl.id} className="hover:bg-muted/30">
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">{lvl.name}</div>
                        {lvl.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                            {lvl.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline" className="font-mono text-xs">
                        {lvl.code}
                      </Badge>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        /{lvl.slug}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs">
                      <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="font-medium">{lvl._count?.subjects ?? 0}</span>
                      <span className="text-muted-foreground">subjects</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge
                        variant={lvl.isActive ? "default" : "secondary"}
                        className={`text-[10px] ${
                          lvl.isActive
                            ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/30"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {lvl.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {lvl.isPublished && (
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
                        disabled={index === filteredLevels.length - 1}
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
                        onClick={() => onOpenEdit(lvl)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${
                          lvl.isActive ? "text-blue-500 hover:text-blue-600" : "text-muted-foreground"
                        }`}
                        title={lvl.isActive ? "Deactivate" : "Activate"}
                        onClick={() => onToggleStatus(lvl.id)}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        title="Delete"
                        onClick={() => onDelete(lvl.id)}
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
