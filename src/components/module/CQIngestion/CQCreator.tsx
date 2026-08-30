/**
 * @file CQCreator.tsx
 * @description Creative Question (CQ) Authoring Studio (MVC - View/Component).
 * Allows Content Creators to ingest structured subjective questions with Uddipok (stimulus),
 * 4 sub-questions (ক, খ, গ, ঘ) with individual marks (default 1, 2, 3, 4), and total marks validation (10 marks).
 * Features KaTeX equation editor, diagram attachments, taxonomy cascade, board tagging, and live board exam paper preview.
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useState, useEffect } from "react";
import { CQService } from "@/services/cq.service";
import { TaxonomyService } from "@/services/taxonomy.service";
import { TagInputAutocomplete } from "../MetadataTagging/TagInputAutocomplete";
import { TagBadge } from "../MetadataTagging/TagBadge";
import { LatexRenderer } from "../shared/LatexRenderer";
import { LatexMathToolbar } from "../shared/LatexMathToolbar";
import { CQBoardPaperPreview } from "./CQBoardPaperPreview";
import { EducationLevel, Subject, Chapter, Topic } from "@/types/taxonomy.types";
import { Tag } from "@/types/tag.types";
import {
  ContextType,
  CQSubQuestionInput,
  CQSubQuestionKey,
  CQSubQuestionLabel,
  CreateCQDTO,
  DifficultyLevel,
} from "@/types/cq.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  BookOpen,
  FileText,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  RefreshCw,
  Eye,
  Image as ImageIcon,
  Brain,
  Layers,
  GraduationCap,
} from "lucide-react";

interface CQCreatorProps {
  onSuccess?: () => void;
}

const DEFAULT_SUB_QUESTIONS: CQSubQuestionInput[] = [
  {
    id: "sub-cq-1",
    label: "ক",
    cognitiveLevel: "KNOWLEDGE",
    questionText: "তড়িৎ প্রবাহ কাকে বলে?",
    marks: 1.0,
    explanation:
      "কোনো পরিবাহীর যেকোনো প্রস্থচ্ছেদের মধ্য দিয়ে প্রতি একক সময়ে যে পরিমাণ আধান প্রবাহিত হয় তাকে তড়িৎ প্রবাহ বলে।",
    difficulty: "EASY",
    order: 1,
  },
  {
    id: "sub-cq-2",
    label: "খ",
    cognitiveLevel: "COMPREHENSION",
    questionText: "তড়িৎ বর্তনীতে ফিউজ তার ব্যবহারের কারণ ব্যাখ্যা করো।",
    marks: 2.0,
    explanation:
      "ফিউজ তার নিম্ন গলনাঙ্কের সংকর ধাতু দিয়ে তৈরি। বর্তনীতে অনুমোদিত মাত্রার চেয়ে অতিরিক্ত তড়িৎ প্রবাহিত হলে এটি উৎপন্ন তাপে গলে গিয়ে বর্তনী বিচ্ছিন্ন করে দেয়, ফলে মূল্যবান বৈদ্যুতিক যন্ত্রপাতি নষ্ট হওয়া থেকে রক্ষা পায়।",
    difficulty: "MEDIUM",
    order: 2,
  },
  {
    id: "sub-cq-3",
    label: "গ",
    cognitiveLevel: "APPLICATION",
    questionText: "উদ্দীপকের বর্তনীটির মোট তুল্য রোধ ($R_{eq}$) নির্ণয় করো।",
    marks: 3.0,
    explanation:
      "বর্তনীতে $R_1 = 6\\,\\Omega$ এবং $R_2 = 3\\,\\Omega$ সমান্তরালে যুক্ত:\n$$R_p = \\frac{R_1 R_2}{R_1 + R_2} = \\frac{6 \\times 3}{6 + 3} = 2\\,\\Omega$$\n$R_3 = 4\\,\\Omega$ শ্রেণিতে যুক্ত থাকায় মোট তুল্য রোধ:\n$$R_{eq} = R_p + R_3 = 2 + 4 = 6\\,\\Omega$$",
    difficulty: "MEDIUM",
    order: 3,
  },
  {
    id: "sub-cq-4",
    label: "ঘ",
    cognitiveLevel: "HIGHER_ABILITY",
    questionText:
      "যদি $R_3$ রোধটিকে খুলে ফেলা হয়, তবে বর্তনীতে তড়িৎ ক্ষমতার কোনো পরিবর্তন হবে কি না? গাণিতিকভাবে বিশ্লেষণ করো।",
    marks: 4.0,
    explanation:
      "১ম ক্ষেত্রে মোট রোধ $R_{eq1} = 6\\,\\Omega$, ক্ষমতা $P_1 = \\frac{V^2}{R_{eq1}} = \\frac{12^2}{6} = 24\\text{ W}$।\n২য় ক্ষেত্রে শুধু সমান্তরাল অংশ থাকায় রোধ $R_{eq2} = 2\\,\\Omega$, ক্ষমতা $P_2 = \\frac{V^2}{R_{eq2}} = \\frac{12^2}{2} = 72\\text{ W}$।\nঅতএব, ক্ষমতা $72 - 24 = 48\\text{ W}$ বৃদ্ধি পাবে।",
    difficulty: "HARD",
    order: 4,
  },
];

export function CQCreator({ onSuccess }: CQCreatorProps) {
  // Taxonomy Cascade States
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");

  // Uddipok / Stimulus Fields
  const [stimulusTitle, setStimulusTitle] = useState<string>("দৃশ্যকল্প ১: তড়িৎ বর্তনী ও ক্ষমতার বিন্যাস");
  const [contextType, setContextType] = useState<ContextType>("STEM");
  const [stimulusText, setStimulusText] = useState<string>(
    "একটি $12\\text{ V}$ ব্যাটারির সাথে $R_1 = 6\\,\\Omega$ এবং $R_2 = 3\\,\\Omega$ সমান্তরালে এবং এদের সাথে $R_3 = 4\\,\\Omega$ রোধ শ্রেণিতে যুক্ত করে একটি তড়িৎ বর্তনী তৈরি করা হলো। ব্যাটারির অভ্যন্তরীণ রোধ নগণ্য।\n\nউদ্দীপকের তথ্যের আলোকে নিচের প্রশ্নগুলোর উত্তর দাও:",
  );
  const [mediaUrl, setMediaUrl] = useState<string>("");

  // 4 Structured Sub-Questions
  const [questions, setQuestions] = useState<CQSubQuestionInput[]>(DEFAULT_SUB_QUESTIONS);

  // Common Tags
  const [commonTags, setCommonTags] = useState<Tag[]>([
    {
      id: "demo-tag-1",
      name: "Dhaka Board 2024",
      slug: "dhaka-board-2024",
      category: "BOARD_EXAM",
      usageCount: 18,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "demo-tag-2",
      name: "Physics 2nd Paper",
      slug: "physics-2nd-paper",
      category: "CUSTOM",
      usageCount: 24,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // UI View Mode (Authoring Studio vs Live Board Paper Preview)
  const [previewTab, setPreviewTab] = useState<"edit" | "preview">("edit");
  const [activeSubTab, setActiveSubTab] = useState<CQSubQuestionLabel>("ক");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Active input ref for LaTeX symbol insertion
  const [activeInputRef, setActiveInputRef] = useState<"stimulus" | CQSubQuestionLabel>("stimulus");

  // Load initial education levels
  useEffect(() => {
    TaxonomyService.getEducationLevels().then((res) => {
      setLevels(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedLevelId(res.data[0].id);
      }
    }).catch(() => {});
  }, []);

  // Cascade: Level -> Subjects
  useEffect(() => {
    if (!selectedLevelId) {
      setSubjects([]);
      setSelectedSubjectId("");
      return;
    }
    TaxonomyService.getSubjects(selectedLevelId).then((res) => {
      setSubjects(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedSubjectId(res.data[0].id);
      } else {
        setSelectedSubjectId("");
      }
    }).catch(() => {});
  }, [selectedLevelId]);

  // Cascade: Subject -> Chapters
  useEffect(() => {
    if (!selectedSubjectId) {
      setChapters([]);
      setSelectedChapterId("");
      return;
    }
    TaxonomyService.getChapters(selectedSubjectId).then((res) => {
      setChapters(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedChapterId(res.data[0].id);
      } else {
        setSelectedChapterId("");
      }
    }).catch(() => {});
  }, [selectedSubjectId]);

  // Cascade: Chapter -> Topics
  useEffect(() => {
    if (!selectedChapterId) {
      setTopics([]);
      setSelectedTopicId("");
      return;
    }
    TaxonomyService.getTopics(selectedChapterId).then((res) => {
      setTopics(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedTopicId(res.data[0].id);
      } else {
        setSelectedTopicId("");
      }
    }).catch(() => {});
  }, [selectedChapterId]);

  // Calculate sum of marks
  const totalMarksSum = questions.reduce((sum, q) => sum + Number(q.marks || 0), 0);
  const isTotalMarksValid = Math.abs(totalMarksSum - 10.0) < 0.01;

  // Insert LaTeX snippet into active textarea
  const handleInsertLatex = (snippet: string) => {
    if (activeInputRef === "stimulus") {
      setStimulusText((prev) => prev + snippet);
    } else {
      setQuestions((prev) =>
        prev.map((q) => (q.label === activeInputRef ? { ...q, questionText: q.questionText + snippet } : q)),
      );
    }
  };

  // Update a specific sub-question field
  const handleUpdateSubQuestion = (
    label: CQSubQuestionLabel,
    field: keyof CQSubQuestionInput,
    val: any,
  ) => {
    setQuestions((prev) =>
      prev.map((q) => (q.label === label ? { ...q, [field]: val } : q)),
    );
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stimulusText.trim()) {
      toast.error("উদ্দীপকের মূল বক্তব্য (Stimulus text) দেওয়া আবশ্যক।");
      return;
    }

    if (questions.some((q) => !q.questionText.trim())) {
      toast.error("সকল ৪টি উপ-প্রশ্নের (ক, খ, গ, ঘ) প্রশ্ন লেখা আবশ্যক।");
      return;
    }

    if (!isTotalMarksValid) {
      toast.error(
        `মোট নম্বর অবশ্যই ১০ হতে হবে। বর্তমান মোট নম্বর: ${totalMarksSum}। অনুগ্রহ করে প্রতিটি প্রশ্নের মান সমন্বয় করুন।`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateCQDTO = {
        stimulus: {
          title: stimulusTitle.trim() || null,
          contextText: stimulusText.trim(),
          contextType,
          mediaUrl: mediaUrl.trim() || null,
          educationLevelId: selectedLevelId || null,
          subjectId: selectedSubjectId || null,
          chapterId: selectedChapterId || null,
          topicId: selectedTopicId || null,
          isActive: true,
          isPublished: true,
        },
        questions: questions.map((q) => ({
          label: q.label,
          cognitiveLevel: q.cognitiveLevel,
          questionText: q.questionText.trim(),
          marks: Number(q.marks),
          explanation: q.explanation?.trim() || null,
          difficulty: q.difficulty,
          topicId: selectedTopicId || null,
          order: q.order,
        })),
        totalMarks: 10.0,
        commonTagIds: commonTags.map((t) => t.id),
      };

      const res = await CQService.ingestCQ(payload);

      if (res.success) {
        toast.success("সৃজনশীল প্রশ্ন (CQ) সফলভাবে সংরক্ষিত হয়েছে!");
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err: any) {
      toast.error(err.message || "সৃজনশীল প্রশ্ন সংরক্ষণে সমস্যা হয়েছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentLevel = levels.find((l) => l.id === selectedLevelId);
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const currentChapter = chapters.find((c) => c.id === selectedChapterId);

  return (
    <div className="space-y-6">
      {/* Top Banner: Total Marks Live Status & View Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              isTotalMarksValid
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
            }`}
          >
            {isTotalMarksValid ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">
                মোট নম্বর ভ্যালিডেশন: {totalMarksSum} / ১০ নম্বর
              </span>
              <Badge
                variant={isTotalMarksValid ? "default" : "destructive"}
                className={`text-xs ${
                  isTotalMarksValid
                    ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                    : "bg-amber-500 hover:bg-amber-500 text-white"
                }`}
              >
                {isTotalMarksValid ? "পরিপূর্ণ (১০/১০)" : `অসঙ্গতি (${totalMarksSum > 10 ? "+" : ""}${totalMarksSum - 10})`}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              ক (১) + খ (২) + গ (৩) + ঘ (৪) = ১০ নম্বর ভিত্তিক সৃজনশীল কাঠামো
            </p>
          </div>
        </div>

        {/* Studio View Mode Switcher */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={previewTab === "edit" ? "default" : "outline"}
            size="sm"
            onClick={() => setPreviewTab("edit")}
            className="text-xs rounded-xl cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            রচনাকালীন এডিটর (Editor)
          </Button>
          <Button
            type="button"
            variant={previewTab === "preview" ? "default" : "outline"}
            size="sm"
            onClick={() => setPreviewTab("preview")}
            className="text-xs rounded-xl cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            প্রশ্নপত্র প্রিভিউ (Board Paper)
          </Button>
        </div>
      </div>

      {/* Conditionally Render: Live Board Paper Preview OR Full Authoring Studio */}
      {previewTab === "preview" ? (
        <CQBoardPaperPreview
          stimulus={{
            title: stimulusTitle,
            contextText: stimulusText,
            contextType,
            mediaUrl,
          }}
          questions={questions}
          subjectName={currentSubject?.name}
          chapterName={currentChapter?.name}
          totalMarks={10}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Curriculum Taxonomy Cascade */}
          <Card className="rounded-2xl border border-border/80 shadow-xs">
            <CardHeader className="py-4 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <GraduationCap className="h-4 w-4 text-primary" />
                ১. কারিকুলাম ও ট্যাক্সোনমি নির্বাচন (Curriculum Taxonomy)
              </CardTitle>
              <CardDescription className="text-xs">
                সৃজনশীল প্রশ্নটিকে নির্দিষ্ট শ্রেণি, বিষয়, অধ্যায় এবং টপিকের সাথে সংযুক্ত করুন।
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Level */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">শিক্ষাস্তর (Level)</Label>
                  <select
                    value={selectedLevelId}
                    onChange={(e) => setSelectedLevelId(e.target.value)}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
                  >
                    {levels.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>
                        {lvl.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">বিষয় (Subject)</Label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    disabled={subjects.length === 0}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary disabled:opacity-50"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chapter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">অধ্যায় (Chapter)</Label>
                  <select
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    disabled={chapters.length === 0}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary disabled:opacity-50"
                  >
                    {chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">টপিক (Topic - ঐচ্ছিক)</Label>
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    disabled={topics.length === 0}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary disabled:opacity-50"
                  >
                    <option value="">-- সাধারণ অধ্যায়ভিত্তিক --</option>
                    {topics.map((top) => (
                      <option key={top.id} value={top.id}>
                        {top.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Metadata & Board Tags */}
          <Card className="rounded-2xl border border-border/80 shadow-xs">
            <CardHeader className="py-4 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-amber-500" />
                ২. মেটাডাটা ও বোর্ড পরীক্ষার ট্যাগিং (Board Exam Tags)
              </CardTitle>
              <CardDescription className="text-xs">
                বিগত সালের বোর্ড প্রশ্ন (Dhaka Board, Rajshahi Board ইত্যাদি), ক্যাডেট কলেজ ও মডেল টেস্ট ট্যাগ যুক্ত করুন।
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <TagInputAutocomplete
                selectedTags={commonTags}
                onChange={setCommonTags}
                placeholder="বোর্ড নাম বা ট্যাগ লিখে এন্টার চাপুন (e.g., Dhaka Board 2024, BUET Standard)..."
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {commonTags.map((tag) => (
                  <TagBadge
                    key={tag.id}
                    tag={tag}
                    onRemove={() => setCommonTags((prev) => prev.filter((t) => t.id !== tag.id))}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Uddipok (Stimulus / Stem Studio) */}
          <Card className="rounded-2xl border border-border/80 shadow-xs">
            <CardHeader className="py-4 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <BookOpen className="h-4 w-4 text-blue-500" />
                ৩. উদ্দীপক রচনা স্টুডিও (Uddipok / Stimulus Stem)
              </CardTitle>
              <CardDescription className="text-xs">
                LaTeX সমীকরণ, চিত্র বা দৃশ্যকল্প দিয়ে প্রধান উদ্দীপকটি প্রস্তুত করুন।
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold">উদ্দীপকের শিরোনাম (ঐচ্ছিক)</Label>
                  <Input
                    value={stimulusTitle}
                    onChange={(e) => setStimulusTitle(e.target.value)}
                    placeholder="e.g. দৃশ্যকল্প ১: তড়িৎ প্রবাহ ও রোধের সমবায়"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">উদ্দীপকের ধরন (Type)</Label>
                  <select
                    value={contextType}
                    onChange={(e) => setContextType(e.target.value as ContextType)}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
                  >
                    <option value="STEM">STEM (সাধারণ বৈজ্ঞানিক উদ্দীপক)</option>
                    <option value="SCENARIO">SCENARIO (বাস্তবমুখী দৃশ্যকল্প)</option>
                    <option value="PASSAGE">PASSAGE (অনুচ্ছেদ)</option>
                    <option value="EXPERIMENT_DATA">EXPERIMENT_DATA (পরীক্ষার উপাত্ত/ছক)</option>
                    <option value="CASE_STUDY">CASE_STUDY (কেস স্টাডি)</option>
                  </select>
                </div>
              </div>

              {/* LaTeX Math Toolbar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">উদ্দীপকের মূল টেক্সট (LaTeX ও বাংলা সমর্থনসহ)</Label>
                  <span className="text-[11px] text-muted-foreground">সমীকরণের জন্য $formula$ অথবা $$display$$ লিখুন</span>
                </div>

                <LatexMathToolbar onInsertSymbol={handleInsertLatex} />

                <textarea
                  value={stimulusText}
                  onFocus={() => setActiveInputRef("stimulus")}
                  onChange={(e) => setStimulusText(e.target.value)}
                  rows={5}
                  placeholder="উদ্দীপকের বিস্তারিত টেক্সট লিখুন..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs font-mono focus:ring-1 focus:ring-primary leading-relaxed"
                  required
                />
              </div>

              {/* Diagram / Media URL */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-primary" />
                  উদ্দীপকের চিত্র / সার্কিট ডায়াগ্রাম লিংক (Image URL - ঐচ্ছিক)
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://example.com/images/circuit.png"
                    className="h-9 text-xs rounded-xl flex-1"
                  />
                  {mediaUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMediaUrl("")}
                      className="h-9 text-xs rounded-xl"
                    >
                      মুছুন
                    </Button>
                  )}
                </div>
              </div>

              {/* Live KaTeX Stimulus Preview Accordion */}
              <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-2">
                <div className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  উদ্দীপক লাইভ প্রিভিউ (LaTeX Live Rendering):
                </div>
                <div className="text-xs text-foreground leading-relaxed pl-2 border-l-2 border-primary/40">
                  <LatexRenderer text={stimulusText || "উদ্দীপকের প্রিভিউ এখানে প্রদর্শিত হবে..."} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: 4 Sub-questions (ক, খ, গ, ঘ) Tabs */}
          <Card className="rounded-2xl border border-border/80 shadow-xs">
            <CardHeader className="py-4 border-b border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <Layers className="h-4 w-4 text-emerald-500" />
                    ৪. চারটি উপ-প্রশ্ন কাঠামো (ক, খ, গ, ঘ)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    জ্ঞানমূলক (১), অনুধাবনমূলক (২), প্রয়োগমূলক (৩) এবং উচ্চতর দক্ষতামূলক (৪) প্রশ্ন ও আদর্শ সমাধান লিখুন।
                  </CardDescription>
                </div>
              </div>

              {/* 4 Question Selector Pills */}
              <div className="flex flex-wrap gap-2 pt-3">
                {questions.map((q) => {
                  const isActive = activeSubTab === q.label;
                  const cognitiveNames: Record<string, string> = {
                    KNOWLEDGE: "জ্ঞানমূলক",
                    COMPREHENSION: "অনুধাবনমূলক",
                    APPLICATION: "প্রয়োগমূলক",
                    HIGHER_ABILITY: "উচ্চতর দক্ষতা",
                  };

                  return (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => {
                        setActiveSubTab(q.label);
                        setActiveInputRef(q.label);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      <span className="h-5 w-5 rounded-full bg-background/20 flex items-center justify-center font-bold">
                        {q.label}
                      </span>
                      <span>
                        {cognitiveNames[q.cognitiveLevel]} ({q.marks} নম্বর)
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardHeader>

            <CardContent className="p-5">
              {questions
                .filter((q) => q.label === activeSubTab)
                .map((q) => {
                  const cognitiveHeaders: Record<
                    CQSubQuestionLabel,
                    { title: string; desc: string; defaultMarks: number; color: string }
                  > = {
                    ক: {
                      title: "ক - জ্ঞানমূলক প্রশ্ন (Knowledge Based)",
                      desc: "পাঠ্যবইয়ের সরাসরি সংজ্ঞা বা তথ্যমূলক প্রশ্ন (প্রস্তাবিত মান: ১ নম্বর)।",
                      defaultMarks: 1.0,
                      color: "text-blue-500",
                    },
                    খ: {
                      title: "খ - অনুধাবনমূলক প্রশ্ন (Comprehension Based)",
                      desc: "বিষয়বস্তুর মূলভাব অনুধাবন বা ব্যাখ্যামূলক প্রশ্ন (প্রস্তাবিত মান: ২ নম্বর)।",
                      defaultMarks: 2.0,
                      color: "text-emerald-500",
                    },
                    গ: {
                      title: "গ - প্রয়োগমূলক প্রশ্ন (Application Based)",
                      desc: "উদ্দীপকের আলোকে সূত্র বা ধারণা প্রয়োগ করে সমাধান (প্রস্তাবিত মান: ৩ নম্বর)।",
                      defaultMarks: 3.0,
                      color: "text-amber-500",
                    },
                    ঘ: {
                      title: "ঘ - উচ্চতর দক্ষতামূলক প্রশ্ন (Higher Ability Based)",
                      desc: "উদ্দীপকের তথ্য বিশ্লেষণ, মতামত প্রদান বা সিদ্ধান্ত যাচাই (প্রস্তাবিত মান: ৪ নম্বর)।",
                      defaultMarks: 4.0,
                      color: "text-purple-500",
                    },
                  };

                  const headerInfo = cognitiveHeaders[q.label];

                  return (
                    <div key={q.label} className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/70">
                        <div>
                          <div className={`font-bold text-xs ${headerInfo.color} flex items-center gap-1.5`}>
                            <Brain className="h-3.5 w-3.5" />
                            {headerInfo.title}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{headerInfo.desc}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <Label className="text-xs font-semibold whitespace-nowrap">নম্বর (Marks):</Label>
                            <Input
                              type="number"
                              step="0.5"
                              min="0.5"
                              max="10"
                              value={q.marks}
                              onChange={(e) =>
                                handleUpdateSubQuestion(q.label, "marks", parseFloat(e.target.value) || 0)
                              }
                              className="h-8 w-20 text-xs rounded-lg text-center font-bold"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Label className="text-xs font-semibold whitespace-nowrap">কঠিন্য:</Label>
                            <select
                              value={q.difficulty}
                              onChange={(e) =>
                                handleUpdateSubQuestion(q.label, "difficulty", e.target.value as DifficultyLevel)
                              }
                              className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
                            >
                              <option value="EASY">সহজ (Easy)</option>
                              <option value="MEDIUM">মাঝারি (Medium)</option>
                              <option value="HARD">কঠিন (Hard)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Sub-Question Text Input */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                          ({q.label}) এর প্রশ্ন টেক্সট (LaTeX সমীকরণ সমর্থনসহ)
                        </Label>
                        <textarea
                          value={q.questionText}
                          onFocus={() => setActiveInputRef(q.label)}
                          onChange={(e) => handleUpdateSubQuestion(q.label, "questionText", e.target.value)}
                          rows={3}
                          placeholder={`(${q.label}) এর প্রশ্নটি লিখুন...`}
                          className="w-full rounded-xl border border-input bg-background p-3 text-xs font-mono focus:ring-1 focus:ring-primary leading-relaxed"
                          required
                        />
                      </div>

                      {/* Model Answer / Marking Rubrics */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <Sparkles className="h-3.5 w-3.5" />
                          আদর্শ উত্তর ও মূল্যায়ন নির্দেশিকা (Model Solution & Marking Guide)
                        </Label>
                        <textarea
                          value={q.explanation || ""}
                          onChange={(e) => handleUpdateSubQuestion(q.label, "explanation", e.target.value)}
                          rows={4}
                          placeholder={`(${q.label}) এর সঠিক উত্তর বা নম্বর বণ্টনের নিয়মাবলী লিখুন...`}
                          className="w-full rounded-xl border border-input bg-background p-3 text-xs font-mono focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                        />
                      </div>

                      {/* Sub-question live preview */}
                      <div className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-1.5">
                        <div className="text-xs font-semibold text-primary">লাইভ প্রিভিউ:</div>
                        <div className="text-xs text-foreground pl-2 border-l-2 border-primary/40">
                          <span className="font-bold mr-1">({q.label})</span>
                          <LatexRenderer text={q.questionText || `(${q.label}) এর প্রশ্ন এখানে দেখা যাবে...`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>

          {/* Form Action Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setQuestions(DEFAULT_SUB_QUESTIONS);
                setStimulusTitle("দৃশ্যকল্প ১: তড়িৎ বর্তনী ও ক্ষমতার বিন্যাস");
                setStimulusText(
                  "একটি $12\\text{ V}$ ব্যাটারির সাথে $R_1 = 6\\,\\Omega$ এবং $R_2 = 3\\,\\Omega$ সমান্তরালে এবং এদের সাথে $R_3 = 4\\,\\Omega$ রোধ শ্রেণিতে যুক্ত করে একটি তড়িৎ বর্তনী তৈরি করা হলো। ব্যাটারির অভ্যন্তরীণ রোধ নগণ্য।\n\nউদ্দীপকের তথ্যের আলোকে নিচের প্রশ্নগুলোর উত্তর দাও:",
                );
                toast.info("ডিফল্ট সৃজনশীল টেমপ্লেট রিসেট করা হয়েছে।");
              }}
              className="text-xs rounded-xl cursor-pointer w-full sm:w-auto"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              নমুনা টেমপ্লেটে রিসেট করুন
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !isTotalMarksValid}
              className="text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer w-full sm:w-auto min-w-[200px] h-10"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  সংরক্ষণ করা হচ্ছে...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  সৃজনশীল প্রশ্ন ইনজেস্ট করুন (Save CQ)
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
