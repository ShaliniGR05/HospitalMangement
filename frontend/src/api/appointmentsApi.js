import { apiRequest } from "./client";

export function listAppointments(token) {
  return apiRequest("/appointments", { method: "GET", token });
}

export function createAppointment(token, payload) {
  return apiRequest("/appointments", {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateAppointment(token, appointmentId, payload) {
  return apiRequest(`/appointments/${appointmentId}`, {
    method: "PUT",
    token,
    body: payload,
  });
}

export function deleteAppointment(token, appointmentId) {
  return apiRequest(`/appointments/${appointmentId}`, {
    method: "DELETE",
    token,
  });
}
