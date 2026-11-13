import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/pulsecut"),
  JWT_SECRET: z.string().default("dev-secret"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  GEMINI_API_KEY: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);
