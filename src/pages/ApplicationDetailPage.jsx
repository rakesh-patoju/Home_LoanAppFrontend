import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Home,
  MessageSquare,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useAction, useResource } from "../hooks/useResource";
import { api, allOfficers } from "../lib/api";
import {
  allDocumentsVerified,
  date,
  money,
  nextStatuses,
  STATUS_NAMES,
  tenure,
} from "../lib/domain";
import {
  BackLink,
  Badge,
  Button,
  ErrorNotice,
  Loading,
  Modal,
  PageHeader,
  SelectField,
  TextAreaField,
} from "../components/UI";
import DocumentPanel from "../components/DocumentPanel";
function DecisionDialog({ application, status, onClose, onSuccess }) {
  const action = useAction();
  const [remarks, setRemarks] = useState("");
  const labels = {
    UNDER_REVIEW: "Start review",
    DOCUMENT_PENDING: "Request additional documents",
    APPROVED: "Approve application",
    REJECTED: "Reject application",
    SANCTIONED: "Record sanction",
    DISBURSED: "Record demo disbursement",
  };
  async function submit(e) {
    e.preventDefault();
    await action.run(async () => {
      await api.put(`/loan-applications/${application.id}/status`, {
        status,
        remarks: remarks.trim(),
      });
      onSuccess();
    });
  }
  return (
    <Modal
      title={labels[status]}
      description={
        status === "DISBURSED"
          ? "This records a demo status only. No money will be transferred."
          : "Your decision and remarks will be visible in the application history."
      }
      onClose={onClose}
      busy={action.busy}
    >
      <ErrorNotice error={action.error} />
      <form onSubmit={submit}>
        <div className="decision-transition">
          <Badge status={application.status} />
          <ArrowRight size={17} />
          <Badge status={status} />
        </div>
        <TextAreaField
          label="Decision remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          required
          maxLength={1000}
          placeholder={
            status === "DOCUMENT_PENDING"
              ? "Tell the customer exactly which document is needed…"
              : "Explain this decision…"
          }
        />
        <div className="modal-actions">
          <Button
            variant="outline"
            type="button"
            disabled={action.busy}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant={status === "REJECTED" ? "danger" : "primary"}
            type="submit"
            busy={action.busy}
          >
            {labels[status]}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
function RemarkDialog({ id, onClose, onSuccess }) {
  const action = useAction();
  const [remarks, setRemarks] = useState("");
  async function submit(e) {
    e.preventDefault();
    await action.run(async () => {
      await api.post(`/loan-applications/${id}/remarks`, {
        remarks: remarks.trim(),
      });
      onSuccess();
    });
  }
  return (
    <Modal
      title="Add a remark"
      description="This note will be visible to the customer in their activity history."
      onClose={onClose}
      busy={action.busy}
    >
      <ErrorNotice error={action.error} />
      <form onSubmit={submit}>
        <TextAreaField
          label="Remark"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          required
          maxLength={1000}
        />
        <div className="modal-actions">
          <Button
            variant="outline"
            type="button"
            disabled={action.busy}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" busy={action.busy}>
            Add remark
          </Button>
        </div>
      </form>
    </Modal>
  );
}
function AssignmentDialog({ application, onClose, onSuccess }) {
  const action = useAction();
  const [officers, setOfficers] = useState(null),
    [loadError, setLoadError] = useState(null),
    [selected, setSelected] = useState(application.assignedOfficerId || "");
  useEffect(() => {
    let active = true;
    allOfficers()
      .then((o) => {
        if (active) setOfficers(o.filter((x) => x.enabled));
      })
      .catch((e) => {
        if (active) setLoadError(e);
      });
    return () => {
      active = false;
    };
  }, []);
  async function submit(e) {
    e.preventDefault();
    await action.run(async () => {
      await api.put(`/loan-applications/${application.id}/assignment`, {
        officerId: Number(selected),
      });
      onSuccess();
    });
  }
  return (
    <Modal
      title="Assign loan officer"
      description="Only the assigned officer and administrators can review this application."
      onClose={onClose}
      busy={action.busy}
    >
      <ErrorNotice error={loadError || action.error} />
      {!officers && !loadError ? (
        <Loading label="Loading loan officers…" />
      ) : (
        <form onSubmit={submit}>
          <SelectField
            label="Loan officer"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            required
            options={[
              { value: "", label: "Select an active loan officer" },
              ...(officers || []).map((o) => ({
                value: o.id,
                label: `${o.fullName} · ${o.email}`,
              })),
            ]}
          />
          {officers?.length === 0 && (
            <p className="muted">
              Create or enable an officer in Loan officer management first.
            </p>
          )}
          <div className="modal-actions">
            <Button
              variant="outline"
              type="button"
              disabled={action.busy}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              busy={action.busy}
              disabled={!selected || !officers?.length}
            >
              Save assignment
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
function ProgressTrack({ status }) {
  const steps = [
    "SUBMITTED",
    "UNDER_REVIEW",
    "APPROVED",
    "SANCTIONED",
    "DISBURSED",
  ];
  const index = status === "DOCUMENT_PENDING" ? 1 : steps.indexOf(status);
  return (
    <div
      className={`progress-track ${status === "REJECTED" ? "rejected-track" : ""}`}
    >
      {steps.map((s, i) => (
        <div
          key={s}
          className={
            status === "REJECTED"
              ? ""
              : i < index
                ? "complete"
                : i === index
                  ? "current"
                  : ""
          }
        >
          <span>{i < index ? <Check size={14} /> : i + 1}</span>
          <small>{STATUS_NAMES[s]}</small>
        </div>
      ))}
    </div>
  );
}
export default function ApplicationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const staff = user.role !== "CUSTOMER";
  const application = useResource(`/loan-applications/${id}`),
    documents = useResource(`/loan-applications/${id}/documents`, []),
    history = useResource(`/loan-applications/${id}/history`, []),
    customer = useResource(staff ? `/loan-applications/${id}/customer` : null);
  const [params, setParams] = useSearchParams();
  const tab = ["overview", "documents", "history"].includes(params.get("tab"))
    ? params.get("tab")
    : "overview";
  const [dialog, setDialog] = useState(null);
  const notify = useToast();
  const refresh = () => {
    application.reload();
    documents.reload();
    history.reload();
  };
  const done = (message) => {
    setDialog(null);
    notify(message);
    refresh();
  };
  if (application.loading)
    return <Loading label="Loading application details…" />;
  if (application.error)
    return (
      <>
        <BackLink />
        <ErrorNotice error={application.error} retry={application.reload} />
      </>
    );
  const a = application.data;
  const actions = nextStatuses(a.status, user.role);
  const verified =
    !documents.error &&
    !documents.loading &&
    allDocumentsVerified(documents.data || []);
  return (
    <>
      <BackLink />
      <PageHeader
        eyebrow={a.referenceNumber}
        title={a.productName}
        description={`Submitted ${date(a.applicationDate)} · ${a.customerName}`}
        action={
          <div className="detail-header-actions">
            <Badge status={a.status} />
            <button
              className="icon-button"
              onClick={refresh}
              aria-label="Refresh application"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        }
      />
      <section className="card progress-card">
        <ProgressTrack status={a.status} />
        {a.status === "DOCUMENT_PENDING" && (
          <div className="info-notice">
            Your officer needs additional documents. Check the latest remarks in
            Activity & history.
          </div>
        )}
        {a.status === "REJECTED" && (
          <div className="info-notice">
            This application was rejected and is closed. Read the decision
            remarks in Activity & history.
          </div>
        )}
      </section>
      <div className="detail-layout">
        <section className="card detail-main">
          <nav className="detail-tabs" aria-label="Application sections">
            {[
              ["overview", "Overview", Home],
              ["documents", "Documents", FileText],
              ["history", "Activity & history", Clock3],
            ].map(([value, label, Icon]) => (
              <button
                key={value}
                className={tab === value ? "active" : ""}
                onClick={() => setParams({ tab: value }, { replace: true })}
                aria-current={tab === value ? "page" : undefined}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>
          <div className="detail-panel">
            {tab === "overview" && (
              <>
                <h2>Application details</h2>
                <dl className="detail-facts">
                  {[
                    ["Requested amount", money(a.requestedLoanAmount)],
                    ["Loan tenure", tenure(a.tenureMonths)],
                    ["Annual interest rate", `${a.interestRate}%`],
                    ["Monthly income", money(a.monthlyIncome)],
                    ["Existing monthly EMIs", money(a.existingEmi)],
                    [
                      "Employment type",
                      a.employmentType === "SALARIED"
                        ? "Salaried"
                        : "Self-employed",
                    ],
                    ["Submitted on", date(a.applicationDate, true)],
                    [
                      "Loan officer",
                      a.assignedOfficerName || "Awaiting assignment",
                    ],
                  ].map(([name, value]) => (
                    <div key={name}>
                      <dt>{name}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="info-notice">
                  Financial details are recorded at submission and cannot be
                  edited. Product interest rates are snapshotted when you apply.
                </div>
                {staff && (
                  <section className="customer-information">
                    <h2>Customer information</h2>
                    {customer.loading ? (
                      <Loading />
                    ) : customer.error ? (
                      <ErrorNotice
                        error={customer.error}
                        retry={customer.reload}
                      />
                    ) : (
                      customer.data && (
                        <dl className="detail-facts">
                          {[
                            ["Full name", customer.data.fullName],
                            ["Email", customer.data.email],
                            ["Mobile", customer.data.mobile],
                            ["Date of birth", date(customer.data.dateOfBirth)],
                            ["Address", customer.data.address],
                          ].map(([k, v]) => (
                            <div key={k}>
                              <dt>{k}</dt>
                              <dd>{v}</dd>
                            </div>
                          ))}
                        </dl>
                      )
                    )}
                  </section>
                )}
              </>
            )}
            {tab === "documents" &&
              (documents.loading ? (
                <Loading label="Loading documents…" />
              ) : documents.error ? (
                <ErrorNotice error={documents.error} retry={documents.reload} />
              ) : (
                <DocumentPanel
                  application={a}
                  documents={documents.data || []}
                  role={user.role}
                  onRefresh={refresh}
                />
              ))}
            {tab === "history" && (
              <>
                <h2>Every step, recorded.</h2>
                <p className="muted">
                  Status changes, assignments and remarks in chronological
                  order.
                </p>
                {history.loading ? (
                  <Loading />
                ) : history.error ? (
                  <ErrorNotice error={history.error} retry={history.reload} />
                ) : (
                  <ol className="activity-timeline">
                    {(history.data || []).map((h) => (
                      <li key={h.id}>
                        <span className="timeline-marker">
                          {h.fromStatus === h.toStatus ? (
                            <MessageSquare size={16} />
                          ) : (
                            <Check size={16} />
                          )}
                        </span>
                        <div>
                          <div className="timeline-top">
                            <strong>
                              {h.fromStatus === h.toStatus
                                ? "Application update"
                                : STATUS_NAMES[h.toStatus]}
                            </strong>
                            <time>{date(h.changedAt, true)}</time>
                          </div>
                          <p>{h.remarks}</p>
                          <small>{h.changedByName}</small>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </>
            )}
          </div>
        </section>
        <aside className="detail-aside">
          <div className="card review-summary">
            <span className="stat-icon teal">
              <UserRound size={23} />
            </span>
            <h2>{staff ? "Review workspace" : "Your loan officer"}</h2>
            <p>
              {a.assignedOfficerName ||
                "An officer will be assigned to your application."}
            </p>
            {staff ? (
              <>
                <div className="verification-summary">
                  <CheckCircle2 size={18} />
                  <span>
                    {verified
                      ? "All required documents verified"
                      : "Documents need attention"}
                  </span>
                </div>
                {actions.length > 0 && (
                  <div className="review-actions">
                    {actions.map((status) => (
                      <Button
                        key={status}
                        variant={
                          status === "REJECTED"
                            ? "danger-outline"
                            : status === "DOCUMENT_PENDING"
                              ? "outline"
                              : "primary"
                        }
                        disabled={status === "APPROVED" && !verified}
                        onClick={() => setDialog({ kind: "status", status })}
                      >
                        {
                          {
                            UNDER_REVIEW: "Start review",
                            DOCUMENT_PENDING: "Request documents",
                            APPROVED: "Approve application",
                            REJECTED: "Reject application",
                            SANCTIONED: "Record sanction",
                            DISBURSED: "Record disbursement",
                          }[status]
                        }
                      </Button>
                    ))}
                  </div>
                )}
                <button
                  className="text-button mt-3"
                  onClick={() => setDialog({ kind: "remark" })}
                >
                  <MessageSquare size={16} /> Add remark
                </button>
                {user.role === "ADMIN" &&
                  !["REJECTED", "DISBURSED"].includes(a.status) && (
                    <button
                      className="text-button mt-3"
                      onClick={() => setDialog({ kind: "assignment" })}
                    >
                      <UserRound size={16} />{" "}
                      {a.assignedOfficerId
                        ? "Reassign officer"
                        : "Assign officer"}
                    </button>
                  )}
              </>
            ) : (
              <>
                <p className="muted small">
                  Updates from your officer will appear in your application
                  history.
                </p>
                <button
                  className="btn btn-outline w-100"
                  onClick={() => setParams({ tab: "history" })}
                >
                  View updates <ArrowRight size={16} />
                </button>
              </>
            )}
          </div>
          <div className="detail-aside-note">
            <FileText size={21} />
            <strong>A complete checklist helps.</strong>
            <p>
              Identity, address, income, bank statements and property documents
              are all required for approval.
            </p>
            <button
              className="text-button"
              onClick={() => setParams({ tab: "documents" })}
            >
              View documents <ArrowRight size={15} />
            </button>
          </div>
        </aside>
      </div>
      {dialog?.kind === "status" && (
        <DecisionDialog
          application={a}
          status={dialog.status}
          onClose={() => setDialog(null)}
          onSuccess={() => done("Application status updated.")}
        />
      )}
      {dialog?.kind === "remark" && (
        <RemarkDialog
          id={a.id}
          onClose={() => setDialog(null)}
          onSuccess={() => done("Remark added to the application history.")}
        />
      )}
      {dialog?.kind === "assignment" && (
        <AssignmentDialog
          application={a}
          onClose={() => setDialog(null)}
          onSuccess={() => done("Loan officer assignment updated.")}
        />
      )}
    </>
  );
}
