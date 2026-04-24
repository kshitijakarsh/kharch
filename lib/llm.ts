import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildPrompt } from "./prompt";

// Initialize client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash-lite",
  generationConfig: { responseMimeType: "application/json" }
});

export const extractExpense = async (
  message: string,
  categories: string[]
) => {
  const prompt = buildPrompt(message, categories);

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const content = response.text();

  if (!content) throw new Error("Empty LLM response");

  return JSON.parse(content);
};
