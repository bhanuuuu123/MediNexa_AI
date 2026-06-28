import { useState, useEffect } from "react";
import api from "../services/api.js";
import { AlertTriangle, ShieldAlert, Phone, MapPin, Truck, Heart, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Emergency() {
  const [profile, setProfile] = useState({
    bloodGroup: "O+",
    allergies: [],
    medicalConditions: [],
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  
  const [hospitals, setHospitals] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);

  // Allergies & Conditions input helper states
  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");

  useEffect(() => {
    async function initPage() {
      try {
        const profRes = await api.get("/emergency/profile");
        setProfile(profRes.data || {});
        
        const hospRes = await api.get("/emergency/hospitals");
        setHospitals(hospRes.data || []);
      } catch (err) {
        toast.error("Failed to load emergency data.");
      } finally {
        setLoadingProfile(false);
      }
    }
    initPage();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put("/emergency/profile", profile);
      setProfile(res.data);
      toast.success("Emergency medical profile saved securely.");
    } catch (err) {
      toast.error("Failed to save emergency profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleTriggerSOS = async () => {
    setDispatching(true);
    setDispatchResult(null);
    try {
      // Fetch coordinates or simulate
      const coords = { latitude: 37.7749, longitude: -122.4194, address: "123 Main St, Apartment 4B" };
      const res = await api.post("/emergency/ambulance", coords);
      setDispatchResult(res.data);
      toast.success("SOS Alert Broadcasted! Ambulance dispatched.");
    } catch (err) {
      toast.error("SOS Trigger failed.");
    } finally {
      setDispatching(false);
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !profile.allergies.includes(newAllergy.trim())) {
      setProfile(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy("");
    }
  };

  const removeAllergy = (index) => {
    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const addCondition = () => {
    if (newCondition.trim() && !profile.medicalConditions.includes(newCondition.trim())) {
      setProfile(prev => ({
        ...prev,
        medicalConditions: [...prev.medicalConditions, newCondition.trim()]
      }));
      setNewCondition("");
    }
  };

  const removeCondition = (index) => {
    setProfile(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.filter((_, i) => i !== index)
    }));
  };

  if (loadingProfile) {
    return <div className="text-center py-10 text-slate-500">Loading emergency workspace...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        
        {/* SOS Panel */}
        <section className="space-y-8">
          <div className="rounded-[2.5rem] border border-rose-200 bg-rose-50/20 p-8 shadow-sm text-center space-y-6">
            <div className="mx-auto h-20 w-20 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 animate-pulse">
              <ShieldAlert className="h-10 w-10" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-3xl font-extrabold text-slate-900">SOS Trigger</h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                Pressing the button below instantly requests a trauma dispatch unit and sends critical medical stats to emergency coordinators.
              </p>
            </div>

            <button
              type="button"
              onClick={handleTriggerSOS}
              disabled={dispatching}
              className="w-full max-w-xs mx-auto rounded-full bg-rose-600 py-6 text-center text-lg font-bold text-white shadow-xl shadow-rose-200/50 hover:bg-rose-500 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {dispatching ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Broadcasting SOS...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5" />
                  Trigger SOS Dispatch
                </>
              )}
            </button>
          </div>

          {dispatchResult && (
            <div className="rounded-3xl border border-cyan-200 bg-cyan-50/30 p-6 space-y-4">
              <div className="flex items-center gap-2 text-cyan-800 font-bold">
                <Truck className="animate-bounce text-cyan-600" />
                Ambulance Status Tracker
              </div>
              <div className="text-sm text-slate-700 space-y-2">
                <p>Status: <strong>{dispatchResult.message}</strong></p>
                <p>Ambulance ID: <strong>{dispatchResult.ambulanceId}</strong></p>
                <p>Location: <span className="text-xs text-slate-500 font-semibold">{dispatchResult.location}</span></p>
                <div className="bg-white border rounded-2xl p-4 flex items-center justify-between mt-4">
                  <span className="text-xs font-bold text-slate-500 uppercase">Estimated Time of Arrival</span>
                  <span className="text-2xl font-black text-rose-600">{dispatchResult.eta}</span>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Hospitals */}
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2">
              <MapPin size={18} className="text-cyan-600" />
              Emergency Closest Trauma Centers
            </h4>
            
            <div className="space-y-4">
              {hospitals.map((h, i) => (
                <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 flex justify-between items-center hover:shadow-sm transition">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-sm">{h.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={12} /> {h.address}
                    </p>
                    <p className="text-[10px] text-cyan-600 font-semibold">Available Emergency Beds: {h.emergencyBeds}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-rose-50 text-rose-700 font-bold px-2 py-1 rounded-full block text-center mb-2">
                      {h.distance}
                    </span>
                    <a
                      href={`tel:${h.phone}`}
                      className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-cyan-300 font-bold"
                    >
                      <Phone size={10} /> Call Center
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Dashboard Profile */}
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Heart className="text-rose-600" size={20} />
              Emergency Medical Profile
            </h3>
            <p className="text-xs text-slate-500">Provide details for first responders and physician access</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Blood Group</span>
                <select
                  value={profile.bloodGroup}
                  onChange={(e) => setProfile(prev => ({ ...prev, bloodGroup: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Emergency Contact Name</span>
                <input
                  type="text"
                  value={profile.emergencyContactName}
                  onChange={(e) => setProfile(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
                  placeholder="Jane Doe"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Emergency Contact Phone</span>
              <input
                type="text"
                value={profile.emergencyContactPhone}
                onChange={(e) => setProfile(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
                placeholder="+1 (555) 987-6543"
              />
            </label>

            {/* Allergies list editor */}
            <div className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Allergies</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400"
                  placeholder="e.g. Penicillin"
                />
                <button
                  type="button"
                  onClick={addAllergy}
                  className="bg-slate-950 text-white rounded-2xl px-4 py-2 hover:bg-slate-800 text-xs font-bold"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {profile.allergies?.map((al, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 bg-slate-100 border text-xs font-bold text-slate-800 px-3 py-1 rounded-full">
                    {al}
                    <button type="button" onClick={() => removeAllergy(idx)} className="text-rose-600 hover:text-rose-800 font-extrabold text-[10px] ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Chronic conditions list editor */}
            <div className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Chronic Medical Conditions</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400"
                  placeholder="e.g. Asthma"
                />
                <button
                  type="button"
                  onClick={addCondition}
                  className="bg-slate-950 text-white rounded-2xl px-4 py-2 hover:bg-slate-800 text-xs font-bold"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {profile.medicalConditions?.map((cond, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 bg-slate-100 border text-xs font-bold text-slate-800 px-3 py-1 rounded-full">
                    {cond}
                    <button type="button" onClick={() => removeCondition(idx)} className="text-rose-600 hover:text-rose-800 font-extrabold text-[10px] ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full rounded-2xl bg-cyan-600 hover:bg-cyan-500 py-4 text-sm font-bold text-white shadow-lg transition"
            >
              {savingProfile ? "Saving Profile..." : "Save Emergency Medical Profile"}
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}
