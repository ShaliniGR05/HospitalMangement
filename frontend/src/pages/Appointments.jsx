import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment, getPatients, getDoctors } from '../services/api';
import { Plus, Search, Edit2, Trash2, X, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { patient_id: '', doctor_id: '', appointment_date: '', appointment_time: '', reason: '', status: 'pending' };

export default function Appointments() {
  const qc = useQueryClient();
  const { data: appointments = [], isLoading } = useQuery({ queryKey: ['appointments'], queryFn: () => getAppointments().then(r => r.data) });
  const { data: patients = [] } = useQuery({ queryKey: ['patients'], queryFn: () => getPatients().then(r => r.data) });
  const { data: doctors = [] } = useQuery({ queryKey: ['doctors'], queryFn: () => getDoctors().then(r => r.data) });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const filtered = appointments.filter(a => {
    const matchSearch = (a.patient?.patient_name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const createMut = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => { qc.invalidateQueries(['appointments']); toast.success('Appointment booked'); closeModal(); },
    onError: () => toast.error('Failed to book appointment'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateAppointment(id, data),
    onSuccess: () => { qc.invalidateQueries(['appointments']); toast.success('Appointment updated'); closeModal(); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => { qc.invalidateQueries(['appointments']); toast.success('Appointment removed'); },
  });

  const openAdd = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (a) => {
    setForm({ patient_id: a.patient_id, doctor_id: a.doctor_id, appointment_date: a.appointment_date, appointment_time: a.appointment_time, reason: a.reason || '', status: a.status });
    setEditId(a.appointment_id);
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setForm(EMPTY); setEditId(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, patient_id: parseInt(form.patient_id), doctor_id: parseInt(form.doctor_id) };
    if (modal === 'add') createMut.mutate(payload);
    else updateMut.mutate({ id: editId, data: payload });
  };

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const statusBadge = (s) => {
    if (s === 'pending') return 'badge-warning';
    if (s === 'completed') return 'badge-success';
    return 'badge-danger';
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">{appointments.length} total appointments</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Book Appointment</button>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} color="var(--text-muted)" />
          <input placeholder="Search by patient name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'pending', 'completed', 'cancelled'].map(s => (
            <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatusFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <div className="loading-state"><div className="spinner" /><span>Loading appointments...</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><CalendarDays size={40} /><span>No appointments found</span></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>#</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.appointment_id}>
                    <td style={{ color: 'var(--text-muted)' }}>{a.appointment_id}</td>
                    <td style={{ fontWeight: 600 }}>{a.patient?.patient_name || `#${a.patient_id}`}</td>
                    <td>
                      {a.doctor?.staff?.staff_name || `Doctor #${a.doctor_id}`}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.doctor?.specialization}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{a.appointment_date}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{a.appointment_time}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason || '—'}</td>
                    <td><span className={`badge ${statusBadge(a.status)}`}>{a.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(a)}><Edit2 size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteMut.mutate(a.appointment_id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'add' ? 'Book Appointment' : 'Edit Appointment'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Patient *</label>
                <select className="form-select" name="patient_id" value={form.patient_id} onChange={handleChange} required>
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.patient_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Doctor *</label>
                <select className="form-select" name="doctor_id" value={form.doctor_id} onChange={handleChange} required>
                  <option value="">Select doctor</option>
                  {doctors.map(d => <option key={d.doc_id} value={d.doc_id}>{d.staff?.staff_name || `Dr. #${d.doc_id}`} — {d.specialization}</option>)}
                </select>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input className="form-input" name="appointment_date" type="date" value={form.appointment_date} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <input className="form-input" name="appointment_time" type="time" value={form.appointment_time} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <input className="form-input" name="reason" value={form.reason} onChange={handleChange} placeholder="Reason for visit" />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{modal === 'add' ? 'Book' : 'Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
