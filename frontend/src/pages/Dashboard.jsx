import { useEffect, useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Users, UserCheck, Wallet, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { Layout } from "../components/Layout.jsx";
import { ProcessingOverlay } from "../components/ProcessingOverlay.jsx";
import api from "../api/axios.js";

function fmt(n) {
  return new Intl.NumberFormat("en-PK").format(Math.round(n || 0)) + " PKR";
}

const COLORS = ["#4f46e5", "#e2e8f0"];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await api.get("/dashboard");
    setData(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleGenerate() {
    setBusy(true);
    const start = Date.now();
    try {
      await api.post("/fees/generate-monthly", {
        year: data.currentYear,
        month: data.currentMonth,
      });
      const elapsed = Date.now() - start;
      if (elapsed < 2600) await new Promise((r) => setTimeout(r, 2600 - elapsed));
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (loading || !data) {
    return (
      <Layout>
        <div className="p-6 md:p-8 flex items-center gap-2 text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      </Layout>
    );
  }

  const collectionRatio =
    data.expectedRevenue > 0 ? Math.round((data.collectedRevenue / data.expectedRevenue) * 100) : 0;

  const paidVsUnpaid = [
    { name: "Paid", value: data.paidStudents },
    { name: "Unpaid", value: data.unpaidStudents },
  ];

  const kpis = [
    { label: "Total Students", value: data.totalStudents, icon: Users, color: "bg-indigo-50 text-indigo-600" },
    { label: "Active Students", value: data.activeStudents, icon: UserCheck, color: "bg-emerald-50 text-emerald-600" },
    { label: "Collected Revenue", value: fmt(data.collectedRevenue), icon: Wallet, color: "bg-amber-50 text-amber-600" },
    { label: "Collection Rate", value: `${collectionRatio}%`, icon: TrendingUp, color: "bg-violet-50 text-violet-600" },
  ];

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeInUp">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Overview of students, fees, and revenue.</p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={busy}
            className="btn-press inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-800 disabled:opacity-70 hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Generate this month's fees
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {kpis.map((k, i) => (
            <div
              key={k.label}
              className="card-hover ui-card p-5 shadow-sm animate-fadeInUp"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${k.color}`}>
                <k.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-2xl font-bold tracking-tight text-slate-900">{k.value}</div>
              <div className="text-sm text-slate-500">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          <div className="lg:col-span-2 ui-card p-6 shadow-sm animate-fadeInUp" style={{ animationDelay: "160ms" }}>
            <h2 className="font-semibold text-slate-900 mb-4">Revenue trend (last 6 months)</h2>
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={data.trend}>
                  <defs>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Area type="monotone" dataKey="collected" stroke="#4f46e5" strokeWidth={2.5} fill="url(#colorCollected)" name="Collected" animationDuration={900} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="ui-card p-6 shadow-sm animate-fadeInUp" style={{ animationDelay: "220ms" }}>
            <h2 className="font-semibold text-slate-900 mb-4">Paid vs Unpaid</h2>
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={paidVsUnpaid} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3} animationDuration={900}>
                    {paidVsUnpaid.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <ProcessingOverlay show={busy} label="Generating this month's fees…" duration={2600} />
    </Layout>
  );
}
