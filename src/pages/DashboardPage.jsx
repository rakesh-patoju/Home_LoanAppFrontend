import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ClipboardList,
  FileCheck2,
  Plus,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useResource } from "../hooks/useResource";
import { ErrorNotice, Loading, PageHeader } from "../components/UI";
import ApplicationsTable from "../components/ApplicationsTable";
import HouseArt from "../components/HouseArt";
export default function DashboardPage() {
  const { user } = useAuth();
  const staff = user.role !== "CUSTOMER";
  const resource = useResource(
    `/dashboard/${user.role === "ADMIN" ? "admin" : user.role === "LOAN_OFFICER" ? "officer" : "customer"}`,
  );
  if (resource.loading) return <Loading />;
  if (resource.error)
    return <ErrorNotice error={resource.error} retry={resource.reload} />;
  const d = resource.data;
  const first = user.fullName.split(" ")[0];
  const stats = [
    [
      ClipboardList,
      user.role === "LOAN_OFFICER"
        ? "Assigned applications"
        : "Total applications",
      d.totalApplications,
      "teal",
    ],
    [
      user.role === "LOAN_OFFICER" ? FileCheck2 : Clock3,
      user.role === "LOAN_OFFICER" ? "Pending verification" : "In progress",
      user.role === "LOAN_OFFICER"
        ? d.pendingVerification
        : d.pendingApplications,
      "amber",
    ],
    [CheckCircle2, "Approved & beyond", d.approvedApplications, "green"],
    [XCircle, "Rejected", d.rejectedApplications, "rose"],
  ];
  const total = d.totalApplications;
  const pending = total ? (d.pendingApplications / total) * 100 : 0,
    approved = total ? (d.approvedApplications / total) * 100 : 0;
  return (
    <>
      <PageHeader
        eyebrow={new Intl.DateTimeFormat("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }).format(new Date())}
        title={`Hello, ${first}.`}
        description={
          staff
            ? "Here’s the latest across your loan workspace."
            : "A new home starts with a clear view of what’s next."
        }
        action={
          <Link
            className="btn btn-primary"
            to={staff ? "/app/applications" : "/app/apply"}
          >
            {staff ? <ClipboardList size={17} /> : <Plus size={17} />}{" "}
            {staff ? "Review applications" : "New application"}
          </Link>
        }
      />
      <section className="dashboard-hero">
        <div>
          <div className="hero-small-label">
            <span />{" "}
            {staff
              ? "Every application. A little more clarity."
              : "Your next chapter starts here."}
          </div>
          <h2>
            {staff
              ? "Keep good things moving."
              : "A place for your plans to grow."}
          </h2>
          <p>
            {user.role === "ADMIN"
              ? `Manage ${d.totalCustomers} registered customers, your lending products and every stage of the application journey.`
              : staff
                ? "Review documents, share useful remarks and help each application take its next step."
                : "Explore your options, get a preliminary estimate, and take the next step at your own pace."}
          </p>
          <Link to={staff ? "/app/applications" : "/app/eligibility"}>
            {staff ? "Open application workspace" : "Check my eligibility"}{" "}
            <ArrowRight size={17} />
          </Link>
        </div>
        <HouseArt />
      </section>
      <section className="stat-grid">
        {stats.map(([Icon, label, value, color]) => (
          <article className="stat-card" key={label}>
            <span className={`stat-icon ${color}`}>
              <Icon size={20} />
            </span>
            <span className="stat-label">{label}</span>
            <strong>{value}</strong>
            <small>
              {label === "Approved & beyond"
                ? "Includes sanctioned & disbursed"
                : label === "Pending verification"
                  ? "Missing or unverified documents"
                  : "Across your applications"}
            </small>
          </article>
        ))}
      </section>
      <div className="dashboard-grid">
        <section className="card recent-card">
          <div className="card-heading">
            <div>
              <h2>Recent applications</h2>
              <p>Your latest activity, at a glance.</p>
            </div>
            <Link to="/app/applications" className="text-button">
              View all <ArrowUpRight size={16} />
            </Link>
          </div>
          <ApplicationsTable
            applications={d.recentApplications}
            staff={staff}
          />
        </section>
        <aside className="card distribution-card">
          <h2>Application overview</h2>
          <p className="muted small">A clear picture of your progress.</p>
          <div
            className="donut"
            role="img"
            aria-label={`${d.pendingApplications} in progress, ${d.approvedApplications} approved or beyond, ${d.rejectedApplications} rejected`}
            style={{
              background: total
                ? `conic-gradient(#d8a768 0 ${pending}%,#397a67 ${pending}% ${pending + approved}%,#b97973 ${pending + approved}% 100%)`
                : "#e7ece7",
            }}
          >
            <div>
              <strong>{total}</strong>
              <span>applications</span>
            </div>
          </div>
          <div className="chart-legend">
            {[
              ["#d8a768", "In progress", d.pendingApplications],
              ["#397a67", "Approved & beyond", d.approvedApplications],
              ["#b97973", "Rejected", d.rejectedApplications],
            ].map(([color, label, count]) => (
              <div key={label}>
                <span>
                  <i style={{ background: color }} />
                  {label}
                </span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </aside>
      </div>
      <section className="next-step-card">
        <span className="stat-icon teal">
          <ShieldCheck size={23} />
        </span>
        <div>
          <h3>
            {staff
              ? "A thoughtful review makes all the difference."
              : "Your documents, all in one place."}
          </h3>
          <p>
            {staff
              ? "Verify the latest document in each required category before approving an application."
              : "Keep your identity, address, income, bank and property documents ready for review."}
          </p>
        </div>
        <Link
          to="/app/applications"
          className="icon-button"
          aria-label="Go to applications"
        >
          <ArrowRight size={20} />
        </Link>
      </section>
    </>
  );
}
