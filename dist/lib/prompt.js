"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPrompt = void 0;
var buildPrompt = function (message, categories) { return "\nYou are an expert expense parser. Your goal is to extract structured data from any text provided by a user, including shorthand formats.\n\nRules:\n- Return ONLY valid JSON.\n- Amount must be a number.\n- Try to match the closest category from the existing list: ".concat(categories.join(", "), ".\n- If none match well, create a NEW category (1-2 words).\n- Avoid vague categories like \"Miscellaneous\" or \"Other\".\n- Set isNewCategory = true if you create a new one.\n- Handle shorthand like \"20 - Pen\", \"Pen 20\", \"Spent 20 on Pen\", or \"20 for Pen\".\n\nFormat:\n{\n  \"amount\": number,\n  \"category\": string,\n  \"description\": string,\n  \"isNewCategory\": boolean\n}\n\nText: \"").concat(message, "\"\n"); };
exports.buildPrompt = buildPrompt;
