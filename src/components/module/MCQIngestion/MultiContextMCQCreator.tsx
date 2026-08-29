/**
 * @file MultiContextMCQCreator.tsx
 * @description Multi-Context (Passage / Stem / Scenario based) MCQ Ingestion interface.
 * Allows Content Creators to author a shared stimulus/passage with rich text & LaTeX,
 * and dynamically attach multiple sub-questions with 4 options, 1 correct answer, marks, and explanations.
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
import { ContextType, DifficultyLevel, IMCQOption, SubQuestionInput } from "@/types/mcq.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Layers,
  FileText,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Sparkles,
  RefreshCw,
  Eye,
  BookOpen,
} from "lucide-react";

interface MultiContextMCQCreatorProps {
  onSuccess?: () => void;
}

const DEFAULT_SUB_QUESTIONS: SubQuestionInput[] = [
  {
    id: "sub-1",
    questionText: "What is the maximum height $H_{\\max}$ reached by the projectile?",
    questionType: "MCQ",
    options: [
      { id: "A", text: "20.4 m", isCorrect: true },
      { id: "B", text: "40.8 m", isCorrect: false },
      { id: "C", text: "15.2 m", isCorrect: false },
      { id: "D", text: "30.6 m", isCorrect: false },
    ],
    correctAnswer: "A",
    marks: 1.0,
    negativeMarks: 0.25,
    difficulty: "MEDIUM",
    explanation:
      "Maximum height $H_{\\max} = \\frac{u^2 \\sin^2 \\theta}{2g} = \\frac{40^2 \\times \\sin^2 30^\\circ}{2 \\times 9.8} = \\frac{1600 \\times 0.25}{19.6} \\approx 20.4\\text{ m}$.",
    order: 1,
  },
  {
    id: "sub-2",
    questionText: "What is the total time of flight $T$ before the projectile hits the ground?",
    questionType: "MCQ",
    options: [
      { id: "A", text: "2.04 s", isCorrect: false },
      { id: "B", text: "4.08 s", isCorrect: true },
      { id: "C", text: "8.16 s", isCorrect: false },
      { id: "D", text: "1.50 s", isCorrect: false },
    ],
    correctAnswer: "B",
    marks: 1.0,
    negativeMarks: 0.25,
    difficulty: "EASY",
    explanation:
      "Time of flight $T = \\frac{2u \\sin \\theta}{g} = \\frac{2 \\times 40 \\times 0.5}{9.8} = \\frac{40}{9.8} \\approx 4.08\\text{ s}$.",
    order: 2,
  },
];

export function MultiContextMCQCreator({ onSuccess }: MultiContextMCQCreatorProps) {
  // Taxonomy Cascade States
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");

  // Context Fields
  const [contextTitle, setContextTitle] = useState<string>("Scenario: Projectile Launch at an Angle");
  const [contextType, setContextType] = useState<ContextType>("SCENARIO");
  const [contextText, setContextText] = useState<string>(
    "A body of mass $m = 2\\text{ kg}$ is launched from the horizontal ground with an initial velocity $u = 40\\text{ m/s}$ at an angle $\\theta = 30^\\circ$ above the horizontal. Assume acceleration due to gravity $g = 9.8\\text{ m/s}^2$ and neglect air resistance.\n\nAnswer the following sequential questions based on this stem:",
  );
  const [mediaUrl, setMediaUrl] = useState<string>("");

  // Sub-questions Array
  const [questions, setQuestions] = useState<SubQuestionInput[]>(DEFAULT_SUB_QUESTIONS);

  // Common Tags
  const [commonTags, setCommonTags] = useState<Tag[]>([
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
      name: "Stem Based",
      slug: "stem-based",
      category: "TOPIC_SPECIAL",
      usageCount: 22,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // UI States
  const [saving, setSaving] = useState<boolean>(false);
  const [studentAnswers, setStudentAnswers] = useState<Record<number, string>>({});
  const [showSolutions, setShowSolutions] = useState<boolean>(false);

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
        if (res.data.length > 0) setSelectedSubjectId(res.data[0].id);
        else setSelectedSubjectId("");
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
        if (res.data.length > 0) setSelectedChapterId(res.data[0].id);
        else setSelectedChapterId("");
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
        if (res.data.length > 0) setSelectedTopicId(res.data[0].id);
        else setSelectedTopicId("");
      })
      .catch(() => {});
  }, [selectedChapterId]);

  // Sub-question Handlers
  const handleAddQuestion = () => {
    const nextIdx = questions.length + 1;
    const newQ: SubQuestionInput = {
      id: `sub-${Date.now()}`,
      questionText: "",
      questionType: "MCQ",
      options: [
        { id: "A", text: "", isCorrect: true },
        { id: "B", text: "", isCorrect: false },
        { id: "C", text: "", isCorrect: false },
        { id: "D", text: "", isCorrect: false },
      ],
      correctAnswer: "A",
      marks: 1.0,
      negativeMarks: 0.25,
      difficulty: "MEDIUM",
      explanation: "",
      order: nextIdx,
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) {
      toast.error("Multi-context requires at least 1 sub-question");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (qIdx: number, text: string) => {
    const updated = [...questions];
    updated[qIdx].questionText = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, text: string) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx].text = text;
    setQuestions(updated);
  };

  const handleSetCorrectOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options = updated[qIdx].options.map((opt, i) => ({
      ...opt,
      isCorrect: i === optIdx,
    }));
    updated[qIdx].correctAnswer = updated[qIdx].options[optIdx].id;
    setQuestions(updated);
  };

  const handleExplanationChange = (qIdx: number, explanation: string) => {
    const updated = [...questions];
    updated[qIdx].explanation = explanation;
    setQuestions(updated);
  };

  const handleMarksChange = (qIdx: number, marks: number) => {
    const updated = [...questions];
    updated[qIdx].marks = marks;
    setQuestions(updated);
  };

  const handleDifficultyChange = (qIdx: number, diff: DifficultyLevel) => {
    const updated = [...questions];
    updated[qIdx].difficulty = diff;
    setQuestions(updated);
  };

  // Validation Logic
  const isContextValid = contextText.trim().length > 0;
  const areAllQuestionsValid =
    questions.length > 0 &&
    questions.every(
      (q) =>
        q.questionText.trim().length > 0 &&
        q.options.length === 4 &&
        q.options.every((opt) => opt.text.trim().length > 0) &&
        q.options.filter((opt) => opt.isCorrect).length === 1 &&
        (q.marks || 1) > 0,
    );

  const isFormValid = isContextValid && areAllQuestionsValid;

  const handleSave = async () => {
    if (!isContextValid) {
      toast.error("Context / passage text cannot be empty");
      return;
    }
    if (!areAllQuestionsValid) {
      toast.error(
        "Please ensure all sub-questions have question text, 4 non-empty options, and exactly 1 correct answer",
      );
      return;
    }

    setSaving(true);
    try {
      const commonTagIds = commonTags
        .filter((t) => !t.id.startsWith("demo-") && !t.id.startsWith("quick-"))
        .map((t) => t.id);
      const commonTagNames = commonTags.map((t) => t.name);

      await MCQService.ingestMultiContextMCQ({
        context: {
          title: contextTitle.trim() || undefined,
          contextText: contextText.trim(),
          contextType,
          mediaUrl: mediaUrl.trim() || undefined,
          educationLevelId: selectedLevelId || undefined,
          subjectId: selectedSubjectId || undefined,
          chapterId: selectedChapterId || undefined,
          topicId: selectedTopicId || undefined,
          isActive: true,
          isPublished: true,
        },
        questions,
        commonTagIds: commonTagIds.length > 0 ? commonTagIds : undefined,
        commonTagNames: commonTagNames.length > 0 ? commonTagNames : undefined,
      });

      toast.success(
        `Multi-Context MCQ Package (${questions.length} questions) Ingested Successfully!`,
      );
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to ingest Multi-Context MCQs");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ================= Left Form Column ================= */}
      <div className="lg:col-span-7 space-y-6">
        {/* Context / Stem Builder Card */}
        <Card className="rounded-2xl shadow-xs border-purple-500/30 bg-card">
          <CardHeader className="pb-3 border-b bg-purple-500/5 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-500/15 text-purple-600 flex items-center justify-center font-bold">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Shared Passage / Scenario Stem</CardTitle>
                  <CardDescription className="text-xs">
                    Define the overarching passage, reading comprehension, or scientific problem stem.
                  </CardDescription>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600">
                Multi-Context Ingestion
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-4 text-xs sm:text-sm">
            {/* Title & Context Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs font-semibold">Passage / Stem Title (Optional)</Label>
                <Input
                  type="text"
                  value={contextTitle}
                  onChange={(e) => setContextTitle(e.target.value)}
                  placeholder="e.g. Scenario 1: Projectile Motion or Passage 3"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Context Type</Label>
                <select
                  value={contextType}
                  onChange={(e) => setContextType(e.target.value as ContextType)}
                  className="w-full h-8 rounded-lg border bg-background px-2 text-xs outline-none focus:border-primary"
                >
                  <option value="SCENARIO">SCENARIO</option>
                  <option value="PASSAGE">PASSAGE</option>
                  <option value="COMPREHENSION">COMPREHENSION</option>
                  <option value="CASE_STUDY">CASE STUDY</option>
                  <option value="EXPERIMENT_DATA">EXPERIMENT DATA</option>
                  <option value="STEM">STEM</option>
                </select>
              </div>
            </div>

            {/* Context Text with LaTeX toolbar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <span>Context Text / Passage Body (Rich Text / LaTeX)</span>
                  <span className="text-rose-500">*</span>
                </Label>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Use $formula$ for LaTeX math
                </span>
              </div>

              <textarea
                value={contextText}
                onChange={(e) => setContextText(e.target.value)}
                placeholder="Write the passage, mathematical scenario, diagram description, or experimental setup..."
                rows={4}
                className="w-full rounded-xl border border-input bg-background p-3 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
              />

              <LatexMathToolbar onInsert={(f) => setContextText((prev) => `${prev} ${f}`)} />
            </div>

            {/* Taxonomy Hierarchy */}
            <div className="p-3 bg-muted/40 rounded-xl border border-border/60 space-y-2">
              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" />
                Default Context Syllabus & Taxonomy
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground font-medium">Class / Level</label>
                  <select
                    value={selectedLevelId}
                    onChange={(e) => setSelectedLevelId(e.target.value)}
                    className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary"
                  >
                    <option value="">Select Level</option>
                    {levels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground font-medium">Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground font-medium">Chapter</label>
                  <select
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary"
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground font-medium">Topic</label>
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary"
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

            {/* Common Tags */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Common Passage Tags</span>
              </Label>
              <TagInputAutocomplete
                value={commonTags}
                onChange={setCommonTags}
                placeholder="Search board exams, institutions, or custom tags for this passage..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Sub-Questions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                Sub-Questions ({questions.length} Linked Items)
              </h3>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddQuestion}
              className="h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/5 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Sub-Question
            </Button>
          </div>

          {questions.map((q, qIdx) => (
            <Card
              key={q.id || qIdx}
              className="rounded-2xl border border-border/80 bg-card/80 shadow-xs relative overflow-hidden"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between p-3.5 border-b bg-muted/20">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                    {qIdx + 1}
                  </span>
                  <span className="font-semibold text-xs text-foreground">Question {qIdx + 1}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Difficulty Selector */}
                  <select
                    value={q.difficulty}
                    onChange={(e) => handleDifficultyChange(qIdx, e.target.value as DifficultyLevel)}
                    className="h-7 rounded-md border bg-background px-2 text-[11px] outline-none"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>

                  {/* Marks */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-muted-foreground">Marks:</span>
                    <Input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={q.marks || 1}
                      onChange={(e) => handleMarksChange(qIdx, parseFloat(e.target.value) || 1)}
                      className="h-7 w-14 text-xs"
                    />
                  </div>

                  {/* Remove Button */}
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="p-1 rounded-md text-muted-foreground hover:text-rose-500 cursor-pointer"
                      title="Remove question"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <CardContent className="p-4 space-y-3.5 text-xs sm:text-sm">
                {/* Question Body */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Question Prompt (Rich Text / LaTeX)</Label>
                  <textarea
                    value={q.questionText}
                    onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                    placeholder={`e.g. What is the maximum height reached?`}
                    rows={2}
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                  />
                  <LatexMathToolbar
                    onInsert={(f) => handleQuestionTextChange(qIdx, `${q.questionText} ${f}`)}
                  />
                </div>

                {/* 4 Options Grid */}
                <div className="space-y-2">
                  <Label className="text-[11px] font-semibold">4 Options (Select 1 correct answer)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = opt.isCorrect;
                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                            isCorrect
                              ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/20"
                              : "border-input bg-background"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSetCorrectOption(qIdx, optIdx)}
                            className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer ${
                              isCorrect
                                ? "bg-emerald-600 text-white"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                            title={isCorrect ? "Correct Option" : "Mark as Correct"}
                          >
                            {isCorrect ? <Check className="h-3 w-3 stroke-[3]" /> : opt.id}
                          </button>

                          <Input
                            type="text"
                            value={opt.text}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            placeholder={`Option ${opt.id}...`}
                            className="h-7 text-xs border-none bg-transparent shadow-none focus-visible:ring-0 px-1"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" />
                    Explanation / Derivation
                  </Label>
                  <textarea
                    value={q.explanation || ""}
                    onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                    placeholder="Step-by-step mathematical reasoning..."
                    rows={1}
                    className="w-full rounded-xl border border-input bg-background p-2 text-xs outline-none focus:border-primary font-sans"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Global Save Button */}
        <div className="pt-2 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving || !isFormValid}
            className="w-full sm:w-auto rounded-xl text-xs gap-1.5 bg-primary text-primary-foreground font-semibold px-8 h-10 shadow-xs cursor-pointer"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Ingest Multi-Context Package ({questions.length} MCQs)
          </Button>
        </div>
      </div>

      {/* ================= Right Student Preview Column ================= */}
      <div className="lg:col-span-5 space-y-4">
        <Card className="rounded-2xl shadow-xs border-purple-500/20 bg-linear-to-b from-purple-500/5 via-card to-card sticky top-20">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Student Multi-Context Exam View
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600">
                {questions.length} Questions
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-4 text-xs sm:text-sm max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
            {/* Passage / Stem Box */}
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-foreground space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                  {contextTitle || "Scenario Context"}
                </span>
                <span className="text-[10px] bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
                  {contextType}
                </span>
              </div>

              <div className="text-xs sm:text-sm leading-relaxed">
                {contextText ? (
                  <LatexRenderer content={contextText} />
                ) : (
                  <span className="text-muted-foreground italic">Passage text will appear here...</span>
                )}
              </div>
            </div>

            {/* Sub-Questions Sequential Display */}
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id || idx} className="p-3.5 rounded-xl border border-border bg-card space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-foreground text-xs sm:text-sm">
                      Q{idx + 1}. <LatexRenderer content={q.questionText || "Question prompt..."} inline />
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{q.marks || 1} mark</span>
                  </div>

                  {/* Options */}
                  <div className="space-y-1.5">
                    {q.options.map((opt) => {
                      const isSelected = studentAnswers[idx] === opt.id;
                      const isActualCorrect = opt.isCorrect;

                      let style = "border-border bg-card text-foreground";
                      if (showSolutions) {
                        if (isActualCorrect) {
                          style = "border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 font-medium";
                        } else if (isSelected && !isActualCorrect) {
                          style = "border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-300";
                        }
                      } else if (isSelected) {
                        style = "border-primary bg-primary/10 text-primary font-medium";
                      }

                      return (
                        <div
                          key={opt.id}
                          onClick={() => setStudentAnswers({ ...studentAnswers, [idx]: opt.id })}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${style}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center font-bold text-[10px]">
                              {opt.id}
                            </span>
                            <span>
                              <LatexRenderer content={opt.text || `Option ${opt.id}`} inline />
                            </span>
                          </div>

                          {showSolutions && isActualCorrect && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Solution */}
                  {showSolutions && q.explanation && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-300">
                      <strong>Solution:</strong> <LatexRenderer content={q.explanation} inline />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Test Simulation Controls */}
            <div className="pt-2 flex justify-between items-center border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSolutions(!showSolutions)}
                className="h-7 text-xs"
              >
                {showSolutions ? "Hide Answers" : "Verify Student Answers"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStudentAnswers({})}
                className="h-7 text-xs text-muted-foreground"
              >
                Reset Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
