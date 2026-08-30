/**
 * @file CQIngestionManager.tsx
 * @description Master container component for Creative Question (CQ) Ingestion.
 * Provides interactive tabbed interface for:
 * 1. CQ Authoring Studio (Uddipok + 4 Sub-questions ক, খ, গ, ঘ)
 * 2. Ingested CQ Question Bank Explorer & Simulation
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useState } from "react";
import { CQStatsBanner } from "./CQStatsBanner";
import { CQCreator } from "./CQCreator";
import { CQFilterExplorer } from "./CQFilterExplorer";
import { BookOpen, Database, Sparkles, FileEdit } from "lucide-react";

export function CQIngestionManager() {
  const [activeTab, setActiveTab] = useState<"creator" | "explorer">("creator");
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleIngestionSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab("explorer");
  };

  const tabs = [
    {
      id: "creator" as const,
      label: "সৃজনশীল প্রশ্ন রচনা (CQ Creator)",
      icon: FileEdit,
      desc: "উদ্দীপক ও ৪টি উপ-প্রশ্ন (ক, খ, গ, ঘ)",
    },
    {
      id: "explorer" as const,
      label: "সৃজনশীল প্রশ্ন ব্যাংক (CQ Bank Explorer)",
      icon: Database,
      desc: "অনুসন্ধান, ফিল্টার ও বোর্ড প্রশ্নপত্র প্রিভিউ",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Analytics KPI Banner */}
      <CQStatsBanner refreshTrigger={refreshTrigger} />

      {/* Navigation Tab Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/40 rounded-2xl border border-border/80">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-background text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40"
              }`}
            >
              <tab.icon
                className={`h-4 w-4 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <div className="text-left">
                <div>{tab.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div className="transition-all duration-200">
        {activeTab === "creator" && (
          <CQCreator onSuccess={handleIngestionSuccess} />
        )}
        {activeTab === "explorer" && (
          <CQFilterExplorer
            refreshTrigger={refreshTrigger}
            onRefreshNeeded={() => setRefreshTrigger((prev) => prev + 1)}
          />
        )}
      </div>
    </div>
  );
}
