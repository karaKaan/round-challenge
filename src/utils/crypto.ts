import { env } from "@/env";
import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const SECRET_KEY = Buffer.from(env.SECRET_KEY, "hex");
const IV = Buffer.from(env.IV, "hex");

export const encrypt = (text: string) => {
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, IV);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return `${IV.toString("hex")}:${encrypted.toString("hex")}`;
};

export const decrypt = (hash: string) => {
  const [iv, encrypted] = hash.split(":");

  if (!iv || !encrypted) return;

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    SECRET_KEY,
    Buffer.from(iv, "hex"),
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString();
};
