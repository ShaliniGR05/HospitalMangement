import { useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import AdminDataManager from "../components/AdminDataManager";
import { ADMIN_TABLES } from "../config/adminTables";

/* SVG icon factory — small inline icons for nav items */
function icon(d) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}

const TABLE_ICONS = {
  department: icon(<><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></>),
  user: icon(<><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
  doctor: icon(<><path d="M12 11V3" /><path d="M8 7h8" /><circle cx="12" cy="17" r="4" /></>),
  staff: icon(<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></>),
  patient: icon(<><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></>),
  appointment: icon(<><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>),
  consultation_billing: icon(<><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></>),
  prescription: icon(<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" /></>),
  medicine: icon(<><path d="M10.5 1.5H8a5.5 5.5 0 000 11h2.5" /><path d="M13.5 12.5H16a5.5 5.5 0 000-11h-2.5" /><line x1="8" y1="7" x2="16" y2="7" /></>),
  prescribed_medicine: icon(<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></>),
  lab_test: icon(<><path d="M9 3h6v4l4 8H5l4-8V3z" /><line x1="12" y1="3" x2="12" y2="7" /></>),
  prescribed_test: icon(<><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></>),
};

function AdminPage({ user, token, onLogout }) {
  const [activeKey, setActiveKey] = useState(ADMIN_TABLES[0].key);

  const navItems = useMemo(
    () =>
      ADMIN_TABLES.map((table) => ({
        key: table.key,
        title: table.title,
        icon: TABLE_ICONS[table.key] || TABLE_ICONS.patient,
      })),
    [],
  );

  return (
    <DashboardLayout
      role="admin"
      user={user}
      token={token}
      onLogout={onLogout}
      navItems={navItems}
      activeKey={activeKey}
      onNavChange={setActiveKey}
    >
      <AdminDataManager token={token} selectedTableKey={activeKey} />
    </DashboardLayout>
  );
}

export default AdminPage;
