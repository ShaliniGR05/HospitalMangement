import { useCallback, useEffect, useMemo, useState } from "react";
import { createUser, deleteUser, listUsers, updateUser } from "../api/usersApi";
import "./AdminUserManager.css";

const DEFAULT_CREATE = {
  user_name: "",
  password: "",
  role: "Staff",
  doctor_id: "",
  staff_id: "",
};

const DEFAULT_EDIT = {
  user_name: "",
  password: "",
  role: "Staff",
  doctor_id: "",
  staff_id: "",
};

function normalizeOptionalInt(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function mapUserToEdit(user) {
  return {
    user_name: user.user_name,
    password: "",
    role: user.role,
    doctor_id: user.doctor_id ?? "",
    staff_id: user.staff_id ?? "",
  };
}

function AdminUserManager({ token }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [createForm, setCreateForm] = useState(DEFAULT_CREATE);
  const [isCreating, setIsCreating] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState(DEFAULT_EDIT);
  const [isUpdating, setIsUpdating] = useState(false);

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.user_id - b.user_id),
    [users],
  );

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await listUsers(token);
      setUsers(result);
    } catch (err) {
      setError(err.message || "Could not load users");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setIsCreating(true);
    setError("");
    try {
      await createUser(token, {
        user_name: createForm.user_name,
        password: createForm.password,
        role: createForm.role,
        doctor_id: normalizeOptionalInt(createForm.doctor_id),
        staff_id: normalizeOptionalInt(createForm.staff_id),
      });
      setCreateForm(DEFAULT_CREATE);
      await loadUsers();
    } catch (err) {
      setError(err.message || "Could not create user");
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (user) => {
    setEditingUserId(user.user_id);
    setEditForm(mapUserToEdit(user));
    setError("");
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditForm(DEFAULT_EDIT);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!editingUserId) {
      return;
    }
    setIsUpdating(true);
    setError("");
    try {
      const payload = {
        user_name: editForm.user_name,
        role: editForm.role,
        doctor_id: normalizeOptionalInt(editForm.doctor_id),
        staff_id: normalizeOptionalInt(editForm.staff_id),
      };

      if (editForm.password.trim()) {
        payload.password = editForm.password;
      }

      await updateUser(token, editingUserId, payload);
      setEditingUserId(null);
      setEditForm(DEFAULT_EDIT);
      await loadUsers();
    } catch (err) {
      setError(err.message || "Could not update user");
    } finally {
      setIsUpdating(false);
    }
  };

  const removeUser = async (userId) => {
    const approved = window.confirm("Delete this user?");
    if (!approved) {
      return;
    }

    setError("");
    try {
      await deleteUser(token, userId);
      await loadUsers();
    } catch (err) {
      setError(err.message || "Could not delete user");
    }
  };

  return (
    <section className="panel-card">
      <h2>User Administration</h2>

      <form className="user-form" onSubmit={handleCreate}>
        <h3>Add User</h3>
        <input
          name="user_name"
          placeholder="Username"
          value={createForm.user_name}
          onChange={handleCreateChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password (min 8 chars)"
          value={createForm.password}
          onChange={handleCreateChange}
          minLength={8}
          required
        />
        <select name="role" value={createForm.role} onChange={handleCreateChange}>
          <option value="Admin">Admin</option>
          <option value="Doctor">Doctor</option>
          <option value="Staff">Staff</option>
        </select>
        <input
          name="doctor_id"
          type="number"
          placeholder="doctor_id (optional)"
          value={createForm.doctor_id}
          onChange={handleCreateChange}
        />
        <input
          name="staff_id"
          type="number"
          placeholder="staff_id (optional)"
          value={createForm.staff_id}
          onChange={handleCreateChange}
        />
        <button type="submit" disabled={isCreating}>
          {isCreating ? "Adding..." : "Add User"}
        </button>
      </form>

      {error ? <p className="inline-error">{error}</p> : null}

      {isLoading ? (
        <p>Loading users...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>doctor_id</th>
                <th>staff_id</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td>{user.user_name}</td>
                  <td>{user.role}</td>
                  <td>{user.doctor_id ?? "-"}</td>
                  <td>{user.staff_id ?? "-"}</td>
                  <td className="row-actions">
                    <button type="button" onClick={() => startEdit(user)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => removeUser(user.user_id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!sortedUsers.length ? (
                <tr>
                  <td colSpan={6}>No users found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {editingUserId ? (
        <div className="edit-box">
          <h3>Edit User #{editingUserId}</h3>
          <div className="edit-grid">
            <input
              name="user_name"
              placeholder="Username"
              value={editForm.user_name}
              onChange={handleEditChange}
            />
            <input
              name="password"
              type="password"
              placeholder="New Password (optional)"
              value={editForm.password}
              onChange={handleEditChange}
            />
            <select name="role" value={editForm.role} onChange={handleEditChange}>
              <option value="Admin">Admin</option>
              <option value="Doctor">Doctor</option>
              <option value="Staff">Staff</option>
            </select>
            <input
              name="doctor_id"
              type="number"
              placeholder="doctor_id (optional)"
              value={editForm.doctor_id}
              onChange={handleEditChange}
            />
            <input
              name="staff_id"
              type="number"
              placeholder="staff_id (optional)"
              value={editForm.staff_id}
              onChange={handleEditChange}
            />
          </div>
          <div className="edit-actions">
            <button type="button" onClick={saveEdit} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={cancelEdit}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AdminUserManager;
