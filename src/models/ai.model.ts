import { generateAIQuestion } from "@/services/ai.service";
import { AIQuestionPayload } from "@/models/ai.model";

export const handleGenerateAIQuestion = async (payload: AIQuestionPayload) => {
  if (!payload.topic) {
    throw new Error("Topic is required");
  }
  return await generateAIQuestion(payload);
};