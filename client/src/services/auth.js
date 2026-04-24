const TOKEN_KEY = "mocksync_token";
import { API_BASE_URL } from "./config";

const API_BASE = `${API_BASE_URL}/auth`;

export const signupUser = async (payload) => {
  const res = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Signup failed");
  return data;
};

export const loginUser = async (payload) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
};


export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);