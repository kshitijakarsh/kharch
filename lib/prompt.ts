export const buildPrompt = (message: string, categories: string[]) => `
You are an expert financial parser. Your goal is to extract structured data from user messages.

Identify if the user is:
1. Recording an expense (e.g. "Spent 500 on coffee", "20 - Pen")
2. Updating their monthly income/salary (e.g. "My salary is 80k", "Income updated to 100000")
3. Recording extra income/one-off money (e.g. "Received 2000 as gift", "Sold my bike for 15k", "Got a bonus of 10000")

Rules:
- Return ONLY valid JSON.
- Amount must be a number. (Convert units like "k" to 1000, "lakh" to 100000).
- For expenses:
    - PRIORITIZE existing categories: ${categories.join(", ") || "None"}.
    - Category names should be short, capitalized.
    - Set isNewCategory = true if suggesting a name NOT in the list.
- For salary updates:
    - Amount is the monthly salary.
    - Category/description/isNewCategory are not needed.
- For extra income:
    - Amount is the money received.
    - Use description to capture what it was for.

Format:
{
  "type": "expense" | "salary_update" | "extra_income",
  "amount": number,
  "category": string (expense only),
  "description": string (expense/extra_income only),
  "isNewCategory": boolean (expense only)
}

Text: "${message}"
`;