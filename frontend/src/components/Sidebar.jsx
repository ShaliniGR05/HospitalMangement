import { useState } from "react";
import "./Sidebar.css";

const ROLE_COLORS = {
  admin: "var(--accent-admin)",
  doctor: "var(--accent-doctor)",
  staff: "var(--accent-staff)",
};

const ROLE_LABELS = {
  admin: "Administrator",
  doctor: "Doctor",
  staff: "Staff",
};

function Sidebar({ role, user, navItems, activeKey, onNavChange, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const accent = ROLE_COLORS[role] || "var(--primary)";
  const roleLabel = ROLE_LABELS[role] || role;
  const initials = (user?.user_name || "U").slice(0, 2).toUpperCase();

  return (
    <aside
      className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}
      style={{ "--role-accent": accent }}
    >
      {/* Accent strip */}
      <div className="sidebar__accent-strip" />

      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M2 12h20" />
            <rect x="3" y="3" width="18" height="18" rx="3" />
          </svg>
        </div>
        {!collapsed && (
          <div className="sidebar__brand-text">
            <span className="sidebar__brand-name">HMS</span>
            <span className="sidebar__brand-sub">Hospital System</span>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        className="sidebar__toggle"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "Expand" : "Collapse"}
        type="button"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {collapsed ? (
            <polyline points="9 18 15 12 9 6" />
          ) : (
            <polyline points="15 18 9 12 15 6" />
          )}
        </svg>
      </button>

      {/* Navigation */}
      <nav className="sidebar__nav">
        <span className="sidebar__nav-label">{collapsed ? "" : "Navigation"}</span>
        <ul className="sidebar__nav-list">
          {navItems.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                className={`sidebar__nav-item ${activeKey === item.key ? "sidebar__nav-item--active" : ""}`}
                onClick={() => onNavChange(item.key)}
                title={item.title}
              >
                <span className="sidebar__nav-icon">{item.icon}</span>
                {!collapsed && <span className="sidebar__nav-text">{item.title}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User section */}
      <div className="sidebar__user">
        <div className="sidebar__avatar">{initials}</div>
        {!collapsed && (
          <div className="sidebar__user-info">
            <span className="sidebar__username">{user?.user_name}</span>
            <span className="sidebar__role-badge">{roleLabel}</span>
          </div>
        )}
      </div>

      {/* Logout */}
      <button type="button" className="sidebar__logout" onClick={onLogout}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        {!collapsed && <span>Logout</span>}
      </button>
    </aside>
  );
}

export default Sidebar;
