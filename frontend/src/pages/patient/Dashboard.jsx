import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useAppointments } from "../../hooks/useAppointments";
import { useMedicines } from "../../hooks/useMedicines";
import { useReports } from "../../hooks/useReports";
import { CalendarDays, ClipboardList, HeartPulse, Activity, User, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { data: appointments, isLoading: apptsLoading } = useAppointments();
  const { data: medicines, isLoading: medsLoading } = useMedicines();
  const { data: reports, isLoading: reportsLoading } = useReports();

  // Calculate stats
  const activeMeds = medicines?.filter(m => m.status === "Pending")?.length || 0;
  const totalMeds = medicines?.length || 0;
  const takenMeds = medicines?.filter(m => m.status === "Taken")?.length || 0;
  const adherence = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 100;

  const upcomingAppts = appointments?.filter(a => a.status === "Confirmed" || a.status === "Pending")?.length || 0;
  const nextAppt = appointments?.filter(a => a.status === "Confirmed" || a.status === "Pending")
    ?.sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const totalReports = reports?.length || 0;

  const stats = [
    {
      title: "Upcoming Appointments",
      value: apptsLoading ? "..." : `${upcomingAppts} Scheduled`,
      desc: nextAppt ? `Next: ${nextAppt.doctor?.full_name || nextAppt.doctor?.name} on ${nextAppt.date}` : "No upcoming sessions",
      icon: <CalendarDays className="h-6 w-6 text-cyan-600" />,
      bg: "bg-cyan-50",
      action: () => navigate("/appointments"),
    },
    {
      title: "Medication Adherence",
      value: medsLoading ? "..." : `${adherence}%`,
      desc: `${takenMeds} of ${totalMeds} doses logged`,
      icon: <HeartPulse className="h-6 w-6 text-emerald-600" />,
      bg: "bg-emerald-50",
      action: () => navigate("/medicines"),
    },
    {
      title: "Active Reminders",
      value: medsLoading ? "..." : `${activeMeds} Pending`,
      desc: "Doses scheduled for today",
      icon: <Activity className="h-6 w-6 text-amber-600" />,
      bg: "bg-amber-50",
      action: () => navigate("/medicines"),
    },
    {
      title: "Medical Reports",
      value: reportsLoading ? "..." : `${totalReports} Uploaded`,
      desc: "Securely encrypted on MediNexa EHR",
      icon: <ClipboardList className="h-6 w-6 text-indigo-600" />,
      bg: "bg-indigo-50",
      action: () => navigate("/reports"),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.12),_transparent_40%)]" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-400 font-semibold">Care overview</p>
          <h2 className="text-3xl font-semibold sm:text-4xl">Hello, {user?.full_name || "Patient"}</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Welcome back to your healthcare dashboard. MediNexa AI has synthesized your latest reports and active schedule. Your health score is stable.
          </p>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            onClick={stat.action}
            className="group cursor-pointer rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-cyan-200 transition duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">{stat.title}</span>
              <div className={`rounded-2xl p-3 ${stat.bg} group-hover:scale-110 transition duration-200`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Short Lists */}
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Next Appointment Detailed Card */}
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Next Consultation</h3>
            <p className="text-sm text-slate-500">Upcoming session with your primary practitioner</p>
          </div>

          {nextAppt ? (
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="h-14 w-14 rounded-2xl bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-xl">
                  {(nextAppt.doctor?.full_name || nextAppt.doctor?.name || "D").charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg">{nextAppt.doctor?.full_name || nextAppt.doctor?.name}</p>
                  <p className="text-sm text-slate-500">{nextAppt.doctor?.specialization || nextAppt.doctor?.specialty || "Specialist"}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-amber-500 font-semibold">
                    ★ {nextAppt.doctor?.rating || "4.8"}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-left sm:text-right w-full sm:w-auto">
                <p className="text-sm font-semibold text-slate-800">📅 {nextAppt.date}</p>
                <p className="text-sm text-slate-500">⏰ {nextAppt.slot}</p>
                <span className="inline-block rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                  {nextAppt.status}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-500">
              <p className="mb-4">No appointments booked yet.</p>
              <button
                type="button"
                onClick={() => navigate("/appointments")}
                className="rounded-3xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-cyan-500 transition"
              >
                Book Appointment
              </button>
            </div>
          )}
        </div>

        {/* Emergency SOS Quick Card */}
        <div className="rounded-[2.5rem] border border-rose-200 bg-rose-50/50 p-8 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Emergency Support</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              If you require immediate medical assistance, trigger the SOS. This alerts your emergency contacts and local services.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/emergency")}
            className="mt-6 w-full rounded-3xl bg-rose-600 py-4 text-center text-sm font-bold text-white shadow-lg shadow-rose-200/50 hover:bg-rose-500 transition"
          >
            Trigger SOS View
          </button>
        </div>
      </div>
    </div>
  );
}
