/**
 * @file QuestionCreatorWithTags.tsx
 * @description Question authoring interface with embedded Auto-complete Tag input and taxonomy integration.
 * Complies with Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Tag } from "@/types/tag.types";
import { TagInputAutocomplete } from "./TagInputAutocomplete";
import { TagBadge } from "./TagBadge";
import { TagService } from "@/services/tag.service";
import { TaxonomyService } from "@/services/taxonomy.service";
import { EducationLevel, Subject, Chapter, Topic } from "@/types/taxonomy.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  FileQuestion,
  Sparkles,
  Layers,
  CheckCircle2,
  HelpCircle,
  Plus,
  Trash2,
  Loader2,
  Check,
} from "lucide-react";

export function QuestionCreatorWithTags() {
  // Taxonomy cascade states
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");

  // Question Form states
  const [questionText, setQuestionText] = useState<string>(
    "What is the escape velocity from the surface of Earth? (Radius R = 6.4 × 10^6 m, g = 9.8 m/s²)",
  );
  const [questionType, setQuestionType] = useState<"MCQ" | "CQ" | "SHORT_ANSWER">("MCQ");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("HARD");
  const [options, setOptions] = useState([
    { id: "A", text: "9.8 km/s", isCorrect: false },
    { id: "B", text: "11.2 km/s", isCorrect: true },
    { id: "C", text: "8.0 km/s", isCorrect: false },
    { id: "D", text: "12.4 km/s", isCorrect: false },
  ]);
  const [explanation, setExplanation] = useState<string>(
    "Escape velocity v_e = √(2gR) = √(2 × 9.8 × 6.4 × 10^6) ≈ 11.2 km/s.",
  );

  // Attached Tags state
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
      name: "Cadet College",
      slug: "cadet-college",
      category: "CADET_COLLEGE",
      usageCount: 28,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "demo-tag-3",
      name: "Hard",
      slug: "hard",
      category: "DIFFICULTY",
      usageCount: 42,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const [saving, setSaving] = useState<boolean>(false);
  const [createdQuestion, setCreatedQuestion] = useState<any | null>(null);

  // Fetch initial levels
  useEffect(() => {
    TaxonomyService.getEducationLevels({ isActive: true })
      .then((res) => {
        setLevels(res.data);
        if (res.data.length > 0) setSelectedLevelId(res.data[0].id);
      })
      .catch(() => {});
  }, []);

  // Fetch subjects when level changes
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
      })
      .catch(() => {});
  }, [selectedLevelId]);

  // Fetch chapters when subject changes
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
      })
      .catch(() => {});
  }, [selectedSubjectId]);

  // Fetch topics when chapter changes
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
      })
      .catch(() => {});
  }, [selectedChapterId]);

  const handleOptionTextChange = (index: number, text: string) => {
    const updated = [...options];
    updated[index].text = text;
    setOptions(updated);
  };

  const handleSetCorrectOption = (index: number) => {
    const updated = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(updated);
  };

  const handleAddOption = () => {
    const nextChar = String.fromCharCode(65 + options.length);
    setOptions([...options, { id: nextChar, text: "", isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSaveQuestion = async () => {
    if (!questionText.trim()) {
      toast.error("Please enter question text");
      return;
    }

    setSaving(true);
    try {
      // Find UUID tags and on-the-fly named tags
      const tagIds = selectedTags.filter((t) => !t.id.startsWith("demo-") && !t.id.startsWith("temp-")).map((t) => t.id);
      const tagNames = selectedTags.map((t) => t.name);

      const res = await TagService.createQuestion({
        questionText: questionText.trim(),
        questionType,
        difficulty,
        educationLevelId: selectedLevelId || undefined,
        subjectId: selectedSubjectId || undefined,
        chapterId: selectedChapterId || undefined,
        topicId: selectedTopicId || undefined,
        options,
        correctAnswer: options.find((o) => o.isCorrect)?.id,
        explanation: explanation.trim() || undefined,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
        tagNames: tagNames.length > 0 ? tagNames : undefined,
      });

      setCreatedQuestion(res.data);
      toast.success("Question created and tagged successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Form Container */}
      <div className="lg:col-span-7 space-y-6">
        <Card className="rounded-2xl shadow-xs border-border/70">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-primary" />
              Question Creation & Tagging Workflow
            </CardTitle>
            <CardDescription className="text-xs">
              Attach curriculum hierarchy and custom metadata tags (e.g. Dhaka Board 2024, Cadet College, Hard, Notre Dame College) for rich discoverability.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-xs sm:text-sm">
            {/* 1. Question Text */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Question Content</Label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Type question content, equation, or prompt..."
                rows={3}
                className="w-full rounded-xl border border-input bg-background p-3 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* 2. Taxonomy Hierarchy Dropdowns */}
            <div className="p-3 bg-muted/40 rounded-xl border space-y-3">
              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" />
                Curriculum Hierarchy
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Level */}
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Class / Level</label>
                  <select
                    value={selectedLevelId}
                    onChange={(e) => setSelectedLevelId(e.target.value)}
                    className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary"
                  >
                    <option value="">Select Level</option>
                    {levels.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Chapter */}
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Chapter</label>
                  <select
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary"
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Topic */}
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Topic</label>
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary"
                  >
                    <option value="">Select Topic</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Auto-Complete Tag Input Component */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Custom Metadata Tags
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Type to search or create custom tags
                </span>
              </div>

              <TagInputAutocomplete
                value={selectedTags}
                onChange={setSelectedTags}
                placeholder="Search board exams, institutions, difficulty, or custom tags..."
              />

              {/* Quick Tag Recommendations Preset Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-muted-foreground font-medium">Quick Suggestions:</span>
                {[
                  { name: "Dhaka Board 2024", category: "BOARD_EXAM" as const },
                  { name: "Cadet College", category: "CADET_COLLEGE" as const },
                  { name: "BUET Admission", category: "ADMISSION_TEST" as const },
                  { name: "Notre Dame College", category: "INSTITUTION" as const },
                  { name: "Formula Based", category: "TOPIC_SPECIAL" as const },
                ].map((item) => {
                  const isAdded = selectedTags.some((t) => t.name === item.name);
                  if (isAdded) return null;

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() =>
                        setSelectedTags([
                          ...selectedTags,
                          {
                            id: `quick-${Date.now()}-${item.name}`,
                            name: item.name,
                            slug: item.name.toLowerCase().replace(/\s+/g, "-"),
                            category: item.category,
                            usageCount: 1,
                            isActive: true,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          },
                        ])
                      }
                      className="text-[11px] px-2 py-0.5 rounded-full border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. MCQ Options */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Answer Choices</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddOption}
                  className="h-7 text-xs gap-1 text-primary"
                >
                  <Plus className="h-3 w-3" />
                  Add Option
                </Button>
              </div>

              <div className="space-y-2">
                {options.map((option, idx) => (
                  <div
                    key={option.id}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                      option.isCorrect
                        ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/20"
                        : "border-input bg-background"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSetCorrectOption(idx)}
                      className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs transition-colors cursor-pointer shrink-0 ${
                        option.isCorrect
                          ? "bg-emerald-600 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
                      }`}
                      title={option.isCorrect ? "Correct Option" : "Mark as Correct"}
                    >
                      {option.isCorrect ? <Check className="h-3.5 w-3.5" /> : option.id}
                    </button>

                    <Input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                      placeholder={`Option ${option.id} text...`}
                      className="h-8 text-xs border-none bg-transparent shadow-none focus-visible:ring-0"
                    />

                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="p-1 rounded-md text-muted-foreground hover:text-rose-500 cursor-pointer"
                        title="Remove Option"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Explanation */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Step-by-Step Explanation / Solution</Label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain why the answer is correct..."
                rows={2}
                className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <Button
                onClick={handleSaveQuestion}
                disabled={saving || !questionText.trim()}
                className="rounded-xl text-xs gap-1.5 bg-primary text-primary-foreground font-semibold px-5"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Publish Question with Tags
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview Card */}
      <div className="lg:col-span-5 space-y-4">
        <Card className="rounded-2xl shadow-xs border-primary/20 bg-linear-to-b from-primary/5 via-background to-background">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Student App Practice Preview
              </span>
              <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                {difficulty}
              </span>
            </div>
            <CardTitle className="text-base font-bold text-foreground mt-2">
              {questionText || "Question preview will appear here..."}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-xs">
            {/* Metadata Tags Attached */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground">Attached Tags:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.length > 0 ? (
                  selectedTags.map((tag) => (
                    <TagBadge key={tag.id || tag.slug} tag={tag} size="sm" />
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">No tags attached yet</span>
                )}
              </div>
            </div>

            {/* MCQ Options Display */}
            <div className="space-y-2 pt-2">
              {options.map((opt) => (
                <div
                  key={opt.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    opt.isCorrect
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 font-medium"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        opt.isCorrect
                          ? "bg-emerald-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span>{opt.text || `Option ${opt.id}`}</span>
                  </div>
                  {opt.isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                </div>
              ))}
            </div>

            {/* Solution Box */}
            {explanation && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300">
                <div className="font-semibold text-xs flex items-center gap-1.5 mb-1">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Solution & Explanation
                </div>
                <p className="text-[11px] leading-relaxed">{explanation}</p>
              </div>
            )}

            {/* Success notification if saved */}
            {createdQuestion && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Question Saved to Database!
                </div>
                <div className="text-[11px] mt-1 text-muted-foreground">
                  ID: <code className="font-mono">{createdQuestion.id}</code>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
