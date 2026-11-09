"use client";

import { useState } from "react";
import { generateAIQuestion } from "@/services/ai.service";

export default function AIGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return alert("Please enter a topic");
    setLoading(true);
    try {
      const data = await generateAIQuestion({ topic, difficulty: "Medium" });
      setResult(data);
    } catch (err) {
      alert("Failed to generate question. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Smart AI Question Generator</h1>
      <input
        type="text"
        placeholder="Enter topic (e.g., Data Structures)..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="w-full p-2 border rounded mb-4 text-black"
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Questions"}
      </button>

      {result && (
        <div className="mt-6 p-4 border rounded bg-gray-900 text-white">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}