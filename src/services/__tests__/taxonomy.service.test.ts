/**
 * @file taxonomy.service.test.ts
 * @description Unit tests for Client-Side Taxonomy Service API calls using Vitest and fetch mocks.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as TaxonomyService from "../taxonomy.service";

describe("Client Taxonomy Service", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch taxonomy tree with onlyActive=true query parameter", async () => {
    const mockTreeResponse = {
      success: true,
      statusCode: 200,
      message: "Tree fetched",
      data: {
        tree: [],
        meta: { totalLevels: 0, totalSubjects: 0, totalChapters: 0, totalTopics: 0 },
      },
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTreeResponse),
    });

    const response = await TaxonomyService.getTaxonomyTree(true);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("curriculum-taxonomy/tree?onlyActive=true"),
      expect.objectContaining({
        credentials: "include",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
    expect(response.success).toBe(true);
  });

  it("should fetch education levels with query params", async () => {
    const mockResponse = {
      success: true,
      statusCode: 200,
      message: "Levels fetched",
      data: [{ id: "lvl-1", name: "HSC", code: "HSC" }],
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const response = await TaxonomyService.getEducationLevels({
      search: "HSC",
      isActive: true,
      page: 1,
      limit: 10,
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("search=HSC"),
      expect.anything(),
    );
    expect(response.data).toHaveLength(1);
  });

  it("should create education level with POST request", async () => {
    const mockCreated = {
      success: true,
      statusCode: 201,
      message: "Created",
      data: { id: "lvl-new", name: "SSC", code: "SSC" },
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCreated),
    });

    const payload = { name: "SSC", code: "SSC" };
    const response = await TaxonomyService.createEducationLevel(payload);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("curriculum-taxonomy/education-levels"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
    expect(response.data.name).toBe("SSC");
  });

  it("should throw error when API request fails", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: () => Promise.resolve({ success: false, message: "Code already exists" }),
    });

    await expect(
      TaxonomyService.createEducationLevel({ name: "HSC", code: "HSC" }),
    ).rejects.toThrowError("Code already exists");
  });
});
