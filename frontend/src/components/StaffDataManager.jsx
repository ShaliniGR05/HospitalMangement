import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createAppointment,
  deleteAppointment,
  listAppointments,
  updateAppointment,
} from "../api/appointmentsApi";
import {
  createConsultationBilling,
  deleteConsultationBilling,
  listConsultationBillings,
  updateConsultationBilling,
} from "../api/consultationBillingsApi";
import { createPatient, deletePatient, listPatients, updatePatient } from "../api/patientsApi";
import { STAFF_TABLES } from "../config/staffTables";
import "./StaffDataManager.css";

const TABLE_HANDLERS = {
  patient: { list: listPatients, create: createPatient, update: updatePatient, delete: deletePatient },
  appointment: { list: listAppointments, create: createAppointment, update: updateAppointment, delete: deleteAppointment },
  consultation_billing: { list: listConsultationBillings, create: createConsultationBilling, update: updateConsultationBilling, delete: deleteConsultationBilling },
};

function initialFormState(fields) {
  return fields.reduce((acc, field) => { acc[field.name] = ""; return acc; }, {});
}

function parseInputValue(field, rawValue) {
  if (rawValue === "") return field.nullable ? null : "";
  if (field.type === "number") { const p = Number(rawValue); return Number.isNaN(p) ? rawValue : p; }
  return rawValue;
}

function buildPayload(fields, formData) {
  const payload = {};
  fields.forEach((f) => { payload[f.name] = parseInputValue(f, formData[f.name]); });
  return payload;
}

function normalizeCellValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

const STATUS_VALUES = ["pending", "completed", "cancelled", "paid", "failed", "available", "offline"];

function CellValue({ value }) {
  const str = normalizeCellValue(value);
  const lower = str.toLowerCase();
  if (STATUS_VALUES.includes(lower)) return <span className={`status-badge status-badge--${lower}`}>{str}</span>;
  return <>{str}</>;
}

function FieldInput({ field, value, onChange }) {
  if (field.type === "select") {
    return (
      <div className="input-group">
        <label className="field-label" htmlFor={field.name}>{field.label || field.name}</label>
        <select id={field.name} name={field.name} value={value} onChange={onChange} required={field.required}>
          <option value="">Select...</option>
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  if (field.type === "textarea") {
    return (
      <div className="input-group">
        <label className="field-label" htmlFor={field.name}>{field.label || field.name}</label>
        <textarea id={field.name} name={field.name} rows={2} value={value} onChange={onChange} placeholder={field.label} required={field.required} />
      </div>
    );
  }
  return (
    <div className="input-group">
      <label className="field-label" htmlFor={field.name}>{field.label || field.name}</label>
      <input id={field.name} name={field.name} type={field.type || "text"} value={value} onChange={onChange} placeholder={field.label} required={field.required} step={field.type === "number" ? "any" : undefined} />
    </div>
  );
}

function StaffDataManager({ token, selectedTableKey }) {
  const [rows, setRows] = useState([]);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const selectedTable = useMemo(
    () => STAFF_TABLES.find((t) => t.key === selectedTableKey) || STAFF_TABLES[0],
    [selectedTableKey],
  );

  const [createFormData, setCreateFormData] = useState(initialFormState(selectedTable.fields));

  const sortedRows = useMemo(() => {
    const key = selectedTable.primaryKey;
    return [...rows].sort((a, b) => Number(a[key]) - Number(b[key]));
  }, [rows, selectedTable.primaryKey]);

  const refreshRows = useCallback(async () => {
    setIsLoadingRows(true);
    setError("");
    try {
      const handlers = TABLE_HANDLERS[selectedTable.key];
      const data = await handlers.list(token);
      setRows(data);
    } catch (err) {
      setRows([]);
      setError(err.message || `Could not load ${selectedTable.title}`);
    } finally {
      setIsLoadingRows(false);
    }
  }, [selectedTable.key, selectedTable.title, token]);

  useEffect(() => {
    setEditId(null);
    setError("");
    setShowCreateForm(false);
    setCreateFormData(initialFormState(selectedTable.fields));
    refreshRows();
  }, [selectedTable, refreshRows]);

  const handleCreateChange = (e) => { const { name, value } = e.target; setCreateFormData((p) => ({ ...p, [name]: value })); };
  const handleEditChange = (e) => { const { name, value } = e.target; setEditFormData((p) => ({ ...p, [name]: value })); };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const handlers = TABLE_HANDLERS[selectedTable.key];
      const payload = buildPayload(selectedTable.fields, createFormData);
      await handlers.create(token, payload);
      setCreateFormData(initialFormState(selectedTable.fields));
      setShowCreateForm(false);
      await refreshRows();
    } catch (err) {
      setError(err.message || `Could not add ${selectedTable.title}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (row) => {
    setEditId(row[selectedTable.primaryKey]);
    const prefill = selectedTable.fields.reduce((acc, f) => { acc[f.name] = row[f.name] ?? ""; return acc; }, {});
    setEditFormData(prefill);
    setError("");
  };

  const cancelEdit = () => { setEditId(null); setEditFormData({}); };

  const saveEdit = async () => {
    if (editId === null || editId === undefined) return;
    setIsSubmitting(true);
    setError("");
    try {
      const handlers = TABLE_HANDLERS[selectedTable.key];
      const payload = buildPayload(selectedTable.fields, editFormData);
      await handlers.update(token, editId, payload);
      setEditId(null);
      setEditFormData({});
      await refreshRows();
    } catch (err) {
      setError(err.message || `Could not update ${selectedTable.title}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeRow = async (id) => {
    if (!window.confirm(`Delete ${selectedTable.title} #${id}?`)) return;
    setIsSubmitting(true);
    setError("");
    try {
      const handlers = TABLE_HANDLERS[selectedTable.key];
      await handlers.delete(token, id);
      await refreshRows();
    } catch (err) {
      setError(err.message || `Could not delete ${selectedTable.title}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayColumns = useMemo(
    () => [selectedTable.primaryKey, ...selectedTable.fields.map((f) => f.name)],
    [selectedTable],
  );

  return (
    <section className="data-manager">
      <div className="data-manager__header">
        <div>
          <h2 className="data-manager__title">{selectedTable.title}</h2>
          <p className="data-manager__subtitle">{sortedRows.length} record{sortedRows.length !== 1 ? "s" : ""} found</p>
        </div>
        <div className="data-manager__actions">
          <button type="button" className="secondary-button" onClick={refreshRows} disabled={isLoadingRows || isSubmitting}>
            {isLoadingRows ? "Loading…" : "↻ Refresh"}
          </button>
          <button type="button" className="primary-button" onClick={() => setShowCreateForm((s) => !s)}>
            {showCreateForm ? "✕ Close" : "+ Add New"}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <form className="entity-form" onSubmit={handleCreate}>
          <h3>Add {selectedTable.title}</h3>
          {selectedTable.fields.map((field) => (
            <FieldInput key={`create-${field.name}`} field={field} value={createFormData[field.name]} onChange={handleCreateChange} />
          ))}
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : `Add ${selectedTable.title}`}</button>
        </form>
      )}

      {error ? <p className="inline-error">⚠ {error}</p> : null}

      {isLoadingRows ? (
        <div className="skeleton-wrap">{[1,2,3,4,5].map((i) => <div key={i} className="skeleton skeleton-row" />)}</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {displayColumns.map((col) => <th key={col}>{col.replace(/_/g, " ")}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => {
                const rowId = row[selectedTable.primaryKey];
                return (
                  <tr key={String(rowId)}>
                    {displayColumns.map((col) => <td key={`${rowId}-${col}`}><CellValue value={row[col]} /></td>)}
                    <td className="row-actions">
                      <button type="button" onClick={() => startEdit(row)}>Edit</button>
                      <button type="button" onClick={() => removeRow(rowId)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
              {!sortedRows.length ? <tr><td colSpan={displayColumns.length + 1} className="empty-cell">No records found.</td></tr> : null}
            </tbody>
          </table>
        </div>
      )}

      {editId !== null ? (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>✏️ Edit {selectedTable.title} #{editId}</h3>
            <div className="modal-form-grid">
              {selectedTable.fields.map((field) => (
                <FieldInput key={`edit-${field.name}`} field={field} value={editFormData[field.name]} onChange={handleEditChange} />
              ))}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={cancelEdit} disabled={isSubmitting}>Cancel</button>
              <button type="button" className="btn-save" onClick={saveEdit} disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save Changes"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default StaffDataManager;
