import { useEffect, useId, useRef } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  Home,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { errorMessage } from "../lib/api";
import { STATUS_NAMES } from "../lib/domain";
export function Brand({ light = false }) {
  return (
    <Link
      to="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="Nestwell home"
    >
      <span className="brand-icon">
        <Home size={23} strokeWidth={1.8} />
      </span>
      <span>
        nestwell<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
export function Badge({ status }) {
  return (
    <span className={`status-badge status-${status?.toLowerCase()}`}>
      <span />
      {STATUS_NAMES[status] || status}
    </span>
  );
}
export function Button({
  children,
  busy = false,
  variant = "primary",
  className = "",
  ...props
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || busy}
      className={`btn btn-${variant} ${className}`}
      aria-busy={busy}
    >
      {busy && <LoaderCircle className="spin" size={17} />} {children}
    </button>
  );
}
export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="page-heading-action">{action}</div>}
    </header>
  );
}
export function Loading({ label = "Loading your workspace…" }) {
  return (
    <div className="loading-state" role="status">
      <LoaderCircle className="spin" size={26} />
      <p>{label}</p>
      <div className="skeleton-lines">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}
export function ErrorNotice({ error, retry, compact = false }) {
  if (!error) return null;
  const fields = error?.response?.data?.fieldErrors;
  return (
    <div className={`error-notice ${compact ? "compact" : ""}`} role="alert">
      <AlertCircle size={20} />
      <div>
        <strong>{errorMessage(error)}</strong>
        {fields && Object.keys(fields).length > 0 && (
          <ul>
            {Object.entries(fields).map(([name, message]) => (
              <li key={name}>
                {name.replace(/([A-Z])/g, " $1")}: {message}
              </li>
            ))}
          </ul>
        )}
        {retry && (
          <button className="text-button" onClick={retry}>
            <RefreshCw size={15} /> Try again
          </button>
        )}
      </div>
    </div>
  );
}
export function EmptyState({
  title = "Nothing here yet",
  description,
  action,
}) {
  return (
    <div className="empty-state">
      <span>
        <FileSearch size={30} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function Field({
  label,
  hint,
  error,
  children,
  className = "",
  ...props
}) {
  const id = useId();
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>
        {label}
        {props.required && (
          <span className="required-dot" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children ? (
        children(id)
      ) : (
        <input
          id={id}
          className={`form-control ${error ? "is-invalid" : ""}`}
          aria-describedby={hint ? `${id}-hint` : undefined}
          {...props}
        />
      )}
      {hint && (
        <small id={`${id}-hint`} className="field-hint">
          {hint}
        </small>
      )}
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}
export function SelectField({ label, options, hint, ...props }) {
  return (
    <Field label={label} hint={hint} required={props.required}>
      {(id) => (
        <select id={id} className="form-select" {...props}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}
export function TextAreaField({ label, ...props }) {
  return (
    <Field label={label} required={props.required}>
      {(id) => (
        <textarea id={id} rows={3} className="form-control" {...props} />
      )}
    </Field>
  );
}
export function Modal({ title, description, children, onClose, busy = false }) {
  const ref = useRef(),
    id = useId();
  useEffect(() => {
    const el = ref.current;
    el.showModal();
    return () => {
      if (el.open) el.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="app-modal"
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !busy) onClose();
      }}
    >
      <div className="modal-heading">
        <div>
          <h2 id={id}>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          disabled={busy}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Pagination({ data, page, onChange }) {
  if (!data) return null;
  return (
    <div className="pagination-bar">
      <span>
        {data.totalElements
          ? `${page * data.size + 1}–${Math.min((page + 1) * data.size, data.totalElements)} of ${data.totalElements}`
          : "0 results"}
      </span>
      <div>
        <button
          aria-label="Previous page"
          className="icon-button"
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft size={18} />
        </button>
        <span>
          Page {page + 1} of {Math.max(data.totalPages, 1)}
        </span>
        <button
          aria-label="Next page"
          className="icon-button"
          disabled={page + 1 >= data.totalPages}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
export function BackLink({
  to = "/app/applications",
  children = "Back to applications",
}) {
  return (
    <Link to={to} className="back-link">
      <ArrowLeft size={16} />
      {children}
    </Link>
  );
}
export function DemoNote({ children }) {
  return (
    <div className="demo-note">
      <ShieldCheck size={17} />
      <span>
        {children ||
          "Portfolio demonstration. Use fictional information and documents only."}
      </span>
    </div>
  );
}
export function CheckItem({ children }) {
  return (
    <div className="check-item">
      <Check size={16} />
      {children}
    </div>
  );
}
export function ActionLink({ to, children, variant = "primary" }) {
  return (
    <Link className={`btn btn-${variant}`} to={to}>
      {children}
      <ArrowRight size={17} />
    </Link>
  );
}
