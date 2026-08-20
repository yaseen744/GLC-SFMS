import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, Mail, ArrowLeft, RefreshCw, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { ProcessingOverlay } from "../components/ProcessingOverlay.jsx";
import { OtpInput } from "../components/OtpInput.jsx";
import logo from "../assets/logo.png";

const RESEND_COOLDOWN = 45; // seconds, must match backend

export default function Login() {
  const navigate = useNavigate();
  const { login, verifyOtp, resendOtp, error, clearError } = useAuth();

  // step: "credentials" -> "otp" -> "success"
  const [step, setStep] = useState("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpKey, setOtpKey] = useState(0); // forces OtpInput to remount/refocus on error
  const [pendingToken, setPendingToken] = useState(null);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMsg, setResendMsg] = useState("");

  const cooldownRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(cooldownRef.current);
  }, []);

  function startCooldown() {
    setResendCooldown(RESEND_COOLDOWN);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function onSubmitCredentials(e) {
    e.preventDefault();
    clearError();
    setBusy(true);
    const start = Date.now();
    const result = await login(username, password);
    const elapsed = Date.now() - start;
    if (elapsed < 800) await new Promise((r) => setTimeout(r, 800 - elapsed));
    setBusy(false);

    if (result.ok) {
      setPendingToken(result.pendingToken);
      setMaskedEmail(result.maskedEmail);
      setOtp("");
      setOtpKey((k) => k + 1);
      setStep("otp");
      startCooldown();
    }
  }

  async function onSubmitOtp(e) {
    e.preventDefault();
    if (otp.length !== 6) return;
    clearError();
    setBusy(true);
    const start = Date.now();
    const result = await verifyOtp(pendingToken, otp);
    const elapsed = Date.now() - start;
    if (elapsed < 700) await new Promise((r) => setTimeout(r, 700 - elapsed));

    if (result.ok) {
      setStep("success");
      setTimeout(() => navigate("/dashboard", { replace: true }), 900);
    } else {
      setBusy(false);
      setOtp("");
      setOtpKey((k) => k + 1);
    }
  }

  async function onResend() {
    if (resendCooldown > 0) return;
    setResendMsg("");
    const result = await resendOtp(pendingToken);
    if (result.ok) {
      setResendMsg("A new code is on its way.");
      startCooldown();
    } else {
      setResendMsg(result.message);
    }
  }

  function backToCredentials() {
    clearError();
    clearInterval(cooldownRef.current);
    setResendCooldown(0);
    setOtp("");
    setStep("credentials");
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
        {/* subtle grid mesh for a premium feel */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
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

        <div className="relative bg-white/95 backdrop-blur rounded-2xl shadow-2xl shadow-black/30 border border-white/40 p-8 overflow-hidden">
          {step === "credentials" && (
            <div key="credentials" className="animate-fadeIn">
              <div className="flex items-center gap-2 text-primary-600 mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Admin Access</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
              <p className="text-sm text-slate-500 mt-1">Sign in to access your admin dashboard.</p>

              <form onSubmit={onSubmitCredentials} className="mt-6 space-y-4">
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
                  disabled={busy}
                  className="btn-press w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-900/25 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:opacity-70 transition-all"
                >
                  Continue
                </button>
              </form>

              <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Protected with email verification
              </p>
            </div>
          )}

          {step === "otp" && (
            <div key="otp" className="animate-slideInRight">
              <button
                type="button"
                onClick={backToCredentials}
                className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>

              <div className="flex items-center gap-2 text-primary-600 mb-1">
                <Mail className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Verify it's you</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Enter your code</h1>
              <p className="text-sm text-slate-500 mt-1">
                We sent a 6-digit code to <span className="font-semibold text-slate-700">{maskedEmail}</span>
              </p>

              <form onSubmit={onSubmitOtp} className="mt-6 space-y-5">
                <OtpInput key={otpKey} length={6} value={otp} onChange={setOtp} disabled={busy} error={!!error} />

                {error && (
                  <div className="text-sm text-center rounded-xl bg-red-50 text-red-600 px-4 py-3 border border-red-100 animate-fadeIn">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy || otp.length !== 6}
                  className="btn-press w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-900/25 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:opacity-60 transition-all"
                >
                  Verify &amp; sign in
                </button>

                <div className="text-center">
                  {resendCooldown > 0 ? (
                    <span className="text-xs text-slate-400">
                      Resend code in <span className="font-semibold tabular-nums">{resendCooldown}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={onResend}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Resend code
                    </button>
                  )}
                  {resendMsg && <div className="mt-1.5 text-[11px] text-slate-400">{resendMsg}</div>}
                </div>
              </form>
            </div>
          )}

          {step === "success" && (
            <div key="success" className="py-10 flex flex-col items-center justify-center animate-fadeIn">
              <div className="relative h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center animate-checkPop animate-ringPulse">
                <Check className="h-8 w-8 text-white" strokeWidth={3} />
              </div>
              <div className="mt-4 text-sm font-semibold text-slate-700">Verified — signing you in…</div>
            </div>
          )}
        </div>
      </div>

      <ProcessingOverlay
        show={busy && step !== "success"}
        label={step === "otp" ? "Verifying code…" : "Signing you in…"}
        duration={step === "otp" ? 900 : 1200}
      />
    </div>
  );
}
