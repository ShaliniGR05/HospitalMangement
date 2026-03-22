import { useCallback, useEffect, useMemo, useState } from "react";
import { createAppointment, listAppointments } from "../api/appointmentsApi";
import "./StaffAppointments.css";

const INITIAL_FORM = {
  patient_id: "",
  doctor_id: "",
  dept_id: "",
  appointment_date: "",
  appointment_time: "",
  status: "",
};

function toRequiredInt(value) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function toOptionalInt(value) {
  if (value === "") {
    return null;
  }
  return toRequiredInt(value);
}

function StaffAppointments({ token }) {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);

  const sortedAppointments = useMemo(
    () => [...appointments].sort((a, b) => a.appointment_id - b.appointment_id),
    [appointments],
  );

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await listAppointments(token);
      setAppointments(result);
    } catch (err) {
      setError(err.message || "Could not load appointments");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const patientId = toRequiredInt(form.patient_id);
      const doctorId = toRequiredInt(form.doctor_id);
      if (patientId === null || doctorId === null) {
        throw new Error("patient_id and doctor_id are required");
      }

      await createAppointment(token, {
        patient_id: patientId,
        doctor_id: doctorId,
        dept_id: toOptionalInt(form.dept_id),
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time,
        status: form.status || null,
      });
      setForm(INITIAL_FORM);
      await loadAppointments();
    } catch (err) {
      setError(err.message || "Could not add appointment");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="panel-card">
      <h2>Appointments</h2>

      <form className="entity-form" onSubmit={handleSubmit}>
        <h3>Add Appointment</h3>
        <input
          name="patient_id"
          type="number"
          placeholder="patient_id"
          value={form.patient_id}
          onChange={handleChange}
          required
        />
        <input
          name="doctor_id"
          type="number"
          placeholder="doctor_id"
          value={form.doctor_id}
          onChange={handleChange}
          required
        />
        <input
          name="dept_id"
          type="number"
          placeholder="dept_id"
          value={form.dept_id}
          onChange={handleChange}
        />
        <input
          name="appointment_date"
          type="date"
          value={form.appointment_date}
          onChange={handleChange}
          required
        />
        <input
          name="appointment_time"
          type="time"
          value={form.appointment_time}
          onChange={handleChange}
          required
        />
        <input
          name="status"
          placeholder="Status (optional)"
          value={form.status}
          onChange={handleChange}
        />
        <button type="submit" disabled={isSaving}>
          {isSaving ? "Adding..." : "Add Appointment"}
        </button>
      </form>

      {error ? <p className="inline-error">{error}</p> : null}

      {isLoading ? (
        <p>Loading appointments...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedAppointments.map((appointment) => (
                <tr key={appointment.appointment_id}>
                  <td>{appointment.appointment_id}</td>
                  <td>{appointment.patient_id}</td>
                  <td>{appointment.doctor_id}</td>
                  <td>{appointment.dept_id ?? "-"}</td>
                  <td>{appointment.appointment_date}</td>
                  <td>{appointment.appointment_time}</td>
                  <td>{appointment.status || "-"}</td>
                </tr>
              ))}
              {!sortedAppointments.length ? (
                <tr>
                  <td colSpan={7}>No appointments found for your scope.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default StaffAppointments;
