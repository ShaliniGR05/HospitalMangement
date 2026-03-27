import LoginForm from "../components/LoginForm";
import "./LoginPage.css";

function LoginPage({ onLogin, isLoading, error }) {
  return (
    <main className="login-page">
      {/* Left Hero Panel */}
      <section className="login-hero">
        <div className="login-hero__shapes">
          <div className="login-hero__shape login-hero__shape--1" />
          <div className="login-hero__shape login-hero__shape--2" />
          <div className="login-hero__shape login-hero__shape--3" />
        </div>
        <div className="login-hero__content">
          <div className="login-hero__icon">
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="6" width="36" height="36" rx="8" />
              <line x1="24" y1="14" x2="24" y2="34" />
              <line x1="14" y1="24" x2="34" y2="24" />
            </svg>
          </div>
          <h1 className="login-hero__title">Hospital<br />Management<br />System</h1>
          <p className="login-hero__subtitle">
            Streamlined operations. Secure access. Complete control over your healthcare facility.
          </p>
          <div className="login-hero__stats">
            <div className="login-hero__stat">
              <span className="login-hero__stat-num">24/7</span>
              <span className="login-hero__stat-label">Operations</span>
            </div>
            <div className="login-hero__stat">
              <span className="login-hero__stat-num">100%</span>
              <span className="login-hero__stat-label">Secure</span>
            </div>
            <div className="login-hero__stat">
              <span className="login-hero__stat-num">RBAC</span>
              <span className="login-hero__stat-label">Protected</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Login Panel */}
      <section className="login-panel">
        <div className="login-card">
          <p className="kicker">HMS Access Portal</p>
          <h2 className="login-card__title">Welcome Back</h2>
          <p className="intro">Sign in with your credentials to access the dashboard.</p>
          <LoginForm onLogin={onLogin} isLoading={isLoading} error={error} />
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
