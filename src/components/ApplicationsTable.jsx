import { Link } from "react-router-dom";
import { ArrowUpRight, Home } from "lucide-react";
import { Badge, EmptyState } from "./UI";
import { compactMoney, date } from "../lib/domain";
export default function ApplicationsTable({
  applications = [],
  staff = false,
}) {
  if (!applications.length)
    return (
      <EmptyState
        title="No applications yet"
        description={
          staff
            ? "Applications will appear here when they are submitted or assigned."
            : "Your home loan journey begins with your first application."
        }
        action={
          !staff && (
            <Link className="btn btn-primary" to="/app/apply">
              Start an application
            </Link>
          )
        }
      />
    );
  return (
    <div className="table-responsive">
      <table className="table app-table">
        <thead>
          <tr>
            <th>Application</th>
            {staff && <th>Customer</th>}
            <th>Loan amount</th>
            <th>Status</th>
            <th>Submitted</th>
            <th>
              <span className="visually-hidden">Open application</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map((a) => (
            <tr key={a.id}>
              <td>
                <Link
                  className="application-link"
                  to={`/app/applications/${a.id}`}
                >
                  <span className="table-house">
                    <Home size={18} />
                  </span>
                  <span>
                    <strong>{a.productName}</strong>
                    <small title={a.referenceNumber}>
                      {a.referenceNumber.length > 20
                        ? `${a.referenceNumber.slice(0, 16)}…`
                        : a.referenceNumber}
                    </small>
                  </span>
                </Link>
              </td>
              {staff && <td>{a.customerName}</td>}
              <td className="money-cell">
                {compactMoney(a.requestedLoanAmount)}
              </td>
              <td>
                <Badge status={a.status} />
              </td>
              <td className="muted no-wrap">{date(a.applicationDate)}</td>
              <td>
                <Link
                  className="icon-button"
                  to={`/app/applications/${a.id}`}
                  aria-label={`View ${a.referenceNumber}`}
                >
                  <ArrowUpRight size={18} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
