import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AddressInfo } from "node:net";
import pg from "pg";
import { signBody } from "./auth.js";
import { PostgresStorageAdapter } from "./postgresStorage.js";
import { createApiServer } from "./server.js";

function repoRoot() {
  const thisDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(thisDir, "../../..");
}

async function withTestServer<T>(fn: (baseUrl: string, storageDir: string) => Promise<T>): Promise<T> {
  const root = repoRoot();
  const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), "commons-sim-server-"));
  const server = createApiServer({
    benchmarkDir: path.join(root, "examples/challenges/benchmarks"),
    storageDir,
    adminToken: "test-admin-token",
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    return await fn(`http://127.0.0.1:${port}`, storageDir);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

async function withPostgresTestServer<T>(databaseUrl: string, fn: (baseUrl: string) => Promise<T>): Promise<T> {
  const root = repoRoot();
  const storage = await PostgresStorageAdapter.create({ connectionString: databaseUrl });
  const server = createApiServer({
    benchmarkDir: path.join(root, "examples/challenges/benchmarks"),
    storageDir: "postgres-test",
    storage,
    adminToken: "test-admin-token",
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    return await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await storage.close();
  }
}

async function createIdentity(baseUrl: string) {
  const response = await fetch(`${baseUrl}/identities`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ label: "test-player" }),
  });
  assert.equal(response.status, 201);
  return (await response.json()) as { identityId: string; identitySecret: string };
}

function signedHeaders(identity: { identityId: string; identitySecret: string }, body: unknown) {
  const timestamp = new Date().toISOString();
  return {
    "content-type": "application/json",
    "x-identity-id": identity.identityId,
    "x-timestamp": timestamp,
    "x-signature": signBody(identity.identitySecret, timestamp, body),
  };
}

test("server exposes health and benchmark list", async () => {
  await withTestServer(async (baseUrl) => {
    const health = await fetch(`${baseUrl}/health`);
    assert.equal(health.status, 200);
    const healthBody = await health.json();
    assert.equal(healthBody.ok, true);
    assert.equal(healthBody.storage.backend, "json");

    const benchmarks = await fetch(`${baseUrl}/benchmarks`);
    assert.equal(benchmarks.status, 200);
    const body = await benchmarks.json();
    assert.ok(body.benchmarks.some((benchmark: { id: string }) => benchmark.id === "balanced-48"));
  });
});

test("server accepts valid submission and stores leaderboard result", async () => {
  await withTestServer(async (baseUrl, storageDir) => {
    const identity = await createIdentity(baseUrl);
    const submission = JSON.parse(
      fs.readFileSync(
        path.join(repoRoot(), "examples/challenges/submissions/balanced-48-baseline.submission.json"),
        "utf-8",
      ),
    );

    const submitted = await fetch(`${baseUrl}/submissions`, {
      method: "POST",
      headers: signedHeaders(identity, submission),
      body: JSON.stringify(submission),
    });
    assert.equal(submitted.status, 201);
    const entry = await submitted.json();
    assert.equal(entry.result.submissionId, "balanced-48-baseline-submission");
    assert.equal(entry.result.validation.ok, true);
    assert.equal(entry.identityId, identity.identityId);
    assert.ok(
      fs.existsSync(path.join(storageDir, "leaderboards", "open-2026", "balanced-48", "balanced-48-baseline-submission.json")),
    );

    const leaderboard = await fetch(`${baseUrl}/leaderboards/balanced-48`);
    assert.equal(leaderboard.status, 200);
    const leaderboardBody = await leaderboard.json();
    assert.equal(leaderboardBody.entries.length, 1);
    assert.equal(leaderboardBody.entries[0].result.submissionId, "balanced-48-baseline-submission");

    const metrics = await fetch(`${baseUrl}/metrics`, { headers: { "x-admin-token": "test-admin-token" } });
    assert.equal(metrics.status, 200);
    const metricsBody = await metrics.json();
    assert.equal(metricsBody.backend, "json");
    assert.equal(metricsBody.leaderboardEntries, 1);
    assert.equal(metricsBody.pendingReviews, 1);
  });
});

test("server rejects submission that edits locked benchmark fields", async () => {
  await withTestServer(async (baseUrl) => {
    const identity = await createIdentity(baseUrl);
    const submission = JSON.parse(
      fs.readFileSync(
        path.join(repoRoot(), "examples/challenges/submissions/balanced-48-baseline.submission.json"),
        "utf-8",
      ),
    );
    submission.id = "bad-household-edit";
    submission.proposedScenario.householdCount = 47;
    submission.proposedScenario.householdMix = { singles: 11, couples: 16, families: 20 };

    const submitted = await fetch(`${baseUrl}/submissions`, {
      method: "POST",
      headers: signedHeaders(identity, submission),
      body: JSON.stringify(submission),
    });
    assert.equal(submitted.status, 422);
    const result = await submitted.json();
    assert.equal(result.validation.ok, false);
    assert.ok(result.validation.violations.some((violation: { field: string }) => violation.field === "householdCount"));
  });
});

test("server rejects unsigned submissions", async () => {
  await withTestServer(async (baseUrl) => {
    const submission = JSON.parse(
      fs.readFileSync(
        path.join(repoRoot(), "examples/challenges/submissions/balanced-48-baseline.submission.json"),
        "utf-8",
      ),
    );
    const submitted = await fetch(`${baseUrl}/submissions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(submission),
    });
    assert.equal(submitted.status, 401);
  });
});

test("server supports admin finalist review workflow", async () => {
  await withTestServer(async (baseUrl) => {
    const identity = await createIdentity(baseUrl);
    const submission = JSON.parse(
      fs.readFileSync(
        path.join(repoRoot(), "examples/challenges/submissions/balanced-48-baseline.submission.json"),
        "utf-8",
      ),
    );
    const submitted = await fetch(`${baseUrl}/submissions`, {
      method: "POST",
      headers: signedHeaders(identity, submission),
      body: JSON.stringify(submission),
    });
    assert.equal(submitted.status, 201);

    const reviewed = await fetch(`${baseUrl}/admin/review/balanced-48/balanced-48-baseline-submission`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-token": "test-admin-token" },
      body: JSON.stringify({ status: "finalist", note: "Ready for human review.", seasonId: "open-2026" }),
    });
    assert.equal(reviewed.status, 200);
    const reviewedBody = await reviewed.json();
    assert.equal(reviewedBody.review.status, "finalist");

    const finalists = await fetch(`${baseUrl}/finalists/balanced-48?seasonId=open-2026`);
    assert.equal(finalists.status, 200);
    const finalistsBody = await finalists.json();
    assert.equal(finalistsBody.entries.length, 1);
  });
});

test("server supports admin season creation", async () => {
  await withTestServer(async (baseUrl) => {
    const created = await fetch(`${baseUrl}/admin/seasons`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-token": "test-admin-token" },
      body: JSON.stringify({
        seasonId: "spring-2026",
        title: "Spring 2026",
        benchmarkIds: ["balanced-48"],
        startsAtUtc: "2026-01-01T00:00:00.000Z",
        endsAtUtc: null,
        active: true,
      }),
    });
    assert.equal(created.status, 201);

    const seasons = await fetch(`${baseUrl}/seasons`);
    assert.equal(seasons.status, 200);
    const body = await seasons.json();
    assert.ok(body.seasons.some((season: { seasonId: string }) => season.seasonId === "spring-2026"));
  });
});

test("server rate limits protected write endpoints", async () => {
  const root = repoRoot();
  const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), "commons-sim-server-rate-"));
  const server = createApiServer({
    benchmarkDir: path.join(root, "examples/challenges/benchmarks"),
    storageDir,
    adminToken: "test-admin-token",
    rateLimitMaxPerMinute: 2,
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as AddressInfo).port;
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    for (let i = 0; i < 2; i++) {
      const response = await fetch(`${baseUrl}/identities`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label: `player-${i}` }),
      });
      assert.equal(response.status, 201);
    }
    const limited = await fetch(`${baseUrl}/identities`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label: "player-3" }),
    });
    assert.equal(limited.status, 429);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test("server supports Postgres storage with review audit events", async (context) => {
  const databaseUrl = process.env.COMMONS_SIM_TEST_DATABASE_URL;
  if (!databaseUrl) {
    context.skip("Set COMMONS_SIM_TEST_DATABASE_URL to run Postgres integration coverage.");
    return;
  }

  const { Pool } = pg;
  const pool = new Pool({ connectionString: databaseUrl });
  const submissionId = `postgres-integration-${Date.now()}`;
  try {
    await withPostgresTestServer(databaseUrl, async (baseUrl) => {
      const identity = await createIdentity(baseUrl);
      const submission = JSON.parse(
        fs.readFileSync(
          path.join(repoRoot(), "examples/challenges/submissions/balanced-48-baseline.submission.json"),
          "utf-8",
        ),
      );
      submission.id = submissionId;

      const health = await fetch(`${baseUrl}/health`);
      assert.equal(health.status, 200);
      const healthBody = await health.json();
      assert.equal(healthBody.storage.backend, "postgres");

      const submitted = await fetch(`${baseUrl}/submissions`, {
        method: "POST",
        headers: signedHeaders(identity, submission),
        body: JSON.stringify(submission),
      });
      assert.equal(submitted.status, 201);

      const reviewed = await fetch(`${baseUrl}/admin/review/balanced-48/${submissionId}`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-token": "test-admin-token" },
        body: JSON.stringify({ status: "finalist", note: "Postgres integration review.", seasonId: "open-2026" }),
      });
      assert.equal(reviewed.status, 200);

      const metrics = await fetch(`${baseUrl}/metrics`, { headers: { "x-admin-token": "test-admin-token" } });
      assert.equal(metrics.status, 200);
      const metricsBody = await metrics.json();
      assert.equal(metricsBody.backend, "postgres");
      assert.ok(metricsBody.leaderboardEntries >= 1);
    });

    const audit = await pool.query<{ count: string }>(
      "select count(*)::text as count from audit_events where event_type = 'review_status_updated' and payload->>'submissionId' = $1",
      [submissionId],
    );
    assert.equal(Number(audit.rows[0]?.count ?? 0), 1);
  } finally {
    await pool.query("delete from audit_events where payload->>'submissionId' = $1", [submissionId]);
    await pool.query("delete from leaderboard_entries where submission_id = $1", [submissionId]);
    await pool.end();
  }
});
