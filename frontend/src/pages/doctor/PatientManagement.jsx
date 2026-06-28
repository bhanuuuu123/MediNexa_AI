import { useState, useEffect } from "react";
import api from "../../services/api.js";
import { User, ClipboardList, ShieldAlert, FileText, Calendar, Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientReports, setPatientReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const res = await api.get("/doctors/patients");
        setPatients(res.data);
      } catch (err) {
        toast.error("Failed to fetch assigned patients.");
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, []);

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setLoadingReports(true);
    try {
      const res = await api.get(`/reports?patientId=${patient._id}`);
      setPatientReports(res.data);
    } catch (err) {
      toast.error("Failed to load patient records (Access Denied).");
      setPatientReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-slate-500">Loading patients list...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        
        {/* Patient Directory */}
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-[650px]">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-900">Patient Directory</h3>
            <p className="text-xs text-slate-500">Select a patient to securely inspect their encrypted health files</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {patients.length === 0 ? (
              <p className="text-slate-500 text-center py-10">No patients assigned to you yet.</p>
            ) : (
              patients.map((pat) => (
                <div
                  key={pat._id}
                  onClick={() => handleSelectPatient(pat)}
                  className={`rounded-2xl border p-4 cursor-pointer transition flex items-center gap-4 ${
                    selectedPatient?._id === pat._id
                      ? "border-cyan-600 bg-cyan-50/30"
                      : "border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                  }`}
                >
                  <div className="h-10 w-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">
                    {pat.full_name?.charAt(0) || "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{pat.full_name}</p>
                    <p className="text-xs text-slate-500 truncate">{pat.email}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {pat.gender}
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        Age: {pat.age}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Patient EHR Portal */}
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-[650px] overflow-y-auto">
          {!selectedPatient ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-6">
              <Lock className="h-14 w-14 text-slate-200 mb-3 animate-pulse" />
              <p className="font-bold text-slate-700 text-sm mb-1">Encrypted Record Safe</p>
              <p className="text-xs leading-relaxed max-w-[240px]">
                Click on a patient to decrypt their health records and review emergency details under audit logs.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Patient Profile */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{selectedPatient.full_name}</h3>
                <p className="text-xs text-slate-500 mt-1">ID: {selectedPatient.patient_id} | Phone: {selectedPatient.phone}</p>
              </div>

              {/* Emergency Summary */}
              <div className="rounded-3xl border border-rose-100 bg-rose-50/30 p-6 space-y-4">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <ShieldAlert size={16} />
                  Emergency Medical Summary
                </div>
                <div className="grid gap-4 sm:grid-cols-3 text-xs text-slate-700">
                  <div>
                    <span className="font-bold block text-slate-500">Blood Group</span>
                    <span className="text-sm font-semibold">{selectedPatient.bloodGroup || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-bold block text-slate-500">Allergies</span>
                    <span className="text-sm font-semibold truncate block">
                      {selectedPatient.allergies?.join(", ") || "None"}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold block text-slate-500">Chronic Conditions</span>
                    <span className="text-sm font-semibold truncate block">
                      {selectedPatient.medicalConditions?.join(", ") || "None"}
                    </span>
                  </div>
                </div>
                <div className="text-xs border-t border-rose-100 pt-3 flex justify-between">
                  <span>Emergency Contact: <strong>{selectedPatient.emergencyContactName}</strong></span>
                  <span>Phone: <strong>{selectedPatient.emergencyContactPhone}</strong></span>
                </div>
              </div>

              {/* Secure Decrypted Reports */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ClipboardList size={16} className="text-cyan-600" />
                  Decrypted Health Records
                </h4>

                {loadingReports ? (
                  <p className="text-xs text-slate-500">Decrypting files...</p>
                ) : patientReports.length === 0 ? (
                  <p className="text-xs text-slate-500 bg-slate-50 border p-4 rounded-2xl">
                    No medical reports uploaded by this patient.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {patientReports.map((rep) => (
                      <div key={rep._id} className="rounded-2xl border border-slate-150 p-5 bg-slate-50/50 hover:shadow transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              <FileText size={16} className="text-slate-500" />
                              {rep.name}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Date: {rep.date}</p>
                          </div>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                            Decrypted
                          </span>
                        </div>
                        {rep.notes && (
                          <div className="mt-3 text-xs bg-white border border-slate-100 p-3 rounded-xl text-slate-700">
                            <strong>Doc Notes:</strong> {rep.notes}
                          </div>
                        )}
                        {rep.summary && (
                          <div className="mt-2 text-xs bg-cyan-50/30 border border-cyan-100 p-3 rounded-xl text-slate-700">
                            <strong>AI Summary:</strong> {rep.summary}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </section>

      </div>
    </div>
  );
}
