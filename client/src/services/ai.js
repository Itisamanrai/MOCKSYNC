import { getToken } from "./auth";
import { API_BASE_URL } from "./config";

const API_BASE = `${API_BASE_URL}/ai`;

export const getAIFeedback = async (text) => {
  const token = getToken();

  if (!token) {
    throw new Error("Please login first");
  }

  const res = await fetch(`${API_BASE}/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to get AI feedback");
  }

  return data;
};