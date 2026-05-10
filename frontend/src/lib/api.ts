const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_URL}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== "undefined") {
    // If we get a 401, the token might be expired
    console.warn("Unauthorized request, redirecting to login...");
    // localStorage.removeItem("token");
    // window.location.href = "/login";
  }

  return response;
}
