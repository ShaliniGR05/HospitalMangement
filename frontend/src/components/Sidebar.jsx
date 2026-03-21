import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, UserRound, Stethoscope, CalendarDays,
  Receipt, FlaskConical, Pill, ClipboardList, Building2,
  LogOut, ChevronRight, Hospital
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
  { to: '/staff', icon: UserRound, label: 'Staff' },
  { to: '/departments', icon: Building2, label: 'Departments' },
  { to: '/appointments', icon: CalendarDays, label: 'Appointments' },
  { to: '/billing', icon: Receipt, label: 'Billing' },
  { to: '/prescriptions', icon: ClipboardList, label: 'Prescriptions' },
  { to: '/medicines', icon: Pill, label: 'Medicines' },
  { to: '/lab-tests', icon: FlaskConical, label: 'Lab Tests' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Hospital size={22} />
        </div>
        <div>
          <div className="logo-name">MediCore</div>
          <div className="logo-sub">Hospital System</div>
        </div>
      </div>

      {/* User badge */}
      {user && (
        <div className="sidebar-user">
          <div className="user-avatar">{user.username[0].toUpperCase()}</div>
          <div>
            <div className="user-name">{user.username}</div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>
      )}

      <div className="sidebar-divider" />

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
            <ChevronRight size={14} className="nav-arrow" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
