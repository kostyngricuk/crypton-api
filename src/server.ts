import "./config/env.js"; // Load environment variables first
import app from "./app.js";
import { telegramBot } from "./bot/telegramBot.js";
import { env } from "./config/env.js";

// Graceful shutdown handler
const shutdown = async (signal: string): Promise<void> => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  try {
    // Stop Telegram bot (if it was running)
    try {
      await telegramBot.stop();
      console.log("✅ Telegram bot stopped");
    } catch {
      console.warn("⚠️  Bot was not running or failed to stop gracefully");
    }

    console.log("🎯 Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the application
const startApp = async (): Promise<void> => {
  try {
    console.log("🚀 Starting Crypton Telegram Bot with API Server...");
    console.log(`📊 Environment: ${env.NODE_ENV}`);
    console.log(`🌐 Port: ${env.PORT}`);

    // Start Express server
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Express server running on port ${env.PORT}`);
      console.log(`📡 API available at http://localhost:${env.PORT}/api`);
    });

    // Start Telegram bot (non-blocking)
    try {
      await telegramBot.start();
      console.log("✅ Telegram bot started successfully!");
      console.log("🤖 Bot is ready to receive commands");
    } catch (botError) {
      console.warn(
        "⚠️  Telegram bot failed to start:",
        botError instanceof Error ? botError.message : "Unknown error",
      );
      console.log("📡 API server will continue running without bot functionality");
      console.log("💡 Please check your TELEGRAM_BOT_TOKEN in .env file");
    }

    console.log("✅ Application started successfully!");

    // Handle server shutdown
    const originalShutdown = shutdown;
    const enhancedShutdown = async (signal: string): Promise<void> => {
      server.close((err) => {
        if (err) {
          console.error("❌ Error closing Express server:", err);
        } else {
          console.log("✅ Express server stopped");
        }
      });
      await originalShutdown(signal);
    };

    // Update shutdown handlers
    process.removeAllListeners("SIGTERM");
    process.removeAllListeners("SIGINT");
    process.on("SIGTERM", () => enhancedShutdown("SIGTERM"));
    process.on("SIGINT", () => enhancedShutdown("SIGINT"));
  } catch (error) {
    console.error("💥 Failed to start application:", error);
    process.exit(1);
  }
};

startApp();
