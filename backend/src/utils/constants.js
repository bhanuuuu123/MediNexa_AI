/**
 * Application constants for roles, statuses, and other enums
 * Centralized to avoid hardcoded strings scattered across code
 */

export const ROLES = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  ADMIN: "admin",
};

export const APPOINTMENT_STATUS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const MEDICINE_STATUS = {
  PENDING: "Pending",
  TAKEN: "Taken",
  MISSED: "Missed",
};

// Arrays for enum validation
export const USER_ROLE_ENUM = Object.values(ROLES);
export const APPOINTMENT_STATUS_ENUM = Object.values(APPOINTMENT_STATUS);
export const MEDICINE_STATUS_ENUM = Object.values(MEDICINE_STATUS);

// File upload constants
export const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
export const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12 MB

// Rate limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 120,
};
