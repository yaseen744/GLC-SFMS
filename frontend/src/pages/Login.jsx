import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { ProcessingOverlay } from "../components/ProcessingOverlay.jsx";
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const { login, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSigningIn(true);
    const start = Date.now();
    const ok = await login(username, password);
    // keep the processing animation visible for a minimum, natural-feeling stretch
    const elapsed = Date.now() - start;
    if (elapsed < 900) await new Promise((r) => setTimeout(r, 900 - elapsed));
    setSigningIn(false);
    if (ok) navigate("/dashboard", { replace: true });
  }

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)" }}
    >
      {/* animated background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-blob" />
        <div className="absolute top-1/2 -right-20 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl animate-blob" style={{ animationDelay: "2s" }} />
        <div className="absolute -bottom-24 left-1/3 h-96 w-96 rounded-full bg-primary-300/10 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />
      </div>

      <div className="relative w-full max-w-md animate-fadeInUp">
        <div className="flex items-center gap-3 mb-8 text-white justify-center">
          <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-lg shadow-black/20 animate-floatSlow">
            <img src={logo} alt="Global Learning Center" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="font-bold text-xl tracking-tight">Global Learning Center</div>
            <div className="text-sm text-white/70">Student Management System</div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl shadow-black/30 border border-white/40 p-8">
          <div className="flex items-center gap-2 text-primary-600 mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Admin Access</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to access your admin dashboard.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Username</label>
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm rounded-xl bg-red-50 text-red-600 px-4 py-3 border border-red-100 animate-fadeIn">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={signingIn}
              className="btn-press w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-900/25 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:opacity-70 transition-all"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Default dev credentials: <span className="font-mono font-semibold">admin / admin123</span>
          </p>
        </div>
      </div>

      <ProcessingOverlay show={signingIn} label="Signing you in…" duration={1400} />
    </div>
  );
}
