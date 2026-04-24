import { Bot, InlineKeyboard } from "grammy";
import { extractExpense } from "./llm";
import { getUserCategories, findOrCreateCategory } from "./categories";
import { addExpense, getRecentExpenses, deleteExpense, getStats } from "./expenses";
import { updateUserSalary, getUserSalary } from "./users";
import { pool } from "./db";
import { LLMResponseSchema } from "./validator";

let bot: Bot | null = null;

// --- Helper: Clean up expired codes ---
async function cleanupCodes() {
  try {
    await pool.query("DELETE FROM auth_codes WHERE expires_at < NOW()");
  } catch (e) {
    console.error("Cleanup error:", e);
  }
}

// --- Handler: Generate Login Code ---
async function handleLoginCode(ctx: any) {
  const userId = ctx.from?.id;
  if (!userId) return;

  await cleanupCodes();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  try {
    // Remove any existing codes for this user first
    await pool.query("DELETE FROM auth_codes WHERE user_id = $1", [userId]);
    await pool.query(
      "INSERT INTO auth_codes (user_id, code, expires_at) VALUES ($1, $2, $3)",
      [userId, code, expiresAt]
    );

    await ctx.reply(
      `🔐 *Your Secure Login Code*\n\n` +
      `Code: \`${code}\`\n\n` +
      `Enter this on the [Kharch Dashboard](https://kharch-two.vercel.app/) to log in. It will expire in 10 minutes.`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("Auth code error:", error);
    await ctx.reply("❌ Failed to generate code. Please try again.");
  }
}

// --- Handler: Process Message (AI) ---
async function handleIncomingMessage(ctx: any, text: string) {
  const userId = ctx.from?.id;
  if (!userId || !text.trim()) return;

  if (text.length > 500) {
    return ctx.reply("⚠️ That message is a bit too long! Try keeping it under 500 characters.");
  }

  try {
    await ctx.replyWithChatAction("typing");

    const categories = await getUserCategories(userId);
    const categoryNames = categories.map((c: any) => c.name);

    const extracted = await extractExpense(text, categoryNames);
    const result = LLMResponseSchema.parse(extracted);

    if (result.type === "salary_update") {
      await updateUserSalary(userId, result.amount);
      return ctx.reply(
        `✅ *Salary Updated!*\n\n` +
        `Your monthly income is now set to *₹${result.amount.toLocaleString()}*.\n` +
        `This helps me calculate your burn rate on the dashboard.`,
        { parse_mode: "Markdown" }
      );
    }

    // Expense processing
    const category = await findOrCreateCategory(result.category, userId);
    await addExpense({
      amount: result.amount,
      description: result.description,
      category: result.category,
      isNewCategory: result.isNewCategory
    } as any, userId, category.id);

    let response = `✅ *Recorded!*\n\n`;
    response += `💰 *Amount:* ₹${result.amount.toLocaleString()}\n`;
    response += `📁 *Category:* ${category.name}${result.isNewCategory ? " (New)" : ""}\n`;
    if (result.description) {
      response += `📝 *Note:* ${result.description}\n`;
    }

    await ctx.reply(response, { parse_mode: "Markdown" });
  } catch (error: any) {
    console.error("Processing error:", error);
    if (error.name === "ZodError") {
      return ctx.reply("💰 Please provide a valid amount and description.");
    }
    await ctx.reply(
      "❌ *Oops!* I couldn't process that.\n\n" +
      "_Try:_ \`100 for Coffee\` or \`My salary is 80000\`",
      { parse_mode: "Markdown" }
    );
  }
}

export default function getBot() {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("TELEGRAM_TOKEN is missing");

    bot = new Bot(token);

    bot.api.setMyCommands([
      { command: "start", description: "🏠 Welcome & Onboarding" },
      { command: "salary", description: "💰 Set Monthly Income" },
      { command: "code", description: "🔑 Get Web Login Code" },
      { command: "history", description: "📋 Recent Expenses" },
      { command: "stats", description: "📊 Spending Reports" },
      { command: "categories", description: "📁 My Categories" },
      { command: "add", description: "➕ Add Manually" },
      { command: "help", description: "❓ How to Use" },
      { command: "reset", description: "⚠️ Clear All Data" },
    ]);

    bot.command("start", async (ctx: any) => {
      const userId = ctx.from?.id;
      const salary = await getUserSalary(userId);

      let welcomeMsg = 
        `🚀 *Welcome to Kharch AI! Your Financial Journal.*\n\n` +
        `I use AI to turn your messages into a professional dashboard. No more spreadsheets.\n\n` +
        `1️⃣ *Set your Income:* Crucial for calculating your burn rate.\n` +
        `   _Try:_ \`/salary 80000\`\n\n` +
        `2️⃣ *Log an Expense:* Just type it naturally.\n` +
        `   _Try:_ \`Spent 500 on lunch\`\n\n` +
        `3️⃣ *View Dashboard:* Access the full UI here:\n` +
        `   🔗 [kharch-two.vercel.app](https://kharch-two.vercel.app/)\n\n`;

      if (salary === 0) {
        welcomeMsg += `🚩 *Action Required:* Please set your monthly salary to unlock full analytics.`;
      } else {
        welcomeMsg += `✅ Current Salary: *₹${salary.toLocaleString()}*`;
      }

      await ctx.reply(welcomeMsg, { parse_mode: "Markdown" });
    });

    bot.command("reset", (ctx: any) => {
      const keyboard = new InlineKeyboard()
        .text("❌ Cancel", "cancel_clear")
        .text("✅ Confirm Reset", "confirm_clear");
      ctx.reply("⚠️ *Danger Zone*\n\nThis will permanently delete all your expense data. Are you sure?", {
        parse_mode: "Markdown",
        reply_markup: keyboard
      });
    });

    bot.command("salary", async (ctx: any) => {
      const text = ctx.message?.text?.replace("/salary", "").trim();
      const userId = ctx.from?.id;
      if (!userId) return;

      if (!text) {
        const salary = await getUserSalary(userId);
        return ctx.reply(
          `💰 *Monthly Salary*\n\n` +
          `Current: *₹${salary.toLocaleString()}*\n\n` +
          `To update, type: \`/salary 80000\` or just tell me \`My salary is 80k\``,
          { parse_mode: "Markdown" }
        );
      }

      // If it's a direct number, update directly
      const amount = parseFloat(text.replace(/,/g, ''));
      if (!isNaN(amount) && amount > 0) {
        await updateUserSalary(userId, amount);
        return ctx.reply(
          `✅ *Salary Updated!*\n\n` +
          `Your monthly income is now set to *₹${amount.toLocaleString()}*.`,
          { parse_mode: "Markdown" }
        );
      }

      // Otherwise, let the LLM handle it (e.g. "/salary 80k")
      handleIncomingMessage(ctx, text);
    });

    bot.command("code", handleLoginCode);

    bot.command("categories", async (ctx: any) => {
      const userId = ctx.from?.id;
      if (!userId) return;
      const cats = await getUserCategories(userId);
      if (cats.length === 0) return ctx.reply("📁 You haven't created any categories yet.");
      
      const list = cats.map((c: any) => `• ${c.name}`).join("\n");
      ctx.reply(`📁 *Your Categories:*\n\n${list}`, { parse_mode: "Markdown" });
    });

    bot.command("history", async (ctx: any) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      const recent = await getRecentExpenses(userId, 10);
      if (recent.length === 0) return ctx.reply("📭 No expenses found.");

      let message = "📝 *Recent Expenses*\n\n";
      const keyboard = new InlineKeyboard();

      recent.forEach((exp: any, index: number) => {
        message += `${index + 1}. *₹${exp.amount}* — ${exp.category_name}\n   _${exp.description || "No description"}_\n\n`;
        keyboard.text(`🗑 Del ${index + 1}`, `delete_${exp.id}`);
        if ((index + 1) % 2 === 0) keyboard.row();
      });

      await ctx.reply(message, { parse_mode: "Markdown", reply_markup: keyboard });
    });

    bot.command("stats", async (ctx: any) => {
      const userId = ctx.from?.id;
      if (!userId) return;

      await ctx.replyWithChatAction("typing");
      const [w, m, salary] = await Promise.all([
        getStats(userId, "week"), 
        getStats(userId, "month"),
        getUserSalary(userId)
      ]);

      const totalMonth = m.reduce((a: number, c: any) => a + parseFloat(c.total), 0);

      let msg = "📊 *Financial Overview*\n\n";
      if (salary > 0) {
        const burn = (totalMonth / salary) * 100;
        msg += `💰 *Salary:* ₹${salary.toLocaleString()}\n`;
        msg += `🔥 *Burn Rate:* ${burn.toFixed(1)}%\n\n`;
      }
      
      msg += "🗓 *Last 7 Days*\n" + (w.length ? w.map((s: any) => `• ${s.category}: ₹${s.total}`).join("\n") : "_No activity_") + "\n\n";
      msg += "🗓 *Last 30 Days*\n" + (m.length ? m.map((s: any) => `• ${s.category}: ₹${s.total}`).join("\n") : "_No activity_");

      await ctx.reply(msg, { parse_mode: "Markdown" });
    });


    bot.command("help", (ctx: any) => {
      ctx.reply(
        `📖 *Kharch AI Guide*\n\n` +
        `• *Expenses:* Just type \`100 for snacks\`\n` +
        `• *Salary:* Type \`My salary is 80000\` or use /salary\n` +
        `• *Dashboard:* [kharch-two.vercel.app](https://kharch-two.vercel.app/)\n` +
        `• *Stats:* Use /stats to see your burn rate\n\n` +
        `I automatically handle everything through natural language!`,
        { parse_mode: "Markdown" }
      );
    });

    bot.on("callback_query:data", async (ctx: any) => {
      const data = ctx.callbackQuery.data;
      const userId = ctx.from?.id;
      if (!userId) return;

      if (data.startsWith("delete_")) {
        const id = parseInt(data.replace("delete_", ""));
        if (await deleteExpense(id, userId)) {
          await ctx.answerCallbackQuery("✅ Deleted");
          await ctx.editMessageText("🗑 *Entry removed.*", { parse_mode: "Markdown" });
        }
      } else if (data === "confirm_clear") {
        await pool.query("DELETE FROM expenses WHERE user_id = $1", [userId]);
        await ctx.editMessageText("💥 *Expense history has been wiped.*", { parse_mode: "Markdown" });
      } else if (data === "cancel_clear") {
        await ctx.editMessageText("Whew! Action cancelled. 😅", { parse_mode: "Markdown" });
      }
    });

    bot.on("message:text", (ctx: any) => {
      const text = ctx.message.text;
      if (text.startsWith("/")) return; // Handled by command listeners
      handleIncomingMessage(ctx, text);
    });

  }
  return bot;
}