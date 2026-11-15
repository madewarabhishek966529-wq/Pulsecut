import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  APP_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/pulsecut"),
  JWT_SECRET: z.string().default("dev-secret-pulsecut-2026-secure-jwt"),
  JWT_REFRESH_SECRET: z.string().default("dev-refresh-secret-pulsecut-2026"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  GEMINI_API_KEY: z.string().optional().default(""),
  GROQ_API_KEY: z.string().optional().default(""),
  REDIS_URL: z.string().optional().default(""),
  RENDER_QUEUE_ENABLED: z.coerce.boolean().default(false),
});

export type Env = z.infer<typeof EnvSchema>;

function maskSecret(secret?: string): string {
  if (!secret || secret.length < 8) return "***";
  return `${secret.slice(0, 4)}...${secret.slice(-3)}`;
}

export function validateProductionEnv(cfg: Env): void {
  if (cfg.APP_ENV !== "production") return;

  const missing: string[] = [];
  if (!cfg.MONGODB_URI || cfg.MONGODB_URI.includes("127.0.0.1") || cfg.MONGODB_URI.includes("localhost")) {
    missing.push("MONGODB_URI (production database required)");
  }
  if (!cfg.JWT_SECRET || cfg.JWT_SECRET === "dev-secret" || cfg.JWT_SECRET.includes("dev-secret")) {
    missing.push("JWT_SECRET (secure production secret required)");
  }
  if (!cfg.JWT_REFRESH_SECRET || cfg.JWT_REFRESH_SECRET.includes("dev-refresh")) {
    missing.push("JWT_REFRESH_SECRET (secure production refresh secret required)");
  }
  if (!cfg.GEMINI_API_KEY) {
    missing.push("GEMINI_API_KEY (required for AI shaders and editing)");
  }
  if (!cfg.GROQ_API_KEY) {
    missing.push("GROQ_API_KEY (required for Groq Whisper auto-captions)");
  }
  if (cfg.RENDER_QUEUE_ENABLED && !cfg.REDIS_URL) {
    missing.push("REDIS_URL (required when RENDER_QUEUE_ENABLED=true)");
  }

  if (missing.length > 0) {
    const errorMsg = [
      "============================================================",
      "FATAL: Production Environment Configuration Incomplete",
      "The following required environment variables are missing or insecure:",
      ...missing.map((m) => `  - ${m}`),
      "",
      "Current configuration status:",
      `  APP_ENV: ${cfg.APP_ENV}`,
      `  PORT: ${cfg.PORT}`,
      `  MONGODB_URI: ${cfg.MONGODB_URI ? "configured" : "missing"}`,
      `  GEMINI_API_KEY: ${maskSecret(cfg.GEMINI_API_KEY)}`,
      `  GROQ_API_KEY: ${maskSecret(cfg.GROQ_API_KEY)}`,
      `  RENDER_QUEUE_ENABLED: ${cfg.RENDER_QUEUE_ENABLED}`,
      "============================================================",
    ].join("\n");
    console.error(errorMsg);
    throw new Error("Production boot failed due to missing required environment configuration.");
  }
}

export const env = EnvSchema.parse(process.env);
validateProductionEnv(env);
