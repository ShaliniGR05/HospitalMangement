import Sidebar from "./Sidebar";
import "./DashboardLayout.css";

function DashboardLayout({ role, user, token, onLogout, navItems, activeKey, onNavChange, children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar
        role={role}
        user={user}
        navItems={navItems}
        activeKey={activeKey}
        onNavChange={onNavChange}
        onLogout={onLogout}
      />
      <main className="dashboard-main">
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
