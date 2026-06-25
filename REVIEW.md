# Hiring Platform — Review, Fixes & Proof

**Branch:** `claude/hiring-platform-review-h0sphw`
**Date:** 2026-06-09

---

## 1. The idea

**Tinder-for-careers** — a swipe-based, two-sided hiring marketplace.

- **Candidates** build a profile (degree, GPA, skills, location prefs).
- **Recruiters** post jobs.
- The platform **intelligently matches** candidates to each job and recruiters
  swipe through their matched pool.
- A like + message opens a **two-way-consent** conversation thread.

The defining feature — the thing that makes it more than a job board — is the
**matching engine**: `degree 40% / GPA 20% / skills 20% / location 20%`.

---

## 2. What was broken → fixed

| # | Severity | Problem | Fix |
|---|----------|---------|-----|
| 1 | **Blocker** | `npm install` failed — `jsonwebtoken@^9.1.0` does not exist on npm | Pinned to `^9.0.2` |
| 2 | **Core feature dead** | `calculateMatchScore()` was never called anywhere — the headline feature was dead code | Posting a job auto-scores every verified candidate and builds the pool; discovery ranks by score |
| 3 | **Flow dead-end** | New users register as `unverified`; discovery requires `verified`; **no verify endpoint existed** → no new candidate was ever discoverable | Added `POST /api/auth/verify` + working verify page; register passes email through |
| 4 | Bug | Dashboard read `user_type`/`account_status`; API returns `userType`/`accountStatus` → type & status always wrong | Aligned field names |
| 5 | Bug | Discover rendered a literal `\|\|` as text and sent candidate→company swipes to a recruiter-only endpoint | Made role-aware; fixed card title |
| 6 | Devex | Missing `prisma.seed` config + `tsx` → documented `prisma db seed` failed; no lockfile; seed duplicated jobs on re-run; README referenced nonexistent test scripts | Added config/dep, committed lockfile, idempotent seed, aligned README/.env.example |

---

## 3. How it was proven

### Unit tests — 13 passing
```
✓ src/utils/matching.test.ts   (6 tests)
✓ src/utils/validation.test.ts (7 tests)
Test Files  2 passed (2)
     Tests  13 passed (13)
```

### Build — clean
```
✓ Compiled successfully
✓ Generating static pages (10/10)
```

### Live end-to-end run (real Postgres)
```
1.  Register new candidate (Grace)      → user_id returned
2.  Verify email                        → account_status: verified
3.  Login                               → JWT issued
4.  Fill profile                        → completion 67%
5.  Recruiter login                     → JWT issued
6.  Recruiter posts "ML Engineer" job   → auto-pooled candidates: 2   ← MATCHING ENGINE
7.  Discover pool (ranked by score):
        John Doe     — score 0.95
        Grace Hopper — score 0.95
8.  Recruiter likes Grace               → interaction recorded
9.  Recruiter messages Grace            → 2-way-consent thread created
10. Grace sees conversation             → "Hi Grace, loved your ML background…"
11. Discover re-queried                 → Grace excluded (already swiped)
```

Every stage of the core loop — **register → verify → match → discover → swipe →
message** — works against a real database.

---

## 4. Deliberately left as-is

The platform has **no real email/Stripe integration**. Verification is a
click-to-confirm MVP stand-in rather than a SendGrid one-time code. Wiring real
email verification (and Stripe subscriptions) is the natural next step.
