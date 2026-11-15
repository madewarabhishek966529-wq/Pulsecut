import { Router } from "express";
import { env } from "../config/env.js";

export const configRouter = Router();

configRouter.get("/", (_req, res) => {
  res.json({
    env: env.APP_ENV,
    features: {
      renderQueue: env.RENDER_QUEUE_ENABLED,
      aiFilters: !!env.GEMINI_API_KEY,
      aiCaptions: !!env.GROQ_API_KEY,
    },
    version: "0.1.0",
  });
});
