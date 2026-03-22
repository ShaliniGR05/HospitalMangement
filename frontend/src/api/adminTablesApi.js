import { apiRequest } from "./client";

export function listTableRows(token, endpoint) {
  return apiRequest(endpoint, { method: "GET", token });
}

export function createTableRow(token, endpoint, payload) {
  return apiRequest(endpoint, {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateTableRow(token, endpoint, id, payload) {
  return apiRequest(`${endpoint}/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
}

export function deleteTableRow(token, endpoint, id) {
  return apiRequest(`${endpoint}/${id}`, {
    method: "DELETE",
    token,
  });
}
