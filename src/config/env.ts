import { config } from "dotenv";
import { z } from "zod";

config();

const EnvSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1, "Telegram bot token is required"),
  WEB_API_HOST: z.string().min(1, "Web API host is required"),
  WEB_API_ID: z.string().min(1, "Web API ID is required"),
  WEB_API_KEY: z.string().min(1, "Web API key is required"),
  WEB_API_SECRET: z.string().min(1, "Web API secret is required"),
  PORT: z.string().default("3000").transform(Number),
  ALLOWED_DOMAINS: z.string().default("localhost,127.0.0.1"),
  TRUST_PROXY: z
    .string()
    .default("false")
    .transform((val) => val.toLowerCase() === "true"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  BEARER_TOKENS: z
    .string()
    .min(1, "At least one Bearer token is required")
    .transform((val) => {
      // Split by comma and trim whitespace from each token
      const tokens = val
        .split(",")
        .map((token) => token.trim())
        .filter((token) => token.length > 0);
      if (tokens.length === 0) {
        throw new Error("BEARER_TOKENS must contain at least one non-empty token");
      }
      return tokens;
    }),
});

export type Environment = z.infer<typeof EnvSchema>;

const parseEnv = (): Environment => {
  try {
    return EnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);
      throw new Error(`Environment validation failed:\n${errorMessages.join("\n")}`);
    }
    throw error;
  }
};

export const env = parseEnv();

export const getAllowedDomains = (): string[] => {
  return env.ALLOWED_DOMAINS.split(",").map((domain) => domain.trim());
};

export const getTrustProxy = (): boolean => {
  return env.TRUST_PROXY;
};

export const getBearerTokens = (): string[] => {
  return env.BEARER_TOKENS;
};
