import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAction } from "../hooks/useResource";
import {
  Button,
  ErrorNotice,
  Field,
  SelectField,
  TextAreaField,
} from "../components/UI";
import { adultDate, passwordError, profileBody } from "../lib/domain";
import HouseArt from "../components/HouseArt";
export const emptyProfile = {
  fullName: "",
  mobile: "",
  dateOfBirth: "",
  address: "",
  employmentType: "SALARIED",
  monthlyIncome: "",
};
export function ProfileFields({ form, setForm, includeName = true }) {
  const change = (e) =>
    setForm((v) => ({ ...v, [e.target.name]: e.target.value }));
  return (
    <>
      {includeName && (
        <Field
          label="Full name"
          name="fullName"
          value={form.fullName}
          onChange={change}
          required
          maxLength={100}
          autoComplete="name"
        />
      )}
      <div className="form-grid">
        <Field
          label="Mobile number"
          name="mobile"
          value={form.mobile}
          onChange={change}
          required
          pattern="[0-9]{10,15}"
          title="Enter 10 to 15 digits"
          maxLength={15}
          inputMode="tel"
          autoComplete="tel"
        />
        <Field
          label="Date of birth"
          name="dateOfBirth"
          value={form.dateOfBirth}
          onChange={change}
          required
          type="date"
          max={adultDate()}
          autoComplete="bday"
          hint="You must be at least 18 years old."
        />
      </div>
      <TextAreaField
        label="Address"
        name="address"
        value={form.address}
        onChange={change}
        required
        maxLength={500}
        autoComplete="street-address"
      />
      <div className="form-grid">
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
          label="Monthly income (₹)"
          name="monthlyIncome"
          value={form.monthlyIncome}
          onChange={change}
          required
          type="number"
          min="0"
          max="9999999999999.99"
          step="0.01"
        />
      </div>
    </>
  );
}
export function PasswordField({
  value,
  onChange,
  label = "Password",
  autoComplete = "current-password",
  minLength,
}) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} required>
      {(id) => (
        <div className="password-field">
          <input
            id={id}
            className="form-control"
            type={visible ? "text" : "password"}
            value={value}
            onChange={onChange}
            required
            minLength={minLength}
            maxLength={64}
            autoComplete={autoComplete}
          />
          <button
            type="button"
            className="icon-button"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      )}
    </Field>
  );
}
export function LoginPage() {
  const { login, expired } = useAuth();
  const action = useAction();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  async function submit(e) {
    e.preventDefault();
    await action.run(async () => {
      await login({ email: email.trim().toLowerCase(), password });
      const from = location.state?.from;
      navigate(
        typeof from === "string" && from.startsWith("/app") ? from : "/app",
        { replace: true },
      );
    });
  }
  return (
    <div className="container auth-page">
      <div className="auth-story">
        <div className="eyebrow">Welcome to your next chapter</div>
        <h1>
          Your home journey.
          <br />
          <em>All in one place.</em>
        </h1>
        <p>A simpler way to apply, share documents and stay in the loop.</p>
        <HouseArt />
        <div className="auth-story-footer">
          <ShieldCheck size={20} /> A connected workspace for every step.
        </div>
      </div>
      <div className="auth-card">
        <div className="eyebrow">Good to see you</div>
        <h2>Welcome back.</h2>
        <p>Log in to pick up where you left off.</p>
        {expired && (
          <div className="info-notice">
            Your session has ended. Please log in again.
          </div>
        )}
        <ErrorNotice error={action.error} compact />
        <form onSubmit={submit}>
          <Field
            label="Email address"
            type="email"
            required
            autoComplete="username"
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <PasswordField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button busy={action.busy} className="w-100 mt-2" type="submit">
            Log in to your workspace <ArrowRight size={17} />
          </Button>
        </form>
        <p className="auth-alternative">
          New to Nestwell? <Link to="/register">Create an account</Link>
        </p>
        <div className="auth-demo">
          <ShieldCheck size={17} />
          <span>
            For seeded demo accounts, use the credentials generated by your
            backend setup.
          </span>
        </div>
      </div>
    </div>
  );
}
export function RegisterPage() {
  const { register } = useAuth();
  const action = useAction();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ...emptyProfile,
    email: "",
    password: "",
  });
  async function submit(e) {
    e.preventDefault();
    const validation = passwordError(form.password);
    if (validation) {
      action.setError(validation);
      return;
    }
    await action.run(async () => {
      await register({
        ...profileBody(form),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      navigate("/app", { replace: true });
    });
  }
  return (
    <div className="container register-page">
      <div className="registration-intro">
        <div className="eyebrow">A fresh start</div>
        <h1>
          Make room for
          <br />
          <em>what comes next.</em>
        </h1>
        <p>
          Create your customer account to explore products, check a preliminary
          estimate and begin your application.
        </p>
        <div className="registration-step">
          <span>01</span>
          <div>
            <strong>A little about you</strong>
            <p>Your personal and contact details.</p>
          </div>
        </div>
        <div className="registration-step">
          <span>02</span>
          <div>
            <strong>A clear picture</strong>
            <p>Your employment and monthly income.</p>
          </div>
        </div>
        <div className="registration-step">
          <span>03</span>
          <div>
            <strong>A place to begin</strong>
            <p>Your own home loan workspace.</p>
          </div>
        </div>
        <p className="muted small">
          Fictional demo only. Please do not enter real sensitive information.
        </p>
      </div>
      <div className="card registration-card">
        <h2>Create your account</h2>
        <p className="muted">
          Already registered? <Link to="/login">Log in</Link>
        </p>
        <ErrorNotice error={action.error} />
        <form onSubmit={submit}>
          <ProfileFields form={form} setForm={setForm} />
          <Field
            label="Email address"
            type="email"
            required
            autoComplete="email"
            maxLength={254}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <PasswordField
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="new-password"
            minLength={10}
          />
          <small className="field-hint d-block mb-3">
            Use 10–64 characters, with no more than 72 UTF-8 bytes.
          </small>
          <Button type="submit" busy={action.busy} className="w-100">
            Create customer account <ArrowRight size={17} />
          </Button>
        </form>
      </div>
    </div>
  );
}
