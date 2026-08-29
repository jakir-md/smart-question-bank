/**
 * @file mcq.types.ts
 * @description Frontend TypeScript types and interfaces for MCQ Ingestion (Single & Multi-Context).
 * Complies with Essential TypeScript standards and TSDoc documentation.
 */

import { Tag } from "./tag.types";
import { EducationLevel, Subject, Chapter, Topic } from "./taxonomy.types";

export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";
export type QuestionType = "MCQ" | "CQ" | "SHORT_ANSWER" | "TRUE_FALSE";
export type ContextType =
  | "PASSAGE"
  | "CASE_STUDY"
  | "COMPREHENSION"
  | "SCENARIO"
  | "EXPERIMENT_DATA"
  | "STEM";

/**
 * MCQ Option item structure
 */
export interface IMCQOption {
  id: string; // "A" | "B" | "C" | "D"
  text: string; // Rich text / LaTeX option body
  isCorrect: boolean; // True for the correct answer
}

/**
 * Data required to create a single standalone MCQ
 */
export interface SingleMCQInput {
  questionText: string;
  questionType?: QuestionType;
  options: IMCQOption[];
  correctAnswer?: string;
  marks?: number;
  negativeMarks?: number;
  explanation?: string;
  difficulty?: DifficultyLevel;
  educationLevelId?: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  tagIds?: string[];
  tagNames?: string[];
  contextId?: string;
  contextOrder?: number;
  isActive?: boolean;
  isPublished?: boolean;
}

/**
 * Sub-question item inside a Multi-Context package
 */
export interface SubQuestionInput {
  id?: string;
  questionText: string;
  questionType?: QuestionType;
  options: IMCQOption[];
  correctAnswer?: string;
  marks?: number;
  negativeMarks?: number;
  explanation?: string;
  difficulty?: DifficultyLevel;
  topicId?: string;
  tagIds?: string[];
  tagNames?: string[];
  order?: number;
}

/**
 * Data required to ingest a Multi-Context Question Package
 */
export interface MultiContextMCQInput {
  context: {
    title?: string;
    contextText: string;
    contextType?: ContextType;
    mediaUrl?: string;
    educationLevelId?: string;
    subjectId?: string;
    chapterId?: string;
    topicId?: string;
    isActive?: boolean;
    isPublished?: boolean;
  };
  questions: SubQuestionInput[];
  commonTagIds?: string[];
  commonTagNames?: string[];
}

/**
 * Ingested Question Context (Passage/Stem) model
 */
export interface QuestionContext {
  id: string;
  title?: string | null;
  contextText: string;
  contextType: ContextType;
  mediaUrl?: string | null;
  educationLevelId?: string | null;
  subjectId?: string | null;
  chapterId?: string | null;
  topicId?: string | null;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  educationLevel?: EducationLevel | null;
  subject?: Subject | null;
  chapter?: Chapter | null;
  topic?: Topic | null;
  questions?: MCQItem[];
  _count?: {
    questions: number;
  };
}

/**
 * Ingested MCQ Item representation with all relations
 */
export interface MCQItem {
  id: string;
  educationLevelId?: string | null;
  subjectId?: string | null;
  chapterId?: string | null;
  topicId?: string | null;
  contextId?: string | null;
  contextOrder?: number | null;
  questionText: string;
  questionType: QuestionType;
  options: IMCQOption[];
  correctAnswer?: string | null;
  explanation?: string | null;
  difficulty: DifficultyLevel;
  marks: number;
  negativeMarks: number;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  educationLevel?: { id: string; name: string; code?: string } | null;
  subject?: { id: string; name: string; code?: string } | null;
  chapter?: { id: string; name: string; chapterNumber?: number } | null;
  topic?: { id: string; name: string } | null;
  context?: {
    id: string;
    title?: string | null;
    contextText: string;
    contextType: ContextType;
  } | null;
  tags?: { id?: string; tag: Tag }[];
}

/**
 * Filter parameters for querying MCQs
 */
export interface MCQFilterParams {
  search?: string;
  educationLevelId?: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  contextId?: string;
  isMultiContext?: boolean;
  difficulty?: DifficultyLevel;
  questionType?: QuestionType;
  tags?: string[];
  operator?: "AND" | "OR";
  isActive?: boolean;
  isPublished?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "difficulty" | "marks";
  sortOrder?: "asc" | "desc";
}

/**
 * Statistics metrics
 */
export interface MCQStats {
  totalQuestions: number;
  totalSingleMCQs: number;
  totalMultiContextMCQs: number;
  totalContexts: number;
  difficultyDistribution: {
    EASY: number;
    MEDIUM: number;
    HARD: number;
  };
  totalActive: number;
  totalPublished: number;
}

/**
 * Standard API response wrapper
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
