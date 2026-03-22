import AppHeader from "../components/AppHeader";
import StaffDataManager from "../components/StaffDataManager";
import "./StaffPage.css";

function StaffPage({ user, token, onLogout }) {
  return (
    <main className="dashboard-page">
      <AppHeader user={user} onLogout={onLogout} />
      <section className="dashboard-grid">
        <StaffDataManager token={token} />
      </section>
    </main>
  );
}

export default StaffPage;
