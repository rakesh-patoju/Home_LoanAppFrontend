export const ROLES = ["CUSTOMER", "LOAN_OFFICER", "ADMIN"];
export const ROLE_NAMES = {
  CUSTOMER: "Customer",
  LOAN_OFFICER: "Loan officer",
  ADMIN: "Administrator",
};
export const DOCUMENTS = {
  IDENTITY_PROOF: "Identity proof",
  ADDRESS_PROOF: "Address proof",
  INCOME_PROOF: "Income proof",
  BANK_STATEMENT: "Bank statement",
  PROPERTY_DOCUMENT: "Property document",
};
export const STATUS_NAMES = {
  SUBMITTED: "Submitted",
  DOCUMENT_PENDING: "Documents needed",
  UNDER_REVIEW: "Under review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SANCTIONED: "Sanctioned",
  DISBURSED: "Disbursed",
  PENDING: "Pending review",
  VERIFIED: "Verified",
};
const transitions = {
  SUBMITTED: ["UNDER_REVIEW", "DOCUMENT_PENDING", "REJECTED"],
  DOCUMENT_PENDING: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["DOCUMENT_PENDING", "APPROVED", "REJECTED"],
  APPROVED: ["SANCTIONED"],
  SANCTIONED: ["DISBURSED"],
  REJECTED: [],
  DISBURSED: [],
};
export function nextStatuses(status, role) {
  if (role === "CUSTOMER") return [];
  return (transitions[status] || []).filter(
    (s) => role === "ADMIN" || !["SANCTIONED", "DISBURSED"].includes(s),
  );
}
export function isEditable(status) {
  return ["SUBMITTED", "DOCUMENT_PENDING", "UNDER_REVIEW"].includes(status);
}
export function latestDocuments(docs = []) {
  const result = {};
  [...docs]
    .sort(
      (a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt) || a.id - b.id,
    )
    .forEach((d) => {
      result[d.documentType] = d;
    });
  return result;
}
export function allDocumentsVerified(docs) {
  const latest = latestDocuments(docs);
  return Object.keys(DOCUMENTS).every(
    (type) => latest[type]?.verificationStatus === "VERIFIED",
  );
}
export function money(value, digits = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number(value) || 0);
}
export function compactMoney(value) {
  const n = Number(value);
  return n >= 10000000
    ? `₹${+(n / 10000000).toFixed(2)} Cr`
    : n >= 100000
      ? `₹${+(n / 100000).toFixed(2)} L`
      : money(n);
}
export function date(value, time = false) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(d);
}
export function tenure(months) {
  const y = Math.floor(months / 12),
    m = months % 12;
  return (
    [
      y ? `${y} ${y === 1 ? "year" : "years"}` : "",
      m ? `${m} ${m === 1 ? "month" : "months"}` : "",
    ]
      .filter(Boolean)
      .join(" ") || "0 months"
  );
}
export function initials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || "N"
  );
}
export function passwordError(value) {
  return value.length < 10
    ? "Use at least 10 characters."
    : value.length > 64
      ? "Use at most 64 characters."
      : new TextEncoder().encode(value).length > 72
        ? "Use at most 72 UTF-8 bytes for this password."
        : "";
}
export function adultDate() {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() - 18);
  return d.toISOString().slice(0, 10);
}
export function fileError(file) {
  if (!file) return "Choose a document to upload.";
  if (!/\.(pdf|jpe?g|png)$/i.test(file.name))
    return "Choose a PDF, JPG or PNG file.";
  if (!file.size) return "The selected file is empty.";
  if (file.size > 5 * 1024 * 1024) return "Your file must be 5 MB or smaller.";
  return "";
}
export function profileBody(form) {
  return {
    fullName: form.fullName.trim(),
    mobile: form.mobile.trim(),
    dateOfBirth: form.dateOfBirth,
    address: form.address.trim(),
    employmentType: form.employmentType,
    monthlyIncome: Number(form.monthlyIncome),
  };
}
export function applicationBody(form) {
  return {
    loanProductId: Number(form.loanProductId),
    requestedLoanAmount: Number(form.requestedLoanAmount),
    tenureMonths: Number(form.tenureMonths),
    monthlyIncome: Number(form.monthlyIncome),
    employmentType: form.employmentType,
    existingEmi: Number(form.existingEmi),
  };
}
export function productBody(form) {
  return {
    productName: form.productName.trim(),
    minimumLoanAmount: Number(form.minimumLoanAmount),
    maximumLoanAmount: Number(form.maximumLoanAmount),
    interestRate: Number(form.interestRate),
    minimumTenureMonths: Number(form.minimumTenureMonths),
    maximumTenureMonths: Number(form.maximumTenureMonths),
    description: form.description.trim(),
    active: !!form.active,
  };
}
export function productError(p) {
  return Number(p.minimumLoanAmount) > Number(p.maximumLoanAmount)
    ? "Minimum loan amount cannot exceed the maximum."
    : Number(p.minimumTenureMonths) > Number(p.maximumTenureMonths)
      ? "Minimum tenure cannot exceed the maximum."
      : "";
}
export function newKey() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `loan-${Date.now()}-${Math.random().toString(36).slice(2, 15)}`
  );
}
