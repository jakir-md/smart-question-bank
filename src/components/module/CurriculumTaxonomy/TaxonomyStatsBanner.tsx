/**
 * @file TaxonomyStatsBanner.tsx
 * @description Dashboard metric cards displaying aggregated curriculum taxonomy metrics (MVC - View).
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React from "react";
import { TaxonomyStats } from "@/types/taxonomy.types";
import {
  GraduationCap,
  BookOpen,
  Layers,
  FileText,
  Activity,
  CheckCircle2,
} from "lucide-react";

interface TaxonomyStatsBannerProps {
  stats: TaxonomyStats | null;
  loading: boolean;
}

/**
 * Visual metrics banner for curriculum taxonomy overview.
 */
export function TaxonomyStatsBanner({ stats, loading }: TaxonomyStatsBannerProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-muted/40 animate-pulse border border-border/50"
          />
        ))}
      </div>
    );
  }

  const items = [
    {
      title: "Education Levels",
      value: stats.totalLevels,
      subValue: `${stats.activeLevels} active`,
      icon: GraduationCap,
      color: "from-blue-500/20 to-blue-600/10 text-blue-500 border-blue-500/20",
      accent: "text-blue-500",
    },
    {
      title: "Subjects",
      value: stats.totalSubjects,
      subValue: `${stats.activeSubjects} active`,
      icon: BookOpen,
      color: "from-emerald-500/20 to-emerald-600/10 text-emerald-500 border-emerald-500/20",
      accent: "text-emerald-500",
    },
    {
      title: "Chapters",
      value: stats.totalChapters,
      subValue: `${stats.activeChapters} active`,
      icon: Layers,
      color: "from-amber-500/20 to-amber-600/10 text-amber-500 border-amber-500/20",
      accent: "text-amber-500",
    },
    {
      title: "Topics",
      value: stats.totalTopics,
      subValue: `${stats.activeTopics} active`,
      icon: FileText,
      color: "from-purple-500/20 to-purple-600/10 text-purple-500 border-purple-500/20",
      accent: "text-purple-500",
    },
    {
      title: "Published Topics",
      value: stats.publishedTopics,
      subValue: `${Math.round((stats.publishedTopics / (stats.totalTopics || 1)) * 100)}% of total`,
      icon: CheckCircle2,
      color: "from-cyan-500/20 to-cyan-600/10 text-cyan-500 border-cyan-500/20",
      accent: "text-cyan-500",
    },
    {
      title: "Active Rate",
      value: `${Math.round((stats.activeTopics / (stats.totalTopics || 1)) * 100)}%`,
      subValue: "Curriculum Health",
      icon: Activity,
      color: "from-rose-500/20 to-rose-600/10 text-rose-500 border-rose-500/20",
      accent: "text-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-all duration-300 hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground truncate">
                {item.title}
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${item.color} border`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {item.value}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.subValue}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
