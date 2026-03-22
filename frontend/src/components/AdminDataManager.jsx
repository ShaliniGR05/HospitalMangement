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
    return "-";
  }
  return String(value);
}

function FieldInput({ field, value, onChange }) {
  if (field.type === "select") {
    return (
      <select name={field.name} value={value} onChange={onChange} required={field.required}>
        <option value="">Select...</option>
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        name={field.name}
        rows={2}
        value={value}
        onChange={onChange}
        placeholder={field.label}
        required={field.required}
      />
    );
  }

  return (
    <input
      name={field.name}
      type={field.type || "text"}
      value={value}
      onChange={onChange}
      placeholder={field.label}
      required={field.required}
      step={field.type === "number" ? "any" : undefined}
    />
  );
}

function AdminDataManager({ token }) {
  const [selectedTableKey, setSelectedTableKey] = useState(ADMIN_TABLES[0].key);
  const [rows, setRows] = useState([]);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [error, setError] = useState("");
  const [createFormData, setCreateFormData] = useState(initialFormState(ADMIN_TABLES[0].fields));
  const [editId, setEditId] = useState(null);
  const [editFormData, setEditFormData] = useState(initialFormState(ADMIN_TABLES[0].fields));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTable = useMemo(
    () => ADMIN_TABLES.find((table) => table.key === selectedTableKey) || ADMIN_TABLES[0],
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
    refreshRows();
  }, [refreshRows]);

  const switchTable = async (tableKey) => {
    const nextTable = ADMIN_TABLES.find((table) => table.key === tableKey);
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
      const payload = buildPayload(selectedTable.fields, createFormData, "create");
      await createTableRow(token, selectedTable.endpoint, payload);
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
      const payload = buildPayload(selectedTable.fields, editFormData, "update");
      await updateTableRow(token, selectedTable.endpoint, editId, payload);
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
    <section className="panel-card admin-data-manager">
      <div className="admin-heading-row">
        <h2>Admin Data Console</h2>
        <button type="button" onClick={refreshRows} disabled={isLoadingRows || isSubmitting}>
          {isLoadingRows ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="table-card-grid">
        {ADMIN_TABLES.map((table) => (
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

export default AdminDataManager;
