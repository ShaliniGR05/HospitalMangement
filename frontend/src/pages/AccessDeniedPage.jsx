import "./AccessDeniedPage.css";

function AccessDeniedPage({ role, onLogout }) {
  return (
    <main className="access-denied-page">
      <section className="access-card">
        <h1>Access Not Configured</h1>
        <p>
          Role <strong>{role || "Unknown"}</strong> does not have a configured panel in this build.
        </p>
        <button type="button" onClick={onLogout}>
          Logout
        </button>
      </section>
    </main>
  );
}

export default AccessDeniedPage;
