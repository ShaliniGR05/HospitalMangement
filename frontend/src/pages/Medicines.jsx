import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMedicines, createMedicine, updateMedicine, deleteMedicine } from '../services/api';
import { Plus, Search, Edit2, Trash2, X, Pill } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { medicine_name: '', unit_price: '' };

export default function Medicines() {
  const qc = useQueryClient();
  const { data: medicines = [], isLoading } = useQuery({ queryKey: ['medicines'], queryFn: () => getMedicines().then(r => r.data) });
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const filtered = medicines.filter(m => m.medicine_name.toLowerCase().includes(search.toLowerCase()));

  const createMut = useMutation({ mutationFn: createMedicine, onSuccess: () => { qc.invalidateQueries(['medicines']); toast.success('Medicine added'); closeModal(); }, onError: () => toast.error('Failed') });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => updateMedicine(id, data), onSuccess: () => { qc.invalidateQueries(['medicines']); toast.success('Updated'); closeModal(); } });
  const deleteMut = useMutation({ mutationFn: deleteMedicine, onSuccess: () => { qc.invalidateQueries(['medicines']); toast.success('Deleted'); } });

  const openAdd = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (m) => { setForm({ medicine_name: m.medicine_name, unit_price: m.unit_price }); setEditId(m.medicine_id); setModal('edit'); };
  const closeModal = () => { setModal(null); setForm(EMPTY); setEditId(null); };
  const handleSubmit = (e) => { e.preventDefault(); const payload = { ...form, unit_price: parseFloat(form.unit_price) }; if (modal === 'add') createMut.mutate(payload); else updateMut.mutate({ id: editId, data: payload }); };
  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Medicines</h1>
          <p className="page-subtitle">{medicines.length} medicines in inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Medicine</button>
      </div>
      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} color="var(--text-muted)" />
          <input placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        {isLoading ? <div className="loading-state"><div className="spinner" /></div> :
          filtered.length === 0 ? <div className="empty-state"><Pill size={40} /><span>No medicines found</span></div> :
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Medicine Name</th><th>Unit Price (₹)</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.medicine_id}>
                    <td style={{ color: 'var(--text-muted)' }}>{m.medicine_id}</td>
                    <td style={{ fontWeight: 600 }}>{m.medicine_name}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 700 }}>₹{m.unit_price.toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(m)}><Edit2 size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteMut.mutate(m.medicine_id)}><Trash2 size={14} /></button>
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
              <h2 className="modal-title">{modal === 'add' ? 'Add Medicine' : 'Edit Medicine'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Medicine Name *</label><input className="form-input" name="medicine_name" value={form.medicine_name} onChange={handleChange} required placeholder="Medicine name" /></div>
              <div className="form-group"><label className="form-label">Unit Price (₹) *</label><input className="form-input" name="unit_price" type="number" step="0.01" value={form.unit_price} onChange={handleChange} required placeholder="Price per unit" /></div>
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
