export const buildPrompt = (message: string, categories: string[]) => `
You are an expert expense parser. Your goal is to extract structured data from any text provided by a user, including shorthand formats.

Rules:
- Return ONLY valid JSON.
- Amount must be a number.
- PRIORITIZE existing categories: ${categories.join(", ") || "None"}. Use them if the expense even broadly fits (e.g. "Coffee" -> "Food").
- Only create a NEW category if the expense is completely unrelated to existing ones.
- Category names should be short (1-2 words), capitalized.
- Set isNewCategory = true if and only if you suggest a name NOT in the existing list.
- Handle shorthand like "20 - Pen", "Pen 20", "Spent 20 on Pen", or "20 for Pen".

Format:
{
  "amount": number,
  "category": string,
  "description": string,
  "isNewCategory": boolean
}

Text: "${message}"
`;