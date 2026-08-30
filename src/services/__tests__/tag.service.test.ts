/**
 * @file tag.service.test.ts
 * @description Unit tests for Client-Side Tag Service API calls using Vitest and fetch mocks.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as TagService from "../tag.service";

describe("Client Tag Service", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch paginated tags with category and search query parameters", async () => {
    const mockResponse = {
      success: true,
      statusCode: 200,
      message: "Tags fetched",
      data: [
        { id: "tag-1", name: "Dhaka Board 2024", category: "BOARD_EXAM", usageCount: 15 },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const response = await TagService.getTags({
      category: "BOARD_EXAM",
      search: "Dhaka",
      page: 1,
      limit: 10,
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("tags?search=Dhaka&category=BOARD_EXAM&page=1&limit=10"),
      expect.objectContaining({
        credentials: "include",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
    expect(response.data).toHaveLength(1);
    expect(response.data[0].name).toBe("Dhaka Board 2024");
  });

  it("should call autocomplete endpoint with query, limit, and category", async () => {
    const mockAutocomplete = {
      success: true,
      statusCode: 200,
      message: "Autocomplete results",
      data: [{ id: "tag-buet", name: "BUET 2023", slug: "buet-2023" }],
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockAutocomplete),
    });

    const response = await TagService.autocompleteTags({
      query: "BUET",
      limit: 5,
      category: "ADMISSION_TEST",
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("tags/autocomplete?query=BUET&category=ADMISSION_TEST&limit=5"),
      expect.anything(),
    );
    expect(response.data).toHaveLength(1);
  });

  it("should create a new tag via POST request", async () => {
    const mockCreated = {
      success: true,
      statusCode: 201,
      message: "Tag created successfully",
      data: {
        id: "tag-created",
        name: "Cadet College 2024",
        category: "CADET_COLLEGE",
        color: "#8B5CF6",
      },
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCreated),
    });

    const payload = {
      name: "Cadet College 2024",
      category: "CADET_COLLEGE" as const,
      color: "#8B5CF6",
    };

    const response = await TagService.createTag(payload);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("tags"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
    expect(response.data.id).toBe("tag-created");
  });

  it("should attach tags to a question via POST request", async () => {
    const mockResult = {
      success: true,
      statusCode: 200,
      message: "Tags attached",
      data: [
        {
          id: "qt-1",
          questionId: "q-100",
          tagId: "t-1",
          tag: { id: "t-1", name: "Dhaka Board 2024" },
        },
      ],
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResult),
    });

    const payload = { tagIds: ["t-1"], tagNames: ["Physics 1st Paper"] };
    const response = await TagService.attachTagsToQuestion("q-100", payload);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("questions/q-100/tags"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
    expect(response.data).toHaveLength(1);
  });

  it("should filter questions by tags with AND/OR operator", async () => {
    const mockQuestions = {
      success: true,
      statusCode: 200,
      message: "Questions filtered",
      data: [
        {
          id: "q-1",
          questionText: "What is momentum?",
          tags: [{ tag: { id: "t-1", name: "HSC 2024" } }],
        },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockQuestions),
    });

    const response = await TagService.filterQuestionsByTags({
      tags: ["hsc-2024", "physics"],
      operator: "AND",
      difficulty: "MEDIUM",
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("questions/by-tags?tags=hsc-2024%2Cphysics&operator=AND&difficulty=MEDIUM"),
      expect.anything(),
    );
    expect(response.data).toHaveLength(1);
  });

  it("should throw formatted error message when API returns failure", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: () => Promise.resolve({ success: false, message: "Tag with this name already exists" }),
    });

    await expect(
      TagService.createTag({ name: "Existing Tag" }),
    ).rejects.toThrowError("Tag with this name already exists");
  });
});
