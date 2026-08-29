/**
 * @file mcq.service.ts
 * @description API Client Service for MCQ Ingestion (Single & Multi-Context) (MVC - Model/Service).
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

import {
  ApiResponse,
  ContextType,
  MCQFilterParams,
  MCQItem,
  MCQStats,
  MultiContextMCQInput,
  QuestionContext,
  SingleMCQInput,
} from "@/types/mcq.types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";

/**
 * Universal fetch wrapper for client-side API requests.
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\/+/, "")}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(typeof options.headers === "object" && !Array.isArray(options.headers) && !(options.headers instanceof Headers)
      ? (options.headers as Record<string, string>)
      : {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || `API error: ${res.status} ${res.statusText}`);
  }

  return json;
}

// ==========================================
// MCQ Ingestion Services
// ==========================================

/**
 * Ingest a single standalone MCQ item.
 */
export async function ingestSingleMCQ(data: SingleMCQInput): Promise<ApiResponse<MCQItem>> {
  return request<MCQItem>("mcq-ingestion/single", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Ingest a Multi-Context Question Package (Passage/Stem + Sub-Questions).
 */
export async function ingestMultiContextMCQ(data: MultiContextMCQInput): Promise<ApiResponse<QuestionContext>> {
  return request<QuestionContext>("mcq-ingestion/multi-context", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Fetch paginated MCQs with filters (search, taxonomy, difficulty, tags, single vs multi-context).
 */
export async function getMCQs(params?: MCQFilterParams): Promise<ApiResponse<MCQItem[]>> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.educationLevelId) query.set("educationLevelId", params.educationLevelId);
  if (params?.subjectId) query.set("subjectId", params.subjectId);
  if (params?.chapterId) query.set("chapterId", params.chapterId);
  if (params?.topicId) query.set("topicId", params.topicId);
  if (params?.contextId) query.set("contextId", params.contextId);
  if (params?.isMultiContext !== undefined) query.set("isMultiContext", String(params.isMultiContext));
  if (params?.difficulty) query.set("difficulty", params.difficulty);
  if (params?.questionType) query.set("questionType", params.questionType);
  if (params?.tags && params.tags.length > 0) query.set("tags", params.tags.join(","));
  if (params?.operator) query.set("operator", params.operator);
  if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
  if (params?.isPublished !== undefined) query.set("isPublished", String(params.isPublished));
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.sortBy) query.set("sortBy", params.sortBy);
  if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

  return request<MCQItem[]>(`mcq-ingestion/questions?${query.toString()}`);
}

/**
 * Fetch single MCQ details by UUID.
 */
export async function getMCQById(id: string): Promise<ApiResponse<MCQItem>> {
  return request<MCQItem>(`mcq-ingestion/questions/${id}`);
}

/**
 * Update an existing MCQ.
 */
export async function updateMCQ(id: string, data: Partial<SingleMCQInput>): Promise<ApiResponse<MCQItem>> {
  return request<MCQItem>(`mcq-ingestion/questions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Delete an MCQ item.
 */
export async function deleteMCQ(id: string): Promise<ApiResponse<MCQItem>> {
  return request<MCQItem>(`mcq-ingestion/questions/${id}`, {
    method: "DELETE",
  });
}

// ==========================================
// Question Context (Passages/Stems) Services
// ==========================================

/**
 * Fetch question contexts / passages with question count.
 */
export async function getQuestionContexts(params?: {
  search?: string;
  educationLevelId?: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  contextType?: ContextType;
  isActive?: boolean;
  isPublished?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<ApiResponse<QuestionContext[]>> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.educationLevelId) query.set("educationLevelId", params.educationLevelId);
  if (params?.subjectId) query.set("subjectId", params.subjectId);
  if (params?.chapterId) query.set("chapterId", params.chapterId);
  if (params?.topicId) query.set("topicId", params.topicId);
  if (params?.contextType) query.set("contextType", params.contextType);
  if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
  if (params?.isPublished !== undefined) query.set("isPublished", String(params.isPublished));
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.sortBy) query.set("sortBy", params.sortBy);
  if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

  return request<QuestionContext[]>(`mcq-ingestion/contexts?${query.toString()}`);
}

/**
 * Fetch single Question Context by ID with all nested questions.
 */
export async function getQuestionContextById(id: string): Promise<ApiResponse<QuestionContext>> {
  return request<QuestionContext>(`mcq-ingestion/contexts/${id}`);
}

/**
 * Update Question Context details.
 */
export async function updateQuestionContext(
  id: string,
  data: Partial<QuestionContext>,
): Promise<ApiResponse<QuestionContext>> {
  return request<QuestionContext>(`mcq-ingestion/contexts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Delete Question Context.
 */
export async function deleteQuestionContext(id: string): Promise<ApiResponse<QuestionContext>> {
  return request<QuestionContext>(`mcq-ingestion/contexts/${id}`, {
    method: "DELETE",
  });
}

/**
 * Fetch MCQ Ingestion statistics and metrics.
 */
export async function getMCQStats(): Promise<ApiResponse<MCQStats>> {
  return request<MCQStats>("mcq-ingestion/stats");
}

export const MCQService = {
  ingestSingleMCQ,
  ingestMultiContextMCQ,
  getMCQs,
  getMCQById,
  updateMCQ,
  deleteMCQ,
  getQuestionContexts,
  getQuestionContextById,
  updateQuestionContext,
  deleteQuestionContext,
  getMCQStats,
};
