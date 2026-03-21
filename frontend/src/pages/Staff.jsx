import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStaff, createStaff, updateStaff, deleteStaff, getDepartments } from '../services/api';
import { Plus, Search, Edit2, Trash2, X, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { staff_name: '', gender: 'Male', phone: '', email: '', address: '', dept_id: '', role: '', salary: '', joining_date: '', status: 'available' };

export default function Staff() {
  const qc = useQueryClient();
  const { data: staff = [], isLoading } = useQuery({ queryKey: ['staff'], queryFn: () => getStaff().then(r => r.data) });
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: () => getDepartments().then(r => r.data) });
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const filtered = staff.filter(s =>
    s.staff_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const createMut = useMutation({
    mutationFn: createStaff,
    onSuccess: () => { qc.invalidateQueries(['staff']); toast.success('Staff added'); closeModal(); },
    onError: () => toast.error('Failed to add staff'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateStaff(id, data),
    onSuccess: () => { qc.invalidateQueries(['staff']); toast.success('Staff updated'); closeModal(); },
    onError: () => toast.error('Failed to update staff'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => { qc.invalidateQueries(['staff']); toast.success('Staff removed'); },
    onError: () => toast.error('Failed to delete staff'),
  });

  const openAdd = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (s) => { setForm({ ...s, dept_id: s.dept_id }); setEditId(s.staff_id); setModal('edit'); };
  const closeModal = () => { setModal(null); setForm(EMPTY); setEditId(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, dept_id: parseInt(form.dept_id), salary: parseFloat(form.salary) };
    if (modal === 'add') createMut.mutate(payload);
    else updateMut.mutate({ id: editId, data: payload });
  };

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const getDeptName = (id) => departments.find(d => d.dept_id === id)?.dept_name || '—';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff</h1>
          <p className="page-subtitle">{staff.length} staff members</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Staff</button>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} color="var(--text-muted)" />
          <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <div className="loading-state"><div className="spinner" /><span>Loading staff...</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><UserRound size={40} /><span>No staff found</span></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>#</th><th>Name</th><th>Gender</th><th>Role</th><th>Department</th><th>Phone</th><th>Salary</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.staff_id}>
                    <td style={{ color: 'var(--text-muted)' }}>{s.staff_id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.staff_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                    </td>
                    <td>{s.gender}</td>
                    <td><span className="badge badge-info">{s.role}</span></td>
                    <td>{getDeptName(s.dept_id)}</td>
                    <td>{s.phone}</td>
                    <td style={{ color: 'var(--success)' }}>₹{s.salary?.toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${s.status === 'available' ? 'badge-success' : 'badge-neutral'}`}>{s.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}><Edit2 size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteMut.mutate(s.staff_id)}><Trash2 size={14} /></button>
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
              <h2 className="modal-title">{modal === 'add' ? 'Add Staff Member' : 'Edit Staff'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" name="staff_name" value={form.staff_name} onChange={handleChange} required placeholder="Staff name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Email" />
                </div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select className="form-select" name="dept_id" value={form.dept_id} onChange={handleChange} required>
                    <option value="">Select department</option>
                    {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <input className="form-input" name="role" value={form.role} onChange={handleChange} required placeholder="e.g. Nurse, Receptionist" />
                </div>
                <div className="form-group">
                  <label className="form-label">Salary *</label>
                  <input className="form-input" name="salary" type="number" value={form.salary} onChange={handleChange} required placeholder="Monthly salary" />
                </div>
                <div className="form-group">
                  <label className="form-label">Joining Date *</label>
                  <input className="form-input" name="joining_date" type="date" value={form.joining_date} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                    <option value="available">Available</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" name="address" value={form.address} onChange={handleChange} placeholder="Address (optional)" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{modal === 'add' ? 'Add Staff' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
