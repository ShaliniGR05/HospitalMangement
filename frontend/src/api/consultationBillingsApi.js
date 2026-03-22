import { apiRequest } from "./client";

export function listConsultationBillings(token) {
  return apiRequest("/consultation-billings", { method: "GET", token });
}

export function createConsultationBilling(token, payload) {
  return apiRequest("/consultation-billings", {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateConsultationBilling(token, consultationBillId, payload) {
  return apiRequest(`/consultation-billings/${consultationBillId}`, {
    method: "PUT",
    token,
    body: payload,
  });
}

export function deleteConsultationBilling(token, consultationBillId) {
  return apiRequest(`/consultation-billings/${consultationBillId}`, {
    method: "DELETE",
    token,
  });
}
