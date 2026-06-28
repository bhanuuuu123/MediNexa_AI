import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMedicines, useCreateMedicine, useUpdateMedicineStatus } from "../hooks/useMedicines";
import { Pill, CheckCircle, XCircle, AlertCircle, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const medicineSchema = z.object({
  name: z.string().min(1, "Medicine name is required").max(100),
  dose: z.string().min(1, "Dose is required").max(50),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export default function Medicines() {
  const { data: medicines, isLoading } = useMedicines();
  const createMedicine = useCreateMedicine();
  const updateMedicineStatus = useUpdateMedicineStatus();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data) => {
    try {
      await createMedicine.mutateAsync(data);
      toast.success("Medicine reminder added successfully!");
      reset();
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Failed to add medicine");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateMedicineStatus.mutateAsync({ id, status });
      toast.success(`Dose marked as ${status.toLowerCase()}`);
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Failed to update status");
    }
  };

  // Calculate adherence statistics
  const totalLogged = medicines?.filter((m) => m.status === "Taken" || m.status === "Missed")?.length || 0;
  const takenCount = medicines?.filter((m) => m.status === "Taken")?.length || 0;
  const adherence = totalLogged > 0 ? Math.round((takenCount / totalLogged) * 100) : 100;
  const activeCount = medicines?.filter((m) => m.status === "Pending")?.length || 0;

  return (
    <div className="space-y-8">
      {/* Overview Dashboard Card */}
      <section className="rounded-[2rem] bg-gradient-to-br from-cyan-600 to-cyan-800 p-8 text-white shadow-xl flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-200 font-semibold">Reminders</p>
          <h2 className="text-3xl font-semibold">Medication Adherence</h2>
          <p className="text-cyan-100 text-sm max-w-md">
            Logging your daily intake helps AI Doctor Assistant provide accurate diagnostics and adjust your therapy program.
          </p>
        </div>
        <div className="flex gap-6 items-center w-full md:w-auto">
          <div className="text-center bg-white/10 backdrop-blur px-6 py-4 rounded-3xl min-w-[120px] flex-1 md:flex-none">
            <p className="text-4xl font-bold">{adherence}%</p>
            <p className="text-xs uppercase text-cyan-200 tracking-wider mt-1">Adherence</p>
          </div>
          <div className="text-center bg-white/10 backdrop-blur px-6 py-4 rounded-3xl min-w-[120px] flex-1 md:flex-none">
            <p className="text-4xl font-bold">{activeCount}</p>
            <p className="text-xs uppercase text-cyan-200 tracking-wider mt-1">Pending Doses</p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1.8fr]">
        {/* Add Reminder Card */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm h-fit">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900">Add Reminder</h3>
            <p className="text-sm text-slate-500">Configure new schedule reminders for your prescriptions</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Medicine Name</span>
              <input
                type="text"
                {...register("name")}
                placeholder="e.g. Aspirin, Lipitor"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
              {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
            </label>

            <div className="grid gap-4 grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Dose / Quantity</span>
                <input
                  type="text"
                  {...register("dose")}
                  placeholder="e.g. 81mg, 1 tablet"
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
                {errors.dose && <p className="mt-1 text-xs text-rose-600">{errors.dose.message}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Intake Time</span>
                <input
                  type="time"
                  {...register("time")}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
                {errors.time && <p className="mt-1 text-xs text-rose-600">{errors.time.message}</p>}
              </label>
            </div>

            <div className="grid gap-4 grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Start Date</span>
                <input
                  type="date"
                  {...register("startDate")}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
                {errors.startDate && <p className="mt-1 text-xs text-rose-600">{errors.startDate.message}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">End Date</span>
                <input
                  type="date"
                  {...register("endDate")}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
                {errors.endDate && <p className="mt-1 text-xs text-rose-600">{errors.endDate.message}</p>}
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Instructions / Notes (Optional)</span>
              <textarea
                {...register("notes")}
                rows={2}
                placeholder="e.g. Take with food, avoid caffeine"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
              {errors.notes && <p className="mt-1 text-xs text-rose-600">{errors.notes.message}</p>}
            </label>

            <button
              type="submit"
              disabled={createMedicine.isPending}
              className="inline-flex w-full items-center justify-center rounded-3xl bg-cyan-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-200/20 hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-300 transition duration-200"
            >
              {createMedicine.isPending ? "Adding..." : "Add Schedule"}
            </button>
          </form>
        </section>

        {/* Reminders List Card */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900">Today's Schedule</h3>
            <p className="text-sm text-slate-500">Log and verify your daily medication tasks</p>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-24 w-full bg-slate-100 animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : !medicines || medicines.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-500">
              No medicine reminders configured.
            </div>
          ) : (
            <div className="space-y-4">
              {medicines.map((med) => (
                <div
                  key={med._id}
                  className="rounded-3xl border border-slate-150 p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between hover:border-slate-300 transition duration-200"
                >
                  <div className="flex gap-4 items-start">
                    <div className="rounded-2xl bg-cyan-50 p-3 mt-1 text-cyan-600">
                      <Pill size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{med.name}</p>
                      <p className="text-sm text-slate-600">Dose: {med.dose}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Calendar size={12} /> {med.startDate} to {med.endDate}
                      </p>
                      {med.notes && (
                        <p className="mt-2 text-xs rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-slate-600 italic">
                          ℹ️ {med.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-3 w-full sm:w-auto">
                    <span className="text-lg font-bold text-slate-800">⏰ {med.time}</span>
                    {med.status === "Pending" ? (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(med._id, "Taken")}
                          className="flex items-center gap-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          <CheckCircle size={14} /> Taken
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(med._id, "Missed")}
                          className="flex items-center gap-1.5 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                        >
                          <XCircle size={14} /> Missed
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold ${
                          med.status === "Taken"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {med.status === "Taken" ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {med.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}