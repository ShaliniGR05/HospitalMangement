import { apiRequest } from "./client";

export function listPatients(token) {
  return apiRequest("/patients", { method: "GET", token });
}

export function createPatient(token, payload) {
  return apiRequest("/patients", {
    method: "POST",
    token,
    body: payload,
  });
}

export function updatePatient(token, patientId, payload) {
  return apiRequest(`/patients/${patientId}`, {
    method: "PUT",
    token,
    body: payload,
  });
}

export function deletePatient(token, patientId) {
  return apiRequest(`/patients/${patientId}`, {
    method: "DELETE",
    token,
  });
}
