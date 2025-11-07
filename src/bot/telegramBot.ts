import type { Bot, Context, SessionFlavor } from "grammy";
import { Bot as GrammyBot, session } from "grammy";
import { env } from "../config/env.js";
import { cryptoApi } from "../services/cryptoApi.js";

// Session data structure
interface SessionData {
  step?: string;
  tradeData?: {
    symbol?: string;
    side?: "buy" | "sell";
    amount?: number;
    price?: number;
  };
}

// Context with session support
type MyContext = Context & SessionFlavor<SessionData>;

export class TelegramBot {
  private bot: Bot<MyContext>;

  constructor() {
    this.bot = new GrammyBot<MyContext>(env.TELEGRAM_BOT_TOKEN);
    this.setupMiddleware();
    this.setupCommands();
  }

  private setupMiddleware(): void {
    // Session middleware
    this.bot.use(
      session({
        initial: (): SessionData => ({}),
      }),
    );
  }

  private setupCommands(): void {
    // Start command
    this.bot.command("start", async (ctx) => {
      await ctx.reply(
        "🚀 Welcome to Crypton Trading Bot!\n\n" + "Use /help to see available commands.",
      );
    });

    // Help command
    this.bot.command("help", async (ctx) => {
      await ctx.reply(
        "🤖 Crypton Trading Bot Help\n\n" +
          "This bot allows you to interact with the crypto trading API:\n\n" +
          "📊 Trading Commands:\n" +
          "• /trades - List all your active trades\n" +
          "• /cancel <trade_id> - Cancel a specific trade by its ID\n\n" +
          "💰 Account:\n" +
          "• /balance - Check your account balances\n" +
          "🔧 System:\n" +
          "• /status - Check bot and server status\n\n",
      );
    });

    // Status command
    this.bot.command("status", async (ctx) => {
      try {
        const serverInfo = await cryptoApi.getServerInfo();

        await ctx.reply(
          `✅ Bot Status: Online
🌐 Server: ${serverInfo.ServerName}
🌐 Address: ${serverInfo.ServerAddress}`,
        );
      } catch (error) {
        await ctx.reply(
          `❌ Error checking status: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    });

    // Balance command
    this.bot.command("balance", async (ctx) => {
      try {
        const assets = await cryptoApi.getAccountAssets();
        const nonZeroAssets = assets.filter((asset) => asset.Amount > 0);

        if (nonZeroAssets.length === 0) {
          await ctx.reply("💰 No assets found in your account.");
          return;
        }

        let message = "💰 Account Balance:\n\n";
        for (const asset of nonZeroAssets) {
          message += `${asset.Currency}: ${Number(asset.Amount).toFixed(4)} (Free: ${Number(asset.FreeAmount).toFixed(4)}, Locked: ${Number(asset.LockedAmount).toFixed(4)})\n`;
        }

        await ctx.reply(message);
      } catch (error) {
        await ctx.reply(
          `❌ Error fetching balance: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    });

    // Trades command
    this.bot.command("trades", async (ctx) => {
      try {
        const trades = await cryptoApi.getTrades();

        if (trades.length === 0) {
          await ctx.reply("📋 No active trades found.");
          return;
        }

        let message = "📋 Active Trades:\n\n";
        for (const trade of trades.slice(0, 10)) {
          message += `🔸 [${trade.Id}] ${trade.Side}: ${trade.InitialAmount} ${trade.Symbol} (${trade.Price} USDT)\n`;
          message += `   Status: ${trade.Status} | Created: ${new Date(trade.Created).toLocaleString()}\n\n`;
        }

        await ctx.reply(message);
      } catch (error) {
        await ctx.reply(
          `❌ Error fetching trades: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    });

    // Cancel trade command
    this.bot.command("cancel", async (ctx) => {
      const tradeId = ctx.match?.toString().trim();
      if (!tradeId) {
        await ctx.reply("Please provide a trade ID: /cancel <trade_id>");
        return;
      }

      try {
        const trade = await cryptoApi.cancelTrade(tradeId);
        await ctx.reply(`✅ Trade ${trade.Id} cancelled successfully!`);
      } catch (error) {
        await ctx.reply(
          `❌ Error cancelling trade: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    });
  }

  async start(): Promise<void> {
    console.log("🤖 Starting Telegram bot...");
    await this.bot.start();
    console.log("✅ Telegram bot started successfully!");
  }

  async stop(): Promise<void> {
    console.log("🛑 Stopping Telegram bot...");
    await this.bot.stop();
    console.log("✅ Telegram bot stopped!");
  }

  getBot(): Bot<MyContext> {
    return this.bot;
  }
}

export const telegramBot = new TelegramBot();
