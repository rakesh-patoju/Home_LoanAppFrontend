# Frontend pages and backend API mapping

All paths below are relative to `/api`. Tokens use `Authorization: Bearer <token>`.

| Frontend page/action | Backend endpoint |
|---|---|
| /login | POST /auth/login |
| /register | POST /auth/register |
| /products and /app/products | GET /loan-products |
| /app customer dashboard | GET /dashboard/customer |
| /app officer dashboard | GET /dashboard/officer |
| /app admin dashboard | GET /dashboard/admin |
| /app/profile load/save | GET and PUT /customers/profile |
| /app/eligibility | POST /eligibility/check |
| /app/apply | GET /loan-products, GET /customers/profile, POST /loan-applications |
| Customer application list | GET /loan-applications/my-applications?page=0&size=10&sort=applicationDate,desc |
| Officer/admin application list | GET /loan-applications?page=0&size=10&sort=applicationDate,desc |
| Application overview | GET /loan-applications/{id} |
| Customer details during staff review | GET /loan-applications/{id}/customer |
| Document checklist | GET /loan-applications/{id}/documents |
| Upload/replace document | POST /loan-applications/{id}/documents (multipart) |
| Download | GET /documents/{id}/download (Blob) |
| Verify/reject document | PUT /documents/{id}/verify |
| Change application status | PUT /loan-applications/{id}/status |
| Add remark | POST /loan-applications/{id}/remarks |
| Status timeline | GET /loan-applications/{id}/history |
| Assign/reassign officer | GET /admin/loan-officers (all pages), PUT /loan-applications/{id}/assignment |
| Admin customer list/edit | GET /admin/customers, PUT /admin/customers/{id} |
| Customer enable/disable | PUT /admin/customers/{id}/enabled |
| Admin officer list/create/edit | GET and POST /admin/loan-officers, PUT /admin/loan-officers/{id} |
| Admin products including inactive | GET /admin/loan-products |
| Admin product create/edit | POST /loan-products, PUT /loan-products/{id} |

## Request details

- Application creation adds an `Idempotency-Key` header and sends `loanProductId`, `requestedLoanAmount`, `tenureMonths`, `monthlyIncome`, `employmentType`, `existingEmi`.
- File upload uses `FormData` with `documentType` and `file`; the browser supplies the multipart boundary.
- Document verification sends `status` (VERIFIED or REJECTED) and required `remarks`.
- Application decisions send `status` and required `remarks`.
- Assignment sends the **officer user ID**, not a customer ID.
- Customer update DTOs exclude immutable email and IDs.
- Product edits exclude response ID and retain all editable product fields.

## Exact workflow

| Current state | Available next state |
|---|---|
| SUBMITTED | UNDER_REVIEW, DOCUMENT_PENDING, REJECTED |
| DOCUMENT_PENDING | UNDER_REVIEW, REJECTED |
| UNDER_REVIEW | DOCUMENT_PENDING, APPROVED, REJECTED |
| APPROVED | SANCTIONED, admin only |
| SANCTIONED | DISBURSED, admin only |
| REJECTED / DISBURSED | None |

APPROVED additionally requires all five latest document categories to be VERIFIED. The backend revalidates this when processing the decision. Approved and closed applications cannot accept document changes.

The original backend supports exactly these operations; this frontend does not invent unsupported REST endpoints.
