import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Patient from "./src/models/Patient.js";
import Doctor from "./src/models/Doctor.js";
import Appointment from "./src/models/Appointment.js";
import Medicine from "./src/models/Medicine.js";
import Prescription from "./src/models/Prescription.js";
import Report from "./src/models/Report.js";
import { encrypt } from "./src/utils/crypto.js";

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database.");

    // Clear existing data
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    await Medicine.deleteMany({});
    await Prescription.deleteMany({});
    await Report.deleteMany({});
    console.log("Cleared existing data.");

    const hashedPass = await bcrypt.hash("SecurePass123!", 12);

    // 1. Seed 3 Doctors
    const doc1 = await Doctor.create({
      full_name: "Dr. Arjun Sharma",
      email: "arjun@medinexa.com",
      password: hashedPass,
      specialization: "Cardiologist",
      experience: 12,
      license_number: "LIC-12345",
      rating: 4.9,
      bio: "Cardiovascular specialist with over 12 years of experience in clinical cardiology.",
      availableSlots: [
        { date: "2026-06-21", slots: ["09:00", "10:00", "11:00", "14:00"] },
        { date: "2026-06-22", slots: ["10:00", "11:00", "14:00", "16:00"] }
      ]
    });

    const doc2 = await Doctor.create({
      full_name: "Dr. Sarah Smith",
      email: "sarah@medinexa.com",
      password: hashedPass,
      specialization: "Pediatrician",
      experience: 8,
      license_number: "LIC-67890",
      rating: 4.8,
      bio: "Caring pediatrician specialized in child health, vaccinations, and nutrition.",
      availableSlots: [
        { date: "2026-06-21", slots: ["09:00", "10:30", "13:00"] },
        { date: "2026-06-22", slots: ["11:00", "14:30", "15:30"] }
      ]
    });

    const doc3 = await Doctor.create({
      full_name: "Dr. Emily Taylor",
      email: "emily@medinexa.com",
      password: hashedPass,
      specialization: "General Physician",
      experience: 15,
      license_number: "LIC-11223",
      rating: 4.7,
      bio: "Expert in primary care, chronic condition management, and preventative medicine.",
      availableSlots: [
        { date: "2026-06-21", slots: ["08:30", "10:00", "15:00"] },
        { date: "2026-06-22", slots: ["09:30", "11:30", "14:00"] }
      ]
    });

    console.log("Seeded 3 Doctors.");

    // 2. Seed 5 Patients
    const pat1 = await Patient.create({
      full_name: "John Doe",
      email: "john@patient.com",
      password: hashedPass,
      age: 45,
      gender: "Male",
      phone: "+1 (555) 123-4567",
      bloodGroup: "O+",
      allergies: ["Penicillin", "Peanuts"],
      medicalConditions: ["Hypertension"],
      emergencyContactName: "Jane Doe",
      emergencyContactPhone: "+1 (555) 987-6543"
    });

    const pat2 = await Patient.create({
      full_name: "Jane Smith",
      email: "jane@patient.com",
      password: hashedPass,
      age: 34,
      gender: "Female",
      phone: "+1 (555) 234-5678",
      bloodGroup: "A-",
      allergies: ["Sulfa Drugs"],
      medicalConditions: ["Asthma"],
      emergencyContactName: "Robert Smith",
      emergencyContactPhone: "+1 (555) 876-5432"
    });

    const pat3 = await Patient.create({
      full_name: "Alice Johnson",
      email: "alice@patient.com",
      password: hashedPass,
      age: 28,
      gender: "Female",
      phone: "+1 (555) 345-6789",
      bloodGroup: "B+",
      allergies: [],
      medicalConditions: [],
      emergencyContactName: "David Johnson",
      emergencyContactPhone: "+1 (555) 765-4321"
    });

    const pat4 = await Patient.create({
      full_name: "Bob Brown",
      email: "bob@patient.com",
      password: hashedPass,
      age: 62,
      gender: "Male",
      phone: "+1 (555) 456-7890",
      bloodGroup: "AB+",
      allergies: ["Aspirin"],
      medicalConditions: ["Type 2 Diabetes", "High Cholesterol"],
      emergencyContactName: "Linda Brown",
      emergencyContactPhone: "+1 (555) 654-3210"
    });

    const pat5 = await Patient.create({
      full_name: "Charlie Green",
      email: "charlie@patient.com",
      password: hashedPass,
      age: 19,
      gender: "Other",
      phone: "+1 (555) 567-8901",
      bloodGroup: "O-",
      allergies: [],
      medicalConditions: ["Mild seasonal allergies"],
      emergencyContactName: "Mary Green",
      emergencyContactPhone: "+1 (555) 543-2109"
    });

    console.log("Seeded 5 Patients.");

    // 3. Seed Sample Appointments
    await Appointment.create([
      {
        patient: pat1._id,
        doctor: doc1._id,
        date: "2026-06-21",
        slot: "09:00",
        status: "Confirmed",
        reason: "Routine cardiovascular checkup."
      },
      {
        patient: pat2._id,
        doctor: doc2._id,
        date: "2026-06-21",
        slot: "10:30",
        status: "Pending",
        reason: "Child checkup and vaccination schedule."
      },
      {
        patient: pat3._id,
        doctor: doc3._id,
        date: "2026-06-22",
        slot: "09:30",
        status: "Completed",
        reason: "Annual health physical."
      }
    ]);
    console.log("Seeded Appointments.");

    // 4. Seed Sample Medicines
    await Medicine.create([
      {
        patient: pat1._id,
        name: "Lisinopril",
        dose: "10mg",
        time: "08:00",
        startDate: "2026-06-01",
        endDate: "2026-09-01",
        status: "Taken",
        notes: "Take once daily in the morning."
      },
      {
        patient: pat1._id,
        name: "Amlodipine",
        dose: "5mg",
        time: "20:00",
        startDate: "2026-06-01",
        endDate: "2026-09-01",
        status: "Pending",
        notes: "Take at bedtime."
      },
      {
        patient: pat2._id,
        name: "Albuterol Inhaler",
        dose: "2 puffs",
        time: "12:00",
        startDate: "2026-06-05",
        endDate: "2026-07-05",
        status: "Taken",
        notes: "Use as needed for wheezing."
      }
    ]);
    console.log("Seeded Medicines.");

    // 5. Seed Sample Prescriptions
    await Prescription.create([
      {
        patient: pat1._id,
        doctor: doc1._id,
        date: "2026-06-15",
        medicines: [
          { name: "Lisinopril", dose: "10mg", time: "08:00", duration: "90 days" },
          { name: "Amlodipine", dose: "5mg", time: "20:00", duration: "90 days" }
        ],
        notes: encrypt("Continue regular physical exercise and low-sodium diet.")
      },
      {
        patient: pat2._id,
        doctor: doc2._id,
        date: "2026-06-18",
        medicines: [
          { name: "Albuterol", dose: "90mcg", time: "Every 4 hours as needed", duration: "30 days" }
        ],
        notes: encrypt("Monitor peak flow readings daily.")
      }
    ]);
    console.log("Seeded Prescriptions.");

    // 6. Seed Sample Health Records (Reports)
    await Report.create([
      {
        patient: pat1._id,
        doctor: doc1._id,
        name: "Cardiology Blood Panel.pdf",
        fileUrl: "uploads/blood_panel_sample.pdf",
        date: "2026-06-10",
        notes: encrypt("Cholesterol levels slightly elevated, otherwise clear blood profile."),
        summary: encrypt("Llipid panels indicate border LDL. Re-test in 3 months. Fasting glucose is within range.")
      },
      {
        patient: pat4._id,
        doctor: doc3._id,
        name: "HbA1c Diagnostic Report.pdf",
        fileUrl: "uploads/hba1c_sample.pdf",
        date: "2026-06-12",
        notes: encrypt("HbA1c level is at 6.8%. Patient instructed on diabetes management."),
        summary: encrypt("Glycemic control shows slight elevation. Keep track of daily carb intake.")
      }
    ]);
    console.log("Seeded Health Records.");

    console.log("\nDatabase successfully seeded with 3 Doctors, 5 Patients, and full sample history!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
