/**
 * @file MCQStatsBanner.tsx
 * @description Summary analytics KPI banner for MCQ Ingestion module.
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useEffect, useState } from "react";
import { MCQStats } from "@/types/mcq.types";
import { MCQService } from "@/services/mcq.service";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion, Layers, CheckCircle, Gauge, Sparkles } from "lucide-react";

interface MCQStatsBannerProps {
  refreshTrigger?: number;
}

export function MCQStatsBanner({ refreshTrigger = 0 }: MCQStatsBannerProps) {
  const [stats, setStats] = useState<MCQStats>({
    totalQuestions: 0,
    totalSingleMCQs: 0,
    totalMultiContextMCQs: 0,
    totalContexts: 0,
    difficultyDistribution: {
      EASY: 0,
      MEDIUM: 0,
      HARD: 0,
    },
    totalActive: 0,
    totalPublished: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    MCQService.getMCQStats()
      .then((res) => {
        setStats(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  const cards = [
    {
      title: "Total Ingested MCQs",
      value: stats.totalQuestions,
      icon: FileQuestion,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      desc: `${stats.totalPublished} published for tests`,
    },
    {
      title: "Single MCQs",
      value: stats.totalSingleMCQs,
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      desc: "Standalone objective questions",
    },
    {
      title: "Multi-Context Passages",
      value: stats.totalContexts,
      secondaryValue: `(${stats.totalMultiContextMCQs} MCQs)`,
      icon: Layers,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      desc: "Stem & scenario based items",
    },
    {
      title: "Difficulty Tier Balance",
      value: `${stats.difficultyDistribution.MEDIUM}`,
      breakdown: `E: ${stats.difficultyDistribution.EASY} | M: ${stats.difficultyDistribution.MEDIUM} | H: ${stats.difficultyDistribution.HARD}`,
      icon: Gauge,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      desc: "Easy / Medium / Hard spread",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <Card
          key={idx}
          className={`rounded-2xl border ${card.borderColor} bg-card/70 backdrop-blur-xs shadow-xs transition-all hover:shadow-md`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-foreground">
                  {loading ? "-" : card.value}
                </span>
                {card.secondaryValue && (
                  <span className="text-xs font-medium text-muted-foreground">{card.secondaryValue}</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground/80">{card.breakdown || card.desc}</p>
            </div>

            <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${card.bgColor} ${card.color} shrink-0`}>
              <card.icon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
