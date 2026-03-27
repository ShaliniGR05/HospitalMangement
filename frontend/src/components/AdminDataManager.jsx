import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createTableRow,
  deleteTableRow,
  listTableRows,
  updateTableRow,
} from "../api/adminTablesApi";
import { ADMIN_TABLES } from "../config/adminTables";
import "./AdminDataManager.css";

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

function buildPayload(fields, formData, mode) {
  const payload = {};

  fields.forEach((field) => {
    const rawValue = formData[field.name];

    if (mode === "update" && field.omitIfEmptyOnUpdate && String(rawValue || "").trim() === "") {
      return;
    }

    const parsed = parseInputValue(field, rawValue);

    if (mode === "update") {
      payload[field.name] = parsed;
      return;
    }

    if (mode === "create" && parsed === "" && !field.required && !field.nullable) {
      return;
    }

    payload[field.name] = parsed;
  });

  return payload;
}

function normalizeCellValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return String(value);
}

const STATUS_VALUES = ["pending", "completed", "cancelled", "paid", "failed", "available", "offline"];

function CellValue({ value }) {
  const str = normalizeCellValue(value);
  const lower = str.toLowerCase();
  if (STATUS_VALUES.includes(lower)) {
    return <span className={`status-badge status-badge--${lower}`}>{str}</span>;
  }
  return <>{str}</>;
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

function AdminDataManager({ token, selectedTableKey }) {
  const [rows, setRows] = useState([]);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const selectedTable = useMemo(
    () => ADMIN_TABLES.find((table) => table.key === selectedTableKey) || ADMIN_TABLES[0],
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
      const data = await listTableRows(token, selectedTable.endpoint);
      setRows(data);
    } catch (err) {
      setRows([]);
      setError(err.message || `Could not load ${selectedTable.title}`);
    } finally {
      setIsLoadingRows(false);
    }
  }, [selectedTable.endpoint, selectedTable.title, token]);

  useEffect(() => {
    setEditId(null);
    setError("");
    setShowCreateForm(false);
    setCreateFormData(initialFormState(selectedTable.fields));
    refreshRows();
  }, [selectedTable, refreshRows]);

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
      const payload = buildPayload(selectedTable.fields, createFormData, "create");
      await createTableRow(token, selectedTable.endpoint, payload);
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
    const prefill = selectedTable.fields.reduce((acc, field) => {
      acc[field.name] = row[field.name] ?? "";
      return acc;
    }, {});
    setEditFormData(prefill);
    setError("");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditFormData({});
  };

  const saveEdit = async () => {
    if (editId === null || editId === undefined) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const payload = buildPayload(selectedTable.fields, editFormData, "update");
      await updateTableRow(token, selectedTable.endpoint, editId, payload);
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
    const approved = window.confirm(`Delete ${selectedTable.title} #${id}?`);
    if (!approved) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await deleteTableRow(token, selectedTable.endpoint, id);
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
    <section className="data-manager">
      {/* Header Bar */}
      <div className="data-manager__header">
        <div>
          <h2 className="data-manager__title">{selectedTable.title}</h2>
          <p className="data-manager__subtitle">
            {sortedRows.length} record{sortedRows.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="data-manager__actions">
          <button
            type="button"
            className="secondary-button"
            onClick={refreshRows}
            disabled={isLoadingRows || isSubmitting}
          >
            {isLoadingRows ? "Loading…" : "↻ Refresh"}
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => setShowCreateForm((s) => !s)}
          >
            {showCreateForm ? "✕ Close" : "+ Add New"}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
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
            {isSubmitting ? "Saving…" : `Add ${selectedTable.title}`}
          </button>
        </form>
      )}

      {error ? <p className="inline-error">⚠ {error}</p> : null}

      {/* Data Table */}
      {isLoadingRows ? (
        <div className="skeleton-wrap">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton skeleton-row" />
          ))}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {displayColumns.map((column) => (
                  <th key={column}>{column.replace(/_/g, " ")}</th>
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
                      <td key={`${rowId}-${column}`}>
                        <CellValue value={row[column]} />
                      </td>
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
                  <td colSpan={displayColumns.length + 1} className="empty-cell">
                    No records found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editId !== null ? (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>
              ✏️ Edit {selectedTable.title} #{editId}
            </h3>
            <div className="modal-form-grid">
              {selectedTable.fields.map((field) => (
                <FieldInput
                  key={`edit-${field.name}`}
                  field={field}
                  value={editFormData[field.name]}
                  onChange={handleEditChange}
                />
              ))}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={cancelEdit} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="button" className="btn-save" onClick={saveEdit} disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AdminDataManager;
