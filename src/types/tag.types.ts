/**
 * @file tag.types.ts
 * @description Client-side TypeScript definitions, interfaces, and category metadata for the Metadata & Tagging System.
 * Complies with Essential TypeScript standards and TSDoc documentation.
 */

export type TagCategory =
  | "BOARD_EXAM"
  | "CADET_COLLEGE"
  | "ADMISSION_TEST"
  | "INSTITUTION"
  | "DIFFICULTY"
  | "EXAM_YEAR"
  | "TOPIC_SPECIAL"
  | "CUSTOM";

export type QuestionType = "MCQ" | "CQ" | "SHORT_ANSWER" | "TRUE_FALSE";
export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";

/**
 * Core Tag entity representation.
 */
export interface Tag {
  id: string;
  name: string;
  slug: string;
  category: TagCategory;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    questions: number;
  };
}

/**
 * Detailed category metadata for UI styling and badging.
 */
export interface TagCategoryInfo {
  category: TagCategory;
  label: string;
  color: string;
  textColor: string;
  bgLight: string;
  borderColor: string;
  icon: string;
  description: string;
  count?: number;
}

/**
 * Standard API response wrapper matching server structure.
 */
export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: T;
}

/**
 * Tag category metadata registry with cohesive theme colors and UI properties.
 */
export const TAG_CATEGORIES_CONFIG: Record<TagCategory, TagCategoryInfo> = {
  BOARD_EXAM: {
    category: "BOARD_EXAM",
    label: "Board Exam",
    color: "#2563eb", // Royal Blue
    textColor: "text-blue-700 dark:text-blue-400",
    bgLight: "bg-blue-500/10 dark:bg-blue-950/40",
    borderColor: "border-blue-500/30",
    icon: "GraduationCap",
    description: "National Secondary & Higher Secondary Board Exams (e.g. Dhaka Board 2024)",
  },
  CADET_COLLEGE: {
    category: "CADET_COLLEGE",
    label: "Cadet College",
    color: "#7c3aed", // Deep Purple
    textColor: "text-purple-700 dark:text-purple-400",
    bgLight: "bg-purple-500/10 dark:bg-purple-950/40",
    borderColor: "border-purple-500/30",
    icon: "Shield",
    description: "Cadet College admission & model tests (e.g. Faujdarhat, Mirzapur)",
  },
  ADMISSION_TEST: {
    category: "ADMISSION_TEST",
    label: "Admission Test",
    color: "#d97706", // Amber
    textColor: "text-amber-700 dark:text-amber-400",
    bgLight: "bg-amber-500/10 dark:bg-amber-950/40",
    borderColor: "border-amber-500/30",
    icon: "Target",
    description: "University & Medical entrance tests (e.g. BUET, Medical, DU A-Unit, IBA)",
  },
  INSTITUTION: {
    category: "INSTITUTION",
    label: "Institution / College",
    color: "#0891b2", // Cyan
    textColor: "text-cyan-700 dark:text-cyan-400",
    bgLight: "bg-cyan-500/10 dark:bg-cyan-950/40",
    borderColor: "border-cyan-500/30",
    icon: "Building2",
    description: "Renowned colleges & schools (e.g. Notre Dame College, Holy Cross)",
  },
  DIFFICULTY: {
    category: "DIFFICULTY",
    label: "Difficulty Tier",
    color: "#e11d48", // Rose / Red
    textColor: "text-rose-700 dark:text-rose-400",
    bgLight: "bg-rose-500/10 dark:bg-rose-950/40",
    borderColor: "border-rose-500/30",
    icon: "Gauge",
    description: "Complexity grade (e.g. Easy, Medium, Hard, Olympiad-level)",
  },
  EXAM_YEAR: {
    category: "EXAM_YEAR",
    label: "Exam Year",
    color: "#059669", // Emerald
    textColor: "text-emerald-700 dark:text-emerald-400",
    bgLight: "bg-emerald-500/10 dark:bg-emerald-950/40",
    borderColor: "border-emerald-500/30",
    icon: "Calendar",
    description: "Academic examination cohort year (e.g. 2024, 2023, 2022)",
  },
  TOPIC_SPECIAL: {
    category: "TOPIC_SPECIAL",
    label: "Special Pattern",
    color: "#db2777", // Pink
    textColor: "text-pink-700 dark:text-pink-400",
    bgLight: "bg-pink-500/10 dark:bg-pink-950/40",
    borderColor: "border-pink-500/30",
    icon: "Sparkles",
    description: "Specific pattern (e.g. Formula Based, Conceptual, Tricky, Graph Based)",
  },
  CUSTOM: {
    category: "CUSTOM",
    label: "Custom Tag",
    color: "#475569", // Slate
    textColor: "text-slate-700 dark:text-slate-400",
    bgLight: "bg-slate-500/10 dark:bg-slate-900/40",
    borderColor: "border-slate-500/30",
    icon: "Tag",
    description: "General custom metadata tags created by content creators",
  },
};

/**
 * Data payload for creating a new Tag.
 */
export interface CreateTagInput {
  name: string;
  slug?: string;
  category?: TagCategory;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

/**
 * Data payload for updating an existing Tag.
 */
export interface UpdateTagInput {
  name?: string;
  slug?: string;
  category?: TagCategory;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  isActive?: boolean;
}

/**
 * Bulk tag creation input.
 */
export interface BulkCreateTagsInput {
  tags: {
    name: string;
    category?: TagCategory;
    color?: string;
    description?: string;
  }[];
}

/**
 * Tag system aggregated statistics.
 */
export interface TagStats {
  totalTags: number;
  activeTags: number;
  inactiveTags: number;
  totalQuestionAttachments: number;
  categories: {
    category: TagCategory;
    label: string;
    count: number;
    color: string;
    icon: string;
    description: string;
  }[];
  topTags: {
    id: string;
    name: string;
    slug: string;
    category: TagCategory;
    color: string | null;
    usageCount: number;
  }[];
}

/**
 * Question model representation with attached tags.
 */
export interface QuestionWithTags {
  id: string;
  educationLevelId?: string | null;
  subjectId?: string | null;
  chapterId?: string | null;
  topicId?: string | null;
  questionText: string;
  questionType: QuestionType;
  options?: Array<{ id: string; text: string; isCorrect: boolean; explanation?: string }>;
  correctAnswer?: string | null;
  explanation?: string | null;
  difficulty: DifficultyLevel;
  marks: number;
  negativeMarks: number;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  tags: {
    tag: Tag;
  }[];
  educationLevel?: { id: string; name: string } | null;
  subject?: { id: string; name: string } | null;
  chapter?: { id: string; name: string } | null;
  topic?: { id: string; name: string } | null;
}

/**
 * Parameters for multi-tag filtering queries.
 */
export interface QuestionFilterParams {
  tags?: string[];
  operator?: "AND" | "OR";
  educationLevelId?: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  difficulty?: DifficultyLevel;
  questionType?: QuestionType;
  search?: string;
  isActive?: boolean;
  isPublished?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "difficulty" | "marks";
  sortOrder?: "asc" | "desc";
}

/**
 * Parameters for creating a sample question with tags.
 */
export interface CreateQuestionInput {
  educationLevelId?: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  questionText: string;
  questionType?: QuestionType;
  options?: Array<{ id: string; text: string; isCorrect: boolean; explanation?: string }>;
  correctAnswer?: string;
  explanation?: string;
  difficulty?: DifficultyLevel;
  marks?: number;
  negativeMarks?: number;
  isActive?: boolean;
  isPublished?: boolean;
  tagIds?: string[];
  tagNames?: string[];
}
