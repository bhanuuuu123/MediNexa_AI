import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LogOut, CalendarDays, ClipboardList, BriefcaseMedical, Stethoscope, HeartPulse, ShieldCheck, Bolt, Activity, MessageSquare } from "lucide-react";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const patientMenuItems = [
  { label: "Dashboard", to: "/dashboard", icon: <Activity size={18} /> },
  { label: "Doctors", to: "/doctors", icon: <Stethoscope size={18} /> },
  { label: "Appointments", to: "/appointments", icon: <CalendarDays size={18} /> },
  { label: "Medical Records", to: "/reports", icon: <ClipboardList size={18} /> },
  { label: "Medicines", to: "/medicines", icon: <HeartPulse size={18} /> },
  { label: "Calendar", to: "/calendar", icon: <ShieldCheck size={18} /> },
  { label: "AI Assistant", to: "/chat", icon: <MessageSquare size={18} /> },
  { label: "Emergency", to: "/emergency", icon: <Bolt size={18} /> },
];

const doctorMenuItems = [
  { label: "Dashboard", to: "/doctor/dashboard", icon: <Activity size={18} /> },
  { label: "Patient Management", to: "/doctor/patients", icon: <ClipboardList size={18} /> },
  { label: "Clinical AI Chat", to: "/doctor/clinical-chat", icon: <MessageSquare size={18} /> },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const menuItems = user.role === "doctor" ? doctorMenuItems : patientMenuItems;
  const isDoctor = user.role === "doctor";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="lg:flex lg:min-h-screen">
        <aside className="lg:w-80 w-full bg-white/90 backdrop-blur-xl border-r border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between px-8 py-8">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-cyan-700 font-semibold">MediNexa AI</p>
                <h1 className="mt-3 text-2xl font-semibold text-slate-900">
                  {isDoctor ? "Doctor Portal" : "Patient Portal"}
                </h1>
              </div>
              <div className="rounded-3xl bg-cyan-50 p-3">
                <BriefcaseMedical className="text-cyan-600" size={24} />
              </div>
            </div>
            <nav className="space-y-2 px-6 pb-8">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-3xl px-4 py-3 transition ${
                      isActive ? "bg-cyan-50 text-cyan-700 shadow-sm" : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="px-6 pb-8">
            <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Signed in as</p>
              <p className="mt-3 text-sm font-semibold truncate">{user.full_name || user.name || "User"}</p>
              <p className="text-xs text-slate-300 capitalize">{user.role}</p>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 text-sm text-slate-100 hover:bg-slate-700 w-full justify-center"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
          <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-700">
                  {isDoctor ? "Clinical Workspace" : "Patient Workspace"}
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                  {isDoctor ? "Intelligent EHR & AI Assistant" : "Intelligent Care Insights"}
                </h2>
              </div>
              {!isDoctor && (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/emergency")}
                    className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-rose-200/20 hover:bg-rose-500 transition"
                  >
                    Emergency SOS
                  </button>
                </div>
              )}
            </header>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
