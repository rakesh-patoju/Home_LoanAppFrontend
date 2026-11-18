# Frontend architecture

## Request flow

React page → shared Axios client → `/api` on the frontend server → Java REST API → MySQL.

The frontend does not access MySQL directly. It does not sign JWTs or decide authorization. It presents backend responses and sends validated request DTOs. Spring Security and the backend's business rules remain authoritative.

## Source organization

| Path | Purpose |
|---|---|
| src/main.jsx | React root, BrowserRouter, Bootstrap, bundled fonts and custom CSS |
| src/App.jsx | Lazy-loaded routes, role guards and runtime error boundary |
| src/context/AuthContext.jsx | Login, registration, session expiry, logout and current-user state |
| src/context/ToastContext.jsx | Success notifications with dismissal |
| src/lib/api.js | Axios base URL, bearer headers, timeout handling, 401 expiry and authenticated downloads |
| src/lib/session.js | Validated sessionStorage access with an in-memory fallback |
| src/lib/domain.js | Exact status transitions, latest-document rules, DTO construction and display formatting |
| src/hooks/useResource.js | Abortable GET requests, reloads, errors and single-flight write actions |
| src/components/Layouts.jsx | Public navigation, responsive workspace sidebar and protected route checks |
| src/components/UI.jsx | Buttons, form fields, dialogs, error messages, loading, pagination and badges |
| src/components/ApplicationsTable.jsx | Shared paginated-list presentation |
| src/components/DocumentPanel.jsx | Checklist, uploads/replacements, verification and downloads |
| src/components/HouseArt.jsx | Local scalable vector house illustration |
| src/pages/PublicPages.jsx | Home, about and live product catalog |
| src/pages/AuthPages.jsx | Login, registration and shared profile/password fields |
| src/pages/DashboardPage.jsx | Role-specific counts, recent applications and chart |
| src/pages/ProfilePage.jsx | Customer profile editing |
| src/pages/EligibilityPage.jsx | Backend-based eligibility and EMI calculation |
| src/pages/ApplyPage.jsx | Three-step application form and retry-safe submission key |
| src/pages/ApplicationsPage.jsx | Server pagination/sorting plus clearly scoped current-page search |
| src/pages/ApplicationDetailPage.jsx | Overview, document/history tabs, decisions, remarks and assignment |
| src/pages/AdminPages.jsx | Customer, officer and product management |
| scripts/serve.mjs | Zero-dependency local production server, SPA fallback and API proxy |
| vite.config.js | React tooling and matching dev/preview API proxy |

## Integration choices

- Requests include only fields accepted by the backend. Response IDs, roles, enabled flags and status are not accidentally copied into customer registration/profile/application payloads.
- Customer registration never accepts a client-selected role.
- API GETs abort when a page unmounts or changes parameters, avoiding stale response updates.
- Write actions have a synchronous single-flight lock as well as disabled submit buttons.
- An application submission key is tied to its exact serialized request body and stored per user in the current tab. Retrying unchanged data reuses the same key.
- The calculator clears the old estimate when its inputs change, so an outdated result is never shown as matching the new inputs.
- File replacement and verification respect latest-upload ordering by timestamp and document ID.
- The UI only offers transitions supported by the backend. Admin-only sanction/disbursement controls are absent from officer pages.
- A server-side 401 invalidates only the currently used token, avoiding an old in-flight request logging out a newer session.
- The production server falls back to index.html for client-side routes, so refreshing application details works.

## Styling and accessibility

A warm off-white background, deep green navigation, sage accents and restrained terracotta highlights keep the banking interface consistent. Local DM Sans and Manrope fonts, reusable spacing, cards and badges provide a clear visual hierarchy.

Animations are limited to page entry, button feedback, loading states and public illustrations. `prefers-reduced-motion` disables motion. Native `<dialog>` elements provide modal semantics, focus containment and Escape handling. Inputs use labels, and async errors/successes use alert/status roles. Mobile navigation, cards and forms adapt to narrow screens; wide data tables scroll within their own containers.

## Deliberate demo limits

No global client state library is needed for this small monolith-backed app. There is no artificial notification center, password-reset button or repayment page because the backend has no corresponding endpoints. Role guards improve navigation; backend authentication and ownership checks enforce security. sessionStorage is a demo convenience, not a defense against XSS. The included Node server is a local demonstration server, not a production hosting stack.
