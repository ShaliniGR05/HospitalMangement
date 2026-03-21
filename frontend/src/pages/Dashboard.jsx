import { useQuery } from '@tanstack/react-query';
import {
  Users, Stethoscope, CalendarDays, Receipt,
  UserRound, Building2, Pill, FlaskConical, TrendingUp, Activity
} from 'lucide-react';
import {
  getPatients, getDoctors, getStaff, getDepartments,
  getAppointments, getBilling, getMedicines, getLabTests
} from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const { data: patients = [] } = useQuery({ queryKey: ['patients'], queryFn: () => getPatients().then(r => r.data) });
  const { data: doctors = [] } = useQuery({ queryKey: ['doctors'], queryFn: () => getDoctors().then(r => r.data) });
  const { data: staff = [] } = useQuery({ queryKey: ['staff'], queryFn: () => getStaff().then(r => r.data) });
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: () => getDepartments().then(r => r.data) });
  const { data: appointments = [] } = useQuery({ queryKey: ['appointments'], queryFn: () => getAppointments().then(r => r.data) });
  const { data: billing = [] } = useQuery({ queryKey: ['billing'], queryFn: () => getBilling().then(r => r.data) });
  const { data: medicines = [] } = useQuery({ queryKey: ['medicines'], queryFn: () => getMedicines().then(r => r.data) });
  const { data: labTests = [] } = useQuery({ queryKey: ['labTests'], queryFn: () => getLabTests().then(r => r.data) });

  const pendingAppts = appointments.filter(a => a.status === 'pending').length;
  const completedAppts = appointments.filter(a => a.status === 'completed').length;
  const pendingBills = billing.filter(b => b.payment_status === 'pending').length;
  const totalRevenue = billing
    .filter(b => b.payment_status === 'completed')
    .reduce((sum, b) => sum + b.amount, 0);

  const stats = [
    { label: 'Total Patients', value: patients.length, icon: Users, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Doctors', value: doctors.length, icon: Stethoscope, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Staff Members', value: staff.length, icon: UserRound, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Departments', value: departments.length, icon: Building2, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { label: 'Appointments', value: appointments.length, icon: CalendarDays, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    { label: 'Pending Appts', value: pendingAppts, icon: Activity, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    { label: 'Medicines', value: medicines.length, icon: Pill, color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
    { label: 'Lab Tests', value: labTests.length, icon: FlaskConical, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome to MediCore Hospital Management System</p>
        </div>
        <div className="dash-date">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={24} color={color} />
            </div>
            <div className="stat-info">
              <div className="label">{label}</div>
              <div className="value">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary cards */}
      <div className="dash-grid">
        {/* Revenue */}
        <div className="card dash-revenue">
          <div className="card-head">
            <div className="card-title">Revenue Overview</div>
            <TrendingUp size={20} color="var(--success)" />
          </div>
          <div className="rev-amount">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div className="rev-label">Total Collected Revenue</div>
          <div className="rev-stats">
            <div className="rev-stat">
              <span className="badge badge-warning">{pendingBills}</span>
              <span>Pending</span>
            </div>
            <div className="rev-stat">
              <span className="badge badge-success">{billing.filter(b => b.payment_status === 'completed').length}</span>
              <span>Completed</span>
            </div>
          </div>
        </div>

        {/* Appointments breakdown */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Appointments Status</div>
            <CalendarDays size={20} color="var(--accent-primary)" />
          </div>
          <div className="appt-breakdown">
            {[
              { label: 'Pending', count: pendingAppts, cls: 'badge-warning' },
              { label: 'Completed', count: completedAppts, cls: 'badge-success' },
              { label: 'Cancelled', count: appointments.filter(a => a.status === 'cancelled').length, cls: 'badge-danger' },
            ].map(({ label, count, cls }) => (
              <div className="appt-row" key={label}>
                <span className="appt-label">{label}</span>
                <div className="appt-bar-wrap">
                  <div
                    className="appt-bar"
                    style={{
                      width: appointments.length ? `${(count / appointments.length) * 100}%` : '0%'
                    }}
                  />
                </div>
                <span className={`badge ${cls}`}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent patients */}
        <div className="card dash-recent">
          <div className="card-head">
            <div className="card-title">Recent Patients</div>
            <Users size={20} color="var(--info)" />
          </div>
          <div className="recent-list">
            {patients.slice(-5).reverse().map(p => (
              <div className="recent-item" key={p.patient_id}>
                <div className="recent-avatar">{p.patient_name[0]}</div>
                <div className="recent-info">
                  <div className="recent-name">{p.patient_name}</div>
                  <div className="recent-sub">{p.blood_group || '—'} • {p.gender}</div>
                </div>
                <span className="badge badge-info">Age {p.age}</span>
              </div>
            ))}
            {patients.length === 0 && <div className="empty-state" style={{ padding: 24 }}>No patients yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
