/**
 * @file CQFilterExplorer.tsx
 * @description Ingested Creative Question (CQ) Bank Explorer (MVC - View/Component).
 * Enables Content Creators to query, search, preview, and manage ingested CQ packages with
 * taxonomy cascades, board exam filters, LaTeX formula rendering, and authentic board paper simulation modals.
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CQService } from "@/services/cq.service";
import { TaxonomyService } from "@/services/taxonomy.service";
import { TagService } from "@/services/tag.service";
import { LatexRenderer } from "../shared/LatexRenderer";
import { CQBoardPaperPreview } from "./CQBoardPaperPreview";
import { CQQuestionContextItem, CQQuestionItem, DifficultyLevel } from "@/types/cq.types";
import { EducationLevel, Subject, Chapter } from "@/types/taxonomy.types";
import { Tag } from "@/types/tag.types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  BookOpen,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Trash2,
  Eye,
  Loader2,
  GraduationCap,
  Calendar,
  X,
  FileText,
} from "lucide-react";

interface CQFilterExplorerProps {
  refreshTrigger?: number;
  onRefreshNeeded?: () => void;
}

export function CQFilterExplorer({ refreshTrigger = 0, onRefreshNeeded }: CQFilterExplorerProps) {
  const [cqs, setCqs] = useState<CQQuestionContextItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | "">("");
  const [selectedTag, setSelectedTag] = useState<string>("");

  // Cascade Options
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // Expanded Cards Map
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  // Board Exam Paper Modal State
  const [selectedCQForPaper, setSelectedCQForPaper] = useState<CQQuestionContextItem | null>(null);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Fetch taxonomy and tags options
  useEffect(() => {
    TaxonomyService.getEducationLevels().then((res) => setLevels(res.data || [])).catch(() => {});
    TagService.getPopularTags(20).then((res) => setTags(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedLevelId) {
      TaxonomyService.getSubjects({ educationLevelId: selectedLevelId, isActive: true }).then((res) => setSubjects(res.data || [])).catch(() => {});
    } else {
      setSubjects([]);
      setSelectedSubjectId("");
    }
  }, [selectedLevelId]);

  useEffect(() => {
    if (selectedSubjectId) {
      TaxonomyService.getChapters(selectedSubjectId).then((res) => setChapters(res.data || [])).catch(() => {});
    } else {
      setChapters([]);
      setSelectedChapterId("");
    }
  }, [selectedSubjectId]);

  // Load CQs
  const loadCQs = useCallback(() => {
    setLoading(true);
    CQService.getCQs({
      search: searchTerm.trim() || undefined,
      educationLevelId: selectedLevelId || undefined,
      subjectId: selectedSubjectId || undefined,
      chapterId: selectedChapterId || undefined,
      difficulty: (selectedDifficulty as DifficultyLevel) || undefined,
      tags: selectedTag ? [selectedTag] : undefined,
      page,
      limit: 6,
    })
      .then((res) => {
        setCqs(res.data || []);
        setTotalPages(res.meta?.totalPages || 1);
        setTotalCount(res.meta?.total || 0);
      })
      .catch((err) => {
        toast.error("সৃজনশীল প্রশ্ন লোড করতে ব্যর্থ হয়েছে");
      })
      .finally(() => setLoading(false));
  }, [searchTerm, selectedLevelId, selectedSubjectId, selectedChapterId, selectedDifficulty, selectedTag, page]);

  useEffect(() => {
    loadCQs();
  }, [loadCQs, refreshTrigger]);

  const toggleExpand = (id: string) => {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই সৃজনশীল প্রশ্ন সেটটি মুছে ফেলতে চান?")) return;

    try {
      const res = await CQService.deleteCQ(id);
      if (res.success) {
        toast.success("সৃজনশীল প্রশ্ন সেটটি সফলভাবে মুছে ফেলা হয়েছে");
        loadCQs();
        if (onRefreshNeeded) onRefreshNeeded();
      }
    } catch (err: any) {
      toast.error(err.message || "মুছে ফেলা সম্ভব হয়নি");
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <Card className="rounded-2xl border border-border/80 bg-card/70 backdrop-blur-xs shadow-xs p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="উদ্দীপক বা উপ-প্রশ্নের মূল শব্দ লিখে খুঁজুন..."
              className="pl-9 text-xs rounded-xl h-9"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setSelectedLevelId("");
              setSelectedSubjectId("");
              setSelectedChapterId("");
              setSelectedDifficulty("");
              setSelectedTag("");
              setPage(1);
            }}
            className="text-xs rounded-xl cursor-pointer"
          >
            রিসেট ফিল্টার
          </Button>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-border/50">
          <select
            value={selectedLevelId}
            onChange={(e) => {
              setSelectedLevelId(e.target.value);
              setPage(1);
            }}
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary"
          >
            <option value="">সকল শিক্ষাস্তর</option>
            {levels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              setPage(1);
            }}
            disabled={subjects.length === 0}
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary disabled:opacity-50"
          >
            <option value="">সকল বিষয়</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          <select
            value={selectedChapterId}
            onChange={(e) => {
              setSelectedChapterId(e.target.value);
              setPage(1);
            }}
            disabled={chapters.length === 0}
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary disabled:opacity-50"
          >
            <option value="">সকল অধ্যায়</option>
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value as DifficultyLevel | "");
              setPage(1);
            }}
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary"
          >
            <option value="">সকল কঠিন্য স্তর</option>
            <option value="EASY">সহজ (Easy)</option>
            <option value="MEDIUM">মাঝারি (Medium)</option>
            <option value="HARD">কঠিন (Hard)</option>
          </select>
        </div>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>মোট পাওয়া গেছে: <strong className="text-foreground">{totalCount}</strong> টি সৃজনশীল প্রশ্ন সেট</span>
        <span>পৃষ্ঠা: {page} / {totalPages}</span>
      </div>

      {/* Cards List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">সৃজনশীল প্রশ্ন লোড করা হচ্ছে...</p>
        </div>
      ) : cqs.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-border/80 p-8 space-y-3">
          <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">কোনো সৃজনশীল প্রশ্ন পাওয়া যায়নি</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            আপনার ফিল্টার অনুযায়ী কোনো প্রশ্ন মেলেনি অথবা এখনো কোনো সৃজনশীল প্রশ্ন ইনজেস্ট করা হয়নি।
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cqs.map((cq) => {
            const isExpanded = !!expandedMap[cq.id];
            const sortedQuestions = [...(cq.questions || [])].sort((a, b) => a.contextOrder - b.contextOrder);
            const totalMarks = sortedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);

            return (
              <Card
                key={cq.id}
                className="rounded-2xl border border-border/80 bg-card shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Header Line */}
                <CardHeader className="py-3.5 px-5 bg-muted/20 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-primary" />
                        {cq.title || "সৃজনশীল প্রশ্ন উদ্দীপক"}
                      </span>
                      <Badge variant="outline" className="text-[11px] bg-primary/5 text-primary border-primary/20">
                        পূর্ণমান: {totalMarks} নম্বর
                      </Badge>
                      <Badge variant="secondary" className="text-[11px]">
                        ৪টি উপ-প্রশ্ন (ক, খ, গ, ঘ)
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      {cq.educationLevel && <span>{cq.educationLevel.name}</span>}
                      {cq.subject && <span>• {cq.subject.name}</span>}
                      {cq.chapter && <span>• {cq.chapter.name}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCQForPaper(cq)}
                      className="h-8 text-xs rounded-xl cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      বোর্ড প্রশ্নপত্র ভিউ
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(cq.id)}
                      className="h-8 text-xs text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Uddipok Content */}
                  <div className="p-4 rounded-xl border border-border/70 bg-muted/10 space-y-2">
                    <div className="text-xs font-semibold text-primary">উদ্দীপক (Stimulus):</div>
                    <div className="text-xs text-foreground leading-relaxed">
                      <LatexRenderer content={cq.contextText} />
                    </div>

                    {/* Media Preview if attached */}
                    {cq.mediaUrl && (
                      <div className="mt-2 pt-2 border-t border-border/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cq.mediaUrl}
                          alt="CQ Diagram"
                          className="max-h-44 object-contain rounded-lg border border-border/60 bg-background/50 p-1"
                        />
                      </div>
                    )}
                  </div>

                  {/* Sub-Questions Toggle Button */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => toggleExpand(cq.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      {isExpanded ? "উপ-প্রশ্নসমূহ লুকান" : "৪টি উপ-প্রশ্ন ও সমাধান দেখুন (ক, খ, গ, ঘ)"}
                    </button>
                  </div>

                  {/* Expanded 4 Sub-questions */}
                  {isExpanded && (
                    <div className="space-y-3 pt-2 border-t border-border/60">
                      {sortedQuestions.map((sub, idx) => {
                        const labels = ["ক", "খ", "গ", "ঘ"];
                        const label = labels[idx] || `${idx + 1}`;

                        return (
                          <div
                            key={sub.id}
                            className="p-3.5 rounded-xl border border-border/60 bg-background space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2 text-xs">
                              <div className="flex items-start gap-2 flex-1">
                                <span className="font-bold text-primary text-sm">({label})</span>
                                <div className="text-foreground leading-relaxed flex-1">
                                  <LatexRenderer content={sub.questionText} />
                                </div>
                              </div>
                              <Badge variant="outline" className="text-[11px] font-mono shrink-0">
                                {sub.marks} নম্বর
                              </Badge>
                            </div>

                            {sub.explanation && (
                              <div className="pl-5 pt-2 border-t border-border/40 text-[11px] text-muted-foreground bg-emerald-500/5 p-2 rounded-lg">
                                <div className="font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5">
                                  আদর্শ উত্তর ও সমাধান:
                                </div>
                                <LatexRenderer content={sub.explanation} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs rounded-xl"
              >
                পূর্ববর্তী
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                পৃষ্ঠা {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs rounded-xl"
              >
                পরবর্তী
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Board Paper Simulation Modal */}
      {selectedCQForPaper && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setSelectedCQForPaper(null)}
              className="absolute -top-3 -right-3 z-10 h-8 w-8 rounded-full bg-background shadow-md border cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
            <CQBoardPaperPreview
              stimulus={{
                title: selectedCQForPaper.title,
                contextText: selectedCQForPaper.contextText,
                contextType: selectedCQForPaper.contextType,
                mediaUrl: selectedCQForPaper.mediaUrl,
              }}
              questions={selectedCQForPaper.questions.map((q, idx) => {
                const labels: ("ক" | "খ" | "গ" | "ঘ")[] = ["ক", "খ", "গ", "ঘ"];
                const cognitiveLevels = ["KNOWLEDGE", "COMPREHENSION", "APPLICATION", "HIGHER_ABILITY"] as const;
                return {
                  label: labels[idx] || "ক",
                  cognitiveLevel: cognitiveLevels[idx] || "KNOWLEDGE",
                  questionText: q.questionText,
                  marks: q.marks,
                  explanation: q.explanation,
                  difficulty: q.difficulty,
                  order: q.contextOrder,
                };
              })}
              subjectName={selectedCQForPaper.subject?.name}
              chapterName={selectedCQForPaper.chapter?.name}
              totalMarks={10}
            />
          </div>
        </div>
      )}
    </div>
  );
}
