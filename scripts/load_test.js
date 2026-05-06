/**
 * TC-PERF-04 — Load test: 50 concurrent users, 60 seconds
 *
 * Targets (per acceptance criteria):
 *   - p95 response time < 500ms  (GET /v1/dashboard/summary, POST /v1/progress/sections/:id/complete)
 *   - Error rate < 1%
 *   - No DB connection pool starvation (watch for 503/timeout spikes)
 *
 * Run:
 *   k6 run --vus 50 --duration 60s scripts/load_test.js
 *
 * Override base URL:
 *   BASE_URL=https://your-staging-url k6 run --vus 50 --duration 60s scripts/load_test.js
 *
 * Prerequisites — set env vars before running:
 *   REFRESH_TOKEN=<token>              valid staging refresh token
 *   LOAD_TEST_BYPASS_SECRET=<secret>   must match LOAD_TEST_BYPASS_SECRET on the backend
 *                                      (bypasses per-IP rate limiting for load test traffic)
 *
 * The token refresh runs ONCE in setup() before VUs start,
 * so it never hits the rate limiter during the load test.
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// ─── Config ────────────────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || "https://learnops-staging.findmywayapp.com";
const API = `${BASE_URL}/api`;
const REFRESH_TOKEN = __ENV.REFRESH_TOKEN || "";
const LOAD_TEST_BYPASS_SECRET = __ENV.LOAD_TEST_BYPASS_SECRET || "";
const COURSE_SLUG = __ENV.COURSE_SLUG || "intro-to-python";
const SECTION_ID = __ENV.SECTION_ID || "1";

// ─── Custom metrics ────────────────────────────────────────────────────────────
const errorRate = new Rate("error_rate");
const dashboardTrend = new Trend("dashboard_summary_duration", true);
const sectionProgressTrend = new Trend("section_progress_duration", true);

// ─── Thresholds (acceptance criteria) ─────────────────────────────────────────
export const options = {
  vus: 50,
  duration: "60s",
  thresholds: {
    dashboard_summary_duration: ["p(95)<500"],
    section_progress_duration: ["p(95)<500"],
    error_rate: ["rate<0.01"],
    http_req_failed: ["rate<0.01"],
  },
};

// ─── Setup: runs ONCE before VUs start ────────────────────────────────────────
// Returns data that is passed as the first argument to default().
export function setup() {
  if (!REFRESH_TOKEN) {
    console.warn("REFRESH_TOKEN not set — requests will be sent without auth.");
    return { accessToken: null };
  }

  const res = http.post(
    `${API}/auth/refresh`,
    null,
    {
      headers: { Cookie: `refresh_token=${REFRESH_TOKEN}` },
      tags: { name: "setup_auth_refresh" },
    }
  );

  if (res.status !== 200) {
    throw new Error(
      `Token refresh failed in setup (status ${res.status}): ${res.body}\n` +
      "Make sure REFRESH_TOKEN is a valid, non-expired staging token."
    );
  }

  const accessToken = JSON.parse(res.body).access_token;
  console.log("✓ Access token obtained in setup — all VUs will reuse it.");
  return { accessToken };
}

// ─── VU lifecycle — receives setup() return value as `data` ───────────────────
export default function (data) {
  const { accessToken } = data;
  const bypassHeader = LOAD_TEST_BYPASS_SECRET
    ? { "X-Load-Test-Secret": LOAD_TEST_BYPASS_SECRET }
    : {};
  const authHeader = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  const params = {
    headers: { "Content-Type": "application/json", ...bypassHeader, ...authHeader },
  };

  // ── 1. GET /v1/dashboard/summary ──────────────────────────────────────────
  {
    const res = http.get(`${API}/dashboard/summary`, {
      ...params,
      tags: { name: "dashboard_summary" },
    });

    const ok = check(res, {
      "dashboard/summary: status 200": (r) => r.status === 200,
      "dashboard/summary: has body": (r) => r.body && r.body.length > 0,
    });

    errorRate.add(!ok);
    dashboardTrend.add(res.timings.duration);

    if (res.status === 503 || res.timings.duration > 5000) {
      console.error(
        `[VU ${__VU}] Possible pool starvation — dashboard/summary: ` +
          `status=${res.status} duration=${res.timings.duration}ms`
      );
    }
  }

  sleep(1);

  // ── 2. GET /v1/courses (public) ───────────────────────────────────────────
  {
    const res = http.get(`${API}/courses`, {
      headers: { ...bypassHeader },
      tags: { name: "courses_list" },
    });

    check(res, {
      "courses: status 200": (r) => r.status === 200,
    });
    errorRate.add(res.status !== 200);
  }

  sleep(0.5);

  // ── 3. POST /v1/progress/sections/:id/complete ────────────────────────────
  {
    const res = http.post(
      `${API}/progress/sections/${SECTION_ID}/complete`,
      null,
      {
        ...params,
        tags: { name: "section_progress" },
      }
    );

    // 200 OK or 409 Conflict (already completed) are both valid
    const ok = check(res, {
      "section_progress: success": (r) => r.status === 200 || r.status === 409,
    });

    errorRate.add(!ok);
    sectionProgressTrend.add(res.timings.duration);

    if (res.status === 503 || res.timings.duration > 5000) {
      console.error(
        `[VU ${__VU}] Possible pool starvation — section_progress: ` +
          `status=${res.status} duration=${res.timings.duration}ms`
      );
    }
  }

  sleep(1);
}
