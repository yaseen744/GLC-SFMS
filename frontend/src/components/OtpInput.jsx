import { useEffect, useRef } from "react";

// A premium 6-box OTP input: auto-advance, backspace-to-previous, paste support.
export function OtpInput({ length = 6, value, onChange, disabled, error }) {
  const inputsRef = useRef([]);

  useEffect(() => {
    // autofocus the first empty box whenever the value resets (e.g. after an error)
    const firstEmpty = value.split("").findIndex((c) => !c);
    const target = firstEmpty === -1 ? length - 1 : firstEmpty;
    inputsRef.current[target]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setDigit(index, digit) {
    const chars = value.padEnd(length, " ").split("");
    chars[index] = digit;
    onChange(chars.join("").replace(/ /g, ""));
  }

  function handleChange(e, index) {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setDigit(index, "");
      return;
    }
    // handles both single keystrokes and fast typing/autofill
    const digits = raw.split("");
    let chars = value.padEnd(length, " ").split("");
    let cursor = index;
    for (const d of digits) {
      if (cursor >= length) break;
      chars[cursor] = d;
      cursor += 1;
    }
    const next = chars.join("").replace(/ /g, "");
    onChange(next);
    const nextFocus = Math.min(cursor, length - 1);
    inputsRef.current[nextFocus]?.focus();
  }

  function handleKeyDown(e, index) {
    if (e.key === "Backspace") {
      if (value[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        setDigit(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted.padEnd(length, "").trimEnd());
    const nextFocus = Math.min(pasted.length, length - 1);
    inputsRef.current[nextFocus]?.focus();
  }

  return (
    <div className="flex items-center justify-center gap-2.5" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={value[i] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className={`h-12 w-10 sm:h-14 sm:w-12 rounded-xl border-2 bg-slate-50 text-center text-xl font-bold text-slate-800 outline-none transition-all duration-150
            focus:bg-white focus:scale-105 focus:shadow-lg focus:shadow-gold-500/10
            disabled:opacity-60
            ${error ? "border-red-300 bg-red-50 animate-shake" : "border-slate-200 focus:border-gold-400"}
            ${value[i] ? "border-gold-300 bg-gold-50/40" : ""}`}
        />
      ))}
    </div>
  );
}
