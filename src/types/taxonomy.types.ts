/**
 * @file taxonomy.types.ts
 * @description Frontend TypeScript types and interfaces for Curriculum Taxonomy Management.
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

/**
 * Importance rating for a curriculum topic.
 */
export type ImportanceLevel = "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";

/**
 * Difficulty tier for a curriculum topic.
 */
export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";

/**
 * Active taxonomy tier tab.
 */
export type TaxonomyTier = "tree" | "levels" | "subjects" | "chapters" | "topics" | "selector";

/**
 * Standard API Response envelope.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  } | null;
  data: T;
}

/**
 * Education Level (Tier 1).
 */
export interface EducationLevel {
  id: string;
  name: string;
  code: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  orderIndex: number;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subjects: number;
  };
}

/**
 * Subject (Tier 2).
 */
export interface Subject {
  id: string;
  educationLevelId: string;
  name: string;
  code: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  paper?: string | null;
  subjectCode?: string | null;
  orderIndex: number;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  educationLevel?: {
    id: string;
    name: string;
    code: string;
  };
  _count?: {
    chapters: number;
  };
}

/**
 * Chapter (Tier 3).
 */
export interface Chapter {
  id: string;
  subjectId: string;
  chapterNumber?: number | null;
  name: string;
  slug: string;
  description?: string | null;
  totalEstimatedHours?: number | null;
  weightage?: number | null;
  orderIndex: number;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  subject?: {
    id: string;
    name: string;
    code: string;
    educationLevel?: {
      id: string;
      name: string;
      code: string;
    };
  };
  _count?: {
    topics: number;
  };
}

/**
 * Topic (Tier 4).
 */
export interface Topic {
  id: string;
  chapterId: string;
  parentTopicId?: string | null;
  topicNumber?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  learningObjectives: string[];
  importanceLevel: ImportanceLevel;
  difficultyLevel: DifficultyLevel;
  orderIndex: number;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  chapter?: {
    id: string;
    name: string;
    subject?: {
      id: string;
      name: string;
      educationLevel?: {
        id: string;
        name: string;
      };
    };
  };
  parentTopic?: {
    id: string;
    name: string;
  } | null;
  subTopics?: Topic[];
  _count?: {
    subTopics: number;
  };
}

/**
 * Tree Node for Topics.
 */
export interface TaxonomyTopicNode {
  id: string;
  topicNumber?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  learningObjectives: string[];
  importanceLevel: ImportanceLevel;
  difficultyLevel: DifficultyLevel;
  orderIndex: number;
  isActive: boolean;
  isPublished: boolean;
  subTopics?: TaxonomyTopicNode[];
}

/**
 * Tree Node for Chapters.
 */
export interface TaxonomyChapterNode {
  id: string;
  chapterNumber?: number | null;
  name: string;
  slug: string;
  description?: string | null;
  totalEstimatedHours?: number | null;
  weightage?: number | null;
  orderIndex: number;
  isActive: boolean;
  isPublished: boolean;
  topicCount: number;
  topics: TaxonomyTopicNode[];
}

/**
 * Tree Node for Subjects.
 */
export interface TaxonomySubjectNode {
  id: string;
  name: string;
  code: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  paper?: string | null;
  subjectCode?: string | null;
  orderIndex: number;
  isActive: boolean;
  isPublished: boolean;
  chapterCount: number;
  topicCount: number;
  chapters: TaxonomyChapterNode[];
}

/**
 * Tree Node for Education Levels.
 */
export interface TaxonomyLevelNode {
  id: string;
  name: string;
  code: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  orderIndex: number;
  isActive: boolean;
  isPublished: boolean;
  subjectCount: number;
  chapterCount: number;
  topicCount: number;
  subjects: TaxonomySubjectNode[];
}

/**
 * Full Nested Taxonomy Tree.
 */
export interface TaxonomyTreeResponse {
  tree: TaxonomyLevelNode[];
  meta: {
    totalLevels: number;
    totalSubjects: number;
    totalChapters: number;
    totalTopics: number;
  };
}

/**
 * Lineage breadcrumb path for a Topic.
 */
export interface TopicLineage {
  level: { id: string; name: string; code: string; slug: string };
  subject: { id: string; name: string; code: string; slug: string };
  chapter: { id: string; name: string; chapterNumber?: number | null; slug: string };
  topic: { id: string; name: string; topicNumber?: string | null; slug: string };
  parentTopic?: { id: string; name: string; slug: string } | null;
}

/**
 * Aggregated taxonomy metrics and statistics.
 */
export interface TaxonomyStats {
  totalLevels: number;
  activeLevels: number;
  totalSubjects: number;
  activeSubjects: number;
  totalChapters: number;
  activeChapters: number;
  totalTopics: number;
  activeTopics: number;
  publishedTopics: number;
  importanceBreakdown: Record<string, number>;
  difficultyBreakdown: Record<string, number>;
}

/**
 * DTO inputs for creating and editing.
 */
export interface CreateEducationLevelInput {
  name: string;
  code: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  orderIndex?: number;
  isActive?: boolean;
  isPublished?: boolean;
}

export interface CreateSubjectInput {
  educationLevelId: string;
  name: string;
  code: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  paper?: string;
  subjectCode?: string;
  orderIndex?: number;
  isActive?: boolean;
  isPublished?: boolean;
}

export interface CreateChapterInput {
  subjectId: string;
  chapterNumber?: number;
  name: string;
  slug?: string;
  description?: string;
  totalEstimatedHours?: number;
  weightage?: number;
  orderIndex?: number;
  isActive?: boolean;
  isPublished?: boolean;
}

export interface CreateTopicInput {
  chapterId: string;
  parentTopicId?: string | null;
  topicNumber?: string;
  name: string;
  slug?: string;
  description?: string;
  learningObjectives?: string[];
  importanceLevel?: ImportanceLevel;
  difficultyLevel?: DifficultyLevel;
  orderIndex?: number;
  isActive?: boolean;
  isPublished?: boolean;
}

export interface ReorderItemInput {
  id: string;
  orderIndex: number;
}
