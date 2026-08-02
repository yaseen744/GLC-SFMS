import { useState } from "react";
import { X } from "lucide-react";
import api from "../api/axios.js";
import { CLASS_LIST } from "../constants/classes.js";
import { ProcessingOverlay } from "./ProcessingOverlay.jsx";

function toFormState(student, lockedClass) {
  return {
    name: student?.name || "",
    fatherName: student?.fatherName || "",
    parentWhatsapp: student?.parentWhatsapp || "",
    contactNumber: student?.contactNumber || "",
    class: student?.class || lockedClass || "",
    address: student?.address || "",
    monthlyFee: student?.monthlyFee ?? "",
    status: student?.status || "active",
  };
}

// mode: "create" | "edit"
// studentId: required when mode === "edit"
// lockedClass: when set (create mode from a class page), class field is fixed
export default function StudentFormModal({ mode, studentId, student, lockedClass, onClose, onSaved }) {
  const [form, setForm] = useState(toFormState(student, lockedClass));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const start = Date.now();
    try {
      const payload = {
        ...form,
        class: lockedClass && mode === "create" ? lockedClass : form.class,
        monthlyFee: Number(form.monthlyFee) || 0,
      };
      if (mode === "edit") {
        await api.put(`/students/${studentId}`, payload);
      } else {
        await api.post("/students", payload);
      }
      const elapsed = Date.now() - start;
      if (elapsed < 2200) await new Promise((r) => setTimeout(r, 2200 - elapsed));
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save student");
    } finally {
      setSaving(false);
    }
  }

  const showClassSelect = mode === "edit" || !lockedClass;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 animate-fadeIn" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scaleIn">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-lg text-slate-900">
              {mode === "edit" ? `Edit Student — ${student?.name || ""}` : `Add New Student${lockedClass ? ` — ${lockedClass}` : ""}`}
            </h2>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <Field label="Father's Name" value={form.fatherName} onChange={(v) => setForm({ ...form, fatherName: v })} required />
              <Field label="Parent WhatsApp" value={form.parentWhatsapp} onChange={(v) => setForm({ ...form, parentWhatsapp: v })} required />
              <Field label="Contact Number" value={form.contactNumber} onChange={(v) => setForm({ ...form, contactNumber: v })} />

              {showClassSelect ? (
                <div>
                  <label className="text-sm font-semibold text-slate-700">Class</label>
                  <select
                    required
                    value={form.class}
                    onChange={(e) => setForm({ ...form, class: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="" disabled>
                      Select class
                    </option>
                    {CLASS_LIST.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-semibold text-slate-700">Class</label>
                  <input
                    disabled
                    value={lockedClass}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
              )}

              <Field label="Monthly Fee" type="number" value={form.monthlyFee} onChange={(v) => setForm({ ...form, monthlyFee: v })} required />
              <div>
                <label className="text-sm font-semibold text-slate-700">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />

            {error && (
              <div className="text-sm rounded-xl bg-red-50 text-red-600 px-4 py-3 border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn-press w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-70 transition-all"
            >
              {mode === "edit" ? "Save Changes" : "Save Student"}
            </button>
          </form>
        </div>
      </div>

      <ProcessingOverlay
        show={saving}
        label={mode === "edit" ? "Updating student record…" : "Saving student record…"}
        duration={2200}
      />
    </>
  );
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
      />
    </div>
  );
}
