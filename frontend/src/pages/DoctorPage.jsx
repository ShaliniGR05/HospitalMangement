import { useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import DoctorDataManager from "../components/DoctorDataManager";
import { DOCTOR_TABLES } from "../config/doctorTables";

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
  prescription: icon(<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" /></>),
  prescribed_medicine: icon(<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></>),
  prescribed_test: icon(<><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></>),
};

function DoctorPage({ user, token, onLogout }) {
  const [activeKey, setActiveKey] = useState(DOCTOR_TABLES[0].key);

  const navItems = useMemo(
    () =>
      DOCTOR_TABLES.map((table) => ({
        key: table.key,
        title: table.title,
        icon: TABLE_ICONS[table.key] || TABLE_ICONS.patient,
      })),
    [],
  );

  return (
    <DashboardLayout
      role="doctor"
      user={user}
      token={token}
      onLogout={onLogout}
      navItems={navItems}
      activeKey={activeKey}
      onNavChange={setActiveKey}
    >
      <DoctorDataManager token={token} selectedTableKey={activeKey} />
    </DashboardLayout>
  );
}

export default DoctorPage;
