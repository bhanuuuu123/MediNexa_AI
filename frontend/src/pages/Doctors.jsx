import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorCard from "../components/DoctorCard";
import api from "../services/api.js";

export default function Doctors() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/doctors")
      .then((response) => setDoctors(response.data.data || response.data))
      .catch((err) => setError(err.response?.data?.error || "Unable to load doctors."))
      .finally(() => setLoading(false));
  }, []);

  const filteredDoctors = useMemo(
    () => doctors.filter((doctor) =>
      (doctor.full_name || doctor.name).toLowerCase().includes(search.toLowerCase()) ||
      doctor.specialty?.toLowerCase().includes(search.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(search.toLowerCase())
    ),
    [doctors, search]
  );

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-700">Doctor network</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Find the right specialist</h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] w-full sm:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or specialty"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
            <button type="button" onClick={() => navigate("/appointments")} className="rounded-3xl bg-cyan-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-200/20 hover:bg-cyan-500">
              Book appointment
            </button>
          </div>
        </div>
      </div>

      {error && <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">Loading doctors...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} onBook={() => navigate(`/appointments?doctor=${doctor._id}`)} />
            ))
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-500">No doctors found matching your search.</div>
          )}
        </div>
      )}
    </div>
  );
}
