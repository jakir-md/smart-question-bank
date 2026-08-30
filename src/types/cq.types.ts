/**
 * @file cq.types.ts
 * @description Frontend TypeScript types and interfaces for Creative Question (CQ) Ingestion.
 * Complies with Essential TypeScript Coding Standards and TSDoc documentation.
 */

import { EducationLevel, Subject, Chapter, Topic } from "./taxonomy.types";
import { Tag } from "./tag.types";

export type ContextType =
  | "STEM"
  | "PASSAGE"
  | "CASE_STUDY"
  | "COMPREHENSION"
  | "SCENARIO"
  | "EXPERIMENT_DATA";

export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";

export type CQSubQuestionKey =
  | "KNOWLEDGE"
  | "COMPREHENSION"
  | "APPLICATION"
  | "HIGHER_ABILITY";

export type CQSubQuestionLabel = "ক" | "খ" | "গ" | "ঘ";

export interface CQSubQuestionMetadata {
  label: CQSubQuestionLabel;
  cognitiveLevel: CQSubQuestionKey;
  totalCQMarks?: number;
}

export interface CQSubQuestionInput {
  id?: string;
  label: CQSubQuestionLabel;
  cognitiveLevel: CQSubQuestionKey;
  questionText: string;
  marks: number;
  explanation?: string | null;
  difficulty: DifficultyLevel;
  topicId?: string | null;
  tagIds?: string[];
  tagNames?: string[];
  order: number;
}

export interface CQStimulusInput {
  title?: string | null;
  contextText: string;
  contextType: ContextType;
  mediaUrl?: string | null;
  educationLevelId?: string | null;
  subjectId?: string | null;
  chapterId?: string | null;
  topicId?: string | null;
  isActive?: boolean;
  isPublished?: boolean;
}

export interface CreateCQDTO {
  stimulus: CQStimulusInput;
  questions: CQSubQuestionInput[];
  totalMarks: number;
  commonTagIds?: string[];
  commonTagNames?: string[];
}

export interface UpdateCQDTO {
  stimulus?: Partial<CQStimulusInput>;
  questions?: CQSubQuestionInput[];
  totalMarks?: number;
  commonTagIds?: string[];
  commonTagNames?: string[];
}

export interface CQFilterParams {
  search?: string;
  educationLevelId?: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  difficulty?: DifficultyLevel;
  tags?: string[];
  operator?: "AND" | "OR";
  isActive?: boolean;
  isPublished?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CQQuestionItem {
  id: string;
  educationLevelId?: string | null;
  subjectId?: string | null;
  chapterId?: string | null;
  topicId?: string | null;
  contextId?: string | null;
  contextOrder: number;
  questionText: string;
  questionType: "CQ";
  options?: CQSubQuestionMetadata | null;
  explanation?: string | null;
  difficulty: DifficultyLevel;
  marks: number;
  negativeMarks: number;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: {
    id: string;
    questionId: string;
    tagId: string;
    tag: Tag;
  }[];
}

export interface CQQuestionContextItem {
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
  questions: CQQuestionItem[];
}

export interface CQStatsResponse {
  totalCQSets: number;
  totalSubQuestions: number;
  cognitiveDistribution: {
    KNOWLEDGE: number;
    COMPREHENSION: number;
    APPLICATION: number;
    HIGHER_ABILITY: number;
  };
  difficultyDistribution: {
    EASY: number;
    MEDIUM: number;
    HARD: number;
  };
  totalMarksLogged: number;
  totalActive: number;
  totalPublished: number;
}
