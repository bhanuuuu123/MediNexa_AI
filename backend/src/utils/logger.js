import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, "../../logs");

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function getLogFile() {
  const date = new Date().toISOString().split("T")[0];
  return path.join(LOG_DIR, `${date}.log`);
}

function formatLog(level, message, error) {
  const timestamp = new Date().toISOString();
  const stack = error?.stack ? `\n${error.stack}` : "";
  return `[${timestamp}] [${level}] ${message}${stack}\n`;
}

export const logger = {
  error: (message, error = null) => {
    const log = formatLog("ERROR", message, error);
    console.error(log);
    try {
      fs.appendFileSync(getLogFile(), log);
    } catch (e) {
      console.error("Failed to write to log file:", e);
    }
  },

  warn: (message) => {
    const log = formatLog("WARN", message);
    console.warn(log);
    try {
      fs.appendFileSync(getLogFile(), log);
    } catch (e) {
      console.error("Failed to write to log file:", e);
    }
  },

  info: (message) => {
    const log = formatLog("INFO", message);
    console.log(log);
    try {
      fs.appendFileSync(getLogFile(), log);
    } catch (e) {
      console.error("Failed to write to log file:", e);
    }
  },

  debug: (message) => {
    if (process.env.DEBUG === "true") {
      const log = formatLog("DEBUG", message);
      console.log(log);
      try {
        fs.appendFileSync(getLogFile(), log);
      } catch (e) {
        console.error("Failed to write to log file:", e);
      }
    }
  },
};
