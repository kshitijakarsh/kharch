import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "./prompt";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function processAIRequest(text: string, categories: string[]) {
  const prompt = SYSTEM_PROMPT.replace("{{CATEGORIES}}", categories.join(", "));
  
  const result = await model.generateContent([
    { text: prompt },
    { text: `User message: "${text}"` }
  ]);

  const response = result.response.text();
  try {
    // Clean up JSON response from potential markdown backticks
    const jsonStr = response.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("AI Parse Error:", e, response);
    throw new Error("Failed to parse AI response");
  }
}
