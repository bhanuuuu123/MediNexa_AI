import { z } from "zod";

/**
 * Reusable Zod validation schemas for all API endpoints
 * Ensures consistent validation across the application
 */

export const patientRegisterSchema = z.object({
  full_name: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .trim(),
  email: z.string()
    .email("Invalid email address")
    .toLowerCase(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  age: z.number().min(0, "Age must be a positive number"),
  gender: z.string().min(1, "Gender is required"),
  phone: z.string().min(1, "Phone number is required"),
});

export const doctorRegisterSchema = z.object({
  full_name: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .trim(),
  email: z.string()
    .email("Invalid email address")
    .toLowerCase(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  specialization: z.string().min(1, "Specialization is required").trim(),
  experience: z.number().min(0, "Experience must be a positive number"),
  license_number: z.string().min(1, "License number is required").trim(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const appointmentSchema = z.object({
  doctorId: z.string()
    .regex(/^[0-9a-f]{24}$/i, "Invalid doctor ID format")
    .refine(id => id.length === 24, "Doctor ID must be valid MongoDB ID"),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine(date => new Date(date) > new Date(), "Date must be in the future"),
  slot: z.string()
    .regex(/^\d{2}:\d{2}$/, "Slot must be in HH:MM format"),
  reason: z.string().max(500, "Reason must not exceed 500 characters").optional(),
});

export const medicineSchema = z.object({
  name: z.string()
    .min(1, "Medicine name is required")
    .max(100, "Medicine name must not exceed 100 characters")
    .trim(),
  dose: z.string()
    .min(1, "Dose is required")
    .max(50)
    .trim(),
  time: z.string()
    .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  endDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
  notes: z.string().max(1000).optional(),
}).refine(
  data => new Date(data.endDate) > new Date(data.startDate),
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export const reportSchema = z.object({
  name: z.string()
    .min(1, "Report name is required")
    .max(200, "Report name must not exceed 200 characters")
    .trim(),
  doctorId: z.string()
    .regex(/^[0-9a-f]{24}$/i, "Invalid doctor ID format")
    .optional()
    .or(z.literal("")),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  notes: z.string().max(1000).optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["Pending", "Confirmed", "Completed", "Cancelled"]),
});

export const updateMedicineStatusSchema = z.object({
  status: z.enum(["Pending", "Taken", "Missed"]),
});

export const addAvailabilitySchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  slots: z.array(z.string())
    .min(1, "At least one slot is required")
    .refine(
      slots => slots.every(s => /^\d{2}:\d{2}$/.test(s)),
      "All slots must be in HH:MM format"
    ),
});

export const blockDateSchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
});
