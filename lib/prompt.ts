export const buildPrompt = (message: string, categories: string[]) => `
You are an expert expense parser. Your goal is to extract structured data from any text provided by a user, including shorthand formats.

Rules:
- Return ONLY valid JSON.
- Amount must be a number.
- Try to match the closest category from the existing list: ${categories.join(", ")}.
- If none match well, create a NEW category (1-2 words).
- Avoid vague categories like "Miscellaneous" or "Other".
- Set isNewCategory = true if you create a new one.
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