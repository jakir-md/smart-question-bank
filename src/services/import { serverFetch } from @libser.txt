import { serverFetch } from "@/lib/server-fetch";

export const generateAIQuestion = async (payload: { topic: string; difficulty: string }) => {
  try {
    const res = await serverFetch("/ai/generate-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};