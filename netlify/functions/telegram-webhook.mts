import type { Context, Config } from "@netlify/functions";
import { webhookCallback } from "grammy";
import { telegramBot } from "../../src/bot/telegramBot.js";

// Create webhook handler using Grammy's webhookCallback
const handleUpdate = webhookCallback(telegramBot.getBot(), "std/http");

export default async (req: Request, context: Context) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Use Grammy's webhook callback to handle the update
    return await handleUpdate(req);

  } catch (error) {
    console.error("Telegram webhook error:", error);
    
    return new Response(JSON.stringify({ 
      error: "Webhook processing failed",
      message: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

export const config: Config = {
  path: "/webhook/telegram",
};