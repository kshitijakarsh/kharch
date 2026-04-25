export interface ParsedCommand {
  type: "expense" | "salary_update" | "extra_income";
  amount: number;
  category?: string;
  description?: string;
}

export function parseManualCommand(text: string): ParsedCommand | null {
  const cleanText = text.trim();
  if (!cleanText) return null;

  // Handle /add command or raw text intended for /add
  if (cleanText.startsWith("/add ") || !cleanText.startsWith("/")) {
    const content = cleanText.replace(/^\/add\s+/, "").trim();
    
    // Split into parts and remove common separators/stop-words
    const rawParts = content.split(/\s+/);
    const parts = rawParts.filter((p, i) => {
      // Always keep the first part (amount)
      if (i === 0) return true;
      // Filter out common separators/stop-words if they are in the "separator" position
      const stopWords = ["-", ":", "=", "for", "on", "at", "in", "to"];
      return !stopWords.includes(p.toLowerCase());
    });

    const amount = parseFloat(parts[0].replace(/,/g, ""));
    const category = parts[1];
    const description = parts.slice(2).join(" ");

    if (isNaN(amount) || amount <= 0 || !category) return null;

    return {
      type: "expense",
      amount,
      category,
      description: description || undefined,
    };
  }

  // Handle /salary
  if (cleanText.startsWith("/salary ")) {
    const amount = parseFloat(cleanText.replace("/salary", "").trim().replace(/,/g, ""));
    if (isNaN(amount) || amount <= 0) return null;
    return { type: "salary_update", amount };
  }

  // Handle /income
  if (cleanText.startsWith("/income ")) {
    const content = cleanText.replace("/income", "").trim();
    const parts = content.split(/\s+/);
    const amount = parseFloat(parts[0].replace(/,/g, ""));
    const description = parts.slice(1).join(" ");

    if (isNaN(amount) || amount <= 0) return null;
    return {
      type: "extra_income",
      amount,
      description: description || undefined,
    };
  }

  return null;
}
