const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to login");
  }

  const data = await response.json();
  // We save the token in localStorage and cookies for broad compatibility
  if (data.access_token) {
    localStorage.setItem("token", data.access_token);
    document.cookie = `token=${data.access_token}; path=/; max-age=604800; SameSite=Lax`; // 7 days
  }
  return data;
}

export async function register(company_name: string, full_name: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ company_name, full_name, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to register");
  }

  return response.json();
}

export async function getCurrentUser() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) return null;

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      logout();
    }
    return null;
  }

  return response.json();
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
}

export async function forgotPassword(email: string) {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to request password reset");
  }
  return response.json();
}

export async function resetPassword(token: string, new_password: string) {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to reset password");
  }
  return response.json();
}

export async function verifyEmail(token: string) {
  const response = await fetch(`${API_URL}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to verify email");
  }
  return response.json();
}

export async function resendVerification() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) throw new Error("Not logged in");

  const response = await fetch(`${API_URL}/auth/resend-verification`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to resend verification email");
  }
  return response.json();
}
