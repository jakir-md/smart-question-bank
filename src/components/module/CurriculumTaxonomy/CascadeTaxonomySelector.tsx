/**
 * @file CascadeTaxonomySelector.tsx
 * @description Reusable 4-tier cascading taxonomy selector for practice & exam workflows (MVC - View).
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  Chapter,
  EducationLevel,
  Subject,
  TaxonomyTreeResponse,
  Topic,
} from "@/types/taxonomy.types";
import { TaxonomyService } from "@/services/taxonomy.service";
import {
  GraduationCap,
  BookOpen,
  Layers,
  FileText,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface SelectedTaxonomyPayload {
  level: EducationLevel | null;
  subject: Subject | null;
  chapter: Chapter | null;
  topic: Topic | null;
}

interface CascadeTaxonomySelectorProps {
  onSelectionComplete?: (selection: SelectedTaxonomyPayload) => void;
  allowTopicSelection?: boolean;
}

/**
 * Universal 4-tier cascading selector component for students to select Exam/Class -> Subject -> Chapter -> Topic.
 */
export function CascadeTaxonomySelector({
  onSelectionComplete,
  allowTopicSelection = true,
}: CascadeTaxonomySelectorProps) {
  const [treeData, setTreeData] = useState<TaxonomyTreeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected Node IDs
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");

  useEffect(() => {
    async function loadActiveTree() {
      try {
        setLoading(true);
        const res = await TaxonomyService.getTaxonomyTree(true); // onlyActive
        setTreeData(res.data);
      } catch (err) {
        console.error("Failed to load active taxonomy tree:", err);
      } finally {
        setLoading(false);
      }
    }
    loadActiveTree();
  }, []);

  const currentLevel = treeData?.tree.find((l) => l.id === selectedLevelId) || null;
  const currentSubject = currentLevel?.subjects.find((s) => s.id === selectedSubjectId) || null;
  const currentChapter = currentSubject?.chapters.find((c) => c.id === selectedChapterId) || null;
  const currentTopic = currentChapter?.topics.find((t) => t.id === selectedTopicId) || null;

  // Active step in the workflow
  const activeStep = !selectedLevelId
    ? 1
    : !selectedSubjectId
      ? 2
      : !selectedChapterId
        ? 3
        : 4;

  const handleReset = () => {
    setSelectedLevelId("");
    setSelectedSubjectId("");
    setSelectedChapterId("");
    setSelectedTopicId("");
  };

  const handleConfirm = () => {
    if (onSelectionComplete) {
      onSelectionComplete({
        level: currentLevel as unknown as EducationLevel,
        subject: currentSubject as unknown as Subject,
        chapter: currentChapter as unknown as Chapter,
        topic: currentTopic as unknown as Topic,
      });
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 space-y-4 animate-pulse">
        <div className="h-6 bg-muted/60 rounded w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted/40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm p-5 space-y-5">
      {/* Header & Steps Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Curriculum Navigator & Selector
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select your curriculum path to practice questions or start a mock exam.
          </p>
        </div>

        {(selectedLevelId || selectedSubjectId) && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs gap-1 self-start sm:self-auto">
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        )}
      </div>

      {/* Breadcrumbs Path */}
      <div className="flex flex-wrap items-center gap-2 text-xs bg-muted/40 p-2.5 rounded-lg border">
        <button
          onClick={() => {
            setSelectedLevelId("");
            setSelectedSubjectId("");
            setSelectedChapterId("");
            setSelectedTopicId("");
          }}
          className={`flex items-center gap-1 font-medium transition-colors ${
            !selectedLevelId ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          {currentLevel ? currentLevel.name : "1. Select Level"}
        </button>

        {currentLevel && (
          <>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
            <button
              onClick={() => {
                setSelectedSubjectId("");
                setSelectedChapterId("");
                setSelectedTopicId("");
              }}
              className={`flex items-center gap-1 font-medium transition-colors ${
                selectedLevelId && !selectedSubjectId
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              {currentSubject ? currentSubject.name : "2. Select Subject"}
            </button>
          </>
        )}

        {currentSubject && (
          <>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
            <button
              onClick={() => {
                setSelectedChapterId("");
                setSelectedTopicId("");
              }}
              className={`flex items-center gap-1 font-medium transition-colors ${
                selectedSubjectId && !selectedChapterId
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              {currentChapter ? currentChapter.name : "3. Select Chapter"}
            </button>
          </>
        )}

        {currentChapter && allowTopicSelection && (
          <>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
            <span
              className={`flex items-center gap-1 font-medium ${
                selectedTopicId ? "text-primary font-bold" : "text-muted-foreground"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              {currentTopic ? currentTopic.name : "4. Select Topic (Optional)"}
            </span>
          </>
        )}
      </div>

      {/* Step 1: Select Level */}
      {activeStep === 1 && (
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Step 1: Choose Education Level / Exam Category
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {treeData?.tree.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedLevelId(level.id)}
                className="flex items-start gap-3 p-3.5 rounded-xl border text-left bg-background hover:bg-muted/40 hover:border-primary/50 transition-all group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:scale-105 transition-transform">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-foreground truncate">{level.name}</div>
                  <Badge variant="outline" className="text-[10px] font-mono mt-1">
                    {level.code}
                  </Badge>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {level.subjectCount} Subjects • {level.topicCount} Topics
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Subject */}
      {activeStep === 2 && currentLevel && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step 2: Choose Subject in {currentLevel.name}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedLevelId("")} className="h-6 text-xs">
              Change Level
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentLevel.subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className="flex items-start gap-3 p-3.5 rounded-xl border text-left bg-background hover:bg-muted/40 hover:border-emerald-500/50 transition-all group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-foreground truncate">{subject.name}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {subject.code}
                    </Badge>
                    {subject.paper && (
                      <Badge variant="secondary" className="text-[10px]">
                        {subject.paper}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {subject.chapterCount} Chapters • {subject.topicCount} Topics
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Select Chapter */}
      {activeStep === 3 && currentSubject && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step 3: Choose Chapter in {currentSubject.name}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedSubjectId("")} className="h-6 text-xs">
              Change Subject
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentSubject.chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => setSelectedChapterId(chapter.id)}
                className="flex items-start gap-3 p-3.5 rounded-xl border text-left bg-background hover:bg-muted/40 hover:border-amber-500/50 transition-all group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-105 transition-transform">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-foreground truncate">
                    {chapter.chapterNumber ? `Ch ${chapter.chapterNumber}: ` : ""}
                    {chapter.name}
                  </div>
                  {chapter.weightage && (
                    <Badge variant="outline" className="text-[10px] mt-1 text-amber-600">
                      {chapter.weightage}% Exam Weight
                    </Badge>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {chapter.topicCount} Topics
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Select Topic (Optional) */}
      {activeStep === 4 && currentChapter && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step 4: Select Specific Topic (or practice all chapter questions)
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedChapterId("")} className="h-6 text-xs">
              Change Chapter
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                setSelectedTopicId("");
                handleConfirm();
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                !selectedTopicId
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "bg-background hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground">Entire Chapter (All Topics)</span>
                {!selectedTopicId && <CheckCircle2 className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Practice questions from all topics in {currentChapter.name}.
              </p>
            </button>

            {currentChapter.topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedTopicId === topic.id
                    ? "border-purple-500 bg-purple-500/5 ring-1 ring-purple-500"
                    : "bg-background hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm text-foreground truncate">
                    {topic.topicNumber ? `${topic.topicNumber} ` : ""}
                    {topic.name}
                  </div>
                  {selectedTopicId === topic.id && <CheckCircle2 className="h-4 w-4 text-purple-500" />}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[9px] font-normal">
                    {topic.difficultyLevel}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {topic.importanceLevel} Priority
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <Button onClick={handleConfirm} className="gap-2 bg-primary text-primary-foreground font-medium">
              Confirm Curriculum Selection
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
