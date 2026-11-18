import { useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Home,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useAction, useResource } from "../hooks/useResource";
import { api } from "../lib/api";
import {
  applicationBody,
  compactMoney,
  money,
  newKey,
  tenure,
} from "../lib/domain";
import {
  Button,
  DemoNote,
  ErrorNotice,
  Field,
  Loading,
  PageHeader,
  SelectField,
} from "../components/UI";
export default function ApplyPage() {
  const products = useResource("/loan-products");
  const profile = useResource("/customers/profile");
  const action = useAction();
  const { user } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const location = useLocation();
  const [form, setForm] = useState({
      loanProductId: "",
      requestedLoanAmount: "",
      tenureMonths: "240",
      monthlyIncome: "",
      employmentType: "SALARIED",
      existingEmi: "0",
    }),
    [step, setStep] = useState(0);
  const initial = useRef(false),
    key = useRef(null);
  useEffect(() => {
    if (!initial.current && products.data?.length && profile.data) {
      initial.current = true;
      const p =
        products.data.find((p) => String(p.id) === params.get("product")) ||
        products.data[0];
      const estimate = location.state?.estimate || {};
      setForm({
        loanProductId: String(p.id),
        requestedLoanAmount: String(
          Math.min(
            p.maximumLoanAmount,
            Math.max(
              p.minimumLoanAmount,
              Number(estimate.requestedLoanAmount) || 3000000,
            ),
          ),
        ),
        tenureMonths: String(
          Math.min(
            p.maximumTenureMonths,
            Math.max(
              p.minimumTenureMonths,
              Number(estimate.tenureMonths) || 240,
            ),
          ),
        ),
        monthlyIncome: String(
          estimate.monthlyIncome || profile.data.monthlyIncome,
        ),
        employmentType: profile.data.employmentType,
        existingEmi: String(estimate.existingEmi || 0),
      });
    }
  }, [products.data, profile.data, params, location.state]);
  const selected = products.data?.find(
    (p) => String(p.id) === String(form.loanProductId),
  );
  const change = (e) => {
    const next = { ...form, [e.target.name]: e.target.value };
    if (e.target.name === "loanProductId") {
      const p = products.data.find((p) => String(p.id) === e.target.value);
      if (p) {
        next.requestedLoanAmount = String(
          Math.min(
            p.maximumLoanAmount,
            Math.max(p.minimumLoanAmount, Number(form.requestedLoanAmount)),
          ),
        );
        next.tenureMonths = String(
          Math.min(
            p.maximumTenureMonths,
            Math.max(p.minimumTenureMonths, Number(form.tenureMonths)),
          ),
        );
      }
    }
    setForm(next);
    action.setError(null);
  };
  async function submit(e) {
    e.preventDefault();
    if (step < 2) {
      setStep((v) => v + 1);
      return;
    }
    await action.run(async () => {
      const body = applicationBody(form),
        signature = JSON.stringify(body),
        storageKey = `nestwell.submission.${user.userId}`;
      let stored;
      try {
        stored = JSON.parse(sessionStorage.getItem(storageKey));
      } catch {}
      if (!key.current || key.current.signature !== signature)
        key.current =
          stored?.signature === signature
            ? stored
            : { signature, value: newKey() };
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(key.current));
      } catch {}
      const { data } = await api.post("/loan-applications", body, {
        headers: { "Idempotency-Key": key.current.value },
      });
      notify("Application submitted. Your next step is to upload documents.");
      navigate(`/app/applications/${data.id}?tab=documents`, { replace: true });
    });
  }
  if (products.loading || profile.loading)
    return <Loading label="Preparing your application…" />;
  if (products.error || profile.error)
    return (
      <ErrorNotice
        error={products.error || profile.error}
        retry={() => {
          products.reload();
          profile.reload();
        }}
      />
    );
  if (!products.data?.length)
    return (
      <div className="card form-card">
        <h1>No products available yet</h1>
        <p>
          Please check again after an administrator adds an active loan product.
        </p>
        <Link to="/app" className="btn btn-primary">
          Back to overview
        </Link>
      </div>
    );
  return (
    <>
      <PageHeader
        eyebrow="A step toward your own space"
        title="Let’s begin your application."
        description="We’ll guide you through the details. You can upload your documents after submitting."
      />
      <div className="application-layout">
        <section className="card application-form-card">
          <div className="form-stepper">
            {["Loan preferences", "Financial details", "Review & submit"].map(
              (label, i) => (
                <div
                  className={
                    i === step ? "current" : i < step ? "complete" : ""
                  }
                  key={label}
                >
                  <span>{i < step ? <Check size={15} /> : i + 1}</span>
                  <strong>{label}</strong>
                </div>
              ),
            )}
          </div>
          <ErrorNotice error={action.error} />
          <form onSubmit={submit}>
            {step === 0 && (
              <div className="step-panel">
                <h2>Find your fit.</h2>
                <p className="muted">
                  Choose a product and the amount you have in mind.
                </p>
                <SelectField
                  label="Loan product"
                  name="loanProductId"
                  required
                  value={form.loanProductId}
                  onChange={change}
                  options={products.data.map((p) => ({
                    value: String(p.id),
                    label: p.productName,
                  }))}
                />
                <Field
                  label="Requested loan amount (₹)"
                  name="requestedLoanAmount"
                  type="number"
                  required
                  min={selected?.minimumLoanAmount}
                  max={selected?.maximumLoanAmount}
                  step="0.01"
                  value={form.requestedLoanAmount}
                  onChange={change}
                  hint={
                    selected
                      ? `Available from ${compactMoney(selected.minimumLoanAmount)} to ${compactMoney(selected.maximumLoanAmount)}.`
                      : ""
                  }
                />
                <Field
                  label="Loan tenure (months)"
                  name="tenureMonths"
                  type="number"
                  required
                  min={selected?.minimumTenureMonths}
                  max={selected?.maximumTenureMonths}
                  step="1"
                  value={form.tenureMonths}
                  onChange={change}
                  hint={
                    selected
                      ? `${selected.minimumTenureMonths}–${selected.maximumTenureMonths} months. ${tenure(Number(form.tenureMonths))} selected.`
                      : ""
                  }
                />
              </div>
            )}
            {step === 1 && (
              <div className="step-panel">
                <h2>Your financial picture.</h2>
                <p className="muted">
                  These details are recorded with this application.
                </p>
                <Field
                  label="Monthly income (₹)"
                  name="monthlyIncome"
                  type="number"
                  required
                  min="1"
                  max="9999999999999.99"
                  step="0.01"
                  value={form.monthlyIncome}
                  onChange={change}
                />
                <SelectField
                  label="Employment type"
                  name="employmentType"
                  value={form.employmentType}
                  onChange={change}
                  required
                  options={[
                    { value: "SALARIED", label: "Salaried" },
                    { value: "SELF_EMPLOYED", label: "Self-employed" },
                  ]}
                />
                <Field
                  label="Existing monthly EMIs (₹)"
                  name="existingEmi"
                  type="number"
                  required
                  min="0"
                  max="9999999999999.99"
                  step="0.01"
                  value={form.existingEmi}
                  onChange={change}
                />
                <div className="info-notice">
                  Not sure about affordability? Use the eligibility calculator
                  before you apply. Eligibility is only a preliminary estimate.
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="step-panel">
                <h2>One last look.</h2>
                <p className="muted">
                  Submitted application details cannot be edited. Please review
                  them carefully.
                </p>
                <dl className="review-grid">
                  {[
                    ["Applicant", user.fullName],
                    ["Loan product", selected?.productName],
                    ["Requested amount", money(form.requestedLoanAmount)],
                    ["Tenure", tenure(Number(form.tenureMonths))],
                    ["Annual interest", `${selected?.interestRate}%`],
                    ["Monthly income", money(form.monthlyIncome)],
                    ["Existing monthly EMIs", money(form.existingEmi)],
                    [
                      "Employment",
                      form.employmentType === "SALARIED"
                        ? "Salaried"
                        : "Self-employed",
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <label className="check-label">
                  <input type="checkbox" required /> I have reviewed these
                  fictional demo details and understand this is not a loan
                  approval.
                </label>
              </div>
            )}
            <div className="wizard-footer">
              {step > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={action.busy}
                  onClick={() => setStep((v) => v - 1)}
                >
                  <ArrowLeft size={16} /> Back
                </Button>
              ) : (
                <Link className="text-button" to="/app">
                  Cancel
                </Link>
              )}
              <Button type="submit" busy={action.busy}>
                {step < 2 ? "Continue" : "Submit application"}{" "}
                <ArrowRight size={17} />
              </Button>
            </div>
          </form>
        </section>
        <aside className="application-aside">
          <div className="card loan-summary">
            <span className="stat-icon teal">
              <Home size={25} />
            </span>
            <span className="eyebrow">Your chosen product</span>
            <h2>{selected?.productName}</h2>
            <div className="summary-rate">
              {selected?.interestRate}
              <span>% p.a.</span>
            </div>
            <p>{selected?.description}</p>
            <hr />
            <div>
              <span>Requested loan</span>
              <strong>{money(form.requestedLoanAmount)}</strong>
            </div>
            <div>
              <span>Tenure</span>
              <strong>{tenure(Number(form.tenureMonths))}</strong>
            </div>
          </div>
          <div className="application-reassurance">
            <ShieldCheck size={22} />
            <h3>A clear next step.</h3>
            <p>
              After submission, add your five document categories. Your assigned
              officer will take it from there.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
