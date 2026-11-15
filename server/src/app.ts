import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.js";
import { configRouter } from "./routes/config.js";
import { aiRouter } from "./routes/ai.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.APP_ENV === "production" ? env.CLIENT_ORIGIN : true,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

app.use("/api/health", healthRouter);
app.use("/api/config", configRouter);
app.use("/api/ai", aiRouter);

app.use(errorHandler);
