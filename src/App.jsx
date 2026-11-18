import { Component, lazy, Suspense } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { PublicLayout, AppLayout, Protected } from "./components/Layouts";
import { Loading } from "./components/UI";
const publicModule = () => import("./pages/PublicPages");
const HomePage = lazy(() =>
  publicModule().then((m) => ({ default: m.HomePage })),
);
const AboutPage = lazy(() =>
  publicModule().then((m) => ({ default: m.AboutPage })),
);
const ProductsPage = lazy(() =>
  publicModule().then((m) => ({ default: m.ProductsPage })),
);
const LoginPage = lazy(() =>
  import("./pages/AuthPages").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("./pages/AuthPages").then((m) => ({ default: m.RegisterPage })),
);
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const EligibilityPage = lazy(() => import("./pages/EligibilityPage"));
const ApplyPage = lazy(() => import("./pages/ApplyPage"));
const ApplicationsPage = lazy(() => import("./pages/ApplicationsPage"));
const ApplicationDetailPage = lazy(
  () => import("./pages/ApplicationDetailPage"),
);
const adminModule = () => import("./pages/AdminPages");
const CustomersAdminPage = lazy(() =>
  adminModule().then((m) => ({ default: m.CustomersAdminPage })),
);
const OfficersAdminPage = lazy(() =>
  adminModule().then((m) => ({ default: m.OfficersAdminPage })),
);
const ProductsAdminPage = lazy(() =>
  adminModule().then((m) => ({ default: m.ProductsAdminPage })),
);
class ErrorBoundary extends Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <main className="fatal-error">
        <h1>Let’s get you back on track.</h1>
        <p>The page could not be displayed. Reload to try again.</p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Reload application
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
function NotFound() {
  return (
    <main className="not-found">
      <span className="eyebrow">404 · A small detour</span>
      <h1>This page isn’t here.</h1>
      <p>Let’s head back to a familiar place.</p>
      <Link className="btn btn-primary" to="/app">
        Open my workspace
      </Link>
      <Link className="text-button mt-3" to="/">
        Go to home page
      </Link>
    </main>
  );
}
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <Suspense fallback={<Loading label="Opening Nestwell…" />}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
              </Route>
              <Route
                path="app"
                element={
                  <Protected>
                    <AppLayout />
                  </Protected>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="applications" element={<ApplicationsPage />} />
                <Route
                  path="applications/:id"
                  element={<ApplicationDetailPage />}
                />
                <Route path="products" element={<ProductsPage inside />} />
                <Route element={<Protected roles={["CUSTOMER"]} />}>
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="eligibility" element={<EligibilityPage />} />
                  <Route path="apply" element={<ApplyPage />} />
                </Route>
                <Route element={<Protected roles={["ADMIN"]} />}>
                  <Route
                    path="admin/customers"
                    element={<CustomersAdminPage />}
                  />
                  <Route
                    path="admin/officers"
                    element={<OfficersAdminPage />}
                  />
                  <Route
                    path="admin/products"
                    element={<ProductsAdminPage />}
                  />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
