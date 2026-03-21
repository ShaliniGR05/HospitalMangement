import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLabTests, createLabTest, updateLabTest, deleteLabTest } from '../services/api';
import { Plus, Search, Edit2, Trash2, X, FlaskConical } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { test_name: '', standard_cost: '' };

export default function LabTests() {
  const qc = useQueryClient();
  const { data: tests = [], isLoading } = useQuery({ queryKey: ['labTests'], queryFn: () => getLabTests().then(r => r.data) });
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const filtered = tests.filter(t => t.test_name.toLowerCase().includes(search.toLowerCase()));

  const createMut = useMutation({ mutationFn: createLabTest, onSuccess: () => { qc.invalidateQueries(['labTests']); toast.success('Lab test added'); closeModal(); }, onError: () => toast.error('Failed') });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => updateLabTest(id, data), onSuccess: () => { qc.invalidateQueries(['labTests']); toast.success('Updated'); closeModal(); } });
  const deleteMut = useMutation({ mutationFn: deleteLabTest, onSuccess: () => { qc.invalidateQueries(['labTests']); toast.success('Deleted'); } });

  const openAdd = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (t) => { setForm({ test_name: t.test_name, standard_cost: t.standard_cost }); setEditId(t.test_id); setModal('edit'); };
  const closeModal = () => { setModal(null); setForm(EMPTY); setEditId(null); };
  const handleSubmit = (e) => { e.preventDefault(); const payload = { ...form, standard_cost: parseFloat(form.standard_cost) }; if (modal === 'add') createMut.mutate(payload); else updateMut.mutate({ id: editId, data: payload }); };
  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lab Tests</h1>
          <p className="page-subtitle">{tests.length} tests available</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Lab Test</button>
      </div>
      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} color="var(--text-muted)" />
          <input placeholder="Search lab tests..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        {isLoading ? <div className="loading-state"><div className="spinner" /></div> :
          filtered.length === 0 ? <div className="empty-state"><FlaskConical size={40} /><span>No lab tests found</span></div> :
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Test Name</th><th>Standard Cost (₹)</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.test_id}>
                    <td style={{ color: 'var(--text-muted)' }}>{t.test_id}</td>
                    <td style={{ fontWeight: 600 }}>{t.test_name}</td>
                    <td style={{ color: 'var(--info)', fontWeight: 700 }}>₹{t.standard_cost.toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(t)}><Edit2 size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteMut.mutate(t.test_id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </div>
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'add' ? 'Add Lab Test' : 'Edit Lab Test'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Test Name *</label><input className="form-input" name="test_name" value={form.test_name} onChange={handleChange} required placeholder="Test name" /></div>
              <div className="form-group"><label className="form-label">Standard Cost (₹) *</label><input className="form-input" name="standard_cost" type="number" step="0.01" value={form.standard_cost} onChange={handleChange} required placeholder="Cost" /></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{modal === 'add' ? 'Add' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
