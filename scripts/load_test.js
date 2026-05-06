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
 *   COURSE_SLUG=<slug>                 e.g. cicd-kavramlarina-giris
 *   SECTION_ID=<section_id_str>        e.g. cicd-001-nedir
 *   LOAD_TEST_BYPASS_SECRET=<secret>   must match LOAD_TEST_BYPASS_SECRET on the backend
 *                                      (bypasses per-IP rate limiting for load test traffic)
 *
 * What setup() does before VUs start:
 *   1. Calls /auth/refresh ONCE to get an access token (avoids rate-limit hits during test)
 *   2. Enrolls the user in the course (idempotent: 201 or 409 both fine)
 *   3. Marks the target section complete ONCE (idempotent warm-up)
 *      → All 50 VU iterations then make read-only idempotent calls → no write contention
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// ─── Config ────────────────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || "https://learnops-staging.findmywayapp.com";
const API = `${BASE_URL}/api`;
const REFRESH_TOKEN = __ENV.REFRESH_TOKEN || "";
const LOAD_TEST_BYPASS_SECRET = __ENV.LOAD_TEST_BYPASS_SECRET || "";
const COURSE_SLUG = __ENV.COURSE_SLUG || "cicd-kavramlarina-giris";
// The course UUID for the enrollment endpoint (resolved from COURSE_SLUG by setup())
const SECTION_ID = __ENV.SECTION_ID || "cicd-001-nedir";

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
    throw new Error("REFRESH_TOKEN env var is required. Get a fresh one from browser DevTools cookies.");
  }

  // ── Step 1: Exchange refresh token for access token ──────────────────────
  const refreshRes = http.post(
    `${API}/auth/refresh`,
    null,
    {
      headers: { Cookie: `refresh_token=${REFRESH_TOKEN}` },
      tags: { name: "setup_auth_refresh" },
    }
  );
  if (refreshRes.status !== 200) {
    throw new Error(
      `Token refresh failed (status ${refreshRes.status}): ${refreshRes.body}\n` +
      "Make sure REFRESH_TOKEN is a valid, non-expired staging token."
    );
  }
  // The backend validates from the httpOnly cookie `access_token`.
  // Read from JSON body; VUs send it as Cookie: access_token=<value>.
  const accessToken = JSON.parse(refreshRes.body).access_token;
  const authCookie = `access_token=${accessToken}`;
  const bypassHeader = LOAD_TEST_BYPASS_SECRET
    ? { "X-Load-Test-Secret": LOAD_TEST_BYPASS_SECRET }
    : {};
  console.log("✓ Step 1/3: Access token obtained.");

  // ── Step 2: Resolve course UUID from slug ────────────────────────────────
  const courseRes = http.get(`${API}/courses/${COURSE_SLUG}`, {
    headers: { ...bypassHeader },
    tags: { name: "setup_course_lookup" },
  });
  if (courseRes.status !== 200) {
    throw new Error(`Course lookup failed (status ${courseRes.status}). Check COURSE_SLUG=${COURSE_SLUG}`);
  }
  const courseId = JSON.parse(courseRes.body).id;
  console.log(`✓ Step 2/3: Course UUID resolved: ${courseId}`);

  // ── Step 3: Ensure user is enrolled (idempotent) ─────────────────────────
  const enrollRes = http.post(
    `${API}/enrollments`,
    JSON.stringify({ course_id: courseId }),
    {
      headers: { "Content-Type": "application/json", Cookie: authCookie, ...bypassHeader },
      tags: { name: "setup_enroll" },
    }
  );
  if (enrollRes.status !== 201 && enrollRes.status !== 409) {
    throw new Error(`Enrollment failed (status ${enrollRes.status}): ${enrollRes.body}`);
  }
  const enrollLabel = enrollRes.status === 201 ? "newly enrolled" : "already enrolled";
  console.log(`✓ Step 3/3: User ${enrollLabel} in ${COURSE_SLUG}.`);

  // ── Step 4: Warm up — mark section complete ONCE ─────────────────────────
  // This ensures all 50 VU iterations are idempotent reads (no write contention).
  const warmupRes = http.post(
    `${API}/progress/sections/${SECTION_ID}/complete`,
    null,
    {
      headers: { Cookie: authCookie, ...bypassHeader },
      tags: { name: "setup_section_warmup" },
    }
  );
  if (warmupRes.status !== 200) {
    console.warn(`Section warmup returned ${warmupRes.status} — VUs may still succeed via idempotency.`);
  } else {
    console.log(`✓ Step 4/4: Section '${SECTION_ID}' pre-completed — VU iterations are now read-only.`);
  }

  return { accessToken };
}

// ─── VU lifecycle — receives setup() return value as `data` ───────────────────
export default function (data) {
  const { accessToken } = data;
  const bypassHeader = LOAD_TEST_BYPASS_SECRET
    ? { "X-Load-Test-Secret": LOAD_TEST_BYPASS_SECRET }
    : {};

  // The backend reads auth from the httpOnly cookie `access_token`, not from
  // the Authorization header. Send the token as a Cookie on every request.
  const cookieHeader = accessToken ? { Cookie: `access_token=${accessToken}` } : {};

  const authedParams = {
    headers: { "Content-Type": "application/json", ...bypassHeader, ...cookieHeader },
  };
  const publicParams = {
    headers: { ...bypassHeader },
  };

  // ── 1. GET /v1/dashboard/summary ──────────────────────────────────────────
  {
    const res = http.get(`${API}/dashboard/summary`, {
      ...authedParams,
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
      ...publicParams,
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
        ...authedParams,
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
