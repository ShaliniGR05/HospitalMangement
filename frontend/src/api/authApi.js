import { apiRequest } from "./client";

export function loginUser(credentials) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export function fetchCurrentUser(token) {
  return apiRequest("/auth/me", {
    method: "GET",
    token,
  });
}
