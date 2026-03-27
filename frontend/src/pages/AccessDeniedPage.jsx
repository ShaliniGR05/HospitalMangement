import "./AccessDeniedPage.css";

function AccessDeniedPage({ role, onLogout }) {
  return (
    <main className="access-denied-page">
      <section className="access-card">
        <div className="access-card__icon">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="22" width="32" height="20" rx="3" />
            <path d="M14 22V16a10 10 0 0120 0v6" />
            <circle cx="24" cy="33" r="3" />
          </svg>
        </div>
        <h1>Access Not Configured</h1>
        <p>
          Role <strong>{role || "Unknown"}</strong> does not have a configured panel in this build.
          Please contact your system administrator.
        </p>
        <button type="button" className="primary-button" onClick={onLogout}>
          ← Return to Login
        </button>
      </section>
    </main>
  );
}

export default AccessDeniedPage;
