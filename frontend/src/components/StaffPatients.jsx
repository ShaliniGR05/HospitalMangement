import { useCallback, useEffect, useMemo, useState } from "react";
import { createPatient, listPatients } from "../api/patientsApi";
import "./StaffPatients.css";

const INITIAL_FORM = {
  patient_name: "",
  gender: "",
  age: "",
  phone_num: "",
  address: "",
  blood_group: "",
  registration_date: "",
};

function normalizeInt(value) {
  if (value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function StaffPatients({ token }) {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);

  const sortedPatients = useMemo(
    () => [...patients].sort((a, b) => a.patient_id - b.patient_id),
    [patients],
  );

  const loadPatients = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await listPatients(token);
      setPatients(result);
    } catch (err) {
      setError(err.message || "Could not load patients");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      await createPatient(token, {
        patient_name: form.patient_name,
        gender: form.gender || null,
        age: normalizeInt(form.age),
        phone_num: form.phone_num || null,
        address: form.address || null,
        blood_group: form.blood_group || null,
        registration_date: form.registration_date || null,
      });
      setForm(INITIAL_FORM);
      await loadPatients();
    } catch (err) {
      setError(err.message || "Could not add patient");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="panel-card">
      <h2>Patients</h2>

      <form className="entity-form" onSubmit={handleSubmit}>
        <h3>Add Patient</h3>
        <div className="input-group">
          <label className="field-label" htmlFor="patient_name">Patient name</label>
          <input
            id="patient_name"
            name="patient_name"
            placeholder="Patient name"
            value={form.patient_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label className="field-label" htmlFor="gender">Gender</label>
          <input id="gender" name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label className="field-label" htmlFor="age">Age</label>
          <input id="age" name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label className="field-label" htmlFor="phone_num">Phone</label>
          <input id="phone_num" name="phone_num" placeholder="Phone" value={form.phone_num} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label className="field-label" htmlFor="blood_group">Blood group</label>
          <input id="blood_group" name="blood_group" placeholder="Blood group" value={form.blood_group} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label className="field-label" htmlFor="registration_date">Registration date</label>
          <input
            id="registration_date"
            name="registration_date"
            type="date"
            placeholder="Registration date"
            value={form.registration_date}
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <label className="field-label" htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            placeholder="Address"
            rows={2}
            value={form.address}
            onChange={handleChange}
          />
        </div>
        <button type="submit" disabled={isSaving}>
          {isSaving ? "Adding..." : "Add Patient"}
        </button>
      </form>

      {error ? <p className="inline-error">{error}</p> : null}

      {isLoading ? (
        <p>Loading patients...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Phone</th>
                <th>Blood Group</th>
              </tr>
            </thead>
            <tbody>
              {sortedPatients.map((patient) => (
                <tr key={patient.patient_id}>
                  <td>{patient.patient_id}</td>
                  <td>{patient.patient_name}</td>
                  <td>{patient.gender || "-"}</td>
                  <td>{patient.age ?? "-"}</td>
                  <td>{patient.phone_num || "-"}</td>
                  <td>{patient.blood_group || "-"}</td>
                </tr>
              ))}
              {!sortedPatients.length ? (
                <tr>
                  <td colSpan={6}>No patients found for your scope.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default StaffPatients;
