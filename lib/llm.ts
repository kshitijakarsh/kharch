import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "./prompt";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
export async function processAIRequest(text: string, categories: string[]) {
  const prompt = SYSTEM_PROMPT.replace("{{CATEGORIES}}", categories.join(", "));

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-lite",
    systemInstruction: prompt,
    generationConfig: { responseMimeType: "application/json" }
  });
  
  const result = await model.generateContent(`User message: "${text}"`);

  const response = result.response.text();
  
  try {
    const extracted = JSON.parse(response);
    return extracted;
  } catch (e) {
    return { type: "unsupported", message: "Internal processing error." };
  }
}
