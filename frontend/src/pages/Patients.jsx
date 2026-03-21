import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPatients, createPatient, updatePatient, deletePatient } from '../services/api';
import { Plus, Search, Edit2, Trash2, X, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { patient_name: '', gender: 'Male', age: '', phone_num: '', address: '', blood_group: '', registration_date: '' };
const BLOOD = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Patients() {
  const qc = useQueryClient();
  const { data: patients = [], isLoading } = useQuery({ queryKey: ['patients'], queryFn: () => getPatients().then(r => r.data) });
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const filtered = patients.filter(p =>
    p.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone_num.includes(search)
  );

  const createMut = useMutation({
    mutationFn: createPatient,
    onSuccess: () => { qc.invalidateQueries(['patients']); toast.success('Patient added'); closeModal(); },
    onError: () => toast.error('Failed to add patient'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updatePatient(id, data),
    onSuccess: () => { qc.invalidateQueries(['patients']); toast.success('Patient updated'); closeModal(); },
    onError: () => toast.error('Failed to update patient'),
  });

  const deleteMut = useMutation({
    mutationFn: deletePatient,
    onSuccess: () => { qc.invalidateQueries(['patients']); toast.success('Patient deleted'); },
    onError: () => toast.error('Failed to delete patient'),
  });

  const openAdd = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (p) => {
    setForm({ ...p });
    setEditId(p.patient_id);
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setForm(EMPTY); setEditId(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, age: parseInt(form.age) };
    if (modal === 'add') createMut.mutate(payload);
    else updateMut.mutate({ id: editId, data: payload });
  };

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">{patients.length} registered patients</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Patient</button>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} color="var(--text-muted)" />
          <input placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {isLoading ? (
          <div className="loading-state"><div className="spinner" /><span>Loading patients...</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Users size={40} /><span>No patients found</span></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Gender</th><th>Age</th>
                  <th>Phone</th><th>Blood Group</th><th>Reg. Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.patient_id}>
                    <td style={{ color: 'var(--text-muted)' }}>{p.patient_id}</td>
                    <td style={{ fontWeight: 600 }}>{p.patient_name}</td>
                    <td><span className={`badge ${p.gender === 'Male' ? 'badge-info' : 'badge-success'}`}>{p.gender}</span></td>
                    <td>{p.age}</td>
                    <td>{p.phone_num}</td>
                    <td><span className="badge badge-warning">{p.blood_group || '—'}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.registration_date}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}><Edit2 size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteMut.mutate(p.patient_id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'add' ? 'Add New Patient' : 'Edit Patient'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" name="patient_name" value={form.patient_name} onChange={handleChange} required placeholder="Patient's full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Age *</label>
                  <input className="form-input" name="age" type="number" min={0} value={form.age} onChange={handleChange} required placeholder="Age" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" name="phone_num" value={form.phone_num} onChange={handleChange} required placeholder="Phone number" />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-select" name="blood_group" value={form.blood_group} onChange={handleChange}>
                    <option value="">Select</option>
                    {BLOOD.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Registration Date *</label>
                  <input className="form-input" name="registration_date" type="date" value={form.registration_date} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" name="address" value={form.address} onChange={handleChange} placeholder="Address (optional)" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{modal === 'add' ? 'Add Patient' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
