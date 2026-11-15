import { Router } from "express";
import mongoose from "mongoose";
import { env } from "../config/env.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  const ok = env.APP_ENV === "production" ? dbStatus === "connected" : true;

  res.status(ok ? 200 : 503).json({
    ok,
    env: env.APP_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      renderQueue: env.RENDER_QUEUE_ENABLED ? (env.REDIS_URL ? "available" : "misconfigured") : "disabled",
      aiFilters: env.GEMINI_API_KEY ? "available" : "not_configured",
      aiCaptions: env.GROQ_API_KEY ? "available" : "not_configured",
    },
  });
});
