/**
 * @file TagBadge.tsx
 * @description Highly customizable, accessible visual badge for metadata tags.
 * Supports category-themed colors, custom hex colors, Lucide icons, and interactive delete triggers.
 */

"use client";

import React from "react";
import { Tag, TagCategory, TAG_CATEGORIES_CONFIG } from "@/types/tag.types";
import {
  GraduationCap,
  Shield,
  Target,
  Building2,
  Gauge,
  Calendar,
  Sparkles,
  Tag as TagIcon,
  X,
} from "lucide-react";

interface TagBadgeProps {
  tag: Partial<Tag> & { name: string; category?: TagCategory };
  onRemove?: () => void;
  size?: "xs" | "sm" | "md" | "lg";
  clickable?: boolean;
  onClick?: () => void;
  showCategoryIcon?: boolean;
  showUsageCount?: boolean;
  className?: string;
}

export function TagBadge({
  tag,
  onRemove,
  size = "sm",
  clickable = false,
  onClick,
  showCategoryIcon = true,
  showUsageCount = false,
  className = "",
}: TagBadgeProps) {
  const category = tag.category || "CUSTOM";
  const config = TAG_CATEGORIES_CONFIG[category] || TAG_CATEGORIES_CONFIG.CUSTOM;

  const renderIcon = () => {
    const iconClass = size === "xs" ? "h-2.5 w-2.5" : size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

    switch (category) {
      case "BOARD_EXAM":
        return <GraduationCap className={iconClass} />;
      case "CADET_COLLEGE":
        return <Shield className={iconClass} />;
      case "ADMISSION_TEST":
        return <Target className={iconClass} />;
      case "INSTITUTION":
        return <Building2 className={iconClass} />;
      case "DIFFICULTY":
        return <Gauge className={iconClass} />;
      case "EXAM_YEAR":
        return <Calendar className={iconClass} />;
      case "TOPIC_SPECIAL":
        return <Sparkles className={iconClass} />;
      default:
        return <TagIcon className={iconClass} />;
    }
  };

  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.5 gap-1 font-medium",
    sm: "text-xs px-2.5 py-1 gap-1.5 font-medium",
    md: "text-sm px-3 py-1.5 gap-2 font-medium",
    lg: "text-base px-3.5 py-2 gap-2.5 font-semibold",
  };

  const customStyle: React.CSSProperties = tag.color
    ? {
        backgroundColor: `${tag.color}15`,
        borderColor: `${tag.color}40`,
        color: tag.color,
      }
    : {};

  return (
    <span
      onClick={clickable ? onClick : undefined}
      style={customStyle}
      className={`inline-flex items-center rounded-full border transition-all duration-200 select-none ${
        sizeClasses[size]
      } ${
        !tag.color
          ? `${config.bgLight} ${config.textColor} ${config.borderColor}`
          : ""
      } ${
        clickable ? "cursor-pointer hover:opacity-85 hover:shadow-xs active:scale-95" : ""
      } ${className}`}
      title={`${tag.name} (${config.label})`}
    >
      {showCategoryIcon && <span className="shrink-0 opacity-80">{renderIcon()}</span>}

      <span className="truncate max-w-[180px]">{tag.name}</span>

      {showUsageCount && tag.usageCount !== undefined && (
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-foreground/10 text-foreground/80 font-mono font-normal">
          {tag.usageCount}
        </span>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-foreground/15 text-foreground/70 hover:text-foreground transition-colors cursor-pointer"
          title={`Remove tag ${tag.name}`}
        >
          <X className={size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3"} />
        </button>
      )}
    </span>
  );
}
