import Patient from "../models/Patient.js";
import { logAudit } from "../utils/audit.js";

// Get Emergency Profile for Patient
export async function getEmergencyProfile(req, res, next) {
  try {
    if (req.user.role !== "patient") {
      res.status(403);
      return next(new Error("Only patients can access emergency profiles."));
    }

    const patient = await Patient.findById(req.user._id)
      .select("bloodGroup allergies medicalConditions emergencyContactName emergencyContactPhone full_name phone");

    res.json(patient);
  } catch (error) {
    next(error);
  }
}

// Update Emergency Profile
export async function updateEmergencyProfile(req, res, next) {
  try {
    if (req.user.role !== "patient") {
      res.status(403);
      return next(new Error("Only patients can modify emergency profiles."));
    }

    const { bloodGroup, allergies, medicalConditions, emergencyContactName, emergencyContactPhone } = req.body;

    const patient = await Patient.findByIdAndUpdate(
      req.user._id,
      {
        bloodGroup,
        allergies,
        medicalConditions,
        emergencyContactName,
        emergencyContactPhone,
      },
      { new: true, runValidators: true }
    ).select("bloodGroup allergies medicalConditions emergencyContactName emergencyContactPhone full_name phone");

    await logAudit(req, "UPDATE_EMERGENCY_PROFILE", "Patient", patient._id);

    res.json(patient);
  } catch (error) {
    next(error);
  }
}

// Request Ambulance
export async function requestAmbulance(req, res, next) {
  try {
    const { latitude, longitude, address } = req.body;
    
    // Simulate ambulance dispatch
    const etaMinutes = Math.floor(Math.random() * 8) + 5; // 5-12 mins
    const ambulanceId = "AMB-" + Math.floor(1000 + Math.random() * 9000);

    if (req.user) {
      await logAudit(req, "REQUEST_AMBULANCE", "EmergencyLocation", null);
    }

    res.status(201).json({
      success: true,
      message: "Ambulance has been dispatched.",
      eta: `${etaMinutes} minutes`,
      ambulanceId,
      location: address || `Lat: ${latitude || "N/A"}, Lng: ${longitude || "N/A"}`,
    });
  } catch (error) {
    next(error);
  }
}

// List Nearby Hospitals
export async function listNearbyHospitals(req, res, next) {
  try {
    const hospitals = [
      {
        name: "City Central General Hospital",
        distance: "1.2 km",
        phone: "+1 (555) 019-2831",
        address: "456 Healthcare Blvd, Downtown",
        rating: 4.7,
        emergencyBeds: 12
      },
      {
        name: "St. Jude Children & Family Clinic",
        distance: "2.8 km",
        phone: "+1 (555) 019-4822",
        address: "789 Wellness Way, Westside",
        rating: 4.5,
        emergencyBeds: 5
      },
      {
        name: "Valley Hope Trauma Center",
        distance: "4.5 km",
        phone: "+1 (555) 019-9011",
        address: "102 Urgent Care Ave, North Valley",
        rating: 4.8,
        emergencyBeds: 24
      }
    ];

    res.json(hospitals);
  } catch (error) {
    next(error);
  }
}
