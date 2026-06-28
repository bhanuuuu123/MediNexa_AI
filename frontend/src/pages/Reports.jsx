import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useReports, useUploadReport } from "../hooks/useReports";
import { useDoctors } from "../hooks/useDoctors";
import { Upload, FileText, Download, User, Calendar, BrainCircuit } from "lucide-react";
import toast from "react-hot-toast";

const reportSchema = z.object({
  name: z.string().min(1, "Report name is required").max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  doctorId: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export default function Reports() {
  const { data: reports, isLoading: reportsLoading } = useReports();
  const { data: doctorsData } = useDoctors(1);
  const uploadReport = useUploadReport();

  const [selectedFile, setSelectedFile] = useState(null);
  const [activeReport, setActiveReport] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data) => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("name", data.name);
    formData.append("date", data.date);
    if (data.doctorId) formData.append("doctorId", data.doctorId);
    if (data.notes) formData.append("notes", data.notes);

    try {
      await uploadReport.mutateAsync(formData);
      toast.success("Medical record uploaded and encrypted!");
      reset();
      setSelectedFile(null);
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Failed to upload record");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1.8fr]">
        {/* Upload Form Card */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm h-fit">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Upload Record</h2>
            <p className="text-sm text-slate-500">Add medical tests, prescriptions, or imaging results</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Record Name</span>
              <input
                type="text"
                {...register("name")}
                placeholder="e.g. Annual Blood Work, Chest X-Ray"
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
              {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
            </label>

            <div className="grid gap-4 grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Record Date</span>
                <input
                  type="date"
                  {...register("date")}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
                {errors.date && <p className="mt-1 text-xs text-rose-600">{errors.date.message}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Consulting Doctor</span>
                <select
                  {...register("doctorId")}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                >
                  <option value="">None / External</option>
                  {doctorsData?.data?.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <span className="text-sm font-medium text-slate-700">Medical Document</span>
              <div className="mt-2 flex items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 px-6 py-8 bg-slate-50 text-center hover:border-cyan-400 transition cursor-pointer relative">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2 pointer-events-none">
                  <Upload className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-700">
                    {selectedFile ? selectedFile.name : "Choose PDF or Image"}
                  </p>
                  <p className="text-xs text-slate-400">PDF, JPG, PNG up to 10MB</p>
                </div>
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Personal Notes</span>
              <textarea
                {...register("notes")}
                rows={3}
                placeholder="Include symptoms, context, or instructions..."
                className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <button
              type="submit"
              disabled={uploadReport.isPending}
              className="inline-flex w-full items-center justify-center rounded-3xl bg-cyan-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-200/20 hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-300 transition duration-200"
            >
              {uploadReport.isPending ? "Uploading..." : "Encrypt & Upload"}
            </button>
          </form>
        </section>

        {/* Records Directory Card */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Medical Directory</h2>
            <p className="text-sm text-slate-500">Browse fully encrypted diagnostic files and smart summaries</p>
          </div>

          {reportsLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-24 w-full bg-slate-100 animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : !reports || reports.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-500">
              No medical reports uploaded yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {reports.map((report) => (
                <div
                  key={report._id}
                  onClick={() => setActiveReport(report)}
                  className={`rounded-3xl border p-6 flex flex-col justify-between hover:border-cyan-300 cursor-pointer transition ${
                    activeReport?._id === report._id ? "border-cyan-500 bg-cyan-50/20" : "border-slate-150"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="rounded-xl bg-cyan-50 p-2 text-cyan-700">
                        <FileText size={20} />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border px-2 py-0.5 rounded-full">
                        Encrypted
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 text-lg leading-tight">{report.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar size={12} /> {report.date}
                    </p>
                    {report.doctor && (
                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        <User size={12} /> {report.doctor.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                    <a
                      href={`http://localhost:5000/${report.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-cyan-900"
                    >
                      <Download size={14} /> Download File
                    </a>
                    <span className="text-[11px] font-semibold text-cyan-600 hover:underline">
                      View AI Summary →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Summary Modal Panel */}
          {activeReport && (
            <div className="mt-8 rounded-[2rem] bg-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.1),_transparent_35%)]" />
              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="text-cyan-400 h-5 w-5" />
                    <span className="text-xs uppercase tracking-[0.25em] text-cyan-400 font-bold">
                      Smart AI Synthesis
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveReport(null)}
                    className="text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Close [x]
                  </button>
                </div>
                <div>
                  <h4 className="text-lg font-bold">{activeReport.name}</h4>
                  <p className="text-xs text-slate-400">Analysis completed immediately upon receipt</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-cyan-200">AI Clinical Summary:</p>
                  <p className="text-sm text-slate-300 leading-relaxed bg-white/5 border border-white/10 rounded-2xl p-4">
                    {activeReport.summary || "No AI summary available."}
                  </p>
                </div>
                {activeReport.notes && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400">Decrypted Personal Notes:</p>
                    <p className="text-xs text-slate-400 italic">"{activeReport.notes}"</p>
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