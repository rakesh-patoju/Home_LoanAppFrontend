import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ClipboardCheck,
  FileCheck2,
  Home,
  Leaf,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useResource } from "../hooks/useResource";
import {
  ActionLink,
  CheckItem,
  DemoNote,
  EmptyState,
  ErrorNotice,
  Loading,
  PageHeader,
} from "../components/UI";
import HouseArt from "../components/HouseArt";
import { compactMoney, tenure } from "../lib/domain";
export function HomePage() {
  const { user } = useAuth();
  return (
    <>
      <section className="landing-hero container">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="tiny-leaf">
              <Leaf size={14} />
            </span>{" "}
            A new beginning, made simpler
          </div>
          <h1>
            A little clarity.
            <br />A place to call <em>home.</em>
          </h1>
          <p>
            Your home is a big decision. Your loan journey should feel simple.
            Explore your options, apply with confidence, and follow every step
            in one place.
          </p>
          <div className="hero-buttons">
            <ActionLink to={user ? "/app" : "/register"}>
              Start your journey
            </ActionLink>
            <Link className="btn btn-outline" to="/products">
              Explore loan products
            </Link>
          </div>
          <div className="hero-reassurance">
            <span>
              <Check size={15} /> Clear application tracking
            </span>
            <span>
              <Check size={15} /> Guided document uploads
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="art-label">
            <span />
            <span>Room for your next chapter</span>
          </div>
          <HouseArt />
          <div className="floating-note">
            <span className="note-icon">
              <Home size={21} />
            </span>
            <div>
              <strong>More than a loan.</strong>
              <small>A step toward your own space.</small>
            </div>
            <Sparkles size={20} />
          </div>
          <div className="visual-coordinate">
            THOUGHTFULLY BUILT. SIMPLY MANAGED.
          </div>
        </div>
      </section>
      <section className="value-strip">
        <div className="container">
          {[
            [
              ShieldCheck,
              "Your information, protected",
              "Role-based access at every step",
            ],
            [
              ClipboardCheck,
              "A process you can follow",
              "One place for every update",
            ],
            [
              FileCheck2,
              "Paperwork, made clearer",
              "Know what to upload and when",
            ],
          ].map(([Icon, title, desc]) => (
            <div key={title}>
              <Icon size={25} />
              <div>
                <strong>{title}</strong>
                <span>{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="container journey-section">
        <div className="section-title">
          <div>
            <div className="eyebrow">A straightforward journey</div>
            <h2>
              Less guesswork.
              <br />
              More moving forward.
            </h2>
          </div>
          <p>
            From the first estimate to the final decision, every step has its
            place.
          </p>
        </div>
        <div className="journey-grid">
          {[
            [
              "01",
              Home,
              "Find your fit",
              "Explore available products and check a preliminary eligibility estimate.",
            ],
            [
              "02",
              FileCheck2,
              "Make it yours",
              "Submit your application and add the documents your officer needs.",
            ],
            [
              "03",
              TrendingUp,
              "Stay in the picture",
              "Track your review, see remarks, and follow your application to a decision.",
            ],
          ].map(([n, Icon, t, d]) => (
            <article key={n}>
              <div className="step-number">
                {n}
                <Icon size={23} />
              </div>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
        <div className="landing-bottom">
          <div>
            <span className="eyebrow">Your next chapter</span>
            <h2>Let’s give it a place to begin.</h2>
          </div>
          <ActionLink to={user ? "/app" : "/register"}>Get started</ActionLink>
        </div>
        <DemoNote />
      </section>
    </>
  );
}
export function AboutPage() {
  return (
    <section className="container public-section">
      <PageHeader
        eyebrow="About Nestwell"
        title="Home loans, with more clarity."
        description="A thoughtful demonstration of a connected customer, officer and administrator experience."
      />
      <div className="about-grid">
        <div className="about-art">
          <HouseArt />
        </div>
        <div>
          <h2>
            One journey.
            <br />
            Everyone on the same page.
          </h2>
          <p>
            Nestwell brings applications, documents and decisions together.
            Customers can see their progress, officers can review the right
            information, and administrators can keep the process moving.
          </p>
          <p>
            This is a fictional portfolio application connected to a Java and
            MySQL backend. It does not offer real loans, perform credit bureau
            checks, or transfer money.
          </p>
          <CheckItem>
            Customer-owned applications and private documents
          </CheckItem>
          <CheckItem>Assigned officer reviews and verification</CheckItem>
          <CheckItem>Recorded status changes from start to finish</CheckItem>
          <Link className="btn btn-primary mt-4" to="/products">
            Explore loan products <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
export function ProductCards({ products, inside = false }) {
  const { user } = useAuth();
  return (
    <div className="product-grid">
      {products.map((p, index) => (
        <article className="product-card" key={p.id}>
          <div className="product-card-top">
            <span className={`product-icon product-icon-${index % 3}`}>
              <Home size={25} />
            </span>
            <span className="product-tag">Home lending</span>
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
              <span>Repayment tenure</span>
              <strong>
                {tenure(p.minimumTenureMonths)} –{" "}
                {tenure(p.maximumTenureMonths)}
              </strong>
            </div>
          </div>
          {!user || user.role === "CUSTOMER" ? (
            <Link
              className="btn btn-outline w-100"
              to={user ? `/app/apply?product=${p.id}` : "/login"}
              state={!user ? { from: `/app/apply?product=${p.id}` } : undefined}
            >
              Explore this loan <ArrowUpRight size={17} />
            </Link>
          ) : (
            <span className="muted small">
              Available to eligible customer applicants
            </span>
          )}
        </article>
      ))}
    </div>
  );
}
export function ProductsPage({ inside = false }) {
  const resource = useResource("/loan-products");
  return (
    <section className={inside ? "" : "container public-section"}>
      <PageHeader
        eyebrow="A home for every next chapter"
        title="Find the right starting point."
        description="Explore available products, compare amounts and tenures, and choose what fits your plans."
      />
      {resource.loading ? (
        <Loading label="Loading loan products…" />
      ) : resource.error ? (
        <ErrorNotice error={resource.error} retry={resource.reload} />
      ) : resource.data?.length ? (
        <ProductCards products={resource.data} inside={inside} />
      ) : (
        <EmptyState
          title="No loan products available"
          description="Please check again later. An administrator can add new products."
        />
      )}
      <div className="mt-4">
        <DemoNote>
          Product rates are demonstration values. Eligibility estimates and
          applications do not constitute bank approval.
        </DemoNote>
      </div>
    </section>
  );
}
