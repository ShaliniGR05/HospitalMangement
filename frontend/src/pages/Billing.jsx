import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBilling, createBilling, updateBilling, deleteBilling, getAppointments } from '../services/api';
import { Plus, Search, Edit2, Trash2, X, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { appointment_id: '', amount: '', payment_status: 'pending', payment_date: '' };

export default function Billing() {
  const qc = useQueryClient();
  const { data: bills = [], isLoading } = useQuery({ queryKey: ['billing'], queryFn: () => getBilling().then(r => r.data) });
  const { data: appointments = [] } = useQuery({ queryKey: ['appointments'], queryFn: () => getAppointments().then(r => r.data) });
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const filtered = bills.filter(b => {
    const appt = appointments.find(a => a.appointment_id === b.appointment_id);
    return (appt?.patient?.patient_name || '').toLowerCase().includes(search.toLowerCase()) ||
      String(b.appointment_id).includes(search);
  });

  const createMut = useMutation({
    mutationFn: createBilling,
    onSuccess: () => { qc.invalidateQueries(['billing']); toast.success('Bill created'); closeModal(); },
    onError: () => toast.error('Failed to create bill'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateBilling(id, data),
    onSuccess: () => { qc.invalidateQueries(['billing']); toast.success('Bill updated'); closeModal(); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteBilling,
    onSuccess: () => { qc.invalidateQueries(['billing']); toast.success('Bill deleted'); },
  });

  const openAdd = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (b) => { setForm({ appointment_id: b.appointment_id, amount: b.amount, payment_status: b.payment_status, payment_date: b.payment_date || '' }); setEditId(b.consultation_bill_id); setModal('edit'); };
  const closeModal = () => { setModal(null); setForm(EMPTY); setEditId(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, appointment_id: parseInt(form.appointment_id), amount: parseFloat(form.amount), payment_date: form.payment_date || null };
    if (modal === 'add') createMut.mutate(payload);
    else updateMut.mutate({ id: editId, data: payload });
  };

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const getApptLabel = (id) => {
    const a = appointments.find(x => x.appointment_id === id);
    if (!a) return `Appointment #${id}`;
    return `${a.patient?.patient_name || '?'} – ${a.appointment_date}`;
  };

  const totalRevenue = bills.filter(b => b.payment_status === 'completed').reduce((s, b) => s + b.amount, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Consultation Billing</h1>
          <p className="page-subtitle">Revenue: ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Create Bill</button>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} color="var(--text-muted)" />
          <input placeholder="Search by patient or appointment ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <div className="loading-state"><div className="spinner" /><span>Loading bills...</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Receipt size={40} /><span>No bills found</span></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>#</th><th>Appointment</th><th>Amount</th><th>Status</th><th>Payment Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.consultation_bill_id}>
                    <td style={{ color: 'var(--text-muted)' }}>{b.consultation_bill_id}</td>
                    <td style={{ fontWeight: 600 }}>{getApptLabel(b.appointment_id)}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 700 }}>₹{b.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td><span className={`badge ${b.payment_status === 'completed' ? 'badge-success' : b.payment_status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{b.payment_status}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{b.payment_date || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(b)}><Edit2 size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteMut.mutate(b.consultation_bill_id)}><Trash2 size={14} /></button>
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
              <h2 className="modal-title">{modal === 'add' ? 'Create Bill' : 'Edit Bill'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Appointment *</label>
                <select className="form-select" name="appointment_id" value={form.appointment_id} onChange={handleChange} required>
                  <option value="">Select appointment</option>
                  {appointments.map(a => <option key={a.appointment_id} value={a.appointment_id}>{a.patient?.patient_name} – {a.appointment_date} ({a.status})</option>)}
                </select>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input className="form-input" name="amount" type="number" step="0.01" value={form.amount} onChange={handleChange} required placeholder="Consultation fee" />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Status</label>
                  <select className="form-select" name="payment_status" value={form.payment_status} onChange={handleChange}>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Date</label>
                  <input className="form-input" name="payment_date" type="date" value={form.payment_date} onChange={handleChange} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{modal === 'add' ? 'Create Bill' : 'Update Bill'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
