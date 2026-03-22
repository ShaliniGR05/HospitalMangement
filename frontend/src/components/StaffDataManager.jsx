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
  patient: {
    list: listPatients,
    create: createPatient,
    update: updatePatient,
    delete: deletePatient,
  },
  appointment: {
    list: listAppointments,
    create: createAppointment,
    update: updateAppointment,
    delete: deleteAppointment,
  },
  consultation_billing: {
    list: listConsultationBillings,
    create: createConsultationBilling,
    update: updateConsultationBilling,
    delete: deleteConsultationBilling,
  },
};

function initialFormState(fields) {
  return fields.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {});
}

function parseInputValue(field, rawValue) {
  if (rawValue === "") {
    return field.nullable ? null : "";
  }

  if (field.type === "number") {
    const parsed = Number(rawValue);
    return Number.isNaN(parsed) ? rawValue : parsed;
  }

  return rawValue;
}

function buildPayload(fields, formData) {
  const payload = {};
  fields.forEach((field) => {
    payload[field.name] = parseInputValue(field, formData[field.name]);
  });
  return payload;
}

function normalizeCellValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
}

function FieldInput({ field, value, onChange }) {
  if (field.type === "select") {
    return (
      <div className="input-group">
        <label className="field-label" htmlFor={field.name}>
          {field.label || field.name}
        </label>
        <select id={field.name} name={field.name} value={value} onChange={onChange} required={field.required}>
          <option value="">Select...</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="input-group">
        <label className="field-label" htmlFor={field.name}>
          {field.label || field.name}
        </label>
        <textarea
          id={field.name}
          name={field.name}
          rows={2}
          value={value}
          onChange={onChange}
          placeholder={field.label}
          required={field.required}
        />
      </div>
    );
  }

  return (
    <div className="input-group">
      <label className="field-label" htmlFor={field.name}>
        {field.label || field.name}
      </label>
      <input
        id={field.name}
        name={field.name}
        type={field.type || "text"}
        value={value}
        onChange={onChange}
        placeholder={field.label}
        required={field.required}
        step={field.type === "number" ? "any" : undefined}
      />
    </div>
  );
}

function StaffDataManager({ token }) {
  const [selectedTableKey, setSelectedTableKey] = useState(STAFF_TABLES[0].key);
  const [rows, setRows] = useState([]);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [error, setError] = useState("");
  const [createFormData, setCreateFormData] = useState(initialFormState(STAFF_TABLES[0].fields));
  const [editId, setEditId] = useState(null);
  const [editFormData, setEditFormData] = useState(initialFormState(STAFF_TABLES[0].fields));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTable = useMemo(
    () => STAFF_TABLES.find((table) => table.key === selectedTableKey) || STAFF_TABLES[0],
    [selectedTableKey],
  );

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
    refreshRows();
  }, [refreshRows]);

  const switchTable = (tableKey) => {
    const nextTable = STAFF_TABLES.find((table) => table.key === tableKey);
    if (!nextTable) {
      return;
    }

    setSelectedTableKey(tableKey);
    setRows([]);
    setEditId(null);
    setError("");
    setCreateFormData(initialFormState(nextTable.fields));
    setEditFormData(initialFormState(nextTable.fields));
  };

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setCreateFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const handlers = TABLE_HANDLERS[selectedTable.key];
      const payload = buildPayload(selectedTable.fields, createFormData);
      await handlers.create(token, payload);
      setCreateFormData(initialFormState(selectedTable.fields));
      await refreshRows();
    } catch (err) {
      setError(err.message || `Could not add ${selectedTable.title}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (row) => {
    setEditId(row[selectedTable.primaryKey]);
    const prefill = selectedTable.fields.reduce((acc, field) => {
      acc[field.name] = row[field.name] ?? "";
      return acc;
    }, {});
    setEditFormData(prefill);
    setError("");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditFormData(initialFormState(selectedTable.fields));
  };

  const saveEdit = async () => {
    if (editId === null || editId === undefined) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const handlers = TABLE_HANDLERS[selectedTable.key];
      const payload = buildPayload(selectedTable.fields, editFormData);
      await handlers.update(token, editId, payload);
      setEditId(null);
      setEditFormData(initialFormState(selectedTable.fields));
      await refreshRows();
    } catch (err) {
      setError(err.message || `Could not update ${selectedTable.title}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeRow = async (id) => {
    const approved = window.confirm(`Delete ${selectedTable.title} #${id}?`);
    if (!approved) {
      return;
    }

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
    () => [selectedTable.primaryKey, ...selectedTable.fields.map((field) => field.name)],
    [selectedTable],
  );

  return (
    <section className="panel-card staff-data-manager">
      <div className="admin-heading-row">
        <h2>Staff Data Console</h2>
        <button type="button" onClick={refreshRows} disabled={isLoadingRows || isSubmitting}>
          {isLoadingRows ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="table-card-grid staff-cards">
        {STAFF_TABLES.map((table) => (
          <button
            key={table.key}
            type="button"
            className={`table-card ${table.key === selectedTable.key ? "active" : ""}`}
            onClick={() => switchTable(table.key)}
          >
            <span>{table.title}</span>
          </button>
        ))}
      </div>

      <h3 className="table-title">Selected: {selectedTable.title}</h3>

      <form className="entity-form" onSubmit={handleCreate}>
        <h3>Add {selectedTable.title}</h3>
        {selectedTable.fields.map((field) => (
          <FieldInput
            key={`create-${field.name}`}
            field={field}
            value={createFormData[field.name]}
            onChange={handleCreateChange}
          />
        ))}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : `Add ${selectedTable.title}`}
        </button>
      </form>

      {error ? <p className="inline-error">{error}</p> : null}

      {isLoadingRows ? (
        <p>Loading {selectedTable.title}...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {displayColumns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => {
                const rowId = row[selectedTable.primaryKey];
                return (
                  <tr key={String(rowId)}>
                    {displayColumns.map((column) => (
                      <td key={`${rowId}-${column}`}>{normalizeCellValue(row[column])}</td>
                    ))}
                    <td className="row-actions">
                      <button type="button" onClick={() => startEdit(row)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => removeRow(rowId)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!sortedRows.length ? (
                <tr>
                  <td colSpan={displayColumns.length + 1}>No records found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {editId !== null ? (
        <section className="edit-box">
          <h3>
            Update {selectedTable.title} #{editId}
          </h3>
          <div className="edit-grid">
            {selectedTable.fields.map((field) => (
              <FieldInput
                key={`edit-${field.name}`}
                field={field}
                value={editFormData[field.name]}
                onChange={handleEditChange}
              />
            ))}
          </div>
          <div className="edit-actions">
            <button type="button" onClick={saveEdit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={cancelEdit} disabled={isSubmitting}>
              Cancel
            </button>
          </div>
        </section>
      ) : null}
    </section>
  );
}

export default StaffDataManager;
