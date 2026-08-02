import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Trash2, Pencil, Users, MessageCircle } from "lucide-react";
import { Layout } from "../components/Layout.jsx";
import { ProcessingOverlay } from "../components/ProcessingOverlay.jsx";
import api from "../api/axios.js";
import StudentFormModal from "../components/StudentFormModal.jsx";
import { buildWhatsappLink, buildFeeReminderMessage } from "../utils/whatsapp.js";

// lockedClass: when set (e.g. "9th"), this page only shows/creates students
// for that one class/section — used by the sidebar's per-class links.
// When null, it behaves as the "All Students" page across every class.
export default function StudentsPage({ lockedClass = null, title, subtitle }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    const params = lockedClass ? { class: lockedClass } : {};
    const { data } = await api.get("/students", { params });
    setStudents(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedClass]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (filter !== "all" && s.status !== filter) return false;
      if (!q.trim()) return true;
      const qq = q.toLowerCase();
      return (
        s.name.toLowerCase().includes(qq) ||
        s.studentCode.toLowerCase().includes(qq) ||
        s.class.toLowerCase().includes(qq)
      );
    });
  }, [students, q, filter]);

  async function handleDelete(id) {
    if (!confirm("Delete this student? This cannot be undone.")) return;
    setDeleting(true);
    const start = Date.now();
    await api.delete(`/students/${id}`);
    const elapsed = Date.now() - start;
    if (elapsed < 1600) await new Promise((r) => setTimeout(r, 1600 - elapsed));
    setDeleting(false);
    load();
  }

  const pageTitle = title || (lockedClass ? `${lockedClass} Students` : "All Students");
  const pageSubtitle =
    subtitle || (lockedClass ? `Manage admissions and fees for ${lockedClass}.` : "Manage student records and enrollment across every class.");

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeInUp">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{pageTitle}</h1>
            <p className="text-sm text-slate-500 mt-1">{pageSubtitle}</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="btn-press inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white px-4 py-2.5 text-sm font-semibold hover:from-primary-700 hover:to-indigo-700 shadow-lg shadow-primary-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Plus className="h-4 w-4" /> Add New Student
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6 animate-fadeInUp" style={{ animationDelay: "60ms" }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, code, class…"
              className="w-full ui-card pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="ui-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="mt-6 ui-card shadow-sm overflow-hidden animate-fadeInUp" style={{ animationDelay: "80ms" }}>
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-10 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Users className="h-10 w-10 mx-auto mb-3" />
              No students found.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 font-medium">Code</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Class</th>
                  <th className="px-5 py-3 font-medium">Monthly Fee</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const waLink = buildWhatsappLink(s.parentWhatsapp, buildFeeReminderMessage(s));
                  return (
                    <tr
                      key={s._id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors animate-fadeIn"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-slate-500">{s.studentCode}</td>
                      <td className="px-5 py-3">
                        <Link to={`/students/${s._id}`} className="font-medium text-slate-900 hover:text-primary-600 transition-colors">
                          {s.name}
                        </Link>
                        <div className="text-xs text-slate-400">{s.fatherName}</div>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{s.class}</td>
                      <td className="px-5 py-3 text-slate-600">
                        {new Intl.NumberFormat("en-PK").format(s.monthlyFee)} PKR
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`pill ${
                            s.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <span className={`pill-dot ${s.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {s.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noreferrer"
                              title="Message parent on WhatsApp"
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all hover:scale-110"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            onClick={() => setEditingStudent(s)}
                            title="Edit student"
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all hover:scale-110"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s._id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {open && (
        <StudentFormModal
          mode="create"
          lockedClass={lockedClass}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            load();
          }}
        />
      )}

      {editingStudent && (
        <StudentFormModal
          mode="edit"
          studentId={editingStudent._id}
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSaved={() => {
            setEditingStudent(null);
            load();
          }}
        />
      )}

      <ProcessingOverlay show={deleting} label="Deleting student…" duration={1600} />
    </Layout>
  );
}
