import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Info,
  RefreshCw,
} from "lucide-react";
import { useAction, useResource } from "../hooks/useResource";
import { api } from "../lib/api";
import { money } from "../lib/domain";
import {
  Button,
  DemoNote,
  ErrorNotice,
  Field,
  PageHeader,
} from "../components/UI";
export default function EligibilityPage() {
  const profile = useResource("/customers/profile");
  const action = useAction();
  const [form, setForm] = useState({
      monthlyIncome: "",
      existingEmi: "0",
      requestedLoanAmount: "3000000",
      tenureMonths: "240",
      interestRate: "8.5",
    }),
    [result, setResult] = useState(null);
  useEffect(() => {
    if (profile.data)
      setForm((v) => ({
        ...v,
        monthlyIncome: v.monthlyIncome || String(profile.data.monthlyIncome),
      }));
  }, [profile.data]);
  const change = (e) => {
    setForm((v) => ({ ...v, [e.target.name]: e.target.value }));
    setResult(null);
  };
  async function submit(e) {
    e.preventDefault();
    await action.run(async () => {
      const { data } = await api.post(
        "/eligibility/check",
        Object.fromEntries(
          Object.entries(form).map(([k, v]) => [k, Number(v)]),
        ),
      );
      setResult(data);
    });
  }
  return (
    <>
      <PageHeader
        eyebrow="Plan with a little more clarity"
        title="What could your home loan look like?"
        description="Get a preliminary estimate based on your income, existing EMIs and preferred loan details."
      />
      <div className="calculator-layout">
        <section className="card form-card">
          <div className="card-heading p-0 mb-4">
            <div>
              <h2>Your financial picture</h2>
              <p>Adjust the details to explore an estimate.</p>
            </div>
            <span className="stat-icon teal">
              <Calculator size={22} />
            </span>
          </div>
          <ErrorNotice error={action.error} />
          <form onSubmit={submit}>
            <div className="form-grid">
              <Field
                label="Monthly income (₹)"
                name="monthlyIncome"
                type="number"
                required
                min="1"
                max="1000000000"
                step="0.01"
                value={form.monthlyIncome}
                onChange={change}
              />
              <Field
                label="Existing monthly EMIs (₹)"
                name="existingEmi"
                type="number"
                required
                min="0"
                max="1000000000"
                step="0.01"
                value={form.existingEmi}
                onChange={change}
              />
            </div>
            <Field
              label="Requested loan amount (₹)"
              name="requestedLoanAmount"
              type="number"
              required
              min="1"
              max="10000000000"
              step="0.01"
              value={form.requestedLoanAmount}
              onChange={change}
            />
            <div className="form-grid">
              <Field
                label="Loan tenure (months)"
                name="tenureMonths"
                type="number"
                required
                min="12"
                max="360"
                step="1"
                value={form.tenureMonths}
                onChange={change}
                hint="For example, 240 months = 20 years."
              />
              <Field
                label="Annual interest rate (%)"
                name="interestRate"
                type="number"
                required
                min="0"
                max="30"
                step="0.01"
                value={form.interestRate}
                onChange={change}
              />
            </div>
            <Button type="submit" busy={action.busy} className="w-100">
              Calculate my estimate <ArrowRight size={17} />
            </Button>
          </form>
          <div className="info-footnote">
            <Info size={16} />
            <span>
              Existing EMIs and the estimated new EMI are both included in your
              debt-to-income ratio.
            </span>
          </div>
        </section>
        <aside
          className={`estimate-card ${result ? "has-result" : ""}`}
          aria-live="polite"
        >
          <div className="eyebrow">Your preliminary estimate</div>
          {result ? (
            <>
              <div
                className={`eligibility-pill ${result.eligible ? "positive" : "caution"}`}
              >
                <CheckCircle2 size={17} />
                {result.eligible
                  ? "Meets preliminary criteria"
                  : "Does not meet preliminary criteria"}
              </div>
              <span className="emi-label">Estimated monthly EMI</span>
              <strong className="emi-amount">
                {money(result.estimatedMonthlyEmi, 2)}
              </strong>
              <div className="dti-label">
                <span>Debt-to-income ratio</span>
                <strong>{result.debtToIncomePercent}%</strong>
              </div>
              <div className="dti-track">
                <span
                  style={{
                    width: `${Math.min(Number(result.debtToIncomePercent), 100)}%`,
                  }}
                />
              </div>
              <div className="estimate-facts">
                <div>
                  <span>Maximum permitted DTI</span>
                  <strong>{result.maxDtiPercent}%</strong>
                </div>
                <div>
                  <span>Minimum monthly income</span>
                  <strong>{money(result.minimumMonthlyIncome)}</strong>
                </div>
              </div>
              <p className="estimate-disclaimer">{result.disclaimer}</p>
              <Link
                to="/app/apply"
                state={{ estimate: form }}
                className="btn btn-cream w-100"
              >
                Use these details <ArrowRight size={17} />
              </Link>
            </>
          ) : (
            <div className="estimate-placeholder">
              <span>
                <Calculator size={40} strokeWidth={1} />
              </span>
              <h2>
                A clearer picture
                <br />
                starts here.
              </h2>
              <p>
                Enter your details and calculate an estimate. Your EMI and
                preliminary eligibility will appear here.
              </p>
            </div>
          )}
        </aside>
      </div>
      <div className="mt-4">
        <DemoNote>
          Preliminary eligibility is not a credit check, loan offer or actual
          bank approval.
        </DemoNote>
      </div>
    </>
  );
}
