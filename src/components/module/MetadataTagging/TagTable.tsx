/**
 * @file TagTable.tsx
 * @description Admin Tag Management data table with category filters, search, status toggling, and CRUD actions.
 * Complies with Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React from "react";
import { Tag, TagCategory, TAG_CATEGORIES_CONFIG } from "@/types/tag.types";
import { TagBadge } from "./TagBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

interface TagTableProps {
  tags: Tag[];
  loading: boolean;
  selectedCategory: TagCategory | "ALL";
  onSelectCategory: (cat: TagCategory | "ALL") => void;
  activeFilter: "all" | "active" | "inactive";
  onSelectActiveFilter: (val: "all" | "active" | "inactive") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (p: number) => void;
  onOpenCreate: (category?: TagCategory) => void;
  onOpenBulk: () => void;
  onOpenEdit: (tag: Tag) => void;
  onOpenDelete: (tag: Tag) => void;
  onToggleStatus: (id: string) => void;
}

export function TagTable({
  tags,
  loading,
  selectedCategory,
  onSelectCategory,
  activeFilter,
  onSelectActiveFilter,
  searchQuery,
  onSearchChange,
  page,
  totalPages,
  totalCount,
  onPageChange,
  onOpenCreate,
  onOpenBulk,
  onOpenEdit,
  onOpenDelete,
  onToggleStatus,
}: TagTableProps) {
  const categoryKeys: (TagCategory | "ALL")[] = [
    "ALL",
    "BOARD_EXAM",
    "CADET_COLLEGE",
    "ADMISSION_TEST",
    "INSTITUTION",
    "DIFFICULTY",
    "EXAM_YEAR",
    "TOPIC_SPECIAL",
    "CUSTOM",
  ];

  return (
    <div className="space-y-4">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categoryKeys.map((cat) => {
          const isSelected = selectedCategory === cat;
          const label = cat === "ALL" ? "All Domains" : TAG_CATEGORIES_CONFIG[cat].label;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-background border-input hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Action and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search & Status Filters */}
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tags by name, slug or keyword..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 text-xs sm:text-sm rounded-xl"
            />
          </div>

          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border text-xs">
            <button
              type="button"
              onClick={() => onSelectActiveFilter("all")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeFilter === "all" ? "bg-background font-semibold shadow-2xs text-foreground" : "text-muted-foreground"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onSelectActiveFilter("active")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeFilter === "active" ? "bg-background font-semibold shadow-2xs text-foreground" : "text-muted-foreground"
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => onSelectActiveFilter("inactive")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeFilter === "inactive" ? "bg-background font-semibold shadow-2xs text-foreground" : "text-muted-foreground"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Create Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenBulk}
            className="h-9 gap-1.5 text-xs rounded-xl"
            title="Bulk Add Multiple Tags"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Bulk Create
          </Button>

          <Button
            size="sm"
            onClick={() => onOpenCreate(selectedCategory !== "ALL" ? selectedCategory : undefined)}
            className="h-9 gap-1.5 text-xs rounded-xl bg-primary text-primary-foreground font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Tag
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[240px] text-xs font-semibold">Tag Name & Badge</TableHead>
              <TableHead className="text-xs font-semibold">Category Domain</TableHead>
              <TableHead className="text-xs font-semibold">Slug Identifier</TableHead>
              <TableHead className="text-xs font-semibold">Questions Attached</TableHead>
              <TableHead className="text-xs font-semibold text-center">Status</TableHead>
              <TableHead className="text-xs font-semibold text-right w-[110px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : tags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Filter className="h-8 w-8 text-muted-foreground/50 stroke-1" />
                    <p className="text-sm font-medium">No metadata tags found</p>
                    <p className="text-xs">Try adjusting your category filter or create a new tag.</p>
                    <Button
                      size="sm"
                      onClick={() => onOpenCreate()}
                      className="mt-2 text-xs rounded-lg gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create Tag
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tags.map((tag) => {
                const catInfo = TAG_CATEGORIES_CONFIG[tag.category] || TAG_CATEGORIES_CONFIG.CUSTOM;

                return (
                  <TableRow key={tag.id} className="hover:bg-muted/30 transition-colors">
                    {/* Tag Name & Badge */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <TagBadge tag={tag} size="sm" />
                        {tag.description && (
                          <span className="text-[11px] text-muted-foreground line-clamp-1">
                            {tag.description}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Category Domain */}
                    <TableCell>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-md font-medium border ${catInfo.bgLight} ${catInfo.textColor} ${catInfo.borderColor}`}
                      >
                        {catInfo.label}
                      </span>
                    </TableCell>

                    {/* Slug Identifier */}
                    <TableCell>
                      <code className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                        {tag.slug}
                      </code>
                    </TableCell>

                    {/* Questions Attached */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground">
                          {tag._count?.questions ?? tag.usageCount ?? 0}
                        </span>
                        <span className="text-[11px] text-muted-foreground">questions</span>
                      </div>
                    </TableCell>

                    {/* Status Toggle */}
                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(tag.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                          tag.isActive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                        }`}
                        title="Click to toggle status"
                      >
                        {tag.isActive ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </>
                        )}
                      </button>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onOpenEdit(tag)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                          title="Edit Tag"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onOpenDelete(tag)}
                          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                          title="Delete Tag"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          <div>
            Showing <span className="font-medium text-foreground">{tags.length}</span> of{" "}
            <span className="font-medium text-foreground">{totalCount}</span> tags
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="h-8 px-2.5 gap-1 text-xs rounded-lg"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>

            <span className="px-2 text-xs font-medium">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-8 px-2.5 gap-1 text-xs rounded-lg"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
