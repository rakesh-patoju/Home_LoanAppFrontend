import { describe, it, expect } from "vitest";
import {
  nextStatuses,
  latestDocuments,
  allDocumentsVerified,
  fileError,
  passwordError,
  applicationBody,
  profileBody,
  productBody,
  productError,
  tenure,
} from "../../src/lib/domain";
describe("backend contract and workflow", () => {
  it("prevents customers from performing status actions", () =>
    expect(nextStatuses("UNDER_REVIEW", "CUSTOMER")).toEqual([]));
  it("restricts sanction and disbursement to admins", () => {
    expect(nextStatuses("APPROVED", "LOAN_OFFICER")).toEqual([]);
    expect(nextStatuses("APPROVED", "ADMIN")).toEqual(["SANCTIONED"]);
  });
  it("keeps rejected and disbursed applications terminal", () => {
    expect(nextStatuses("REJECTED", "ADMIN")).toEqual([]);
    expect(nextStatuses("DISBURSED", "ADMIN")).toEqual([]);
  });
  it("uses latest document by timestamp then ID", () => {
    const docs = [
      {
        id: 1,
        documentType: "IDENTITY_PROOF",
        uploadedAt: "2026-01-01T00:00:00Z",
      },
      {
        id: 2,
        documentType: "IDENTITY_PROOF",
        uploadedAt: "2026-01-01T00:00:00Z",
      },
    ];
    expect(latestDocuments(docs).IDENTITY_PROOF.id).toBe(2);
  });
  it("requires all five latest categories verified", () => {
    const docs = [
      "IDENTITY_PROOF",
      "ADDRESS_PROOF",
      "INCOME_PROOF",
      "BANK_STATEMENT",
      "PROPERTY_DOCUMENT",
    ].map((documentType, i) => ({
      id: i,
      documentType,
      uploadedAt: "2026-01-01",
      verificationStatus: "VERIFIED",
    }));
    expect(allDocumentsVerified(docs)).toBe(true);
    expect(
      allDocumentsVerified([
        ...docs,
        {
          id: 10,
          documentType: "IDENTITY_PROOF",
          uploadedAt: "2026-01-02",
          verificationStatus: "PENDING",
        },
      ]),
    ).toBe(false);
  });
  it("rejects missing, empty, oversized and unsupported uploads", () => {
    expect(fileError(null)).not.toBe("");
    expect(fileError({ name: "a.exe", size: 12 })).not.toBe("");
    expect(fileError({ name: "a.pdf", size: 0 })).not.toBe("");
    expect(fileError({ name: "a.pdf", size: 5242881 })).not.toBe("");
    expect(fileError({ name: "a.JPG", size: 1024 })).toBe("");
  });
  it("matches BCrypt byte and character limits", () => {
    expect(passwordError("short")).not.toBe("");
    expect(passwordError("x".repeat(65))).not.toBe("");
    expect(passwordError("😀".repeat(20))).not.toBe("");
    expect(passwordError("A-long-demo-password")).toBe("");
  });
  it("sends only allowed application fields with months as a number", () => {
    expect(
      applicationBody({
        loanProductId: "1",
        requestedLoanAmount: "3000000",
        tenureMonths: "240",
        monthlyIncome: "100000",
        employmentType: "SALARIED",
        existingEmi: "0",
        status: "APPROVED",
      }),
    ).toEqual({
      loanProductId: 1,
      requestedLoanAmount: 3000000,
      tenureMonths: 240,
      monthlyIncome: 100000,
      employmentType: "SALARIED",
      existingEmi: 0,
    });
  });
  it("strips immutable profile fields and trims strings", () => {
    const p = profileBody({
      id: 1,
      email: "x@test.invalid",
      fullName: " Demo ",
      mobile: "9000000000",
      address: " Somewhere ",
      dateOfBirth: "1990-01-01",
      employmentType: "SALARIED",
      monthlyIncome: "1234.50",
    });
    expect(p.email).toBeUndefined();
    expect(p.fullName).toBe("Demo");
    expect(p.monthlyIncome).toBe(1234.5);
  });
  it("validates product ranges and strips response IDs", () => {
    expect(
      productError({ minimumLoanAmount: 200, maximumLoanAmount: 100 }),
    ).not.toBe("");
    expect(
      productError({
        minimumLoanAmount: 100,
        maximumLoanAmount: 200,
        minimumTenureMonths: 240,
        maximumTenureMonths: 120,
      }),
    ).not.toBe("");
    expect(
      productBody({
        id: 1,
        productName: "Demo",
        description: "Demo",
        active: true,
      }).id,
    ).toBeUndefined();
  });
  it("formats tenure without confusing years and months", () => {
    expect(tenure(240)).toBe("20 years");
    expect(tenure(13)).toBe("1 year 1 month");
  });
});
