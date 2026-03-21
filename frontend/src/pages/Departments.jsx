import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../services/api';
import { Plus, Search, Edit2, Trash2, X, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { dept_name: '', no_of_staffs: 0 };

export default function Departments() {
  const qc = useQueryClient();
  const { data: departments = [], isLoading } = useQuery({ queryKey: ['departments'], queryFn: () => getDepartments().then(r => r.data) });
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const filtered = departments.filter(d => d.dept_name.toLowerCase().includes(search.toLowerCase()));

  const createMut = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => { qc.invalidateQueries(['departments']); toast.success('Department created'); closeModal(); },
    onError: () => toast.error('Failed to create department'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateDepartment(id, data),
    onSuccess: () => { qc.invalidateQueries(['departments']); toast.success('Department updated'); closeModal(); },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => { qc.invalidateQueries(['departments']); toast.success('Department deleted'); },
    onError: () => toast.error('Failed to delete'),
  });

  const openAdd = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (d) => { setForm({ dept_name: d.dept_name, no_of_staffs: d.no_of_staffs }); setEditId(d.dept_id); setModal('edit'); };
  const closeModal = () => { setModal(null); setForm(EMPTY); setEditId(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, no_of_staffs: parseInt(form.no_of_staffs) };
    if (modal === 'add') createMut.mutate(payload);
    else updateMut.mutate({ id: editId, data: payload });
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">{departments.length} departments</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Department</button>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} color="var(--text-muted)" />
          <input placeholder="Search departments..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="dept-cards">
        {isLoading ? (
          <div className="loading-state"><div className="spinner" /><span>Loading...</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Building2 size={40} /><span>No departments found</span></div>
        ) : filtered.map(d => (
          <div className="dept-card card" key={d.dept_id}>
            <div className="dept-icon"><Building2 size={24} color="var(--accent-primary)" /></div>
            <div className="dept-name">{d.dept_name}</div>
            <div className="dept-staff">{d.no_of_staffs} staff</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => openEdit(d)}><Edit2 size={14} /> Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => deleteMut.mutate(d.dept_id)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'add' ? 'Add Department' : 'Edit Department'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Department Name *</label>
                <input className="form-input" name="dept_name" value={form.dept_name} onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))} required placeholder="e.g. Cardiology" />
              </div>
              <div className="form-group">
                <label className="form-label">Number of Staffs</label>
                <input className="form-input" name="no_of_staffs" type="number" value={form.no_of_staffs} onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))} min={0} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{modal === 'add' ? 'Create' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .dept-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 16px; }
        .dept-card { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
        .dept-icon { width: 48px; height: 48px; background: var(--accent-glow); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
        .dept-name { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
        .dept-staff { font-size: 0.8rem; color: var(--text-muted); }
      `}</style>
    </div>
  );
}
