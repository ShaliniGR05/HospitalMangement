import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor, getStaff } from '../services/api';
import { Plus, Search, Edit2, Trash2, X, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { staff_id: '', specialization: '', qualification: '', experience: 0, no_of_patients: 0 };

export default function Doctors() {
  const qc = useQueryClient();
  const { data: doctors = [], isLoading } = useQuery({ queryKey: ['doctors'], queryFn: () => getDoctors().then(r => r.data) });
  const { data: staff = [] } = useQuery({ queryKey: ['staff'], queryFn: () => getStaff().then(r => r.data) });
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const filtered = doctors.filter(d =>
    (d.staff?.staff_name || '').toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const createMut = useMutation({
    mutationFn: createDoctor,
    onSuccess: () => { qc.invalidateQueries(['doctors']); toast.success('Doctor added'); closeModal(); },
    onError: () => toast.error('Failed to add doctor'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateDoctor(id, data),
    onSuccess: () => { qc.invalidateQueries(['doctors']); toast.success('Doctor updated'); closeModal(); },
  });

  const deleteMut = useMutation({
    mutationFn: deleteDoctor,
    onSuccess: () => { qc.invalidateQueries(['doctors']); toast.success('Doctor removed'); },
  });

  const openAdd = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (d) => {
    setForm({ staff_id: d.staff_id, specialization: d.specialization, qualification: d.qualification, experience: d.experience, no_of_patients: d.no_of_patients });
    setEditId(d.doc_id);
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setForm(EMPTY); setEditId(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, staff_id: parseInt(form.staff_id), experience: parseInt(form.experience), no_of_patients: parseInt(form.no_of_patients) };
    if (modal === 'add') createMut.mutate(payload);
    else updateMut.mutate({ id: editId, data: payload });
  };

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctors</h1>
          <p className="page-subtitle">{doctors.length} doctors on staff</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Doctor</button>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} color="var(--text-muted)" />
          <input placeholder="Search by name or specialization..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <div className="loading-state"><div className="spinner" /><span>Loading doctors...</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Stethoscope size={40} /><span>No doctors found</span></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>#</th><th>Name</th><th>Specialization</th><th>Qualification</th><th>Experience</th><th>Patients</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.doc_id}>
                    <td style={{ color: 'var(--text-muted)' }}>{d.doc_id}</td>
                    <td style={{ fontWeight: 600 }}>
                      {d.staff?.staff_name || `Staff #${d.staff_id}`}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.staff?.email}</div>
                    </td>
                    <td><span className="badge badge-info">{d.specialization}</span></td>
                    <td>{d.qualification}</td>
                    <td>{d.experience} yrs</td>
                    <td>{d.no_of_patients}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(d)}><Edit2 size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteMut.mutate(d.doc_id)}><Trash2 size={14} /></button>
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
              <h2 className="modal-title">{modal === 'add' ? 'Add Doctor' : 'Edit Doctor'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Staff Member *</label>
                <select className="form-select" name="staff_id" value={form.staff_id} onChange={handleChange} required>
                  <option value="">Select staff member</option>
                  {staff.map(s => <option key={s.staff_id} value={s.staff_id}>{s.staff_name} ({s.email})</option>)}
                </select>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Specialization *</label>
                  <input className="form-input" name="specialization" value={form.specialization} onChange={handleChange} required placeholder="e.g. Cardiology" />
                </div>
                <div className="form-group">
                  <label className="form-label">Qualification *</label>
                  <input className="form-input" name="qualification" value={form.qualification} onChange={handleChange} required placeholder="e.g. MBBS, MD" />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input className="form-input" name="experience" type="number" min={0} value={form.experience} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">No. of Patients</label>
                  <input className="form-input" name="no_of_patients" type="number" min={0} value={form.no_of_patients} onChange={handleChange} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{modal === 'add' ? 'Add Doctor' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
