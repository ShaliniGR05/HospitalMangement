import AppHeader from "../components/AppHeader";
import DoctorDataManager from "../components/DoctorDataManager";
import "./DoctorPage.css";

function DoctorPage({ user, token, onLogout }) {
  return (
    <main className="dashboard-page">
      <AppHeader user={user} onLogout={onLogout} />
      <section className="dashboard-grid">
        <DoctorDataManager token={token} />
      </section>
    </main>
  );
}

export default DoctorPage;
