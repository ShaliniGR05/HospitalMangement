import "./AppHeader.css";

function AppHeader({ user, onLogout }) {
  return (
    <header className="app-header">
      <div>
        <p className="header-title">Hospital Management System</p>
        <p className="header-subtitle">
          Signed in as <strong>{user.user_name}</strong> ({user.role})
        </p>
      </div>
      <button type="button" className="secondary-button" onClick={onLogout}>
        Logout
      </button>
    </header>
  );
}

export default AppHeader;
