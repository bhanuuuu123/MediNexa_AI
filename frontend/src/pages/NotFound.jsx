import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-12 shadow-xl">
      <span className="text-sm uppercase tracking-[0.35em] text-cyan-700">Page not found</span>
      <h1 className="mt-6 text-4xl font-semibold text-slate-900">Nothing to see here.</h1>
      <p className="mt-4 text-slate-500">The section you are looking for is not available yet.</p>
      <button
        type="button"
        onClick={() => navigate("/")}
        className="mt-8 rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-200/20 hover:bg-cyan-500"
      >
        Return Home
      </button>
    </div>
  );
}
