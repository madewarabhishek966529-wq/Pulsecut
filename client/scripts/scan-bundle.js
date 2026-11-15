import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, "../dist");

if (!fs.existsSync(DIST_DIR)) {
  console.error("Bundle scanner error: dist directory does not exist. Run 'npm run build' first.");
  process.exit(1);
}

// Banned markers that represent demo debris or mock simulation
const BANNED_PATTERNS = [
  /mockProjects/i,
  /Cyber_City_4K/i,
  /Synth_Car_Chase/i,
  /images\.unsplash\.com/i,
  /setTimeout\([^,]+,\s*1200\)/,
  /setInterval\([^,]+,\s*300\)/,
];

let hasErrors = false;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".html") || entry.name.endsWith(".css"))) {
      const content = fs.readFileSync(fullPath, "utf8");
      for (const pattern of BANNED_PATTERNS) {
        if (pattern.test(content)) {
          console.error(`[M1 Gate Violation] Found forbidden mock pattern ${pattern} in ${path.relative(DIST_DIR, fullPath)}`);
          hasErrors = true;
        }
      }
    }
  }
}

console.log("[M1 Gate] Scanning client distribution bundle for demo debris...");
scanDir(DIST_DIR);

if (hasErrors) {
  console.error("[M1 Gate] FAILED: Production bundle contains demo debris or forbidden mock patterns.");
  process.exit(1);
} else {
  console.log("[M1 Gate] PASSED: Zero forbidden mock patterns found in production bundle.");
}
