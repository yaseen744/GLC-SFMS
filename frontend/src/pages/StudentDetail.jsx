import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, CheckCircle2, Circle, MessageCircle, Pencil } from "lucide-react";
import { Layout } from "../components/Layout.jsx";
import { ProcessingOverlay } from "../components/ProcessingOverlay.jsx";
import api from "../api/axios.js";
import StudentFormModal from "../components/StudentFormModal.jsx";
import { buildWhatsappLink, buildFeeReminderMessage, buildUnpaidFeeMessage } from "../utils/whatsapp.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingKey, setMarkingKey] = useState(null);
  const [marking, setMarking] = useState(false);
  const [editing, setEditing] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await api.get(`/students/${id}`);
    setStudent(data.student);
    setFees(data.fees);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function markPaid(month, year) {
    const key = `${year}-${month}`;
    setMarkingKey(key);
    setMarking(true);
    const start = Date.now();
    try {
      await api.post("/fees/mark-paid", { studentId: id, month, year });
      const elapsed = Date.now() - start;
      if (elapsed < 2200) await new Promise((r) => setTimeout(r, 2200 - elapsed));
      await load();
    } finally {
      setMarkingKey(null);
      setMarking(false);
    }
  }

  if (loading || !student) {
    return (
      <Layout>
        <div className="p-6 md:p-8 flex items-center gap-2 text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <Link to="/students" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to students
        </Link>

        <div className="ui-card p-6 shadow-sm animate-fadeInUp">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{student.name}</h1>
              <p className="text-sm text-slate-500 mt-1">
                {student.studentCode} · Class {student.class}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 text-primary-700 px-3 py-1.5 text-xs font-semibold hover:bg-primary-100 transition-all"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              {buildWhatsappLink(student.parentWhatsapp) && (
                <a
                  href={buildWhatsappLink(student.parentWhatsapp, buildFeeReminderMessage(student))}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-700 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-100 transition-all"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Message Parent
                </a>
              )}
              <span
                className={`pill ${
                  student.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                }`}
              >
                <span className={`pill-dot ${student.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                {student.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 text-sm">
            <Info label="Father's Name" value={student.fatherName} />
            <Info label="Parent WhatsApp" value={student.parentWhatsapp} />
            <Info label="Contact Number" value={student.contactNumber || "—"} />
            <Info label="Monthly Fee" value={`${new Intl.NumberFormat("en-PK").format(student.monthlyFee)} PKR`} />
            <Info label="Admission Date" value={new Date(student.admissionDate).toLocaleDateString()} />
            <Info label="Address" value={student.address || "—"} />
          </div>
        </div>

        <div className="ui-card shadow-sm mt-6 overflow-hidden animate-fadeInUp" style={{ animationDelay: "80ms" }}>
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Fee History</h2>
          </div>
          {fees.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No fee records yet.</div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 font-medium">Period</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Payment Date</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f) => {
                  const key = `${f.year}-${f.month}`;
                  return (
                    <tr key={f._id} className="border-b border-slate-50 last:border-0 animate-fadeIn">
                      <td className="px-5 py-3">{MONTHS[f.month - 1]} {f.year}</td>
                      <td className="px-5 py-3">{new Intl.NumberFormat("en-PK").format(f.feeAmount)} PKR</td>
                      <td className="px-5 py-3">
                        {f.status === "paid" ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                            <CheckCircle2 className="h-4 w-4" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
                            <Circle className="h-4 w-4" /> Unpaid
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {f.paymentDate ? new Date(f.paymentDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {f.status === "unpaid" && (
                          <div className="inline-flex items-center gap-2">
                            {buildWhatsappLink(student.parentWhatsapp) && (
                              <a
                                href={buildWhatsappLink(student.parentWhatsapp, buildUnpaidFeeMessage(student, f))}
                                target="_blank"
                                rel="noreferrer"
                                title="Send fee reminder on WhatsApp"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-700 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-100 hover:scale-105 transition-all"
                              >
                                <MessageCircle className="h-3.5 w-3.5" /> Remind
                              </a>
                            )}
                            <button
                              onClick={() => markPaid(f.month, f.year)}
                              disabled={markingKey === key}
                              className="btn-press inline-flex items-center gap-1.5 rounded-lg bg-primary-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-primary-700 disabled:opacity-70 transition-all"
                            >
                              Mark Paid
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>

      <ProcessingOverlay show={marking} label="Updating fee record…" duration={2200} />

      {editing && (
        <StudentFormModal
          mode="edit"
          studentId={student._id}
          student={student}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            load();
          }}
        />
      )}
    </Layout>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="font-medium text-slate-800 mt-0.5">{value}</div>
    </div>
  );
}
