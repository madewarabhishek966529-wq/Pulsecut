import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";

async function main() {
  try {
    await connectDb();
  } catch (e) {
    console.warn("MongoDB not connected, continuing without DB:", (e as Error).message);
  }
  app.listen(env.PORT, () => console.log(`API on http://localhost:${env.PORT}`));
}

main();
