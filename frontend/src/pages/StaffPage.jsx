import { useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StaffDataManager from "../components/StaffDataManager";
import { STAFF_TABLES } from "../config/staffTables";

function icon(d) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}

const TABLE_ICONS = {
  patient: icon(<><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></>),
  appointment: icon(<><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>),
  consultation_billing: icon(<><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></>),
};

function StaffPage({ user, token, onLogout }) {
  const [activeKey, setActiveKey] = useState(STAFF_TABLES[0].key);

  const navItems = useMemo(
    () =>
      STAFF_TABLES.map((table) => ({
        key: table.key,
        title: table.title,
        icon: TABLE_ICONS[table.key] || TABLE_ICONS.patient,
      })),
    [],
  );

  return (
    <DashboardLayout
      role="staff"
      user={user}
      token={token}
      onLogout={onLogout}
      navItems={navItems}
      activeKey={activeKey}
      onNavChange={setActiveKey}
    >
      <StaffDataManager token={token} selectedTableKey={activeKey} />
    </DashboardLayout>
  );
}

export default StaffPage;
