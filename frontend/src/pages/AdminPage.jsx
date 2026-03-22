import AppHeader from "../components/AppHeader";
import AdminDataManager from "../components/AdminDataManager";
import "./AdminPage.css";

function AdminPage({ user, token, onLogout }) {
  return (
    <main className="dashboard-page">
      <AppHeader user={user} onLogout={onLogout} />
      <section className="dashboard-grid">
        <AdminDataManager token={token} />
      </section>
    </main>
  );
}

export default AdminPage;
