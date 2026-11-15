import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";

async function main() {
  try {
    await connectDb();
    console.log(`[Database] Connected successfully to ${env.MONGODB_URI.split("@").pop() || "MongoDB"}`);
  } catch (e) {
    if (env.APP_ENV === "production") {
      console.error("[Database] FATAL: Failed to connect to MongoDB in production mode:", (e as Error).message);
      process.exit(1);
    } else {
      console.warn("[Database] MongoDB not connected, continuing in local development mode without DB:", (e as Error).message);
    }
  }

  app.listen(env.PORT, () => {
    console.log(`[Pulsecut Server] Listening on port ${env.PORT} (${env.APP_ENV} mode)`);
  });
}

main();
