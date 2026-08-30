/**
 * @file CQStatsBanner.tsx
 * @description Summary analytics KPI banner for Creative Question (CQ) Ingestion module.
 * Displays total CQ sets, sub-questions count, cognitive distribution (Knowledge, Comprehension, Application, Higher Ability),
 * and difficulty balance.
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useEffect, useState } from "react";
import { CQStatsResponse } from "@/types/cq.types";
import { CQService } from "@/services/cq.service";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Layers, CheckCircle, Gauge, Brain, Sparkles } from "lucide-react";

interface CQStatsBannerProps {
  refreshTrigger?: number;
}

export function CQStatsBanner({ refreshTrigger = 0 }: CQStatsBannerProps) {
  const [stats, setStats] = useState<CQStatsResponse>({
    totalCQSets: 0,
    totalSubQuestions: 0,
    cognitiveDistribution: {
      KNOWLEDGE: 0,
      COMPREHENSION: 0,
      APPLICATION: 0,
      HIGHER_ABILITY: 0,
    },
    difficultyDistribution: {
      EASY: 0,
      MEDIUM: 0,
      HARD: 0,
    },
    totalMarksLogged: 0,
    totalActive: 0,
    totalPublished: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    CQService.getCQStats()
      .then((res) => {
        setStats(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  const cards = [
    {
      title: "Total Creative Questions (CQ)",
      value: stats.totalCQSets,
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      desc: `${stats.totalPublished} published sets`,
    },
    {
      title: "Total Sub-Questions (ক, খ, গ, ঘ)",
      value: stats.totalSubQuestions,
      icon: Layers,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      desc: `${stats.totalMarksLogged} total marks recorded`,
    },
    {
      title: "Cognitive Domain Spread",
      value: `${stats.totalSubQuestions}`,
      breakdown: `ক: ${stats.cognitiveDistribution.KNOWLEDGE} | খ: ${stats.cognitiveDistribution.COMPREHENSION} | গ: ${stats.cognitiveDistribution.APPLICATION} | ঘ: ${stats.cognitiveDistribution.HIGHER_ABILITY}`,
      icon: Brain,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      desc: "Knowledge → Higher Ability",
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
              </div>
              <p className="text-[11px] text-muted-foreground/80">{card.breakdown || card.desc}</p>
            </div>

            <div
              className={`h-11 w-11 rounded-xl flex items-center justify-center ${card.bgColor} ${card.color} shrink-0`}
            >
              <card.icon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
