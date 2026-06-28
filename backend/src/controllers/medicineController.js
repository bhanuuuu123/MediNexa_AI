import Medicine from "../models/Medicine.js";

export async function addMedicine(req, res, next) {
  try {
    const { name, dose, time, startDate, endDate, notes } = req.body;
    // Request body is already validated by middleware ✅

    const medicine = await Medicine.create({
      patient: req.user._id,
      name,
      dose,
      time,
      startDate,
      endDate,
      notes,
    });

    res.status(201).json(medicine);
  } catch (error) {
    next(error);
  }
}

export async function listMedicines(req, res, next) {
  try {
    const medicines = await Medicine.find({ patient: req.user._id })
      .sort({ createdAt: -1 });
    res.json(medicines);
  } catch (error) {
    next(error);
  }
}

export async function updateMedicineStatus(req, res, next) {
  try {
    const { status } = req.body;
    // Status is already validated by middleware ✅

    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      res.status(404);
      return next(new Error("Medicine record not found."));
    }

    if (medicine.patient.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error("Cannot update this medicine record."));
    }

    medicine.status = status;
    await medicine.save();
    res.json(medicine);
  } catch (error) {
    next(error);
  }
}
