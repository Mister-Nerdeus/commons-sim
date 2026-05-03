import http, { type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { ChallengeSubmissionSchema } from "@commons-sim/shared";
import { verifySignedBodyWithIdentity } from "./auth.js";
import { findBenchmark, listBenchmarks } from "./benchmarkStore.js";
import { buildChallengeResult } from "./challengeResult.js";
import { JsonStorageAdapter } from "./jsonStorage.js";
import { createRateLimiter } from "./rateLimit.js";
import { type ReviewStatus } from "./resultStore.js";
import { type SeasonRecord } from "./seasonStore.js";
import type { StorageAdapter } from "./storage.js";

export type ApiServerOptions = {
  benchmarkDir: string;
  storageDir: string;
  adminToken?: string;
  requireSignedSubmissions?: boolean;
  rateLimitMaxPerMinute?: number;
  storage?: StorageAdapter;
};

type ApiError = {
  status: number;
  code: string;
  message: string;
};

type ResolvedApiServerOptions = Required<
  Pick<ApiServerOptions, "benchmarkDir" | "storageDir" | "requireSignedSubmissions" | "rateLimitMaxPerMinute" | "storage">
> &
  Pick<ApiServerOptions, "adminToken">;

export function createApiServer(options: ApiServerOptions): Server {
  const resolvedOptions: ResolvedApiServerOptions = {
    ...options,
    requireSignedSubmissions: options.requireSignedSubmissions ?? true,
    rateLimitMaxPerMinute: options.rateLimitMaxPerMinute ?? 60,
    storage: options.storage ?? new JsonStorageAdapter(options.storageDir),
  };
  const rateLimiter = createRateLimiter({ maxPerMinute: resolvedOptions.rateLimitMaxPerMinute });

  return http.createServer((request, response) => {
    void handleRequest(resolvedOptions, rateLimiter, request, response).catch((error) => {
      const apiError = normalizeError(error);
      writeJson(response, apiError.status, { error: { code: apiError.code, message: apiError.message } });
    });
  });
}

async function handleRequest(
  options: ResolvedApiServerOptions,
  rateLimiter: ReturnType<typeof createRateLimiter>,
  request: IncomingMessage,
  response: ServerResponse,
) {
  const url = new URL(request.url ?? "/", "http://localhost");

  if (request.method === "GET" && url.pathname === "/health") {
    const storage = await options.storage.health();
    writeJson(response, storage.ok ? 200 : 503, { ok: storage.ok, authRequired: options.requireSignedSubmissions, storage });
    return;
  }

  if (request.method === "GET" && url.pathname === "/metrics") {
    requireAdmin(options, request);
    writeJson(response, 200, await options.storage.metrics());
    return;
  }

  if (request.method === "GET" && url.pathname === "/benchmarks") {
    writeJson(response, 200, { benchmarks: listBenchmarks(options.benchmarkDir) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/seasons") {
    writeJson(response, 200, { seasons: await options.storage.listSeasons() });
    return;
  }

  if (request.method === "POST" && url.pathname === "/identities") {
    enforceRateLimit(rateLimiter, rateLimitKey(request, "identity"));
    const body = await readJsonBody(request);
    const label = readOptionalString(body, "label") ?? "anonymous-player";
    const identity = await options.storage.createIdentity(label);
    writeJson(response, 201, identity);
    return;
  }

  const leaderboardMatch = /^\/leaderboards\/([^/]+)$/.exec(url.pathname);
  if (request.method === "GET" && leaderboardMatch) {
    const benchmarkId = decodeURIComponent(leaderboardMatch[1]!);
    const benchmark = findBenchmark(options.benchmarkDir, benchmarkId);
    if (!benchmark) throw apiError(404, "BENCHMARK_NOT_FOUND", `Benchmark not found: ${benchmarkId}`);
    const seasonId = url.searchParams.get("seasonId") ?? undefined;
    writeJson(response, 200, {
      benchmarkId,
      benchmarkClassId: benchmark.benchmarkClassId,
      seasonId: seasonId ?? null,
      entries: await options.storage.listLeaderboardRecords(benchmarkId, seasonId),
    });
    return;
  }

  const finalistsMatch = /^\/finalists\/([^/]+)$/.exec(url.pathname);
  if (request.method === "GET" && finalistsMatch) {
    const benchmarkId = decodeURIComponent(finalistsMatch[1]!);
    const benchmark = findBenchmark(options.benchmarkDir, benchmarkId);
    if (!benchmark) throw apiError(404, "BENCHMARK_NOT_FOUND", `Benchmark not found: ${benchmarkId}`);
    const seasonId = url.searchParams.get("seasonId") ?? undefined;
    const entries = (await options.storage.listLeaderboardRecords(benchmarkId, seasonId)).filter(
      (entry) => entry.review.status === "finalist" || entry.review.status === "approved",
    );
    writeJson(response, 200, { benchmarkId, benchmarkClassId: benchmark.benchmarkClassId, seasonId: seasonId ?? null, entries });
    return;
  }

  if (request.method === "POST" && url.pathname === "/submissions") {
    enforceRateLimit(rateLimiter, rateLimitKey(request, request.headers["x-identity-id"]?.toString() ?? "submission"));
    const body = await readJsonBody(request);
    const submission = ChallengeSubmissionSchema.parse(body);
    const identityId = await authenticateSubmission(options, request, body);
    const benchmark = findBenchmark(options.benchmarkDir, submission.benchmarkId);
    if (!benchmark) throw apiError(404, "BENCHMARK_NOT_FOUND", `Benchmark not found: ${submission.benchmarkId}`);
    const season = await options.storage.findActiveSeason(benchmark.id);
    if (!season) throw apiError(409, "NO_ACTIVE_SEASON", `No active season for benchmark: ${benchmark.id}`);
    const result = buildChallengeResult(benchmark, submission);
    if (!result.validation.ok) {
      writeJson(response, 422, result);
      return;
    }
    const entry = await options.storage.saveChallengeResult(result, { identityId, seasonId: season.seasonId });
    writeJson(response, 201, entry);
    return;
  }

  if (request.method === "GET" && url.pathname === "/admin/identities") {
    requireAdmin(options, request);
    writeJson(response, 200, { identities: await options.storage.listIdentities() });
    return;
  }

  if (request.method === "POST" && url.pathname === "/admin/seasons") {
    requireAdmin(options, request);
    const body = (await readJsonBody(request)) as SeasonRecord;
    writeJson(response, 201, { season: await options.storage.upsertSeason(normalizeSeason(body)) });
    return;
  }

  const reviewMatch = /^\/admin\/review\/([^/]+)\/([^/]+)$/.exec(url.pathname);
  if (request.method === "POST" && reviewMatch) {
    requireAdmin(options, request);
    const benchmarkId = decodeURIComponent(reviewMatch[1]!);
    const submissionId = decodeURIComponent(reviewMatch[2]!);
    const body = await readJsonBody(request);
    const status = readRequiredReviewStatus(body);
    const note = readOptionalString(body, "note") ?? "";
    const seasonId = readOptionalString(body, "seasonId") ?? undefined;
    const updated = await options.storage.updateReviewStatus(benchmarkId, submissionId, seasonId, status, note);
    if (!updated) throw apiError(404, "SUBMISSION_NOT_FOUND", `Submission not found: ${submissionId}`);
    writeJson(response, 200, updated);
    return;
  }

  throw apiError(404, "NOT_FOUND", `Route not found: ${request.method} ${url.pathname}`);
}

async function authenticateSubmission(
  options: Pick<ResolvedApiServerOptions, "requireSignedSubmissions" | "storage">,
  request: IncomingMessage,
  body: unknown,
): Promise<string> {
  if (!options.requireSignedSubmissions) return "unsigned-dev";
  const identityId = request.headers["x-identity-id"]?.toString();
  const verification = verifySignedBodyWithIdentity(
    identityId ? await options.storage.findIdentity(identityId) : undefined,
    {
      identityId,
      signature: request.headers["x-signature"]?.toString(),
      timestamp: request.headers["x-timestamp"]?.toString(),
    },
    body,
  );
  if (!verification.ok) throw apiError(401, "INVALID_SIGNATURE", verification.reason);
  return verification.identityId;
}

function requireAdmin(options: Pick<ApiServerOptions, "adminToken">, request: IncomingMessage): void {
  if (!options.adminToken) throw apiError(503, "ADMIN_DISABLED", "Admin endpoints require COMMONS_SIM_ADMIN_TOKEN.");
  const token = request.headers["x-admin-token"]?.toString();
  if (token !== options.adminToken) throw apiError(403, "ADMIN_FORBIDDEN", "Invalid admin token.");
}

function enforceRateLimit(rateLimiter: ReturnType<typeof createRateLimiter>, key: string): void {
  const result = rateLimiter.check(key);
  if (!result.allowed) throw apiError(429, "RATE_LIMITED", `Too many requests. Retry after ${result.retryAfterSeconds}s.`);
}

function rateLimitKey(request: IncomingMessage, scope: string) {
  return `${scope}:${request.socket.remoteAddress ?? "unknown"}`;
}

function readOptionalString(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const actual = (value as Record<string, unknown>)[key];
  return typeof actual === "string" && actual.trim().length > 0 ? actual : undefined;
}

function readRequiredReviewStatus(value: unknown): ReviewStatus {
  const status = readOptionalString(value, "status");
  if (status === "pending" || status === "finalist" || status === "approved" || status === "rejected") return status;
  throw apiError(400, "INVALID_REVIEW_STATUS", "Expected status: pending, finalist, approved, or rejected.");
}

function normalizeSeason(body: SeasonRecord): SeasonRecord {
  if (!body || typeof body !== "object") throw apiError(400, "INVALID_SEASON", "Expected season object.");
  return {
    seasonId: readOptionalString(body, "seasonId") ?? missing("seasonId"),
    title: readOptionalString(body, "title") ?? missing("title"),
    benchmarkIds: Array.isArray(body.benchmarkIds) ? body.benchmarkIds.filter((item) => typeof item === "string") : [],
    startsAtUtc: readOptionalString(body, "startsAtUtc") ?? missing("startsAtUtc"),
    endsAtUtc: typeof body.endsAtUtc === "string" ? body.endsAtUtc : null,
    active: Boolean(body.active),
  };
}

function missing(field: string): never {
  throw apiError(400, "INVALID_SEASON", `Missing season field: ${field}`);
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf-8");
  if (raw.trim().length === 0) throw apiError(400, "EMPTY_BODY", "Expected JSON request body.");
  try {
    return JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw apiError(400, "INVALID_JSON", message);
  }
}

function writeJson(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status;
  response.setHeader("content-type", "application/json;charset=utf-8");
  response.end(`${JSON.stringify(body, null, 2)}\n`);
}

function apiError(status: number, code: string, message: string): ApiError {
  return { status, code, message };
}

function normalizeError(error: unknown): ApiError {
  if (isApiError(error)) return error;
  const message = error instanceof Error ? error.message : String(error);
  return { status: 500, code: "INTERNAL_ERROR", message };
}

function isApiError(error: unknown): error is ApiError {
  return Boolean(
    error &&
      typeof error === "object" &&
      typeof (error as ApiError).status === "number" &&
      typeof (error as ApiError).code === "string" &&
      typeof (error as ApiError).message === "string",
  );
}
