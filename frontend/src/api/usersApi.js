import { apiRequest } from "./client";

export function listUsers(token) {
  return apiRequest("/users/", { method: "GET", token });
}

export function createUser(token, payload) {
  return apiRequest("/users/", {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateUser(token, userId, payload) {
  return apiRequest(`/users/${userId}`, {
    method: "PUT",
    token,
    body: payload,
  });
}

export function deleteUser(token, userId) {
  return apiRequest(`/users/${userId}`, {
    method: "DELETE",
    token,
  });
}
