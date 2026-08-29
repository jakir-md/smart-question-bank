/**
 * @file SingleMCQCreator.tsx
 * @description Single MCQ Ingestion interface for Content Creators.
 * Enforces Acceptance Criteria:
 * - Rich text / LaTeX Question body for math & science
 * - Exactly 4 options (A, B, C, D)
 * - Exactly one correct option selected
 * - All 4 options non-empty
 * - Marks (default = 1) and Explanation
 * - Link to Taxonomy (Class/Level, Subject, Chapter, Topic) and Tags
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useState, useEffect } from "react";
import { MCQService } from "@/services/mcq.service";
import { TaxonomyService } from "@/services/taxonomy.service";
import { TagInputAutocomplete } from "../MetadataTagging/TagInputAutocomplete";
import { TagBadge } from "../MetadataTagging/TagBadge";
import { LatexRenderer } from "../shared/LatexRenderer";
import { LatexMathToolbar } from "../shared/LatexMathToolbar";
import { EducationLevel, Subject, Chapter, Topic } from "@/types/taxonomy.types";
import { Tag } from "@/types/tag.types";
import { IMCQOption, DifficultyLevel } from "@/types/mcq.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  FileQuestion,
  Layers,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Plus,
  Loader2,
  Check,
  Eye,
  RefreshCw,
  Award,
  AlertCircle,
} from "lucide-react";

interface SingleMCQCreatorProps {
  onSuccess?: () => void;
}

const DEFAULT_OPTIONS: IMCQOption[] = [
  { id: "A", text: "9.8 km/s", isCorrect: false },
  { id: "B", text: "11.2 km/s", isCorrect: true },
  { id: "C", text: "8.0 km/s", isCorrect: false },
  { id: "D", text: "12.4 km/s", isCorrect: false },
];

export function SingleMCQCreator({ onSuccess }: SingleMCQCreatorProps) {
  // Taxonomy Cascading States
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");

  // Question Fields
  const [questionText, setQuestionText] = useState<string>(
    "What is the escape velocity $v_e$ from the surface of Earth? (Given radius $R = 6.4 \\times 10^6\\text{ m}$, $g = 9.8\\text{ m/s}^2$)",
  );
  const [options, setOptions] = useState<IMCQOption[]>(DEFAULT_OPTIONS);
  const [marks, setMarks] = useState<number>(1.0);
  const [negativeMarks, setNegativeMarks] = useState<number>(0.25);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("MEDIUM");
  const [explanation, setExplanation] = useState<string>(
    "Escape velocity formula: $v_e = \\sqrt{2gR} = \\sqrt{2 \\times 9.8 \\times 6.4 \\times 10^6} \\approx 11.2\\text{ km/s}$.",
  );

  // Attached Tags
  const [selectedTags, setSelectedTags] = useState<Tag[]>([
    {
      id: "demo-tag-1",
      name: "Dhaka Board 2024",
      slug: "dhaka-board-2024",
      category: "BOARD_EXAM",
      usageCount: 14,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "demo-tag-2",
      name: "Formula Based",
      slug: "formula-based",
      category: "TOPIC_SPECIAL",
      usageCount: 35,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // UI States
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [studentSelectedOption, setStudentSelectedOption] = useState<string | null>(null);
  const [showStudentFeedback, setShowStudentFeedback] = useState<boolean>(false);

  // Fetch initial levels
  useEffect(() => {
    TaxonomyService.getEducationLevels({ isActive: true })
      .then((res) => {
        setLevels(res.data);
        if (res.data.length > 0 && !selectedLevelId) {
          setSelectedLevelId(res.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch subjects on level change
  useEffect(() => {
    if (!selectedLevelId) {
      setSubjects([]);
      setSelectedSubjectId("");
      return;
    }
    TaxonomyService.getSubjects({ educationLevelId: selectedLevelId, isActive: true })
      .then((res) => {
        setSubjects(res.data);
        if (res.data.length > 0) {
          setSelectedSubjectId(res.data[0].id);
        } else {
          setSelectedSubjectId("");
        }
      })
      .catch(() => {});
  }, [selectedLevelId]);

  // Fetch chapters on subject change
  useEffect(() => {
    if (!selectedSubjectId) {
      setChapters([]);
      setSelectedChapterId("");
      return;
    }
    TaxonomyService.getChapters({ subjectId: selectedSubjectId, isActive: true })
      .then((res) => {
        setChapters(res.data);
        if (res.data.length > 0) {
          setSelectedChapterId(res.data[0].id);
        } else {
          setSelectedChapterId("");
        }
      })
      .catch(() => {});
  }, [selectedSubjectId]);

  // Fetch topics on chapter change
  useEffect(() => {
    if (!selectedChapterId) {
      setTopics([]);
      setSelectedTopicId("");
      return;
    }
    TaxonomyService.getTopics({ chapterId: selectedChapterId, isActive: true })
      .then((res) => {
        setTopics(res.data);
        if (res.data.length > 0) {
          setSelectedTopicId(res.data[0].id);
        } else {
          setSelectedTopicId("");
        }
      })
      .catch(() => {});
  }, [selectedChapterId]);

  // Option Handlers
  const handleOptionTextChange = (index: number, text: string) => {
    const updated = [...options];
    updated[index] = { ...updated[index], text };
    setOptions(updated);
  };

  const handleSetCorrectOption = (index: number) => {
    const updated = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(updated);
  };

  const handleInsertFormulaToQuestion = (formula: string) => {
    setQuestionText((prev) => `${prev} ${formula}`);
  };

  const handleInsertFormulaToExplanation = (formula: string) => {
    setExplanation((prev) => `${prev} ${formula}`);
  };

  // Validation Checks (Acceptance Criteria)
  const isQuestionTextValid = questionText.trim().length > 0;
  const areAllOptionsNonEmpty = options.length === 4 && options.every((opt) => opt.text.trim().length > 0);
  const isExactlyOneCorrect = options.filter((opt) => opt.isCorrect).length === 1;
  const isMarksValid = Number(marks) > 0;
  const isFormValid = isQuestionTextValid && areAllOptionsNonEmpty && isExactlyOneCorrect && isMarksValid;

  const handleSave = async () => {
    if (!isQuestionTextValid) {
      toast.error("Question body cannot be empty");
      return;
    }
    if (!areAllOptionsNonEmpty) {
      toast.error("All 4 options (A, B, C, D) must be non-empty");
      return;
    }
    if (!isExactlyOneCorrect) {
      toast.error("Exactly one correct option must be selected");
      return;
    }
    if (!isMarksValid) {
      toast.error("Marks must be greater than 0");
      return;
    }

    setSaving(true);
    try {
      const tagIds = selectedTags
        .filter((t) => !t.id.startsWith("demo-") && !t.id.startsWith("quick-"))
        .map((t) => t.id);
      const tagNames = selectedTags.map((t) => t.name);

      const correctOpt = options.find((o) => o.isCorrect);

      await MCQService.ingestSingleMCQ({
        questionText: questionText.trim(),
        questionType: "MCQ",
        options,
        correctAnswer: correctOpt?.id || "A",
        marks: Number(marks) || 1.0,
        negativeMarks: Number(negativeMarks) || 0.25,
        explanation: explanation.trim() || undefined,
        difficulty,
        educationLevelId: selectedLevelId || undefined,
        subjectId: selectedSubjectId || undefined,
        chapterId: selectedChapterId || undefined,
        topicId: selectedTopicId || undefined,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
        tagNames: tagNames.length > 0 ? tagNames : undefined,
        isActive: true,
        isPublished: true,
      });

      toast.success("Single MCQ Ingested Successfully into Question Bank!");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to ingest MCQ");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setQuestionText("");
    setOptions([
      { id: "A", text: "", isCorrect: true },
      { id: "B", text: "", isCorrect: false },
      { id: "C", text: "", isCorrect: false },
      { id: "D", text: "", isCorrect: false },
    ]);
    setExplanation("");
    setStudentSelectedOption(null);
    setShowStudentFeedback(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ================= Left Form Column ================= */}
      <div className="lg:col-span-7 space-y-6">
        <Card className="rounded-2xl shadow-xs border-border/80 bg-card">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <FileQuestion className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Single MCQ Ingestion</CardTitle>
                  <CardDescription className="text-xs">
                    Create 4-choice objective questions with LaTeX formulas, marks, step explanation, and taxonomy links.
                  </CardDescription>
                </div>
              </div>

              {/* Reset Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Clear
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-4 text-xs sm:text-sm">
            {/* 1. Taxonomy Cascade Card */}
            <div className="p-3.5 bg-muted/40 rounded-xl border border-border/60 space-y-2.5">
              <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  Curriculum Taxonomy & Grade
                </span>
                <span className="text-[11px] text-muted-foreground">Select relevant syllabus path</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Level */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Class / Exam Level</label>
                  <select
                    value={selectedLevelId}
                    onChange={(e) => setSelectedLevelId(e.target.value)}
                    className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Level</option>
                    {levels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chapter */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Chapter</label>
                  <select
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.chapterNumber ? `Ch ${c.chapterNumber}: ` : ""}
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Topic</label>
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Topic</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Question Text with LaTeX Toolbar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <span>Question Body (Rich Text / LaTeX)</span>
                  <span className="text-rose-500">*</span>
                </Label>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Use $formula$ for math equations
                </span>
              </div>

              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Type question body. For math: e.g. What is the derivative of $f(x) = x^2$?"
                rows={3}
                className="w-full rounded-xl border border-input bg-background p-3 text-xs sm:text-sm font-sans outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />

              {/* LaTeX Math Inserter Toolbar */}
              <LatexMathToolbar onInsert={handleInsertFormulaToQuestion} />
            </div>

            {/* 3. Four Options (A, B, C, D) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <span>Answer Options (4 Choices Required)</span>
                  <span className="text-rose-500">*</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Click radio circle to mark the 1 correct answer
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {options.map((option, idx) => {
                  const isCorrect = option.isCorrect;
                  const isEmpty = !option.text.trim();

                  return (
                    <div
                      key={option.id}
                      className={`relative flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                        isCorrect
                          ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-2xs"
                          : isEmpty
                          ? "border-amber-500/40 bg-amber-500/5"
                          : "border-input bg-background hover:border-border"
                      }`}
                    >
                      {/* Correct Option Selector Radio */}
                      <button
                        type="button"
                        onClick={() => handleSetCorrectOption(idx)}
                        className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all cursor-pointer ${
                          isCorrect
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-muted text-muted-foreground hover:bg-emerald-600/20 hover:text-emerald-700"
                        }`}
                        title={isCorrect ? "Correct Option" : "Click to mark as Correct"}
                      >
                        {isCorrect ? <Check className="h-4 w-4 stroke-[3]" /> : option.id}
                      </button>

                      {/* Option Input */}
                      <div className="flex-1 min-w-0">
                        <Input
                          type="text"
                          value={option.text}
                          onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                          placeholder={`Option ${option.id} text (e.g. $11.2\\text{ km/s}$)...`}
                          className="h-8 text-xs border-none bg-transparent shadow-none focus-visible:ring-0 px-1"
                        />
                      </div>

                      {/* Correct Badge Indicator */}
                      {isCorrect && (
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full shrink-0">
                          Correct
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Marks & Difficulty Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/20 rounded-xl border border-border/60">
              {/* Marks */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold flex items-center gap-1">
                  <Award className="h-3 w-3 text-primary" />
                  Marks
                </Label>
                <Input
                  type="number"
                  step="0.25"
                  min="0.1"
                  value={marks}
                  onChange={(e) => setMarks(parseFloat(e.target.value) || 1)}
                  className="h-8 text-xs bg-background"
                />
              </div>

              {/* Negative Marks */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  Negative Penalty
                </Label>
                <Input
                  type="number"
                  step="0.05"
                  min="0"
                  value={negativeMarks}
                  onChange={(e) => setNegativeMarks(parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs bg-background"
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  Difficulty Level
                </Label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full h-8 rounded-lg border bg-background px-2 text-xs outline-none focus:border-primary"
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </div>
            </div>

            {/* 5. Step-by-Step Explanation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-primary" />
                  <span>Step-by-Step Solution & Explanation (Rich Text / LaTeX)</span>
                </Label>
                <span className="text-[10px] text-muted-foreground">Shown to students after test</span>
              </div>

              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain the step-by-step reasoning or mathematical derivation..."
                rows={2}
                className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
              />

              <LatexMathToolbar onInsert={handleInsertFormulaToExplanation} />
            </div>

            {/* 6. Metadata Tags Autocomplete */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Metadata Tags (Board Exams, Institutions, Special Patterns)</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">Type to search or add custom tags</span>
              </div>

              <TagInputAutocomplete
                value={selectedTags}
                onChange={setSelectedTags}
                placeholder="Search Dhaka Board 2024, BUET, Cadet College, Hard..."
              />
            </div>

            {/* 7. Validation Checklist & Publish Button */}
            <div className="pt-3 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {/* Validation Badges */}
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                    isQuestionTextValid
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "border-rose-500/40 bg-rose-500/10 text-rose-600"
                  }`}
                >
                  {isQuestionTextValid ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  Question Text
                </span>

                <span
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                    areAllOptionsNonEmpty
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "border-rose-500/40 bg-rose-500/10 text-rose-600"
                  }`}
                >
                  {areAllOptionsNonEmpty ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  4 Non-empty Options
                </span>

                <span
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                    isExactlyOneCorrect
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "border-rose-500/40 bg-rose-500/10 text-rose-600"
                  }`}
                >
                  {isExactlyOneCorrect ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  1 Correct Answer
                </span>
              </div>

              {/* Ingest Action Button */}
              <Button
                onClick={handleSave}
                disabled={saving || !isFormValid}
                className="w-full sm:w-auto rounded-xl text-xs gap-1.5 bg-primary text-primary-foreground font-semibold px-6 shadow-xs cursor-pointer"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Ingest Single MCQ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= Right Live Preview Column ================= */}
      <div className="lg:col-span-5 space-y-4">
        <Card className="rounded-2xl shadow-xs border-primary/20 bg-linear-to-b from-primary/5 via-card to-card sticky top-20">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Student Test Mode Preview
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {marks} {marks === 1 ? "Mark" : "Marks"}
                </span>
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full">
                  {difficulty}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-4 text-xs sm:text-sm">
            {/* Metadata Tags Ribbon */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tag) => (
                  <TagBadge key={tag.id || tag.slug} tag={tag} size="sm" />
                ))}
              </div>
            )}

            {/* Question Text with Live LaTeX Rendering */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80">
              <div className="font-semibold text-foreground text-sm sm:text-base leading-relaxed">
                {questionText ? (
                  <LatexRenderer content={questionText} />
                ) : (
                  <span className="text-muted-foreground italic">Question preview will appear here...</span>
                )}
              </div>
            </div>

            {/* Interactive Options Preview */}
            <div className="space-y-2">
              {options.map((opt) => {
                const isSelected = studentSelectedOption === opt.id;
                const isActualCorrect = opt.isCorrect;

                let cardStyle = "border-border bg-card hover:border-primary/50 text-foreground";

                if (showStudentFeedback) {
                  if (isActualCorrect) {
                    cardStyle = "border-emerald-500 bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 font-medium";
                  } else if (isSelected && !isActualCorrect) {
                    cardStyle = "border-rose-500 bg-rose-500/15 text-rose-950 dark:text-rose-200 font-medium";
                  }
                } else if (isSelected) {
                  cardStyle = "border-primary bg-primary/10 text-primary font-medium";
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      setStudentSelectedOption(opt.id);
                      setShowStudentFeedback(false);
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${cardStyle}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          showStudentFeedback && isActualCorrect
                            ? "bg-emerald-600 text-white"
                            : isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {opt.id}
                      </span>

                      <div className="truncate text-xs sm:text-sm">
                        {opt.text ? (
                          <LatexRenderer content={opt.text} inline />
                        ) : (
                          <span className="text-muted-foreground italic">Option {opt.id} text</span>
                        )}
                      </div>
                    </div>

                    {showStudentFeedback && isActualCorrect && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    )}
                    {showStudentFeedback && isSelected && !isActualCorrect && (
                      <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Test Simulation Controls */}
            <div className="flex items-center justify-between pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowStudentFeedback(!showStudentFeedback)}
                disabled={!studentSelectedOption}
                className="h-7 text-xs gap-1 rounded-lg"
              >
                {showStudentFeedback ? "Hide Solution" : "Check Student Answer"}
              </Button>

              <span className="text-[10px] text-muted-foreground">
                {studentSelectedOption
                  ? `Selected: Option ${studentSelectedOption}`
                  : "Click an option above to test"}
              </span>
            </div>

            {/* Solution & Explanation Box */}
            {(showStudentFeedback || explanation) && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-950 dark:text-amber-200 space-y-1 text-xs">
                <div className="font-semibold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Solution & Derivation
                </div>
                <div className="text-[11px] leading-relaxed">
                  <LatexRenderer content={explanation || "No explanation provided."} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
