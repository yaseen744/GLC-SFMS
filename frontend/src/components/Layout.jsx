import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, BarChart3, LogOut, Menu, X, Monitor, BookOpen, Wallet } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { CLASS_LIST } from "../constants/classes.js";
import logo from "../assets/logo.png";

const topNavItems = [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }];

const allStudentsItem = { to: "/students", label: "All Students", icon: Users, exact: true };
const feeSystemItem = { to: "/fees", label: "Fee System", icon: Wallet, exact: true };

function classIcon(slug) {
  if (slug === "Computer") return Monitor;
  if (slug === "Tuition") return BookOpen;
  return Users;
}

const classNavItems = CLASS_LIST.map((c) => ({
  to: `/students/class/${c.slug}`,
  label: c.label,
  icon: classIcon(c.slug),
}));

const bottomNavItems = [{ to: "/reports", label: "Reports", icon: BarChart3 }];

export function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function isActive(item) {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  }

  function renderLink(item) {
    const active = isActive(item);
    const Icon = item.icon;
    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={() => setMobileOpen(false)}
        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
          active
            ? "bg-gradient-to-r from-primary-600 to-indigo-500 text-white shadow-lg shadow-primary-900/30"
            : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
        }`}
      >
        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-white/70" />}
        <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-105"}`} />
        {item.label}
      </Link>
    );
  }

  const SidebarContent = (
    <>
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/20 overflow-hidden shrink-0 ring-1 ring-white/50">
          <img src={logo} alt="Global Learning Center" className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0">
          <div className="font-bold tracking-tight text-white text-[15px] leading-tight truncate">
            Global Learning Center
          </div>
          <div className="text-xs text-slate-400">Student Management System</div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto">
        {topNavItems.map(renderLink)}
        {renderLink(allStudentsItem)}
        {renderLink(feeSystemItem)}

        <div className="pt-4 pb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Classes
        </div>
        {classNavItems.map(renderLink)}

        <div className="pt-2" />
        {bottomNavItems.map(renderLink)}
      </nav>

      <div className="px-3 pb-6 mt-auto">
        <div className="rounded-xl bg-white/[0.06] ring-1 ring-white/10 px-3 py-3 mb-2">
          <div className="text-xs text-slate-400">Signed in as</div>
          <div className="text-sm font-semibold text-white truncate">{user?.username}</div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen w-full flex">
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-64 flex-col fixed inset-y-0 border-r border-white/5"
        style={{ background: "linear-gradient(180deg, #0f172a 0%, #171e3d 55%, #1e1b4b 100%)" }}
      >
        {SidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside
            className="absolute inset-y-0 left-0 w-64 flex flex-col animate-fadeIn"
            style={{ background: "linear-gradient(180deg, #0f172a 0%, #171e3d 55%, #1e1b4b 100%)" }}
          >
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
              <img src={logo} alt="Global Learning Center" className="h-full w-full object-contain" />
            </div>
            <span className="font-bold text-slate-900 truncate">Global Learning Center</span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 shrink-0">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        <main className="flex-1 animate-fadeIn">{children}</main>
      </div>
    </div>
  );
}
