/**
 * @file page.tsx
 * @description Admin MCQ Ingestion Hub (Single & Multi-Context) (MVC - View/Page).
 * Enables Content Creators to author, validate, and manage single objective MCQs and multi-context passage items.
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React from "react";
import { MCQIngestionManager } from "@/components/module/MCQIngestion/MCQIngestionManager";
import { FileQuestion, Sparkles, Layers } from "lucide-react";

export default function MCQIngestionPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileQuestion className="h-7 w-7 text-primary" />
            MCQ Ingestion Hub (Single & Multi-Context)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Author objective test questions with LaTeX equations, 4 options, 1 correct answer validation, marks, step-by-step solutions, and curriculum taxonomy links.
          </p>
        </div>
      </div>

      {/* Main Tabbed Ingestion Manager */}
      <MCQIngestionManager />
    </div>
  );
}
