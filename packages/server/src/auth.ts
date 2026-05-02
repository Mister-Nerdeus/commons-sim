import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import path from "node:path";
import { readJsonFile, writeJsonFileAtomic } from "./database.js";
import { sha256, stableStringify } from "./json.js";

export type IdentityRecord = {
  identityId: string;
  identitySecret: string;
  secretHash: string;
  createdAtUtc: string;
  label: string;
  disabled: boolean;
};

export type CreatedIdentity = {
  identityId: string;
  identitySecret: string;
  createdAtUtc: string;
  label: string;
};

type IdentityDb = {
  identities: IdentityRecord[];
};

export type SignatureHeaders = {
  identityId: string | undefined;
  signature: string | undefined;
  timestamp: string | undefined;
};

export function createAnonymousIdentity(storageDir: string, label: string): CreatedIdentity {
  const createdAtUtc = new Date().toISOString();
  const identitySecret = randomBytes(32).toString("base64url");
  const record: IdentityRecord = {
    identityId: randomUUID(),
    identitySecret,
    secretHash: hashSecret(identitySecret),
    createdAtUtc,
    label,
    disabled: false,
  };
  const db = readIdentityDb(storageDir);
  db.identities.push(record);
  writeIdentityDb(storageDir, db);
  return {
    identityId: record.identityId,
    identitySecret,
    createdAtUtc,
    label,
  };
}

export function listIdentities(storageDir: string): Omit<IdentityRecord, "secretHash" | "identitySecret">[] {
  return readIdentityDb(storageDir).identities.map(({ secretHash: _secretHash, identitySecret: _identitySecret, ...identity }) => identity);
}

export function verifySignedBody(
  storageDir: string,
  headers: SignatureHeaders,
  body: unknown,
  maxSkewMs = 5 * 60 * 1000,
): { ok: true; identityId: string } | { ok: false; reason: string } {
  if (!headers.identityId || !headers.signature || !headers.timestamp) {
    return { ok: false, reason: "Missing identity signature headers." };
  }

  const timestampMs = Date.parse(headers.timestamp);
  if (!Number.isFinite(timestampMs)) return { ok: false, reason: "Invalid signature timestamp." };
  if (Math.abs(Date.now() - timestampMs) > maxSkewMs) return { ok: false, reason: "Signature timestamp outside allowed window." };

  const identity = readIdentityDb(storageDir).identities.find((item) => item.identityId === headers.identityId);
  if (!identity || identity.disabled) return { ok: false, reason: "Unknown or disabled identity." };

  if (hashSecret(identity.identitySecret) !== identity.secretHash) return { ok: false, reason: "Identity secret hash mismatch." };
  const expected = signBody(identity.identitySecret, headers.timestamp, body);
  if (!safeEqual(expected, headers.signature)) return { ok: false, reason: "Invalid request signature." };
  return { ok: true, identityId: identity.identityId };
}

export function signBody(identitySecret: string, timestamp: string, body: unknown): string {
  return createHmac("sha256", identitySecret).update(`${timestamp}.${stableStringify(body)}`).digest("hex");
}

export function hashSecret(identitySecret: string): string {
  return sha256(identitySecret);
}

function identityDbPath(storageDir: string) {
  return path.join(storageDir, "identity-db.json");
}

function readIdentityDb(storageDir: string): IdentityDb {
  return readJsonFile(identityDbPath(storageDir), { identities: [] });
}

function writeIdentityDb(storageDir: string, db: IdentityDb) {
  writeJsonFileAtomic(identityDbPath(storageDir), db);
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a, "utf-8");
  const right = Buffer.from(b, "utf-8");
  return left.length === right.length && timingSafeEqual(left, right);
}
