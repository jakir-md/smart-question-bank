/**
 * @file page.tsx
 * @description Admin Creative Question (CQ) Ingestion Hub (MVC - View/Page).
 * Enables Content Creators to author, validate, and manage structured subjective CQ items (Uddipok + 4 Sub-questions ক, খ, গ, ঘ).
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React from "react";
import { CQIngestionManager } from "@/components/module/CQIngestion/CQIngestionManager";
import { BookOpen, Sparkles } from "lucide-react";

export default function CQIngestionPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BookOpen className="h-7 w-7 text-primary" />
            CQ Ingestion Hub (সৃজনশীল প্রশ্ন ইঞ্জিন)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            উদ্দীপক (Stem/Stimulus) এবং ৪টি উপ-প্রশ্ন (ক-জ্ঞানমূলক ১, খ-অনুধাবনমূলক ২, গ-প্রয়োগমূলক ৩, ঘ-উচ্চতর দক্ষতামূলক ৪) সম্বলিত ১০ নম্বরের পূর্ণাঙ্গ সৃজনশীল প্রশ্ন ইনজেস্ট ও পরিচালনা করুন।
          </p>
        </div>
      </div>

      {/* Main Tabbed Ingestion Manager */}
      <CQIngestionManager />
    </div>
  );
}
