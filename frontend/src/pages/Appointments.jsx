import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppointments, useCreateAppointment } from "../hooks/useAppointments";
import { useDoctors } from "../hooks/useDoctors";
import toast from "react-hot-toast";

const appointmentSchema = z.object({
  doctorId: z.string().min(1, "Please choose a doctor"),
  date: z.string().min(1, "Please choose a date")
    .refine(val => new Date(val) >= new Date(new Date().setHours(0,0,0,0)), {
      message: "Appointment date must be in the future"
    }),
  slot: z.string().min(1, "Please select an available slot"),
  reason: z.string().max(500, "Reason must not exceed 500 characters").optional(),
});

const defaultSlots = ["09:00", "10:00", "11:30", "14:00", "16:00"];

export default function Appointments() {
  const { data: appointments, isLoading: apptsLoading } = useAppointments();
  const { data: doctorsData, isLoading: docsLoading } = useDoctors(1);
  const createAppointment = useCreateAppointment();

  const [selectedSlot, setSelectedSlot] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(appointmentSchema),
  });

  const onSubmit = async (data) => {
    try {
      await createAppointment.mutateAsync(data);
      toast.success("Appointment booked successfully!");
      reset();
      setSelectedSlot("");
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Failed to book appointment");
    }
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setValue("slot", slot, { shouldValidate: true });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1.8fr]">
        {/* Booking Form Card */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm h-fit">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Book Appointment</h2>
            <p className="text-sm text-slate-500">Request a slot with one of our specialized practitioners</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Select Specialist</span>
              <select
                {...register("doctorId")}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">Choose doctor...</option>
                {doctorsData?.data?.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.full_name || doc.name} - {doc.specialization || doc.specialty}
                  </option>
                ))}
              </select>
              {errors.doctorId && <p className="mt-1 text-xs text-rose-600">{errors.doctorId.message}</p>}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Appointment Date</span>
              <input
                type="date"
                {...register("date")}
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
              {errors.date && <p className="mt-1 text-xs text-rose-600">{errors.date.message}</p>}
            </label>

            <div>
              <span className="text-sm font-medium text-slate-700">Available Time Slots</span>
              <div className="grid grid-cols-3 gap-3 mt-3">
                {defaultSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleSlotClick(slot)}
                    className={`rounded-2xl py-3 text-sm font-semibold transition ${
                      selectedSlot === slot
                        ? "bg-cyan-600 text-white shadow-md shadow-cyan-200"
                        : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {errors.slot && <p className="mt-1 text-xs text-rose-600">{errors.slot.message}</p>}
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Reason for Visit</span>
              <textarea
                {...register("reason")}
                rows={3}
                placeholder="Briefly describe your symptoms..."
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
              {errors.reason && <p className="mt-1 text-xs text-rose-600">{errors.reason.message}</p>}
            </label>

            <button
              type="submit"
              disabled={createAppointment.isPending}
              className="inline-flex w-full items-center justify-center rounded-3xl bg-cyan-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-200/20 hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-300 transition duration-200"
            >
              {createAppointment.isPending ? "Submitting..." : "Confirm Booking"}
            </button>
          </form>
        </section>

        {/* Appointments List Section */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Your Appointments</h2>
            <p className="text-sm text-slate-500">History of your bookings and current status</p>
          </div>

          {apptsLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-24 w-full bg-slate-100 animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : !appointments || appointments.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-500">
              No appointments scheduled yet.
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div
                  key={apt._id}
                  className="rounded-3xl border border-slate-150 p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between hover:border-slate-300 transition duration-200"
                >
                  <div className="flex gap-4 items-center">
                    <div className="h-12 w-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-700 font-bold">
                      {(apt.doctor?.full_name || apt.doctor?.name || "D").charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{apt.doctor?.full_name || apt.doctor?.name || "Unknown Doctor"}</p>
                      <p className="text-xs text-slate-500">{apt.doctor?.specialization || apt.doctor?.specialty || "Specialist"}</p>
                      {apt.reason && <p className="text-xs text-slate-600 mt-1 italic">"{apt.reason}"</p>}
                    </div>
                  </div>
                  <div className="space-y-2 text-left sm:text-right w-full sm:w-auto">
                    <p className="text-sm font-semibold text-slate-800">📅 {apt.date}</p>
                    <p className="text-sm text-slate-500">⏰ {apt.slot}</p>
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        apt.status === "Confirmed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : apt.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {apt.status}
                    </span>
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