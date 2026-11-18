import { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  UserRound,
  Power,
  Home,
  Users,
} from "lucide-react";
import { useAction, useResource } from "../hooks/useResource";
import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import {
  compactMoney,
  initials,
  passwordError,
  productBody,
  productError,
  profileBody,
  tenure,
} from "../lib/domain";
import {
  Button,
  EmptyState,
  ErrorNotice,
  Field,
  Loading,
  Modal,
  PageHeader,
  Pagination,
  TextAreaField,
} from "../components/UI";
import { PasswordField, ProfileFields } from "./AuthPages";
function CustomerDialog({ customer, onClose, onSuccess }) {
  const [form, setForm] = useState(customer);
  const action = useAction();
  async function submit(e) {
    e.preventDefault();
    await action.run(async () => {
      await api.put(`/admin/customers/${customer.id}`, profileBody(form));
      onSuccess();
    });
  }
  return (
    <Modal
      title="Edit customer"
      description={customer.email}
      onClose={onClose}
      busy={action.busy}
    >
      <ErrorNotice error={action.error} />
      <form onSubmit={submit}>
        <ProfileFields form={form} setForm={setForm} />
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
            Save customer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
function EnableDialog({ customer, onClose, onSuccess }) {
  const action = useAction();
  const enabled = !customer.enabled;
  return (
    <Modal
      title={`${enabled ? "Enable" : "Disable"} customer account?`}
      description={customer.fullName}
      onClose={onClose}
      busy={action.busy}
    >
      <ErrorNotice error={action.error} />
      <p>
        {enabled
          ? "The customer will be able to log in again."
          : "The customer will be unable to log in or use an existing token. Their applications and history will be preserved."}
      </p>
      <div className="modal-actions">
        <Button variant="outline" disabled={action.busy} onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant={enabled ? "primary" : "danger"}
          busy={action.busy}
          onClick={() =>
            action.run(async () => {
              await api.put(`/admin/customers/${customer.id}/enabled`, {
                enabled,
              });
              onSuccess();
            })
          }
        >
          {enabled ? "Enable account" : "Disable account"}
        </Button>
      </div>
    </Modal>
  );
}
export function CustomersAdminPage() {
  const [page, setPage] = useState(0),
    [search, setSearch] = useState(""),
    [dialog, setDialog] = useState(null);
  const resource = useResource(`/admin/customers?page=${page}&size=10`);
  const notify = useToast();
  const done = () => {
    setDialog(null);
    resource.reload();
    notify("Customer account updated.");
  };
  const rows = (resource.data?.content || []).filter((c) =>
    `${c.fullName} ${c.email}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="People at the heart of the journey."
        description="View customer profiles, update details and manage account access."
      />
      <section className="card">
        <div className="table-toolbar">
          <h2>
            Customers{" "}
            <span className="count-tag">
              {resource.data?.totalElements || 0}
            </span>
          </h2>
          <div className="search-field">
            <Search size={17} />
            <input
              placeholder="Search this page…"
              aria-label="Search customers on this page"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {resource.loading ? (
          <Loading />
        ) : resource.error ? (
          <ErrorNotice error={resource.error} retry={resource.reload} />
        ) : !rows.length ? (
          <EmptyState
            title="No matching customers"
            description="Try a different search or page."
          />
        ) : (
          <div className="table-responsive">
            <table className="table app-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Employment</th>
                  <th>Account</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="person-cell">
                        <span className="avatar">{initials(c.fullName)}</span>
                        <div>
                          <strong>{c.fullName}</strong>
                          <small>{c.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>{c.mobile}</td>
                    <td>
                      {c.employmentType === "SALARIED"
                        ? "Salaried"
                        : "Self-employed"}
                    </td>
                    <td>
                      <span
                        className={`account-status ${c.enabled ? "enabled" : "disabled"}`}
                      >
                        {c.enabled ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          aria-label={`Edit ${c.fullName}`}
                          onClick={() =>
                            setDialog({ kind: "edit", customer: c })
                          }
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`${c.enabled ? "Disable" : "Enable"} ${c.fullName}`}
                          onClick={() =>
                            setDialog({ kind: "enable", customer: c })
                          }
                        >
                          <Power size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination data={resource.data} page={page} onChange={setPage} />
      </section>
      {dialog?.kind === "edit" && (
        <CustomerDialog
          customer={dialog.customer}
          onClose={() => setDialog(null)}
          onSuccess={done}
        />
      )}
      {dialog?.kind === "enable" && (
        <EnableDialog
          customer={dialog.customer}
          onClose={() => setDialog(null)}
          onSuccess={done}
        />
      )}
    </>
  );
}
function OfficerDialog({ officer, onClose, onSuccess }) {
  const action = useAction();
  const [form, setForm] = useState(
    officer || { fullName: "", email: "", password: "", enabled: true },
  );
  async function submit(e) {
    e.preventDefault();
    if (!officer) {
      const err = passwordError(form.password);
      if (err) {
        action.setError(err);
        return;
      }
    }
    await action.run(async () => {
      if (officer)
        await api.put(`/admin/loan-officers/${officer.id}`, {
          fullName: form.fullName.trim(),
          enabled: form.enabled,
        });
      else
        await api.post("/admin/loan-officers", {
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        });
      onSuccess();
    });
  }
  return (
    <Modal
      title={officer ? "Edit loan officer" : "Add a loan officer"}
      description={
        officer
          ? "Reassign open applications before disabling an officer."
          : "Create an account for a new reviewer."
      }
      onClose={onClose}
      busy={action.busy}
    >
      <ErrorNotice error={action.error} />
      <form onSubmit={submit}>
        <Field
          label="Full name"
          required
          maxLength={100}
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
        {!officer ? (
          <>
            <Field
              label="Email address"
              type="email"
              required
              maxLength={254}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <PasswordField
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={10}
              autoComplete="new-password"
            />
            <p className="field-hint">
              10–64 characters; at most 72 UTF-8 bytes.
            </p>
          </>
        ) : (
          <>
            <p className="muted">{officer.email}</p>
            <label className="check-label">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) =>
                  setForm({ ...form, enabled: e.target.checked })
                }
              />{" "}
              Account enabled
            </label>
          </>
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
          <Button type="submit" busy={action.busy}>
            {officer ? "Save officer" : "Create officer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function OfficersAdminPage() {
  const [page, setPage] = useState(0),
    [dialog, setDialog] = useState(null);
  const resource = useResource(`/admin/loan-officers?page=${page}&size=10`);
  const notify = useToast();
  const done = () => {
    setDialog(null);
    resource.reload();
    notify("Loan officer account saved.");
  };
  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="The people keeping things moving."
        description="Manage your loan officers and their account access."
        action={
          <Button onClick={() => setDialog({})}>
            <Plus size={17} /> Add loan officer
          </Button>
        }
      />
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>Loan officers</h2>
            <p>Assign applications from each application’s review workspace.</p>
          </div>
          <span className="count-tag">{resource.data?.totalElements || 0}</span>
        </div>
        {resource.loading ? (
          <Loading />
        ) : resource.error ? (
          <ErrorNotice error={resource.error} retry={resource.reload} />
        ) : !resource.data?.content.length ? (
          <EmptyState
            title="No loan officers yet"
            description="Create your first reviewer account to begin assigning applications."
          />
        ) : (
          <div className="table-responsive">
            <table className="table app-table">
              <thead>
                <tr>
                  <th>Loan officer</th>
                  <th>User ID</th>
                  <th>Account</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {resource.data.content.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div className="person-cell">
                        <span className="avatar">{initials(o.fullName)}</span>
                        <div>
                          <strong>{o.fullName}</strong>
                          <small>{o.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>#{o.id}</td>
                    <td>
                      <span
                        className={`account-status ${o.enabled ? "enabled" : "disabled"}`}
                      >
                        {o.enabled ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-small"
                        onClick={() => setDialog({ officer: o })}
                      >
                        <Pencil size={15} /> Edit officer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination data={resource.data} page={page} onChange={setPage} />
      </section>
      {dialog && (
        <OfficerDialog
          officer={dialog.officer}
          onClose={() => setDialog(null)}
          onSuccess={done}
        />
      )}
    </>
  );
}
function ProductDialog({ product, onClose, onSuccess }) {
  const action = useAction();
  const [form, setForm] = useState(
    product || {
      productName: "",
      minimumLoanAmount: 100000,
      maximumLoanAmount: 10000000,
      interestRate: 8.5,
      minimumTenureMonths: 12,
      maximumTenureMonths: 360,
      description: "",
      active: true,
    },
  );
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    const error = productError(form);
    if (error) {
      action.setError(error);
      return;
    }
    await action.run(async () => {
      if (product)
        await api.put(`/loan-products/${product.id}`, productBody(form));
      else await api.post("/loan-products", productBody(form));
      onSuccess();
    });
  }
  return (
    <Modal
      title={product ? "Edit loan product" : "Create a loan product"}
      description="Set the limits and annual rate available to new applicants."
      onClose={onClose}
      busy={action.busy}
    >
      <ErrorNotice error={action.error} />
      <form onSubmit={submit}>
        <Field
          label="Product name"
          name="productName"
          required
          maxLength={100}
          value={form.productName}
          onChange={change}
        />
        <div className="form-grid">
          <Field
            label="Minimum loan amount (₹)"
            name="minimumLoanAmount"
            type="number"
            min="1"
            max="9999999999999.99"
            step="0.01"
            required
            value={form.minimumLoanAmount}
            onChange={change}
          />
          <Field
            label="Maximum loan amount (₹)"
            name="maximumLoanAmount"
            type="number"
            min="1"
            max="9999999999999.99"
            step="0.01"
            required
            value={form.maximumLoanAmount}
            onChange={change}
          />
        </div>
        <div className="form-grid">
          <Field
            label="Minimum tenure (months)"
            name="minimumTenureMonths"
            type="number"
            min="12"
            max="360"
            step="1"
            required
            value={form.minimumTenureMonths}
            onChange={change}
          />
          <Field
            label="Maximum tenure (months)"
            name="maximumTenureMonths"
            type="number"
            min="12"
            max="360"
            step="1"
            required
            value={form.maximumTenureMonths}
            onChange={change}
          />
        </div>
        <Field
          label="Annual interest rate (%)"
          name="interestRate"
          type="number"
          min="0"
          max="30"
          step="0.01"
          required
          value={form.interestRate}
          onChange={change}
        />
        <TextAreaField
          label="Description"
          name="description"
          required
          maxLength={1000}
          value={form.description}
          onChange={change}
        />
        <label className="check-label">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />{" "}
          Active and available to customers
        </label>
        <p className="field-hint">
          Changes apply to new applications. Existing applications retain their
          original interest rate.
        </p>
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
            {product ? "Save product" : "Create product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function ProductsAdminPage() {
  const [dialog, setDialog] = useState(null);
  const resource = useResource("/admin/loan-products");
  const notify = useToast();
  const done = () => {
    setDialog(null);
    resource.reload();
    notify("Loan product saved.");
  };
  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="A product for every next chapter."
        description="Create and maintain the loan options available to your customers."
        action={
          <Button onClick={() => setDialog({})}>
            <Plus size={17} /> Create product
          </Button>
        }
      />
      {resource.loading ? (
        <Loading />
      ) : resource.error ? (
        <ErrorNotice error={resource.error} retry={resource.reload} />
      ) : !resource.data?.length ? (
        <EmptyState
          title="No products yet"
          description="Create your first home loan product to begin accepting applications."
        />
      ) : (
        <div className="product-grid">
          {resource.data.map((p) => (
            <article
              className={`product-card ${!p.active ? "inactive-product" : ""}`}
              key={p.id}
            >
              <div className="product-card-top">
                <span className="product-icon">
                  <Home size={25} />
                </span>
                <span
                  className={`account-status ${p.active ? "enabled" : "disabled"}`}
                >
                  {p.active ? "Active" : "Inactive"}
                </span>
              </div>
              <h2>{p.productName}</h2>
              <p>{p.description}</p>
              <div className="product-rate">
                <strong>
                  {Number(p.interestRate).toFixed(2)}
                  <span>%</span>
                </strong>
                <span>annual interest rate</span>
              </div>
              <div className="product-facts">
                <div>
                  <span>Loan amount</span>
                  <strong>
                    {compactMoney(p.minimumLoanAmount)} –{" "}
                    {compactMoney(p.maximumLoanAmount)}
                  </strong>
                </div>
                <div>
                  <span>Tenure</span>
                  <strong>
                    {p.minimumTenureMonths}–{p.maximumTenureMonths} months
                  </strong>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-100"
                onClick={() => setDialog({ product: p })}
              >
                <Pencil size={16} /> Edit product
              </Button>
            </article>
          ))}
        </div>
      )}
      {dialog && (
        <ProductDialog
          product={dialog.product}
          onClose={() => setDialog(null)}
          onSuccess={done}
        />
      )}
    </>
  );
}
