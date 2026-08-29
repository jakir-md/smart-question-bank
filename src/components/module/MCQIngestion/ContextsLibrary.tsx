/**
 * @file ContextsLibrary.tsx
 * @description Dedicated library explorer for Multi-Context Passages, Stems, and Comprehensions.
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useState, useEffect } from "react";
import { MCQService } from "@/services/mcq.service";
import { QuestionContext } from "@/types/mcq.types";
import { LatexRenderer } from "../shared/LatexRenderer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Layers,
  Search,
  BookOpen,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  FileQuestion,
  CheckCircle2,
} from "lucide-react";

interface ContextsLibraryProps {
  refreshTrigger?: number;
  onRefreshNeeded?: () => void;
}

export function ContextsLibrary({ refreshTrigger = 0, onRefreshNeeded }: ContextsLibraryProps) {
  const [contexts, setContexts] = useState<QuestionContext[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [expandedContexts, setExpandedContexts] = useState<Record<string, boolean>>({});

  const fetchContexts = async () => {
    setLoading(true);
    try {
      const res = await MCQService.getQuestionContexts({
        search: search.trim() || undefined,
        limit: 20,
      });
      setContexts(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load passages library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContexts();
  }, [search, refreshTrigger]);

  const toggleExpand = (id: string) => {
    setExpandedContexts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteContext = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this passage stem and all its sub-questions?")) {
      return;
    }
    try {
      await MCQService.deleteQuestionContext(id);
      toast.success("Passage and sub-questions deleted");
      fetchContexts();
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete passage");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <Card className="rounded-2xl border-border/80 bg-card p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search passages by title or keywords..."
              className="pl-8 h-9 text-xs"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchContexts}
            className="h-9 px-3 text-xs gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Context Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          <span className="text-xs">Loading Passages & Stems Library...</span>
        </div>
      ) : contexts.length === 0 ? (
        <Card className="rounded-2xl p-12 text-center border-dashed">
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Layers className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-semibold">No Multi-Context Passages Found</p>
            <p className="text-xs">Use the "Multi-Context Ingestion" tab to create your first passage package.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {contexts.map((ctx) => {
            const isExpanded = expandedContexts[ctx.id];
            const qCount = ctx._count?.questions || ctx.questions?.length || 0;

            return (
              <Card
                key={ctx.id}
                className="rounded-2xl border-purple-500/30 bg-purple-500/2 shadow-xs transition-all hover:border-purple-500/50"
              >
                <CardContent className="p-4 space-y-3 text-xs sm:text-sm">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-7 w-7 rounded-lg bg-purple-500/15 text-purple-600 flex items-center justify-center font-bold">
                        <BookOpen className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <h4 className="font-bold text-foreground text-xs sm:text-sm">
                          {ctx.title || "Untitled Passage Context"}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="bg-purple-500/10 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
                            {ctx.contextType}
                          </span>
                          {ctx.educationLevel && <span>{ctx.educationLevel.name}</span>}
                          {ctx.subject && <span>• {ctx.subject.name}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-purple-600 bg-purple-500/10 px-2.5 py-1 rounded-full">
                        {qCount} Sub-Question{qCount !== 1 ? "s" : ""}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeleteContext(ctx.id)}
                        className="p-1 rounded-md text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete Passage"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Passage Body */}
                  <div className="p-3 rounded-xl bg-card border border-border/80 text-foreground text-xs sm:text-sm leading-relaxed">
                    <LatexRenderer content={ctx.contextText} />
                  </div>

                  {/* Sub-Questions Accordion */}
                  {ctx.questions && ctx.questions.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={() => toggleExpand(ctx.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:underline cursor-pointer"
                      >
                        <FileQuestion className="h-3.5 w-3.5" />
                        <span>
                          {isExpanded
                            ? "Hide Attached Sub-Questions"
                            : `View ${ctx.questions.length} Linked Sub-Questions`}
                        </span>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="space-y-2.5 pl-3 border-l-2 border-purple-500/40 mt-2">
                          {ctx.questions.map((subQ, idx) => (
                            <div
                              key={subQ.id || idx}
                              className="p-3 rounded-xl bg-card border border-border space-y-2 text-xs"
                            >
                              <div className="font-semibold text-foreground flex items-center justify-between">
                                <span>
                                  Q{idx + 1}. <LatexRenderer content={subQ.questionText} inline />
                                </span>
                                <span className="text-[10px] text-muted-foreground">{subQ.marks || 1} mark</span>
                              </div>

                              {/* Options */}
                              <div className="grid grid-cols-2 gap-1.5">
                                {Array.isArray(subQ.options) &&
                                  subQ.options.map((opt: any) => {
                                    const isCorrect = opt.isCorrect || opt.id === subQ.correctAnswer;
                                    return (
                                      <div
                                        key={opt.id}
                                        className={`p-1.5 rounded-lg border text-[11px] flex items-center justify-between ${
                                          isCorrect
                                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-950 dark:text-emerald-300 font-medium"
                                            : "border-border/60 bg-muted/20 text-muted-foreground"
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold">{opt.id}.</span>
                                          <span>
                                            <LatexRenderer content={opt.text} inline />
                                          </span>
                                        </div>
                                        {isCorrect && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          ))}
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
