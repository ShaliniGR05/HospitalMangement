import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPrescriptions, createPrescription, deletePrescription,
  getPrescribedMedicines, createPrescribedMedicine, deletePrescribedMedicine,
  getPrescribedTests, createPrescribedTest, deletePrescribedTest,
  getAppointments, getMedicines, getLabTests
} from '../services/api';
import { Plus, Trash2, X, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_RX = { appointment_id: '', prescribed_date: '' };
const EMPTY_MED = { prescription_id: '', medicine_id: '', quantity: 1, dosage: '', duration: '', unit_price: 0, amount: 0 };
const EMPTY_TEST = { appointment_id: '', test_id: '', prescribed_date: '', result_date: '', amount: 0, status: 'pending' };

export default function Prescriptions() {
  const qc = useQueryClient();
  const { data: prescriptions = [], isLoading } = useQuery({ queryKey: ['prescriptions'], queryFn: () => getPrescriptions().then(r => r.data) });
  const { data: appointments = [] } = useQuery({ queryKey: ['appointments'], queryFn: () => getAppointments().then(r => r.data) });
  const { data: medicines = [] } = useQuery({ queryKey: ['medicines'], queryFn: () => getMedicines().then(r => r.data) });
  const { data: labTests = [] } = useQuery({ queryKey: ['labTests'], queryFn: () => getLabTests().then(r => r.data) });
  const { data: prescribedMeds = [] } = useQuery({ queryKey: ['prescribedMeds'], queryFn: () => getPrescribedMedicines().then(r => r.data) });
  const { data: prescribedTests = [] } = useQuery({ queryKey: ['prescribedTests'], queryFn: () => getPrescribedTests().then(r => r.data) });

  const [modal, setModal] = useState(null); // 'rx' | 'med' | 'test'
  const [form, setForm] = useState({});
  const [expanded, setExpanded] = useState(null);

  const createRxMut = useMutation({ mutationFn: createPrescription, onSuccess: () => { qc.invalidateQueries(['prescriptions']); toast.success('Prescription created'); closeModal(); }, onError: () => toast.error('Failed') });
  const deleteRxMut = useMutation({ mutationFn: deletePrescription, onSuccess: () => { qc.invalidateQueries(['prescriptions']); toast.success('Deleted'); } });
  const createMedMut = useMutation({ mutationFn: createPrescribedMedicine, onSuccess: () => { qc.invalidateQueries(['prescribedMeds']); toast.success('Medicine prescribed'); closeModal(); }, onError: () => toast.error('Failed to prescribe medicine') });
  const deleteMedMut = useMutation({ mutationFn: deletePrescribedMedicine, onSuccess: () => qc.invalidateQueries(['prescribedMeds']) });
  const createTestMut = useMutation({ mutationFn: createPrescribedTest, onSuccess: () => { qc.invalidateQueries(['prescribedTests']); toast.success('Lab test prescribed'); closeModal(); }, onError: () => toast.error('Failed to prescribe test') });
  const deleteTestMut = useMutation({ mutationFn: deletePrescribedTest, onSuccess: () => qc.invalidateQueries(['prescribedTests']) });

  const closeModal = () => { setModal(null); setForm({}); };
  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const getApptLabel = (id) => {
    const a = appointments.find(x => x.appointment_id === id);
    return a ? `${a.patient?.patient_name || '?'} – ${a.appointment_date}` : `Appt #${id}`;
  };

  const getMedsForRx = (id) => prescribedMeds.filter(m => m.prescription_id === id);
  // Prescribed tests are linked to appointment, not prescription
  // We'll get the appointment for this prescription to match tests
  const getTestsForRx = (rx) => {
    const appt = appointments.find(a => a.appointment_id === rx.appointment_id);
    if (!appt) return [];
    return prescribedTests.filter(t => t.appointment_id === rx.appointment_id);
  };

  const handleSubmitRx = (e) => {
    e.preventDefault();
    createRxMut.mutate({ appointment_id: parseInt(form.appointment_id), prescribed_date: form.prescribed_date });
  };

  const handleSubmitMed = (e) => {
    e.preventDefault();
    const medicine = medicines.find(m => m.medicine_id === parseInt(form.medicine_id));
    const unitPrice = medicine?.unit_price || parseFloat(form.unit_price) || 0;
    const qty = parseInt(form.quantity);
    createMedMut.mutate({
      prescription_id: parseInt(form.prescription_id),
      medicine_id: parseInt(form.medicine_id),
      quantity: qty,
      dosage: form.dosage || null,
      duration: form.duration || null,
      unit_price: unitPrice,
      amount: unitPrice * qty,
    });
  };

  const handleSubmitTest = (e) => {
    e.preventDefault();
    const test = labTests.find(t => t.test_id === parseInt(form.test_id));
    createTestMut.mutate({
      appointment_id: parseInt(form.appointment_id),
      test_id: parseInt(form.test_id),
      prescribed_date: form.prescribed_date,
      result_date: form.result_date || null,
      amount: test?.standard_cost || parseFloat(form.amount) || 0,
      status: form.status || 'pending',
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Prescriptions</h1>
          <p className="page-subtitle">{prescriptions.length} prescriptions</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => { setForm({ ...EMPTY_TEST, appointment_id: '' }); setModal('test'); }}>+ Lab Test</button>
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY_RX); setModal('rx'); }}><Plus size={16} /> New Prescription</button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : prescriptions.length === 0 ? (
        <div className="empty-state"><ClipboardList size={40} /><span>No prescriptions yet</span></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {prescriptions.map(rx => {
            const meds = getMedsForRx(rx.prescription_id);
            const tests = getTestsForRx(rx);
            const isOpen = expanded === rx.prescription_id;
            return (
              <div className="card" key={rx.prescription_id} style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : rx.prescription_id)}>
                  <ClipboardList size={20} color="var(--accent-primary)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{getApptLabel(rx.appointment_id)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date: {rx.prescribed_date} · {meds.length} medicines · {tests.length} lab tests</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); setForm({ ...EMPTY_MED, prescription_id: rx.prescription_id }); setModal('med'); }}>+ Med</button>
                    <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); deleteRxMut.mutate(rx.prescription_id); }}><Trash2 size={14} /></button>
                    {isOpen ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </div>
                </div>
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Medicines</div>
                        {meds.length === 0 ? <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None prescribed</div> :
                          meds.map(m => (
                            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                              <span className="badge badge-info">{m.medicine?.medicine_name || `#${m.medicine_id}`}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>×{m.quantity} · {m.dosage} · {m.duration}</span>
                              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--success)' }}>₹{m.amount?.toFixed(2)}</span>
                              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }} onClick={() => deleteMedMut.mutate(m.id)}><Trash2 size={12} /></button>
                            </div>
                          ))
                        }
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lab Tests</div>
                        {tests.length === 0 ? <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None ordered</div> :
                          tests.map(t => (
                            <div key={t.prescribed_test_id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                              <span className="badge badge-warning">{t.lab_test?.test_name || `#${t.test_id}`}</span>
                              <span className={`badge ${t.status === 'completed' ? 'badge-success' : 'badge-neutral'}`}>{t.status}</span>
                              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--info)' }}>₹{t.amount?.toFixed(2)}</span>
                              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }} onClick={() => deleteTestMut.mutate(t.prescribed_test_id)}><Trash2 size={12} /></button>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Prescription Modal */}
      {modal === 'rx' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header"><h2 className="modal-title">New Prescription</h2><button className="modal-close" onClick={closeModal}><X size={20} /></button></div>
            <form className="modal-form" onSubmit={handleSubmitRx}>
              <div className="form-group"><label className="form-label">Appointment *</label>
                <select className="form-select" name="appointment_id" value={form.appointment_id} onChange={handleChange} required>
                  <option value="">Select appointment</option>
                  {appointments.map(a => <option key={a.appointment_id} value={a.appointment_id}>{a.patient?.patient_name} – {a.appointment_date} ({a.status})</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Prescribed Date *</label><input className="form-input" name="prescribed_date" type="date" value={form.prescribed_date} onChange={handleChange} required /></div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Prescribe Medicine Modal */}
      {modal === 'med' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header"><h2 className="modal-title">Prescribe Medicine</h2><button className="modal-close" onClick={closeModal}><X size={20} /></button></div>
            <form className="modal-form" onSubmit={handleSubmitMed}>
              <div className="form-group"><label className="form-label">Medicine *</label>
                <select className="form-select" name="medicine_id" value={form.medicine_id} onChange={e => {
                  const med = medicines.find(m => m.medicine_id === parseInt(e.target.value));
                  setForm(p => ({ ...p, medicine_id: e.target.value, unit_price: med?.unit_price || 0 }));
                }} required>
                  <option value="">Select medicine</option>
                  {medicines.map(m => <option key={m.medicine_id} value={m.medicine_id}>{m.medicine_name} (₹{m.unit_price}/unit)</option>)}
                </select>
              </div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Quantity *</label><input className="form-input" name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} required /></div>
                <div className="form-group"><label className="form-label">Dosage *</label><input className="form-input" name="dosage" value={form.dosage} onChange={handleChange} required placeholder="e.g. 1 tablet" /></div>
                <div className="form-group"><label className="form-label">Duration *</label><input className="form-input" name="duration" value={form.duration} onChange={handleChange} required placeholder="e.g. 7 days" /></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn btn-primary">Prescribe</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Prescribe Lab Test Modal */}
      {modal === 'test' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header"><h2 className="modal-title">Order Lab Test</h2><button className="modal-close" onClick={closeModal}><X size={20} /></button></div>
            <form className="modal-form" onSubmit={handleSubmitTest}>
              <div className="form-group"><label className="form-label">Appointment *</label>
                <select className="form-select" name="appointment_id" value={form.appointment_id} onChange={handleChange} required>
                  <option value="">Select appointment</option>
                  {appointments.map(a => <option key={a.appointment_id} value={a.appointment_id}>{a.patient?.patient_name} – {a.appointment_date}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Lab Test *</label>
                <select className="form-select" name="test_id" value={form.test_id} onChange={handleChange} required>
                  <option value="">Select test</option>
                  {labTests.map(t => <option key={t.test_id} value={t.test_id}>{t.test_name} (₹{t.standard_cost})</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Prescribed Date *</label><input className="form-input" name="prescribed_date" type="date" value={form.prescribed_date} onChange={handleChange} required /></div>
              <div className="form-group"><label className="form-label">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  <option value="pending">Pending</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn btn-primary">Order Test</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
