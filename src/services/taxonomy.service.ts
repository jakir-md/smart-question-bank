/**
 * @file taxonomy.service.ts
 * @description API Client Service for Curriculum Taxonomy operations (MVC - Model/Service).
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

import {
  ApiResponse,
  Chapter,
  CreateChapterInput,
  CreateEducationLevelInput,
  CreateSubjectInput,
  CreateTopicInput,
  EducationLevel,
  ReorderItemInput,
  Subject,
  TaxonomyStats,
  TaxonomyTreeResponse,
  Topic,
  TopicLineage,
} from "@/types/taxonomy.types";

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
// Tree, Lineage & Analytics Services
// ==========================================

/**
 * Fetches the complete 4-tier hierarchical taxonomy tree.
 */
export async function getTaxonomyTree(onlyActive: boolean = false): Promise<ApiResponse<TaxonomyTreeResponse>> {
  return request<TaxonomyTreeResponse>(`curriculum-taxonomy/tree?onlyActive=${onlyActive}`);
}

/**
 * Fetches aggregated taxonomy statistics.
 */
export async function getTaxonomyStats(): Promise<ApiResponse<TaxonomyStats>> {
  return request<TaxonomyStats>("curriculum-taxonomy/stats");
}

/**
 * Resolves full breadcrumb lineage for a Topic.
 */
export async function getTopicLineage(topicId: string): Promise<ApiResponse<TopicLineage>> {
  return request<TopicLineage>(`curriculum-taxonomy/topics/${topicId}/lineage`);
}

// ==========================================
// Education Level Services (Tier 1)
// ==========================================

export async function getEducationLevels(params?: {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<EducationLevel[]>> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  return request<EducationLevel[]>(`curriculum-taxonomy/education-levels?${query.toString()}`);
}

export async function getEducationLevelById(id: string): Promise<ApiResponse<EducationLevel>> {
  return request<EducationLevel>(`curriculum-taxonomy/education-levels/${id}`);
}

export async function createEducationLevel(
  data: CreateEducationLevelInput,
): Promise<ApiResponse<EducationLevel>> {
  return request<EducationLevel>("curriculum-taxonomy/education-levels", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEducationLevel(
  id: string,
  data: Partial<CreateEducationLevelInput>,
): Promise<ApiResponse<EducationLevel>> {
  return request<EducationLevel>(`curriculum-taxonomy/education-levels/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function toggleEducationLevelStatus(id: string): Promise<ApiResponse<EducationLevel>> {
  return request<EducationLevel>(`curriculum-taxonomy/education-levels/${id}/toggle-status`, {
    method: "PATCH",
  });
}

export async function deleteEducationLevel(id: string): Promise<ApiResponse<EducationLevel>> {
  return request<EducationLevel>(`curriculum-taxonomy/education-levels/${id}`, {
    method: "DELETE",
  });
}

export async function reorderEducationLevels(items: ReorderItemInput[]): Promise<ApiResponse<null>> {
  return request<null>("curriculum-taxonomy/education-levels/reorder", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

// ==========================================
// Subject Services (Tier 2)
// ==========================================

export async function getSubjects(params?: {
  educationLevelId?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Subject[]>> {
  const query = new URLSearchParams();
  if (params?.educationLevelId) query.set("educationLevelId", params.educationLevelId);
  if (params?.search) query.set("search", params.search);
  if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  return request<Subject[]>(`curriculum-taxonomy/subjects?${query.toString()}`);
}

export async function getSubjectById(id: string): Promise<ApiResponse<Subject>> {
  return request<Subject>(`curriculum-taxonomy/subjects/${id}`);
}

export async function createSubject(data: CreateSubjectInput): Promise<ApiResponse<Subject>> {
  return request<Subject>("curriculum-taxonomy/subjects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSubject(
  id: string,
  data: Partial<CreateSubjectInput>,
): Promise<ApiResponse<Subject>> {
  return request<Subject>(`curriculum-taxonomy/subjects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function toggleSubjectStatus(id: string): Promise<ApiResponse<Subject>> {
  return request<Subject>(`curriculum-taxonomy/subjects/${id}/toggle-status`, {
    method: "PATCH",
  });
}

export async function deleteSubject(id: string): Promise<ApiResponse<Subject>> {
  return request<Subject>(`curriculum-taxonomy/subjects/${id}`, {
    method: "DELETE",
  });
}

export async function reorderSubjects(items: ReorderItemInput[]): Promise<ApiResponse<null>> {
  return request<null>("curriculum-taxonomy/subjects/reorder", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

// ==========================================
// Chapter Services (Tier 3)
// ==========================================

export async function getChapters(params?: {
  subjectId?: string;
  educationLevelId?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Chapter[]>> {
  const query = new URLSearchParams();
  if (params?.subjectId) query.set("subjectId", params.subjectId);
  if (params?.educationLevelId) query.set("educationLevelId", params.educationLevelId);
  if (params?.search) query.set("search", params.search);
  if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  return request<Chapter[]>(`curriculum-taxonomy/chapters?${query.toString()}`);
}

export async function getChapterById(id: string): Promise<ApiResponse<Chapter>> {
  return request<Chapter>(`curriculum-taxonomy/chapters/${id}`);
}

export async function createChapter(data: CreateChapterInput): Promise<ApiResponse<Chapter>> {
  return request<Chapter>("curriculum-taxonomy/chapters", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateChapter(
  id: string,
  data: Partial<CreateChapterInput>,
): Promise<ApiResponse<Chapter>> {
  return request<Chapter>(`curriculum-taxonomy/chapters/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function toggleChapterStatus(id: string): Promise<ApiResponse<Chapter>> {
  return request<Chapter>(`curriculum-taxonomy/chapters/${id}/toggle-status`, {
    method: "PATCH",
  });
}

export async function deleteChapter(id: string): Promise<ApiResponse<Chapter>> {
  return request<Chapter>(`curriculum-taxonomy/chapters/${id}`, {
    method: "DELETE",
  });
}

export async function reorderChapters(items: ReorderItemInput[]): Promise<ApiResponse<null>> {
  return request<null>("curriculum-taxonomy/chapters/reorder", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

// ==========================================
// Topic Services (Tier 4)
// ==========================================

export async function getTopics(params?: {
  chapterId?: string;
  subjectId?: string;
  educationLevelId?: string;
  parentTopicId?: string | null;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Topic[]>> {
  const query = new URLSearchParams();
  if (params?.chapterId) query.set("chapterId", params.chapterId);
  if (params?.subjectId) query.set("subjectId", params.subjectId);
  if (params?.educationLevelId) query.set("educationLevelId", params.educationLevelId);
  if (params?.parentTopicId !== undefined) query.set("parentTopicId", String(params.parentTopicId));
  if (params?.search) query.set("search", params.search);
  if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  return request<Topic[]>(`curriculum-taxonomy/topics?${query.toString()}`);
}

export async function getTopicById(id: string): Promise<ApiResponse<Topic>> {
  return request<Topic>(`curriculum-taxonomy/topics/${id}`);
}

export async function createTopic(data: CreateTopicInput): Promise<ApiResponse<Topic>> {
  return request<Topic>("curriculum-taxonomy/topics", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTopic(
  id: string,
  data: Partial<CreateTopicInput>,
): Promise<ApiResponse<Topic>> {
  return request<Topic>(`curriculum-taxonomy/topics/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function toggleTopicStatus(id: string): Promise<ApiResponse<Topic>> {
  return request<Topic>(`curriculum-taxonomy/topics/${id}/toggle-status`, {
    method: "PATCH",
  });
}

export async function deleteTopic(id: string): Promise<ApiResponse<Topic>> {
  return request<Topic>(`curriculum-taxonomy/topics/${id}`, {
    method: "DELETE",
  });
}

export async function reorderTopics(items: ReorderItemInput[]): Promise<ApiResponse<null>> {
  return request<null>("curriculum-taxonomy/topics/reorder", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export const TaxonomyService = {
  getTaxonomyTree,
  getTaxonomyStats,
  getTopicLineage,
  getEducationLevels,
  getEducationLevelById,
  createEducationLevel,
  updateEducationLevel,
  toggleEducationLevelStatus,
  deleteEducationLevel,
  reorderEducationLevels,
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  toggleSubjectStatus,
  deleteSubject,
  reorderSubjects,
  getChapters,
  getChapterById,
  createChapter,
  updateChapter,
  toggleChapterStatus,
  deleteChapter,
  reorderChapters,
  getTopics,
  getTopicById,
  createTopic,
  updateTopic,
  toggleTopicStatus,
  deleteTopic,
  reorderTopics,
};
