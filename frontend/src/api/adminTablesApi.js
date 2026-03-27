import { apiRequest } from "./client";

function asCollectionEndpoint(endpoint) {
  return endpoint.endsWith("/") ? endpoint : `${endpoint}/`;
}

function asItemEndpoint(endpoint, id) {
  const normalized = endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint;
  return `${normalized}/${id}`;
}

export function listTableRows(token, endpoint) {
  return apiRequest(asCollectionEndpoint(endpoint), { method: "GET", token });
}

export function createTableRow(token, endpoint, payload) {
  return apiRequest(asCollectionEndpoint(endpoint), {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateTableRow(token, endpoint, id, payload) {
  return apiRequest(asItemEndpoint(endpoint, id), {
    method: "PUT",
    token,
    body: payload,
  });
}

export function deleteTableRow(token, endpoint, id) {
  return apiRequest(asItemEndpoint(endpoint, id), {
    method: "DELETE",
    token,
  });
}
