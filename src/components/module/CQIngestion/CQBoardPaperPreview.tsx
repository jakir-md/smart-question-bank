/**
 * @file CQBoardPaperPreview.tsx
 * @description Real-time authentic NCTB / Board Standard Creative Question (সৃজনশীল প্রশ্ন) Paper Simulation.
 * Renders the Uddipok (stimulus), diagrams, and 4 sub-questions (ক, খ, গ, ঘ) with right-aligned marks [১], [২], [৩], [৪],
 * along with an optional toggle for model solutions / marking rubrics.
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useState } from "react";
import { CQStimulusInput, CQSubQuestionInput } from "@/types/cq.types";
import { LatexRenderer } from "../shared/LatexRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookOpen, Eye, EyeOff, FileText, Image as ImageIcon, Sparkles } from "lucide-react";

interface CQBoardPaperPreviewProps {
  stimulus: CQStimulusInput;
  questions: CQSubQuestionInput[];
  subjectName?: string;
  chapterName?: string;
  totalMarks?: number;
}

/**
 * Converts English digits to Bengali digits.
 */
function toBengaliDigits(num: number | string): string {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/\d/g, (d) => bengaliDigits[Number(d)]);
}

export function CQBoardPaperPreview({
  stimulus,
  questions,
  subjectName,
  chapterName,
  totalMarks = 10,
}: CQBoardPaperPreviewProps) {
  const [showSolutions, setShowSolutions] = useState<boolean>(false);

  return (
    <Card className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
      {/* Header Bar */}
      <CardHeader className="bg-muted/30 border-b border-border/60 py-3.5 px-5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              সৃজনশীল প্রশ্নপত্র সিমুলেশন (CQ Board Paper Preview)
              <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                পূর্ণমান: {toBengaliDigits(totalMarks)}
              </Badge>
            </h3>
            {(subjectName || chapterName) && (
              <p className="text-xs text-muted-foreground">
                {[subjectName, chapterName].filter(Boolean).join(" • ")}
              </p>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowSolutions(!showSolutions)}
          className="h-8 gap-1.5 text-xs rounded-lg cursor-pointer"
        >
          {showSolutions ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5 text-primary" />}
          {showSolutions ? "উত্তর ও মূল্যায়ন লুকান" : "আদর্শ উত্তর দেখুন"}
        </Button>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Stimulus / Uddipok Box */}
        <div className="p-4 sm:p-5 rounded-xl border border-border/80 bg-muted/20 space-y-3">
          {stimulus.title && (
            <div className="font-semibold text-sm text-primary flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>{stimulus.title}</span>
            </div>
          )}

          {/* Stimulus Body with KaTeX */}
          <div className="text-sm leading-relaxed text-foreground">
            <LatexRenderer text={stimulus.contextText || "উদ্দীপক এখনো লেখা হয়নি..."} />
          </div>

          {/* Optional Diagram / Media */}
          {stimulus.mediaUrl && (
            <div className="mt-3 pt-3 border-t border-border/50 flex flex-col items-center">
              <div className="relative max-w-md max-h-64 overflow-hidden rounded-lg border border-border/60 bg-background/50 p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stimulus.mediaUrl}
                  alt="CQ Stimulus Diagram"
                  className="max-h-56 object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground mt-1.5 italic">চিত্র: উদ্দীপকের চিত্র / বর্তনী / লেখচিত্র</span>
            </div>
          )}
        </div>

        {/* 4 Sub-questions (ক, খ, গ, ঘ) */}
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
            প্রশ্নের উত্তর লিখুন:
          </div>

          {questions.map((q) => {
            const bengaliMarks = toBengaliDigits(q.marks);
            const cognitiveBengaliLabels: Record<string, string> = {
              KNOWLEDGE: "জ্ঞানমূলক",
              COMPREHENSION: "অনুধাবনমূলক",
              APPLICATION: "প্রয়োগমূলক",
              HIGHER_ABILITY: "উচ্চতর দক্ষতামূলক",
            };

            return (
              <div
                key={q.label}
                className="p-4 rounded-xl border border-border/60 bg-background hover:bg-muted/10 transition-colors space-y-2.5"
              >
                {/* Question Line: Label + Body + Right-Aligned Marks */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5 text-sm flex-1">
                    <span className="font-bold text-primary text-base shrink-0 leading-tight">
                      ({q.label})
                    </span>
                    <div className="text-foreground leading-relaxed flex-1">
                      <LatexRenderer text={q.questionText || `(${q.label}) এর প্রশ্ন এখনো লেখা হয়নি...`} />
                    </div>
                  </div>

                  {/* Right-aligned marks badge */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/70">
                      [ {bengaliMarks} ]
                    </span>
                  </div>
                </div>

                {/* Cognitive Domain Tag */}
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground pl-6">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                    ডোমেইন: {cognitiveBengaliLabels[q.cognitiveLevel] || q.cognitiveLevel}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                    কাঙ্ক্ষিত মান: {q.marks} নম্বর
                  </span>
                </div>

                {/* Model Solution / Marking Rubrics (if toggled) */}
                {showSolutions && (
                  <div className="mt-2 pl-6 pt-2.5 border-t border-border/50 space-y-1.5 bg-emerald-500/5 p-3 rounded-lg border-emerald-500/20">
                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      আদর্শ উত্তর ও মূল্যায়ন নির্দেশনা (Model Solution & Marking Guide):
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      <LatexRenderer
                        text={q.explanation || "এই প্রশ্নের জন্য কোনো নমুনা উত্তর বা নির্দেশিকা যোগ করা হয়নি।"}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
