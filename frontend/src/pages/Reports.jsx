import { useEffect, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  LineChart, Line,
} from "recharts";
import { Loader2, BarChart3 } from "lucide-react";
import { Layout } from "../components/Layout.jsx";
import api from "../api/axios.js";

function fmt(n) {
  return new Intl.NumberFormat("en-PK").format(Math.round(n || 0));
}

export default function Reports() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data));
  }, []);

  if (!data) {
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
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 animate-fadeInUp">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center shadow-lg shadow-primary-900/20 shrink-0">
            <BarChart3 className="h-5 w-5 text-gold-300" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Reports</h1>
            <p className="text-sm text-slate-500 mt-0.5">Analytics for revenue and collection performance.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <Card title="Monthly revenue (last 6 months)" delay="80ms">
            <ResponsiveContainer>
              <BarChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  formatter={(v) => fmt(v) + " PKR"}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 12px 28px -8px rgba(15,23,42,0.12)" }}
                />
                <Legend />
                <Bar dataKey="expected" fill="#e5bd5c" name="Expected" radius={[6, 6, 0, 0]} animationDuration={900} />
                <Bar dataKey="collected" fill="#1f3257" name="Collected" radius={[6, 6, 0, 0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Fee collection trend" delay="140ms">
            <ResponsiveContainer>
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  formatter={(v) => fmt(v) + " PKR"}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 12px 28px -8px rgba(15,23,42,0.12)" }}
                />
                <Line
                  type="monotone"
                  dataKey="collected"
                  stroke="#1f3257"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#e5bd5c", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  animationDuration={900}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="card-hover ui-card p-6 mt-4 animate-fadeInUp" style={{ animationDelay: "200ms" }}>
          <h2 className="font-semibold text-slate-900">Current month summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
            <Kpi label="Expected Revenue" value={`${fmt(data.expectedRevenue)} PKR`} />
            <Kpi label="Collected Revenue" value={`${fmt(data.collectedRevenue)} PKR`} />
            <Kpi label="Remaining Revenue" value={`${fmt(data.remainingRevenue)} PKR`} />
            <Kpi label="Unpaid Students" value={String(data.unpaidStudents)} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Card({ title, children, delay }) {
  return (
    <div className="card-hover ui-card p-6 animate-fadeInUp" style={{ animationDelay: delay }}>
      <h2 className="font-semibold text-slate-900 mb-4">{title}</h2>
      <div className="h-72">{children}</div>
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-bold tracking-tight text-slate-900">{value}</div>
    </div>
  );
}
