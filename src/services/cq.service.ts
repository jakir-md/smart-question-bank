/**
 * @file cq.service.ts
 * @description API Client Service for Creative Question (CQ) Ingestion (MVC - Model/Service).
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

import { ApiResponse } from "@/types/mcq.types";
import {
  CQFilterParams,
  CQQuestionContextItem,
  CQStatsResponse,
  CreateCQDTO,
  UpdateCQDTO,
} from "@/types/cq.types";

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
// CQ Ingestion Services
// ==========================================

/**
 * Ingest a complete Creative Question set (Uddipok + 4 Sub-questions ক, খ, গ, ঘ).
 */
export async function ingestCQ(data: CreateCQDTO): Promise<ApiResponse<CQQuestionContextItem>> {
  return request<CQQuestionContextItem>("cq-ingestion/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Fetch paginated Creative Questions with filters (taxonomy, tags, search, difficulty).
 */
export async function getCQs(params?: CQFilterParams): Promise<ApiResponse<CQQuestionContextItem[]>> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.educationLevelId) query.set("educationLevelId", params.educationLevelId);
  if (params?.subjectId) query.set("subjectId", params.subjectId);
  if (params?.chapterId) query.set("chapterId", params.chapterId);
  if (params?.topicId) query.set("topicId", params.topicId);
  if (params?.difficulty) query.set("difficulty", params.difficulty);
  if (params?.tags && params.tags.length > 0) query.set("tags", params.tags.join(","));
  if (params?.operator) query.set("operator", params.operator);
  if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
  if (params?.isPublished !== undefined) query.set("isPublished", String(params.isPublished));
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.sortBy) query.set("sortBy", params.sortBy);
  if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

  return request<CQQuestionContextItem[]>(`cq-ingestion/questions?${query.toString()}`);
}

/**
 * Fetch single CQ details by Context UUID.
 */
export async function getCQById(id: string): Promise<ApiResponse<CQQuestionContextItem>> {
  return request<CQQuestionContextItem>(`cq-ingestion/questions/${id}`);
}

/**
 * Update an existing CQ set.
 */
export async function updateCQ(
  id: string,
  data: UpdateCQDTO,
): Promise<ApiResponse<CQQuestionContextItem>> {
  return request<CQQuestionContextItem>(`cq-ingestion/questions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Delete a CQ set.
 */
export async function deleteCQ(id: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
  return request<{ success: boolean; message: string }>(`cq-ingestion/questions/${id}`, {
    method: "DELETE",
  });
}

/**
 * Fetch summary statistics for CQ Ingestion.
 */
export async function getCQStats(): Promise<ApiResponse<CQStatsResponse>> {
  return request<CQStatsResponse>("cq-ingestion/stats");
}

export const CQService = {
  ingestCQ,
  getCQs,
  getCQById,
  updateCQ,
  deleteCQ,
  getCQStats,
};
