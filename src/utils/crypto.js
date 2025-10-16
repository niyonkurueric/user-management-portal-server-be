/* eslint-env node */
import crypto from "crypto";
import fs from "fs";
import path from "path";

const keysDir = path.resolve(process.cwd(), "keys");
const privateKeyPath = path.join(keysDir, "private.pem");
const publicKeyPath = path.join(keysDir, "public.pem");

function ensureKeys() {
  if (!fs.existsSync(keysDir)) fs.mkdirSync(keysDir, { recursive: true });
  if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    fs.writeFileSync(privateKeyPath, privateKey, { mode: 0o600 });
    fs.writeFileSync(publicKeyPath, publicKey);
  }
}

export function getPrivateKey() {
  ensureKeys();
  return fs.readFileSync(privateKeyPath, "utf8");
}

export function getPublicKey() {
  ensureKeys();
  return fs.readFileSync(publicKeyPath, "utf8");
}

export function hashEmail(email) {
  if (typeof email !== "string") email = String(email || "");
  return crypto.createHash("sha384").update(email.toLowerCase().trim(), "utf8").digest("hex");
}

export function signDigest(hexDigest) {
  const priv = getPrivateKey();
  const sign = crypto.createSign("RSA-SHA384");
  // sign expects raw data; we'll sign the hex digest bytes
  sign.update(Buffer.from(hexDigest, "hex"));
  sign.end();
  return sign.sign(priv, "base64");
}

export function verifySignature(hexDigest, signature) {
  const pub = getPublicKey();
  const verify = crypto.createVerify("RSA-SHA384");
  verify.update(Buffer.from(hexDigest, "hex"));
  verify.end();
  return verify.verify(pub, signature, "base64");
}

export default { getPrivateKey, getPublicKey, hashEmail, signDigest, verifySignature };
