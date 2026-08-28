/**
 * @file TagStatsBanner.tsx
 * @description Summary metric cards displaying tag counts, categories, and question connections.
 * Complies with Essential TypeScript standards and TSDoc documentation.
 */

"use client";

import React from "react";
import { TagStats } from "@/types/tag.types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tags, Link2, LayoutGrid, Award } from "lucide-react";

interface TagStatsBannerProps {
  stats: TagStats | null;
  loading?: boolean;
}

export function TagStatsBanner({ stats, loading = false }: TagStatsBannerProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/60 shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const topTag = stats.topTags && stats.topTags.length > 0 ? stats.topTags[0] : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Total Tags Card */}
      <Card className="border-blue-500/20 bg-linear-to-br from-blue-500/5 via-background to-background shadow-xs hover:border-blue-500/30 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Tags</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground">{stats.totalTags}</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {stats.activeTags} active
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Tags className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Question Attachments Card */}
      <Card className="border-emerald-500/20 bg-linear-to-br from-emerald-500/5 via-background to-background shadow-xs hover:border-emerald-500/30 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Question Attachments</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground">{stats.totalQuestionAttachments}</span>
              <span className="text-[11px] text-muted-foreground">connected tags</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Link2 className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Tag Categories Card */}
      <Card className="border-purple-500/20 bg-linear-to-br from-purple-500/5 via-background to-background shadow-xs hover:border-purple-500/30 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Metadata Domains</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground">{stats.categories.length}</span>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                categories
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <LayoutGrid className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Top Tag Card */}
      <Card className="border-amber-500/20 bg-linear-to-br from-amber-500/5 via-background to-background shadow-xs hover:border-amber-500/30 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-medium text-muted-foreground">Most Used Tag</p>
            <div className="mt-1 truncate">
              {topTag ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-foreground truncate">{topTag.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-mono font-semibold shrink-0">
                    {topTag.usageCount} qs
                  </span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">No tags attached yet</span>
              )}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <Award className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
