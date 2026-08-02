import { useEffect, useRef, useState } from "react";

// A full-screen animated "Processing…" overlay with a filling progress bar.
// Usage: <ProcessingOverlay show={saving} label="Saving student…" duration={3000} />
// The bar animates smoothly toward ~92% over `duration` ms (so a 3000ms duration
// feels like a genuine ~3 second wait), then races to 100% and fades out the
// moment `show` flips back to false — even if the real request finishes sooner
// or takes a bit longer, the animation always looks natural.
export function ProcessingOverlay({ show, label = "Processing…", duration = 3000 }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (show) {
      setVisible(true);
      startRef.current = performance.now();
      const target = 92;

      const tick = (now) => {
        const elapsed = now - startRef.current;
        const t = Math.min(elapsed / duration, 1);
        // ease-out curve so it starts fast and settles near the target
        const eased = 1 - Math.pow(1 - t, 3);
        setProgress(eased * target);
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      return () => cancelAnimationFrame(rafRef.current);
    } else if (visible) {
      // finish the bar, then fade the overlay out
      setProgress(100);
      const timeout = setTimeout(() => setVisible(false), 320);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, duration]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-8 w-80 text-center animate-scaleIn">
        <div className="relative mx-auto h-12 w-12 mb-5">
          <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin" />
        </div>
        <div className="text-sm font-semibold text-slate-800 mb-1">{label}</div>
        <div className="text-xs text-slate-400 mb-4">Please wait a moment…</div>
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 via-indigo-500 to-primary-600 transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-[11px] text-slate-400 mt-2 tabular-nums">{Math.round(progress)}%</div>
      </div>
    </div>
  );
}
