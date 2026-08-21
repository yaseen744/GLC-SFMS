import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, Mail, ArrowLeft, RefreshCw, Check, User, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { ProcessingOverlay } from "../components/ProcessingOverlay.jsx";
import { OtpInput } from "../components/OtpInput.jsx";
import logo from "../assets/logo.png";

const RESEND_COOLDOWN = 45; // seconds, must match backend

// A handful of fixed points for the quiet constellation motif on the brand
// panel — deliberately sparse, each drifting on its own slow, offset timer.
const CONSTELLATION = [
  { x: 14, y: 18, r: 2.4, delay: "0s", dur: "7s" },
  { x: 78, y: 12, r: 1.8, delay: "1.2s", dur: "8s" },
  { x: 42, y: 30, r: 1.4, delay: "2.1s", dur: "6.5s" },
  { x: 88, y: 46, r: 2.1, delay: "0.6s", dur: "9s" },
  { x: 20, y: 58, r: 1.6, delay: "1.8s", dur: "7.5s" },
  { x: 60, y: 66, r: 2.6, delay: "0.3s", dur: "8.5s" },
  { x: 30, y: 82, r: 1.4, delay: "2.4s", dur: "6s" },
  { x: 85, y: 84, r: 1.9, delay: "1s", dur: "7s" },
];
const LINKS = [
  [0, 2], [2, 4], [1, 3], [3, 5], [4, 6], [5, 7],
];

function FloatingField({ id, label, icon: Icon, type = "text", value, onChange, autoFocus, autoComplete, trailing }) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        required
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        placeholder=" "
        className={`peer w-full rounded-xl border border-slate-200 bg-white pl-11 ${trailing ? "pr-11" : "pr-4"} pt-5 pb-2 text-sm text-slate-800 outline-none transition-all
          focus:border-gold-400 focus:ring-4 focus:ring-gold-400/15`}
      />
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors peer-focus:text-gold-600" />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-11 top-4 text-sm text-slate-400 transition-all duration-200
          peer-focus:top-1.5 peer-focus:text-[10.5px] peer-focus:tracking-wide peer-focus:text-gold-700
          peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10.5px] peer-[:not(:placeholder-shown)]:text-slate-500"
      >
        {label}
      </label>
      {trailing}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, verifyOtp, resendOtp, error, clearError } = useAuth();

  // step: "credentials" -> "otp" -> "success"
  const [step, setStep] = useState("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpKey, setOtpKey] = useState(0);
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
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0d1526 0%, #16233e 55%, #1f3257 100%)" }}
    >
      {/* quiet backdrop: fine grid + two soft, slow-drifting glows (no loud color blobs) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(229,189,92,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(229,189,92,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl animate-drift" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-primary-400/10 blur-3xl animate-drift" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative w-full max-w-4xl animate-fadeInUp">
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/10">
          {/* ---------- Brand panel (desktop/tablet only) ---------- */}
          <div className="hidden lg:flex relative flex-col justify-between p-10 bg-gradient-to-br from-[#0d1526] via-[#16233e] to-[#1f3257] overflow-hidden">
            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
              {LINKS.map(([a, b], i) => (
                <line
                  key={i}
                  x1={CONSTELLATION[a].x}
                  y1={CONSTELLATION[a].y}
                  x2={CONSTELLATION[b].x}
                  y2={CONSTELLATION[b].y}
                  stroke="rgba(229,189,92,0.18)"
                  strokeWidth="0.25"
                />
              ))}
              {CONSTELLATION.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={p.r}
                  fill="rgba(229,189,92,0.55)"
                  className="animate-drift"
                  style={{ animationDelay: p.delay, animationDuration: p.dur, transformOrigin: `${p.x}px ${p.y}px` }}
                />
              ))}
            </svg>

            <div className="relative z-10">
              <div className="relative h-20 w-20">
                <svg className="absolute -inset-1.5 h-[92px] w-[92px]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(229,189,92,0.25)" strokeWidth="1.5" />
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="#e5bd5c"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="seal-ring"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white shadow-lg shadow-black/30 overflow-hidden">
                  <img src={logo} alt="Global Learning Center" className="h-14 w-14 object-contain" />
                </div>
              </div>

              <h1 className="font-display mt-8 text-3xl font-bold leading-tight text-white">
                Global Learning
                <br />
                Center
              </h1>
              <div className="mt-3 flex items-center gap-2 text-gold-300/90">
                <span className="h-px w-6 bg-gold-400/50" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Admissions · Records · Results</span>
              </div>
              <p className="font-display mt-8 max-w-xs text-[15px] italic leading-relaxed text-white/60">
                "A calmer, more orderly way to run the front office."
              </p>
            </div>

            <div className="relative z-10 text-[11px] text-white/35">
              Student Management System
            </div>
          </div>

          {/* ---------- Form panel ---------- */}
          <div className="relative bg-white p-7 sm:p-10 flex flex-col justify-center">
            {/* compact brand row, mobile only */}
            <div className="lg:hidden flex items-center gap-3 mb-7">
              <div className="relative h-12 w-12 shrink-0">
                <svg className="absolute -inset-1 h-14 w-14" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(181,135,42,0.2)" strokeWidth="2" />
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#b5872a" strokeWidth="2" strokeLinecap="round" className="seal-ring" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-100 overflow-hidden">
                  <img src={logo} alt="Global Learning Center" className="h-8 w-8 object-contain" />
                </div>
              </div>
              <div>
                <div className="font-display font-bold text-slate-900 leading-tight">Global Learning Center</div>
                <div className="text-[11px] text-slate-400">Student Management System</div>
              </div>
            </div>

            {step === "credentials" && (
              <div key="credentials" className="animate-fadeIn">
                <div className="flex items-center gap-2 text-gold-700 mb-1 animate-fadeInUp">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em]">Admin Access</span>
                </div>
                <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 animate-fadeInUp" style={{ animationDelay: "60ms" }}>
                  Welcome back
                </h2>
                <p className="text-sm text-slate-500 mt-1.5 animate-fadeInUp" style={{ animationDelay: "100ms" }}>
                  Sign in to access your admin dashboard.
                </p>

                <form onSubmit={onSubmitCredentials} className="mt-7 space-y-4">
                  <div className="animate-fadeInUp" style={{ animationDelay: "160ms" }}>
                    <FloatingField
                      id="username"
                      label="Username"
                      icon={User}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoFocus
                      autoComplete="username"
                    />
                  </div>

                  <div className="animate-fadeInUp" style={{ animationDelay: "220ms" }}>
                    <FloatingField
                      id="password"
                      label="Password"
                      icon={Lock}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      trailing={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                    />
                  </div>

                  {error && (
                    <div className="text-sm rounded-xl bg-red-50 text-red-600 px-4 py-3 border border-red-100 animate-fadeIn">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="btn-press btn-shine w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-900/30 bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-600 hover:to-primary-700 disabled:opacity-70 transition-all animate-fadeInUp"
                    style={{ animationDelay: "280ms" }}
                  >
                    Continue
                  </button>
                </form>

                <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400 animate-fadeInUp" style={{ animationDelay: "320ms" }}>
                  <ShieldCheck className="h-3.5 w-3.5 text-gold-600" />
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

                <div className="flex items-center gap-2 text-gold-700 mb-1">
                  <Mail className="h-4 w-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em]">Verify it's you</span>
                </div>
                <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900">Enter your code</h2>
                <p className="text-sm text-slate-500 mt-1.5">
                  We sent a 6-digit code to <span className="font-semibold text-slate-700">{maskedEmail}</span>
                </p>

                <form onSubmit={onSubmitOtp} className="mt-7 space-y-5">
                  <OtpInput key={otpKey} length={6} value={otp} onChange={setOtp} disabled={busy} error={!!error} />

                  {error && (
                    <div className="text-sm text-center rounded-xl bg-red-50 text-red-600 px-4 py-3 border border-red-100 animate-fadeIn">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={busy || otp.length !== 6}
                    className="btn-press btn-shine w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-900/30 bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-600 hover:to-primary-700 disabled:opacity-60 transition-all"
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
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700 hover:text-gold-800"
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
      </div>

      <ProcessingOverlay
        show={busy && step !== "success"}
        label={step === "otp" ? "Verifying code…" : "Signing you in…"}
        duration={step === "otp" ? 900 : 1200}
      />
    </div>
  );
}
