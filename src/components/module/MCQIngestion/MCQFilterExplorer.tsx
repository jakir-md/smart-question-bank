/**
 * @file MCQFilterExplorer.tsx
 * @description Ingested Question Bank explorer with rich LaTeX rendering, multi-taxonomy filters, tags, and interactive student preview.
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MCQService } from "@/services/mcq.service";
import { TaxonomyService } from "@/services/taxonomy.service";
import { TagService } from "@/services/tag.service";
import { MCQItem, DifficultyLevel } from "@/types/mcq.types";
import { EducationLevel, Subject, Chapter, Topic } from "@/types/taxonomy.types";
import { Tag } from "@/types/tag.types";
import { LatexRenderer } from "../shared/LatexRenderer";
import { TagBadge } from "../MetadataTagging/TagBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Search,
  Filter,
  CheckCircle2,
  HelpCircle,
  Trash2,
  BookOpen,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface MCQFilterExplorerProps {
  refreshTrigger?: number;
  onRefreshNeeded?: () => void;
}

export function MCQFilterExplorer({ refreshTrigger = 0, onRefreshNeeded }: MCQFilterExplorerProps) {
  const [questions, setQuestions] = useState<MCQItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  // Filter States
  const [search, setSearch] = useState<string>("");
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [formatFilter, setFormatFilter] = useState<"ALL" | "SINGLE" | "MULTI">("ALL");

  // Taxonomy Lists
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Fetch Taxonomy
  useEffect(() => {
    TaxonomyService.getEducationLevels({ isActive: true })
      .then((res) => setLevels(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedLevelId) {
      setSubjects([]);
      setSelectedSubjectId("");
      return;
    }
    TaxonomyService.getSubjects({ educationLevelId: selectedLevelId, isActive: true })
      .then((res) => setSubjects(res.data))
      .catch(() => {});
  }, [selectedLevelId]);

  useEffect(() => {
    if (!selectedSubjectId) {
      setChapters([]);
      setSelectedChapterId("");
      return;
    }
    TaxonomyService.getChapters({ subjectId: selectedSubjectId, isActive: true })
      .then((res) => setChapters(res.data))
      .catch(() => {});
  }, [selectedSubjectId]);

  // Fetch Questions
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const isMulti = formatFilter === "MULTI" ? true : formatFilter === "SINGLE" ? false : undefined;
      const res = await MCQService.getMCQs({
        search: search.trim() || undefined,
        educationLevelId: selectedLevelId || undefined,
        subjectId: selectedSubjectId || undefined,
        chapterId: selectedChapterId || undefined,
        difficulty: selectedDifficulty ? (selectedDifficulty as DifficultyLevel) : undefined,
        isMultiContext: isMulti,
        limit: 30,
      });

      setQuestions(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [search, selectedLevelId, selectedSubjectId, selectedChapterId, selectedDifficulty, formatFilter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions, refreshTrigger]);

  const toggleSolution = (id: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await MCQService.deleteMCQ(id);
      toast.success("Question deleted successfully");
      fetchQuestions();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete question");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <Card className="rounded-2xl border-border/80 bg-card p-4 shadow-xs">
        <div className="space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by question text, equation, or solution keywords..."
                className="pl-8 h-9 text-xs"
              />
            </div>

            {/* Format Filter */}
            <div className="flex rounded-lg border bg-muted/30 p-0.5 shrink-0">
              {(["ALL", "SINGLE", "MULTI"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormatFilter(fmt)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                    formatFilter === fmt
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {fmt === "ALL" ? "All Formats" : fmt === "SINGLE" ? "Single MCQs" : "Multi-Context"}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchQuestions}
              className="h-9 px-3 text-xs gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>

          {/* Taxonomy & Difficulty Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-border/50">
            {/* Level */}
            <select
              value={selectedLevelId}
              onChange={(e) => setSelectedLevelId(e.target.value)}
              className="h-8 rounded-lg border bg-background px-2 text-xs outline-none"
            >
              <option value="">All Classes / Levels</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>

            {/* Subject */}
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="h-8 rounded-lg border bg-background px-2 text-xs outline-none"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Chapter */}
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              className="h-8 rounded-lg border bg-background px-2 text-xs outline-none"
            >
              <option value="">All Chapters</option>
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Difficulty */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="h-8 rounded-lg border bg-background px-2 text-xs outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">EASY</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HARD">HARD</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Questions List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Loading Question Bank...</span>
        </div>
      ) : questions.length === 0 ? (
        <Card className="rounded-2xl p-12 text-center border-dashed">
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <BookOpen className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-semibold">No questions found matching your criteria</p>
            <p className="text-xs">Use the tabs above to ingest new Single or Multi-Context MCQs.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => {
            const isMulti = Boolean(q.contextId);
            const isSolutionOpen = expandedSolutions[q.id];

            return (
              <Card
                key={q.id}
                className={`rounded-2xl border transition-all hover:border-primary/40 shadow-xs ${
                  isMulti ? "border-purple-500/30 bg-purple-500/2" : "border-border/80 bg-card"
                }`}
              >
                <CardContent className="p-4 space-y-3 text-xs sm:text-sm">
                  {/* Top Bar: Taxonomy, Type Badge, Marks, Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                      {isMulti && (
                        <span className="font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          Multi-Context Item
                        </span>
                      )}
                      {q.educationLevel && (
                        <span className="bg-muted px-2 py-0.5 rounded-md font-medium text-foreground">
                          {q.educationLevel.name}
                        </span>
                      )}
                      {q.subject && (
                        <span className="bg-muted px-2 py-0.5 rounded-md font-medium text-foreground">
                          {q.subject.name}
                        </span>
                      )}
                      {q.chapter && (
                        <span className="bg-muted px-2 py-0.5 rounded-md font-medium text-muted-foreground">
                          {q.chapter.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {q.marks} Mark{q.marks !== 1 ? "s" : ""}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          q.difficulty === "HARD"
                            ? "bg-rose-500/10 text-rose-600"
                            : q.difficulty === "MEDIUM"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-emerald-500/10 text-emerald-600"
                        }`}
                      >
                        {q.difficulty}
                      </span>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(q.id)}
                        className="p-1 rounded-md text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Context Header (if Multi-context) */}
                  {q.context && (
                    <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
                      <div className="font-bold text-[11px] text-purple-800 dark:text-purple-300">
                        Stem: {q.context.title || "Passage"}
                      </div>
                      <div className="text-muted-foreground line-clamp-2">
                        <LatexRenderer content={q.context.contextText} />
                      </div>
                    </div>
                  )}

                  {/* Question Prompt */}
                  <div className="font-semibold text-foreground text-sm sm:text-base leading-relaxed">
                    <span className="text-muted-foreground mr-1.5 font-bold">#{idx + 1}.</span>
                    <LatexRenderer content={q.questionText} />
                  </div>

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {Array.isArray(q.options) &&
                      q.options.map((opt: any) => {
                        const isCorrect = opt.isCorrect || opt.id === q.correctAnswer;
                        return (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                              isCorrect
                                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-950 dark:text-emerald-300 font-medium"
                                : "border-border/60 bg-muted/20 text-muted-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                  isCorrect
                                    ? "bg-emerald-600 text-white"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {opt.id}
                              </span>
                              <span>
                                <LatexRenderer content={opt.text} inline />
                              </span>
                            </div>

                            {isCorrect && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                          </div>
                        );
                      })}
                  </div>

                  {/* Metadata Tags */}
                  {q.tags && q.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {q.tags.map((t) => (
                        <TagBadge key={t.tag?.id || Math.random()} tag={t.tag} size="sm" />
                      ))}
                    </div>
                  )}

                  {/* Explanation Toggle */}
                  {q.explanation && (
                    <div className="pt-2 border-t border-border/50">
                      <button
                        type="button"
                        onClick={() => toggleSolution(q.id)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                      >
                        <HelpCircle className="h-3 w-3" />
                        <span>{isSolutionOpen ? "Hide Solution" : "View Step-by-Step Solution"}</span>
                        {isSolutionOpen ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>

                      {isSolutionOpen && (
                        <div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-950 dark:text-amber-200 text-xs leading-relaxed">
                          <LatexRenderer content={q.explanation} />
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
