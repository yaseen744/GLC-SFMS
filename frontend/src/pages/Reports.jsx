import { useEffect, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  LineChart, Line,
} from "recharts";
import { Loader2 } from "lucide-react";
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
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Analytics for revenue and collection performance.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          <Card title="Monthly revenue (last 6 months)">
            <ResponsiveContainer>
              <BarChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip formatter={(v) => fmt(v) + " PKR"} contentStyle={{ borderRadius: 12 }} />
                <Legend />
                <Bar dataKey="expected" fill="#a5b4fc" name="Expected" radius={[6, 6, 0, 0]} />
                <Bar dataKey="collected" fill="#4f46e5" name="Collected" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Fee collection trend">
            <ResponsiveContainer>
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip formatter={(v) => fmt(v) + " PKR"} contentStyle={{ borderRadius: 12 }} />
                <Line type="monotone" dataKey="collected" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
