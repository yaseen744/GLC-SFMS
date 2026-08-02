import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MessageCircle, Wallet, CheckCircle2, Circle, ChevronLeft, ChevronRight } from "lucide-react";
import { Layout } from "../components/Layout.jsx";
import { ProcessingOverlay } from "../components/ProcessingOverlay.jsx";
import api from "../api/axios.js";
import { buildWhatsappLink, buildUnpaidFeeMessage } from "../utils/whatsapp.js";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function FeeSystem() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all"); // all | unpaid | paid
  const [markingId, setMarkingId] = useState(null);
  const [marking, setMarking] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await api.get("/fees/overview", { params: { month, year } });
    setRows(data.rows);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const counts = useMemo(() => {
    const unpaid = rows.filter((r) => r.feeStatus === "unpaid").length;
    return { all: rows.length, unpaid, paid: rows.length - unpaid };
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (tab !== "all" && r.feeStatus !== tab) return false;
      if (!q.trim()) return true;
      const qq = q.toLowerCase();
      return (
        r.name.toLowerCase().includes(qq) ||
        r.studentCode.toLowerCase().includes(qq) ||
        r.class.toLowerCase().includes(qq) ||
        (r.fatherName || "").toLowerCase().includes(qq)
      );
    });
  }, [rows, q, tab]);

  async function markPaid(studentId) {
    setMarkingId(studentId);
    setMarking(true);
    const start = Date.now();
    try {
      await api.post("/fees/mark-paid", { studentId, month, year });
      const elapsed = Date.now() - start;
      if (elapsed < 2200) await new Promise((r) => setTimeout(r, 2200 - elapsed));
      await load();
    } finally {
      setMarkingId(null);
      setMarking(false);
    }
  }

  function shiftMonth(delta) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  }

  const tabs = [
    { key: "all", label: "All", count: counts.all },
    { key: "unpaid", label: "Unpaid", count: counts.unpaid },
    { key: "paid", label: "Paid", count: counts.paid },
  ];

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeInUp">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-900/20">
                <Wallet className="h-4.5 w-4.5 text-white" />
              </span>
              Fee System
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Every student, every class, in one place — search by name and see who has paid.
            </p>
          </div>

          <div className="flex items-center gap-2 ui-card px-2 py-1.5">
            <button onClick={() => shiftMonth(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-all">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-sm font-semibold text-slate-800 w-32 text-center tabular-nums">
              {MONTHS[month - 1]} {year}
            </div>
            <button onClick={() => shiftMonth(1)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-all">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6 animate-fadeInUp" style={{ animationDelay: "60ms" }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search 400+ students by name, code, class…"
              className="w-full ui-card pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          <div className="flex ui-card p-1 gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  tab === t.key
                    ? "bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-900/20"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {t.label} <span className="opacity-70 tabular-nums">({t.count})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 ui-card overflow-hidden animate-fadeInUp" style={{ animationDelay: "120ms" }}>
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton h-10 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Wallet className="h-10 w-10 mx-auto mb-3" />
              No students match this search/filter.
            </div>
          ) : (
            <div className="max-h-[65vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/95 backdrop-blur">
                    <th className="px-5 py-3 font-medium">Code</th>
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Class</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const isPaid = r.feeStatus === "paid";
                    return (
                      <tr key={r._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-slate-500">{r.studentCode}</td>
                        <td className="px-5 py-3">
                          <Link to={`/students/${r._id}`} className="font-medium text-slate-900 hover:text-primary-600 transition-colors">
                            {r.name}
                          </Link>
                          <div className="text-xs text-slate-400">{r.fatherName}</div>
                        </td>
                        <td className="px-5 py-3 text-slate-600">{r.class}</td>
                        <td className="px-5 py-3 text-slate-600 tabular-nums">
                          {new Intl.NumberFormat("en-PK").format(r.feeAmount)} PKR
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`pill ${
                              isPaid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            <span className={`pill-dot ${isPaid ? "bg-emerald-500" : "bg-amber-500"}`} />
                            {isPaid ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                            {isPaid ? "Paid" : "Unpaid"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {!isPaid && (
                            <div className="inline-flex items-center gap-2">
                              {buildWhatsappLink(r.parentWhatsapp) && (
                                <a
                                  href={buildWhatsappLink(r.parentWhatsapp, buildUnpaidFeeMessage(r, { feeAmount: r.feeAmount, month, year }))}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Send fee reminder on WhatsApp"
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-700 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-100 hover:scale-105 transition-all"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" /> Remind
                                </a>
                              )}
                              <button
                                onClick={() => markPaid(r._id)}
                                disabled={markingId === r._id}
                                className="btn-press inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary-600 to-indigo-600 text-white px-3 py-1.5 text-xs font-semibold hover:from-primary-700 hover:to-indigo-700 disabled:opacity-70 transition-all"
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
    </Layout>
  );
}
