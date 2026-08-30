/**
 * @file mcq.service.test.ts
 * @description Unit tests for Client-Side MCQ Ingestion (Single & Multi-Context) Service API calls using Vitest and fetch mocks.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as MCQService from "../mcq.service";

const mockOptions = [
  { id: "A", text: "Scalar quantity", isCorrect: true },
  { id: "B", text: "Vector quantity", isCorrect: false },
  { id: "C", text: "Tensor quantity", isCorrect: false },
  { id: "D", text: "Dimensionless quantity", isCorrect: false },
];

describe("Client MCQ Ingestion Service", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should ingest single MCQ via POST request to mcq-ingestion/single", async () => {
    const mockCreated = {
      success: true,
      statusCode: 201,
      message: "MCQ ingested successfully",
      data: {
        id: "mcq-1",
        questionText: "Energy is what type of physical quantity?",
        options: mockOptions,
        difficulty: "EASY",
      },
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCreated),
    });

    const payload = {
      questionText: "Energy is what type of physical quantity?",
      options: mockOptions,
      difficulty: "EASY" as const,
      marks: 1.0,
      negativeMarks: 0.25,
    };

    const response = await MCQService.ingestSingleMCQ(payload);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("mcq-ingestion/single"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
    expect(response.data.id).toBe("mcq-1");
  });

  it("should ingest multi-context passage and sub-questions via POST request", async () => {
    const mockCreated = {
      success: true,
      statusCode: 201,
      message: "Multi-context questions ingested",
      data: {
        id: "ctx-1",
        title: "Thermodynamics Passage",
        questions: [{ id: "q-1", questionText: "Calculate work done" }],
      },
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCreated),
    });

    const payload = {
      context: {
        title: "Thermodynamics Passage",
        contextText: "A gas undergoes isothermal expansion...",
        contextType: "PASSAGE" as const,
      },
      questions: [
        {
          questionText: "Calculate work done",
          options: mockOptions,
          marks: 1.0,
          negativeMarks: 0.25,
          difficulty: "HARD" as const,
          order: 1,
        },
      ],
      commonTagNames: ["Physics 2nd Paper"],
    };

    const response = await MCQService.ingestMultiContextMCQ(payload);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("mcq-ingestion/multi-context"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
    expect(response.data.id).toBe("ctx-1");
  });

  it("should fetch paginated MCQs with search and difficulty filters", async () => {
    const mockMCQs = {
      success: true,
      statusCode: 200,
      message: "MCQs fetched",
      data: [
        {
          id: "q-1",
          questionText: "What is thermodynamics?",
          difficulty: "HARD",
        },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMCQs),
    });

    const response = await MCQService.getMCQs({
      search: "thermodynamics",
      difficulty: "HARD",
      page: 1,
      limit: 10,
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("mcq-ingestion/questions?search=thermodynamics&difficulty=HARD&page=1&limit=10"),
      expect.anything(),
    );
    expect(response.data).toHaveLength(1);
  });

  it("should fetch question contexts library", async () => {
    const mockContexts = {
      success: true,
      statusCode: 200,
      message: "Contexts fetched",
      data: [{ id: "ctx-1", title: "Mechanics Stem", contextType: "STEM" }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockContexts),
    });

    const response = await MCQService.getQuestionContexts({
      contextType: "STEM",
      page: 1,
      limit: 10,
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("mcq-ingestion/contexts?contextType=STEM&page=1&limit=10"),
      expect.anything(),
    );
    expect(response.data[0].contextType).toBe("STEM");
  });

  it("should fetch MCQ statistics summary", async () => {
    const mockStats = {
      success: true,
      statusCode: 200,
      message: "Stats fetched",
      data: {
        totalQuestions: 150,
        singleMCQs: 90,
        multiContextMCQs: 60,
        totalContexts: 20,
        difficultyDistribution: { EASY: 50, MEDIUM: 70, HARD: 30 },
      },
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStats),
    });

    const response = await MCQService.getMCQStats();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("mcq-ingestion/stats"),
      expect.anything(),
    );
    expect(response.data.totalQuestions).toBe(150);
  });

  it("should throw formatted error when API request fails", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: () =>
        Promise.resolve({
          success: false,
          message: "Exactly 4 options (A, B, C, D) are required",
        }),
    });

    await expect(
      MCQService.ingestSingleMCQ({
        questionText: "Invalid MCQ",
        options: [],
      } as any),
    ).rejects.toThrowError("Exactly 4 options (A, B, C, D) are required");
  });
});
