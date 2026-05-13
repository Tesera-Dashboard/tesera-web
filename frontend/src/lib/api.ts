// NEXT_PUBLIC_API_URL sadece base host olmalı: https://api.example.com
// /api/v1 prefix'i bu dosyada eklenir. Eğer env var yanlışlıkla /api/v1
// ile bitiyorsa double-prefix oluşmasını önlemek için burada temizlenir.
const _raw = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api\/v1\/?$/, "");
const API_URL = `${_raw}/api/v1`;

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };

  const path = endpoint.startsWith("/") ? endpoint : "/" + endpoint;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== "undefined") {
    console.warn("Unauthorized request — token may be expired.");
    // localStorage.removeItem("token");
    // window.location.href = "/login";
  }

  return response;
}
