import { createContext, useContext, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("sms_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // STEP 1: username + password -> if correct, backend emails an OTP and
  // returns a short-lived pendingToken (this is NOT a login session yet).
  async function login(username, password) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/login", { username, password });
      return { ok: true, pendingToken: data.pendingToken, maskedEmail: data.maskedEmail, expiresInSeconds: data.expiresInSeconds };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  }

  // STEP 2: pendingToken + the 6-digit code -> real access token = actually logged in.
  async function verifyOtp(pendingToken, otp) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/verify-otp", { pendingToken, otp });
      localStorage.setItem("sms_token", data.token);
      localStorage.setItem("sms_user", JSON.stringify(data.user));
      setUser(data.user);
      return { ok: true };
    } catch (err) {
      const message = err.response?.data?.message || "Verification failed";
      setError(message);
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp(pendingToken) {
    try {
      const { data } = await api.post("/auth/resend-otp", { pendingToken });
      return { ok: true, expiresInSeconds: data.expiresInSeconds };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || "Couldn't resend code" };
    }
  }

  function clearError() {
    setError(null);
  }

  function logout() {
    localStorage.removeItem("sms_token");
    localStorage.removeItem("sms_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, verifyOtp, resendOtp, logout, loading, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
