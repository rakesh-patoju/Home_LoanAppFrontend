# Verification — 17 November 2026

## Executed checks

| Check | Result |
|---|---|
| Vite production build | Passed; prebuilt dist included |
| Frontend unit tests | 11 passed, 0 failures |
| Playwright browser integration scenarios | 6 passed, 0 failures, 0 skipped |
| Backend Maven clean verify with H2 | 22 passed, executable JAR built |
| Backend tests with MySQL 8.4.7 | 22 passed, 0 failures/errors/skips |
| Direct browser CORS request from localhost:5173 to localhost:8080 | Passed after backend CORS fix |
| Same-origin API proxy, uploads and authenticated downloads | Passed in actual browser workflows |

The browser suite used the packaged Spring Boot JAR, a fresh real MySQL database and the included zero-dependency Node server serving the production frontend. No API-success mocks or synthetic loan records replaced the backend. One intentional intercepted network failure tests the offline/retry screen.

Verified in Linux with Node 24.22.1, Java 21.0.5, Maven 3.9.11, MySQL 8.4.7, Playwright 1.65.1 and Chrome Headless Shell 131. Desktop viewport 1440 × 1000 and mobile viewport 390 × 844 were exercised. Windows instructions are supplied; Windows, Safari, Firefox and physical phones were not executed here. These are tested-path results, not a guarantee that every possible defect or local setup issue is absent.

## Browser scenario coverage

1. Public home/products/about, mobile navigation, horizontal-overflow check, backend-unavailable message and successful retry.
2. Registration, profile update surviving refresh, customer route protection and expired-session redirect.
3. Dashboard, eligible/ineligible calculator results, stale-result clearing, real direct CORS preflight with JWT/JSON/idempotency headers, mobile workspace navigation.
4. Three-step application submission, all five document uploads, authenticated download, assigned-officer review, approval blocked until verification, approval, admin sanction and demo disbursement, persisted history and other-customer denial.
5. Admin product creation/deactivation, officer creation/disabling, customer edit and Escape dismissal of a confirmation dialog.
6. Officer reassignment, old-officer access denial, remarks, additional-document request visible to customer, invalid-file feedback, document upload/rejection, application rejection and no disbursement action for rejected applications.

Each browser scenario also fails on an unhandled JavaScript page error.

Unit tests cover legal role/status transitions, terminal states, latest-document verification, zero/invalid uploads, file size/type validation, amount/tenure/product bounds, exact API payload mapping and password byte limits. Backend tests independently enforce authorization, ownership, document requirements, idempotency and workflow rules.

## CORS fix delivered with this frontend

The original backend's `CorsConfigurationSource` bean was named `cors`, which Spring Security did not automatically use. A new preflight test reproduced HTTP 403. Renaming the bean method to `corsConfigurationSource` connected the configured allowlist to the security filter chain. The new allowed-origin regression test now passes, the untrusted-origin test returns 403, and a real cross-origin browser POST succeeds.

Use the refreshed `HomeLoan_Backend.zip` delivered with this frontend. If upgrading an existing copy, preserve `config/local.properties`, `DEMO-LOGINS.local.txt`, your uploaded files and your MySQL database. Replace the source/JAR and restart Java; do not generate new secrets or rerun initial setup unnecessarily. No schema change is required. The frontend's default same-origin proxy also works with the original backend.

## Repeat unit and build checks

From the frontend project folder:

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run build
```

## Repeat browser tests

Use a **fresh, disposable demo database** with the backend demo seed enabled. The suite creates and changes data, expects the original seeded IDs and names, and is not intended for a populated demo or production database. Use another fresh database for each full run.

1. Start the refreshed backend against that empty database and wait for startup/seed completion.
2. Start the frontend with `node scripts/serve.mjs` on port 5173.
3. In another terminal in the frontend folder:

```powershell
npm.cmd ci
npx.cmd playwright install chromium
$env:DEMO_PASSWORD='paste your generated backend demo password here locally'
npm.cmd run test:e2e
Remove-Item Env:DEMO_PASSWORD
```

Keep the default `http://localhost:5173` frontend origin and backend port 8080 for the direct-CORS check. No password is embedded in the test source. The included fictional PDF is used automatically. Test output is written to `test-results/`, which is ignored by Git and omitted from this ZIP. Retained failure traces may contain test-session information; keep them private.

`FRONTEND_URL` can override the browser base URL. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` is an optional path to an existing compatible Chromium executable; normally leave it unset and use Playwright's installed browser.

## Manual acceptance

Follow the role-by-role workflow in README.md. Also try an incorrect password, replacing a verified document, refreshing a deep application URL, logging out, using an unassigned officer and attempting approval with missing documents. Backend messages should appear in the UI rather than a fake success.
