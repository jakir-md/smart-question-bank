/**
 * @file cq.service.test.ts
 * @description Unit tests for Client-Side Creative Question (CQ) Ingestion Service API calls using Vitest and fetch mocks.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as CQService from "../cq.service";

const mockSubQuestions = [
  {
    label: "ক" as const,
    cognitiveLevel: "KNOWLEDGE" as const,
    questionText: "তড়িৎ প্রবাহ কাকে বলে?",
    marks: 1.0,
    explanation: "আধান প্রবাহের হারকে তড়িৎ প্রবাহ বলে।",
    difficulty: "EASY" as const,
    order: 1,
  },
  {
    label: "খ" as const,
    cognitiveLevel: "COMPREHENSION" as const,
    questionText: "ওহমের সূত্রটি ব্যাখ্যা করো।",
    marks: 2.0,
    explanation: "V = IR অনুযায়ী বিভব পার্থক্য ও প্রবাহের সম্পর্ক।",
    difficulty: "MEDIUM" as const,
    order: 2,
  },
  {
    label: "গ" as const,
    cognitiveLevel: "APPLICATION" as const,
    questionText: "বর্তনীর তুল্য রোধ নির্ণয় করো।",
    marks: 3.0,
    explanation: "Req = 6 ohm",
    difficulty: "MEDIUM" as const,
    order: 3,
  },
  {
    label: "ঘ" as const,
    cognitiveLevel: "HIGHER_ABILITY" as const,
    questionText: "বর্তনীটির ক্ষমতার পরিবর্তন গাণিতিকভাবে বিশ্লেষণ করো।",
    marks: 4.0,
    explanation: "ক্ষমতার অনুপাত নির্ণয়...",
    difficulty: "HARD" as const,
    order: 4,
  },
];

describe("Client CQ Ingestion Service", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should ingest CQ set via POST request to cq-ingestion/create", async () => {
    const mockCreated = {
      success: true,
      statusCode: 201,
      message: "Creative Question (CQ) ingested successfully",
      data: {
        id: "ctx-cq-1",
        title: "দৃশ্যকল্প ১: তড়িৎ বর্তনী",
        contextText: "একটি ১২ ভোল্টের ব্যাটারির সাথে ৩টি রোধ যুক্ত...",
        questions: mockSubQuestions,
      },
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCreated),
    });

    const payload = {
      stimulus: {
        title: "দৃশ্যকল্প ১: তড়িৎ বর্তনী",
        contextText: "একটি ১২ ভোল্টের ব্যাটারির সাথে ৩টি রোধ যুক্ত...",
        contextType: "STEM" as const,
      },
      questions: mockSubQuestions,
      totalMarks: 10.0,
      commonTagNames: ["Dhaka Board 2024"],
    };

    const response = await CQService.ingestCQ(payload);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("cq-ingestion/create"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
    expect(response.data.id).toBe("ctx-cq-1");
  });

  it("should fetch paginated CQs with full filter parameters", async () => {
    const mockCQs = {
      success: true,
      statusCode: 200,
      message: "Creative Questions retrieved successfully",
      data: [
        {
          id: "ctx-1",
          title: "দৃশ্যকল্প ১",
          contextText: "উদ্দীপক...",
          questions: mockSubQuestions,
        },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCQs),
    });

    const response = await CQService.getCQs({
      search: "বর্তনী",
      educationLevelId: "level-1",
      subjectId: "sub-1",
      chapterId: "chap-1",
      topicId: "top-1",
      difficulty: "MEDIUM",
      tags: ["Dhaka", "Physics"],
      operator: "AND",
      isActive: true,
      isPublished: true,
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("cq-ingestion/questions?search=%E0%A6%AC%E0%A6%B0%E0%A7%8D%E0%A6%A4%E0%A6%A8%E0%A7%80&educationLevelId=level-1&subjectId=sub-1&chapterId=chap-1&topicId=top-1&difficulty=MEDIUM&tags=Dhaka%2CPhysics&operator=AND&isActive=true&isPublished=true&page=1&limit=10&sortBy=createdAt&sortOrder=desc"),
      expect.anything(),
    );
    expect(response.data).toHaveLength(1);
  });

  it("should fetch single CQ by UUID", async () => {
    const mockCQ = {
      success: true,
      statusCode: 200,
      message: "Creative Question retrieved successfully",
      data: {
        id: "ctx-100",
        title: "গতিবিদ্যা সৃজনশীল",
        contextText: "উদ্দীপকের বর্ণনা...",
        questions: mockSubQuestions,
      },
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCQ),
    });

    const response = await CQService.getCQById("ctx-100");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("cq-ingestion/questions/ctx-100"),
      expect.anything(),
    );
    expect(response.data.id).toBe("ctx-100");
  });

  it("should update CQ with PATCH request", async () => {
    const mockUpdated = {
      success: true,
      statusCode: 200,
      message: "Creative Question updated successfully",
      data: {
        id: "ctx-100",
        title: "আপডেট দৃশ্যকল্প ১",
        contextText: "আপডেট উদ্দীপকের বিবরণ...",
      },
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUpdated),
    });

    const updatePayload = {
      stimulus: { title: "আপডেট দৃশ্যকল্প ১" },
    };

    const response = await CQService.updateCQ("ctx-100", updatePayload);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("cq-ingestion/questions/ctx-100"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify(updatePayload),
      }),
    );
    expect(response.data.title).toBe("আপডেট দৃশ্যকল্প ১");
  });

  it("should delete CQ by UUID with DELETE request", async () => {
    const mockDeleteRes = {
      success: true,
      statusCode: 200,
      message: "Creative Question deleted successfully",
      data: { success: true, message: "Deleted" },
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDeleteRes),
    });

    const response = await CQService.deleteCQ("ctx-100");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("cq-ingestion/questions/ctx-100"),
      expect.objectContaining({
        method: "DELETE",
      }),
    );
    expect(response.success).toBe(true);
  });

  it("should fetch CQ statistics summary", async () => {
    const mockStats = {
      success: true,
      statusCode: 200,
      message: "Stats fetched",
      data: {
        totalCQSets: 25,
        totalSubQuestions: 100,
        cognitiveDistribution: {
          KNOWLEDGE: 25,
          COMPREHENSION: 25,
          APPLICATION: 25,
          HIGHER_ABILITY: 25,
        },
        difficultyDistribution: { EASY: 25, MEDIUM: 50, HARD: 25 },
        totalMarksLogged: 250,
      },
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStats),
    });

    const response = await CQService.getCQStats();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("cq-ingestion/stats"),
      expect.anything(),
    );
    expect(response.data.totalCQSets).toBe(25);
    expect(response.data.totalSubQuestions).toBe(100);
  });

  it("should throw error when server returns non-ok response", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: () => Promise.resolve({ success: false, message: "CQ not found" }),
    });

    await expect(CQService.getCQById("unknown-id")).rejects.toThrowError("CQ not found");
  });
});
