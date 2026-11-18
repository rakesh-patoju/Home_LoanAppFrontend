import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useResource } from "../hooks/useResource";
import {
  EmptyState,
  ErrorNotice,
  Loading,
  PageHeader,
  Pagination,
} from "../components/UI";
import ApplicationsTable from "../components/ApplicationsTable";
export default function ApplicationsPage() {
  const { user } = useAuth();
  const staff = user.role !== "CUSTOMER";
  const [page, setPage] = useState(0),
    [search, setSearch] = useState(""),
    [sort, setSort] = useState("applicationDate,desc");
  const resource = useResource(
    `/loan-applications${staff ? "" : "/my-applications"}?page=${page}&size=10&sort=${sort}`,
  );
  const filtered = useMemo(
    () =>
      (resource.data?.content || []).filter((a) =>
        `${a.referenceNumber} ${a.productName} ${a.customerName} ${a.status}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [resource.data, search],
  );
  return (
    <>
      <PageHeader
        eyebrow={staff ? "Application workspace" : "Your home loan journey"}
        title={
          user.role === "ADMIN"
            ? "Every application. One clear view."
            : staff
              ? "Your assigned applications."
              : "Your plans, in progress."
        }
        description={
          staff
            ? "Review applications, verify documents and keep each journey moving."
            : "Track your submissions, add documents and follow every update."
        }
        action={
          !staff && (
            <Link to="/app/apply" className="btn btn-primary">
              <Plus size={17} /> New application
            </Link>
          )
        }
      />
      <section className="card">
        <div className="table-toolbar">
          <div className="search-field">
            <Search size={18} />
            <input
              aria-label="Search this page"
              placeholder="Search this page…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="table-toolbar-actions">
            <select
              className="form-select"
              aria-label="Sort applications"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(0);
              }}
            >
              <option value="applicationDate,desc">Newest first</option>
              <option value="applicationDate,asc">Oldest first</option>
              <option value="requestedLoanAmount,desc">Highest amount</option>
              <option value="status,asc">Status</option>
            </select>
            <button
              className="icon-button"
              onClick={resource.reload}
              disabled={resource.loading}
              aria-label="Refresh applications"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </div>
        {resource.loading ? (
          <Loading label="Loading applications…" />
        ) : resource.error ? (
          <ErrorNotice error={resource.error} retry={resource.reload} />
        ) : search && !filtered.length ? (
          <EmptyState
            title="No matches on this page"
            description="Try another search or browse the other pages."
          />
        ) : (
          <ApplicationsTable applications={filtered} staff={staff} />
        )}
        <Pagination data={resource.data} page={page} onChange={setPage} />
      </section>
      <p className="list-note">
        Search applies to the current page. Sort and page controls load results
        from the backend.
      </p>
    </>
  );
}
