import { Star, Calendar } from "lucide-react";

export default function DoctorCard({ doctor, onBook }) {
  return (
    <article className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center gap-4">
        <img
          src={doctor.image || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`}
          alt={doctor.full_name || doctor.name}
          className="h-24 w-24 rounded-3xl object-cover"
        />
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{doctor.full_name || doctor.name}</h2>
          <p className="mt-1 text-sm uppercase tracking-[0.35em] text-cyan-700">{doctor.specialty || doctor.specialization || "General"}</p>
          <p className="mt-2 text-sm text-slate-500">{doctor.experience ?? 0} years experience</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Star size={18} className="text-amber-500" />
          <span>{doctor.rating?.toFixed(1) ?? "4.8"}</span>
        </div>
        <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700">Available</span>
      </div>

      <div className="mt-5 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-medium">Next slot</p>
        <p className="mt-1 text-slate-500">{doctor.availableSlots?.[0]?.date || "Today"} • {doctor.availableSlots?.[0]?.times?.[0] || "09:00 AM"}</p>
      </div>

      <button
        type="button"
        onClick={() => onBook?.(doctor)}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
      >
        <Calendar size={18} />
        Book visit
      </button>
    </article>
  );
}
