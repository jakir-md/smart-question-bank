/**
 * @file tag.service.ts
 * @description API Client Service for Metadata & Tagging operations (MVC - Model/Service).
 * Follows Essential TypeScript standards and TSDoc documentation.
 */

import {
  ApiResponse,
  BulkCreateTagsInput,
  CreateQuestionInput,
  CreateTagInput,
  QuestionFilterParams,
  QuestionWithTags,
  Tag,
  TagCategory,
  TagStats,
  UpdateTagInput,
} from "@/types/tag.types";

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
// Tag Management & Autocomplete Services
// ==========================================

/**
 * Fetches paginated tags with optional search, category, and status filters.
 */
export async function getTags(params?: {
  search?: string;
  category?: TagCategory;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<ApiResponse<Tag[]>> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category) query.set("category", params.category);
  if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.sortBy) query.set("sortBy", params.sortBy);
  if (params?.sortOrder) query.set("sortOrder", params.sortOrder);

  return request<Tag[]>(`tags?${query.toString()}`);
}

/**
 * High-speed autocomplete query for finding tags by prefix or search keyword.
 */
export async function autocompleteTags(params: {
  query: string;
  category?: TagCategory;
  limit?: number;
  onlyActive?: boolean;
}): Promise<ApiResponse<Tag[]>> {
  const query = new URLSearchParams();
  query.set("query", params.query);
  if (params.category) query.set("category", params.category);
  if (params.limit) query.set("limit", String(params.limit));
  if (params.onlyActive !== undefined) query.set("onlyActive", String(params.onlyActive));

  return request<Tag[]>(`tags/autocomplete?${query.toString()}`);
}

/**
 * Retrieves a single tag by ID with details and question count.
 */
export async function getTagById(id: string): Promise<ApiResponse<Tag>> {
  return request<Tag>(`tags/${id}`);
}

/**
 * Creates a new custom tag.
 */
export async function createTag(data: CreateTagInput): Promise<ApiResponse<Tag>> {
  return request<Tag>("tags", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Updates an existing tag.
 */
export async function updateTag(id: string, data: UpdateTagInput): Promise<ApiResponse<Tag>> {
  return request<Tag>(`tags/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Toggles the active status of a tag.
 */
export async function toggleTagStatus(id: string): Promise<ApiResponse<Tag>> {
  return request<Tag>(`tags/${id}/toggle-status`, {
    method: "PATCH",
  });
}

/**
 * Deletes a tag by ID.
 */
export async function deleteTag(id: string): Promise<ApiResponse<Tag>> {
  return request<Tag>(`tags/${id}`, {
    method: "DELETE",
  });
}

/**
 * Bulk creates or resolves tags by names and categories.
 */
export async function bulkCreateTags(data: BulkCreateTagsInput): Promise<ApiResponse<Tag[]>> {
  return request<Tag[]>("tags/bulk-create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Fetches all tag categories with metadata and counts.
 */
export async function getTagCategories(): Promise<
  ApiResponse<
    {
      category: TagCategory;
      label: string;
      count: number;
      color: string;
      icon: string;
      description: string;
    }[]
  >
> {
  return request("tags/categories");
}

/**
 * Fetches tag analytics and summary metrics.
 */
export async function getTagStats(): Promise<ApiResponse<TagStats>> {
  return request<TagStats>("tags/stats");
}

/**
 * Fetches the most frequently used / popular tags.
 */
export async function getPopularTags(limit: number = 10): Promise<ApiResponse<Tag[]>> {
  return request<Tag[]>(`tags/popular?limit=${limit}`);
}

// ==========================================
// Question Tagging & Filter Services
// ==========================================

/**
 * Filters questions by multiple custom tags (AND/OR logic) and curriculum hierarchy.
 */
export async function filterQuestionsByTags(
  params: QuestionFilterParams,
): Promise<ApiResponse<QuestionWithTags[]>> {
  const query = new URLSearchParams();
  if (params.tags && params.tags.length > 0) query.set("tags", params.tags.join(","));
  if (params.operator) query.set("operator", params.operator);
  if (params.educationLevelId) query.set("educationLevelId", params.educationLevelId);
  if (params.subjectId) query.set("subjectId", params.subjectId);
  if (params.chapterId) query.set("chapterId", params.chapterId);
  if (params.topicId) query.set("topicId", params.topicId);
  if (params.difficulty) query.set("difficulty", params.difficulty);
  if (params.questionType) query.set("questionType", params.questionType);
  if (params.search) query.set("search", params.search);
  if (params.isActive !== undefined) query.set("isActive", String(params.isActive));
  if (params.isPublished !== undefined) query.set("isPublished", String(params.isPublished));
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  return request<QuestionWithTags[]>(`questions/by-tags?${query.toString()}`);
}

/**
 * Creates a Question with attached tags.
 */
export async function createQuestion(data: CreateQuestionInput): Promise<ApiResponse<QuestionWithTags>> {
  return request<QuestionWithTags>("questions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Attaches or synchronizes tags to a question.
 */
export async function attachTagsToQuestion(
  questionId: string,
  data: { tagIds?: string[]; tagNames?: string[]; replaceExisting?: boolean },
): Promise<ApiResponse<{ id: string; questionId: string; tagId: string; tag: Tag }[]>> {
  return request(`questions/${questionId}/tags`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Retrieves all tags attached to a question.
 */
export async function getQuestionTags(questionId: string): Promise<ApiResponse<Tag[]>> {
  return request<Tag[]>(`questions/${questionId}/tags`);
}

export const TagService = {
  getTags,
  autocompleteTags,
  getTagById,
  createTag,
  updateTag,
  toggleTagStatus,
  deleteTag,
  bulkCreateTags,
  getTagCategories,
  getTagStats,
  getPopularTags,
  filterQuestionsByTags,
  createQuestion,
  attachTagsToQuestion,
  getQuestionTags,
};
