/**
 * @file MCQIngestionManager.tsx
 * @description Master container component for MCQ Ingestion (Single & Multi-Context).
 * Provides interactive tabbed interface for:
 * 1. Single MCQ Ingestion
 * 2. Multi-Context Ingestion (Passage/Stem based)
 * 3. Ingested Question Bank Explorer
 * 4. Passages & Stems Library
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React, { useState } from "react";
import { MCQStatsBanner } from "./MCQStatsBanner";
import { SingleMCQCreator } from "./SingleMCQCreator";
import { MultiContextMCQCreator } from "./MultiContextMCQCreator";
import { MCQFilterExplorer } from "./MCQFilterExplorer";
import { ContextsLibrary } from "./ContextsLibrary";
import { FileQuestion, Layers, Database, BookOpen, Sparkles } from "lucide-react";

export function MCQIngestionManager() {
  const [activeTab, setActiveTab] = useState<"single" | "multi" | "explorer" | "contexts">("single");
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleIngestionSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab("explorer");
  };

  const tabs = [
    {
      id: "single" as const,
      label: "Single MCQ Ingestion",
      icon: FileQuestion,
      desc: "Standalone 4-choice questions",
    },
    {
      id: "multi" as const,
      label: "Multi-Context Ingestion",
      icon: Layers,
      desc: "Passage & Scenario-based items",
    },
    {
      id: "explorer" as const,
      label: "MCQ Bank Explorer",
      icon: Database,
      desc: "Search, filter & test simulation",
    },
    {
      id: "contexts" as const,
      label: "Passages Library",
      icon: BookOpen,
      desc: "Manage stems & stimulus sets",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Analytics KPI Banner */}
      <MCQStatsBanner refreshTrigger={refreshTrigger} />

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
        {activeTab === "single" && (
          <SingleMCQCreator onSuccess={handleIngestionSuccess} />
        )}
        {activeTab === "multi" && (
          <MultiContextMCQCreator onSuccess={handleIngestionSuccess} />
        )}
        {activeTab === "explorer" && (
          <MCQFilterExplorer
            refreshTrigger={refreshTrigger}
            onRefreshNeeded={() => setRefreshTrigger((prev) => prev + 1)}
          />
        )}
        {activeTab === "contexts" && (
          <ContextsLibrary
            refreshTrigger={refreshTrigger}
            onRefreshNeeded={() => setRefreshTrigger((prev) => prev + 1)}
          />
        )}
      </div>
    </div>
  );
}
