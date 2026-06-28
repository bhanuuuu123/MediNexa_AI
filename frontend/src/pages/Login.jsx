import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthContext } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import { Stethoscope, User } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("patient"); // 'patient' or 'doctor'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await login(data, role);
      toast.success(`Welcome back, ${res.user.full_name || res.user.name || "User"}!`);
      if (role === "doctor") {
        navigate("/doctor/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-cyan-50 px-6 py-10 lg:px-16 flex items-center justify-center">
      <div className="mx-auto max-w-lg w-full rounded-[2.5rem] bg-white/80 p-8 lg:p-10 shadow-2xl border border-slate-200 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-700 font-bold mb-2">MediNexa AI Healthcare</p>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-2">Access your secure clinical dashboard.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1.5 rounded-3xl mb-8">
          <button
            type="button"
            onClick={() => setRole("patient")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition duration-200 ${
              role === "patient" ? "bg-white text-cyan-700 shadow-md" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <User size={16} />
            Patient
          </button>
          <button
            type="button"
            onClick={() => setRole("doctor")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition duration-200 ${
              role === "doctor" ? "bg-white text-cyan-700 shadow-md" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Stethoscope size={16} />
            Doctor Portal
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email Address</span>
            <input
              type="email"
              {...register("email")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              placeholder="name@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              {...register("password")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-200/20 hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-300 transition duration-200"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Not registered yet?{" "}
          <button type="button" onClick={() => navigate("/register")} className="font-semibold text-cyan-700 hover:text-cyan-900">
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}
