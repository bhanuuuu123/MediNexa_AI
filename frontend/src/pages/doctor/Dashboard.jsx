import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useAppointments, useUpdateAppointmentStatus } from "../../hooks/useAppointments";
import { CalendarDays, Users, Star, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function DoctorDashboard() {
  const { user } = useContext(AuthContext);
  const { data: appointments, isLoading, refetch } = useAppointments();
  const updateStatusMutation = useUpdateAppointmentStatus();

  const doctorAppointments = appointments?.filter(a => a.doctor?._id === user?._id) || [];
  
  const pendingCount = doctorAppointments.filter(a => a.status === "Pending").length;
  const confirmedCount = doctorAppointments.filter(a => a.status === "Confirmed").length;
  const completedCount = doctorAppointments.filter(a => a.status === "Completed").length;

  const handleStatusChange = async (id, status) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      toast.success(`Appointment marked as ${status}`);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update appointment status");
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Doctor Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.12),_transparent_40%)]" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-400 font-semibold">Clinical Overview</p>
          <h2 className="text-3xl font-semibold sm:text-4xl">Welcome back, {user?.full_name || "Doctor"}</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            {user?.specialization || "Specialist"} | License No: {user?.license_number || "N/A"}
          </p>
          <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
            <Star size={16} fill="currentColor" />
            {user?.rating || "4.9"} (Internal Rating)
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Pending Patients</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{pendingCount}</p>
          </div>
          <div className="rounded-2xl p-3 bg-amber-50 text-amber-600">
            <CalendarDays size={24} />
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Confirmed Sessions</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{confirmedCount}</p>
          </div>
          <div className="rounded-2xl p-3 bg-cyan-50 text-cyan-600">
            <Users size={24} />
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Completed Sessions</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{completedCount}</p>
          </div>
          <div className="rounded-2xl p-3 bg-emerald-50 text-emerald-600">
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Appointment Queue */}
      <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Your Appointment Queue</h3>

        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Loading schedule...</div>
        ) : doctorAppointments.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-500">
            No appointments on your schedule.
          </div>
        ) : (
          <div className="space-y-4">
            {doctorAppointments.map((apt) => (
              <div key={apt._id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:shadow-md transition">
                <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold">
                    {(apt.patient?.full_name || "P").charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{apt.patient?.full_name}</p>
                    <p className="text-sm text-slate-500">{apt.patient?.email}</p>
                    <p className="text-xs text-cyan-700 mt-1">Reason: {apt.reason || "General Consult"}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap md:flex-nowrap gap-6 items-center justify-between md:justify-end">
                  <div className="text-left md:text-right">
                    <p className="text-sm font-semibold text-slate-800">📅 {apt.date}</p>
                    <p className="text-sm text-slate-500">⏰ {apt.slot}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      apt.status === "Confirmed" ? "bg-cyan-100 text-cyan-800" :
                      apt.status === "Pending" ? "bg-amber-100 text-amber-800" :
                      apt.status === "Completed" ? "bg-emerald-100 text-emerald-800" :
                      "bg-rose-100 text-rose-800"
                    }`}>
                      {apt.status}
                    </span>

                    {apt.status === "Pending" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(apt._id, "Confirmed")}
                          className="p-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-500"
                          title="Confirm Appointment"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(apt._id, "Cancelled")}
                          className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500"
                          title="Cancel Appointment"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}

                    {apt.status === "Confirmed" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(apt._id, "Completed")}
                        className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
