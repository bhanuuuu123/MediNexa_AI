import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
// Derive a 32-byte key from JWT_SECRET or a fallback
const SECRET_KEY = crypto.scryptSync(process.env.JWT_SECRET || "medinexa_secret_key", "salt", 32);
const IV_LENGTH = 16;

/**
 * Encrypts cleartext using AES-256-CBC.
 * Returns ivHex:encryptedHex.
 */
export function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts ciphertext format: ivHex:encryptedHex.
 */
export function decrypt(text) {
  if (!text) return text;
  try {
    const parts = text.split(":");
    if (parts.length !== 2) return text; // Probably not encrypted
    
    const [ivHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    // Fail-soft: if it fails, return the original text
    return text;
  }
}
