import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthContext } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import { Stethoscope, User } from "lucide-react";

const registerSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("patient"),
    full_name: z.string().min(2, "Full name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
    age: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(0, "Age must be positive")),
    gender: z.string().min(1, "Gender is required"),
    phone: z.string().min(1, "Phone number is required"),
  }),
  z.object({
    role: z.literal("doctor"),
    full_name: z.string().min(2, "Full name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
    specialization: z.string().min(1, "Specialization is required").trim(),
    experience: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(0, "Experience must be positive")),
    license_number: z.string().min(1, "License number is required").trim(),
  }),
]);

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("patient"); // 'patient' or 'doctor'

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "patient",
    },
  });

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setValue("role", newRole);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser(data, role);
      toast.success("Account created successfully!");
      if (role === "doctor") {
        navigate("/doctor/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-cyan-50 px-6 py-10 lg:px-16 flex items-center justify-center">
      <div className="mx-auto max-w-2xl w-full rounded-[2.5rem] bg-white/80 p-8 lg:p-10 shadow-2xl border border-slate-200 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-700 font-bold mb-2">MediNexa AI Account</p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create your account</h1>
          <p className="text-slate-500 mt-2">Sign up as a patient or join our doctor network.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1.5 rounded-3xl mb-8">
          <button
            type="button"
            onClick={() => handleRoleChange("patient")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition duration-200 ${
              role === "patient" ? "bg-white text-cyan-700 shadow-md" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <User size={16} />
            Patient
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("doctor")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition duration-200 ${
              role === "doctor" ? "bg-white text-cyan-700 shadow-md" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Stethoscope size={16} />
            Doctor Portal
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Hidden input to register role field in react-hook-form */}
          <input type="hidden" {...register("role")} value={role} />

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Full Name</span>
              <input
                type="text"
                {...register("full_name")}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                placeholder="John Doe"
              />
              {errors.full_name && <p className="mt-1 text-xs text-rose-600">{errors.full_name.message}</p>}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email Address</span>
              <input
                type="email"
                {...register("email")}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              {...register("password")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
          </label>

          {/* Conditional Patient Fields */}
          {role === "patient" && (
            <div className="grid gap-6 sm:grid-cols-3 border-t border-slate-100 pt-6">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Age</span>
                <input
                  type="number"
                  {...register("age")}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  placeholder="30"
                />
                {errors.age && <p className="mt-1 text-xs text-rose-600">{errors.age.message}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Gender</span>
                <select
                  {...register("gender")}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="mt-1 text-xs text-rose-600">{errors.gender.message}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Phone Number</span>
                <input
                  type="text"
                  {...register("phone")}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>}
              </label>
            </div>
          )}

          {/* Conditional Doctor Fields */}
          {role === "doctor" && (
            <div className="border-t border-slate-100 pt-6 space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Professional details</p>
              <div className="grid gap-6 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Specialization</span>
                  <input
                    type="text"
                    {...register("specialization")}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    placeholder="e.g. Cardiology"
                  />
                  {errors.specialization && <p className="mt-1 text-xs text-rose-600">{errors.specialization.message}</p>}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Years Exp.</span>
                  <input
                    type="number"
                    {...register("experience")}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    placeholder="8"
                  />
                  {errors.experience && <p className="mt-1 text-xs text-rose-600">{errors.experience.message}</p>}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">License Number</span>
                  <input
                    type="text"
                    {...register("license_number")}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    placeholder="LIC-XXXXX"
                  />
                  {errors.license_number && <p className="mt-1 text-xs text-rose-600">{errors.license_number.message}</p>}
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-200/20 hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-300 transition duration-200"
          >
            {loading ? "Creating account..." : "Register Now"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <button type="button" onClick={() => navigate("/login")} className="font-semibold text-cyan-700 hover:text-cyan-900">
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
