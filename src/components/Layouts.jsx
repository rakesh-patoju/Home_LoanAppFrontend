import { useEffect, useState, useSyncExternalStore } from "react";
import { Link, NavLink, Outlet, useLocation, Navigate } from "react-router-dom";
import {
  ArrowUpRight,
  Building2,
  Calculator,
  ChevronRight,
  ClipboardList,
  FilePlus2,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
  Users,
  X,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Brand, Modal, DemoNote } from "./UI";
import { connectionStore } from "../lib/api";
import { initials, ROLE_NAMES } from "../lib/domain";
export function PublicLayout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <div className="public-site">
      <header className="public-header">
        <div className="public-nav container">
          <Brand />
          <button
            className="icon-button mobile-toggle"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <nav className={open ? "open" : ""} aria-label="Main navigation">
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/products">Loan products</NavLink>
            <NavLink to="/about">About Nestwell</NavLink>
            <div className="nav-actions">
              {user ? (
                <Link className="btn btn-primary" to="/app">
                  My workspace <ArrowUpRight size={16} />
                </Link>
              ) : (
                <>
                  <Link className="nav-login" to="/login">
                    Log in
                  </Link>
                  <Link className="btn btn-primary" to="/register">
                    Get started <ArrowUpRight size={16} />
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
      <main id="main-content">
        <Outlet />
      </main>
      <footer className="public-footer container">
        <Brand />
        <span>A little clarity. A place to call home.</span>
        <small>Portfolio demo · No real lending</small>
      </footer>
    </div>
  );
}
const customerNav = [
  ["/app", "Overview", LayoutDashboard],
  ["/app/applications", "My applications", ClipboardList],
  ["/app/apply", "Apply for a loan", FilePlus2],
  ["/app/eligibility", "Eligibility calculator", Calculator],
  ["/app/products", "Loan products", Building2],
  ["/app/profile", "My profile", UserRound],
];
const officerNav = [
  ["/app", "Overview", LayoutDashboard],
  ["/app/applications", "Assigned applications", ClipboardList],
  ["/app/products", "Loan products", Building2],
];
const adminNav = [
  ["/app", "Overview", LayoutDashboard],
  ["/app/applications", "All applications", ClipboardList],
  ["/app/admin/customers", "Customers", Users],
  ["/app/admin/officers", "Loan officers", UserRound],
  ["/app/admin/products", "Loan products", Building2],
];
export function AppLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false),
    [help, setHelp] = useState(false);
  const location = useLocation();
  const connection = useSyncExternalStore(
    connectionStore.subscribe,
    connectionStore.getSnapshot,
  );
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const nav =
    user.role === "ADMIN"
      ? adminNav
      : user.role === "LOAN_OFFICER"
        ? officerNav
        : customerNav;
  const current = nav.find(([path]) =>
    path === "/app"
      ? location.pathname === path
      : location.pathname.startsWith(path),
  );
  return (
    <div className="workspace">
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <Brand light />
          <button
            className="icon-button mobile-toggle"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>
        <div className="workspace-label">{ROLE_NAMES[user.role]} workspace</div>
        <nav aria-label="Workspace navigation">
          {nav.map(([path, label, Icon]) => (
            <NavLink key={path} to={path} end={path === "/app"}>
              <Icon size={19} />
              <span>{label}</span>
              <ChevronRight className="nav-chevron" size={14} />
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <ShieldCheck size={23} />
            <h3>A clearer path home.</h3>
            <p>Understand each step of your application.</p>
            <button onClick={() => setHelp(true)}>
              View the guide <ArrowUpRight size={15} />
            </button>
          </div>
          <button className="sidebar-logout" onClick={logout}>
            <LogOut size={18} /> Log out
          </button>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="workspace-topbar">
          <div className="breadcrumb-label">
            <button
              className="icon-button mobile-toggle"
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{current?.[1] || "Application details"}</strong>
          </div>
          <div className="topbar-actions">
            <span className={`connection ${connection}`}>
              {connection === "offline" ? (
                <WifiOff size={14} />
              ) : (
                <Wifi size={14} />
              )}
              <span>
                {connection === "online"
                  ? "Connected"
                  : connection === "offline"
                    ? "Service offline"
                    : "Connecting"}
              </span>
            </span>
            <button
              className="icon-button help-top"
              aria-label="Open help guide"
              onClick={() => setHelp(true)}
            >
              <HelpCircle size={20} />
            </button>
            <div className="account-chip">
              <span className="avatar">{initials(user.fullName)}</span>
              <div>
                <strong>{user.fullName}</strong>
                <small>{ROLE_NAMES[user.role]}</small>
              </div>
            </div>
          </div>
        </header>
        <main id="main-content" className="workspace-content">
          <div className="page-enter" key={location.pathname}>
            <Outlet />
          </div>
        </main>
        <footer className="workspace-footer">
          <span>
            © {new Date().getFullYear()} Nestwell · Portfolio demonstration
          </span>
          <span>
            <ShieldCheck size={13} /> Your next chapter, thoughtfully managed.
          </span>
        </footer>
      </div>
      {help && (
        <Modal
          title="Your guide to the loan journey"
          description="A few simple steps, from application to decision."
          onClose={() => setHelp(false)}
        >
          <div className="guide-list">
            {[
              [
                "01",
                "Apply with confidence",
                "Choose a product, enter your financial details and submit once.",
              ],
              [
                "02",
                "Add your documents",
                "Upload all five document categories. Replace any file your officer asks you to clarify.",
              ],
              [
                "03",
                "Follow the review",
                "Your assigned officer checks your application and documents. Remarks and status changes appear in your activity history.",
              ],
              [
                "04",
                "Receive a decision",
                "After approval, the administrator records sanction and disbursement for this demo.",
              ],
            ].map(([n, t, d]) => (
              <div key={n}>
                <span>{n}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </div>
            ))}
          </div>
          <DemoNote />
        </Modal>
      )}
    </div>
  );
}
export function Protected({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user)
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  if (roles && !roles.includes(user.role))
    return <Navigate to="/app" replace />;
  return children || <Outlet />;
}
