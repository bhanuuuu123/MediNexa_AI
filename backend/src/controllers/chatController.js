export async function sendChatMessage(req, res) {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Chat message is required." });
  }

  const normalized = message.toLowerCase();
  let reply = "I am here to help you understand your symptoms. Please share any details about how you are feeling.";
  let conditions = ["General Mild Viral Syndrome", "Stress-related Fatigue"];
  let actions = ["Get 8 hours of sleep", "Stay hydrated (2-3L of water daily)", "Eat light, balanced meals"];
  let contactDoctor = "If symptoms persist for more than 48 hours or worsen.";

  if (normalized.includes("fever")) {
    reply = "It sounds like you have a fever. Monitoring your temperature and resting is key.";
    conditions = ["Viral Infection (e.g., Flu, Common Cold)", "Bacterial Infection", "Inflammation"];
    actions = [
      "Monitor temperature with a thermometer every 4 hours",
      "Rest and avoid strenuous activity",
      "Stay hydrated with water or electrolyte solutions",
      "Consider over-the-counter fever reducers (like Paracetamol or Ibuprofen) if appropriate"
    ];
    contactDoctor = "If temperature exceeds 103°F (39.4°C), lasts more than 3 days, or is accompanied by severe headache, stiff neck, or difficulty breathing.";
  } else if (normalized.includes("headache")) {
    reply = "I see you're experiencing a headache. Let's see how you can manage this.";
    conditions = ["Tension Headache (Stress-related)", "Dehydration", "Migraine Episode", "Sinus Congestion"];
    actions = [
      "Rest in a quiet, dimly lit room",
      "Drink a large glass of water to rule out dehydration",
      "Apply a cold compress to your forehead or neck",
      "Massage temples and practice slow deep breathing"
    ];
    contactDoctor = "If the headache is sudden and extremely severe (thunderclap), or accompanied by fever, stiff neck, confusion, numbness, or difficulty speaking.";
  } else if (normalized.includes("cough")) {
    reply = "A cough can be uncomfortable. Here is some guidance on what might be causing it.";
    conditions = ["Acute Bronchitis", "Post-Nasal Drip (from cold/allergies)", "Gastroesophageal Reflux (GERD)"];
    actions = [
      "Drink warm fluids like tea with honey",
      "Use a cool-mist humidifier in your room",
      "Take warm, steamy showers",
      "Avoid throat irritants like smoke and dust"
    ];
    contactDoctor = "If you cough up blood, have shortness of breath, wheezing, or if the cough persists for more than 3 weeks.";
  } else if (normalized.includes("cold")) {
    reply = "Experiencing a cold is common. Make sure to take care of yourself to help recovery.";
    conditions = ["Rhinovirus (Common Cold)", "Mild Seasonal Influenza", "Allergic Rhinitis"];
    actions = [
      "Get plenty of bed rest",
      "Keep hydrated with fluids and warm broths",
      "Use saline nasal drops or sprays to ease congestion",
      "Gargle with warm salt water for throat relief"
    ];
    contactDoctor = "If you experience shortness of breath, chest pain, a high fever, or if symptoms do not improve after 10 days.";
  } else if (normalized.includes("fatigue")) {
    reply = "Fatigue can stem from many factors. Let's check potential causes and remedies.";
    conditions = ["Physical exhaustion / Sleep debt", "Iron Deficiency Anemia", "Vitamin D or B12 Deficiency", "Chronic Stress"];
    actions = [
      "Maintain a consistent sleep-wake schedule",
      "Engage in light physical activity like a 15-minute walk",
      "Ensure a balanced diet rich in iron and vitamins",
      "Limit caffeine and heavy meals close to bedtime"
    ];
    contactDoctor = "If fatigue is chronic, unexplained, lasts more than 2 weeks, or is accompanied by weight loss, fever, or swollen lymph nodes.";
  }

  res.json({
    message,
    reply,
    analysis: {
      conditions,
      actions,
      contactDoctor
    },
    createdAt: new Date().toISOString()
  });
}

export async function analyzeClinicalConversation(req, res, next) {
  try {
    const { transcript } = req.body;
    if (!transcript) {
      res.status(400);
      return next(new Error("Transcript is required for clinical analysis."));
    }

    const text = transcript.toLowerCase();
    
    // Extracted symptoms list
    const symptoms = [];
    if (text.includes("fever") || text.includes("temp")) symptoms.push("Fever");
    if (text.includes("cough")) symptoms.push("Cough");
    if (text.includes("headache") || text.includes("migraine")) symptoms.push("Headache");
    if (text.includes("throat") || text.includes("sore")) symptoms.push("Sore Throat");
    if (text.includes("chest") || text.includes("pain")) symptoms.push("Chest Pain");
    if (text.includes("breath") || text.includes("shortness")) symptoms.push("Dyspnea (Shortness of Breath)");
    if (text.includes("stomach") || text.includes("nausea") || text.includes("vomit")) symptoms.push("Nausea / Gastrointestinal Distress");
    if (text.includes("weak") || text.includes("fatigue") || text.includes("tired")) symptoms.push("Fatigue");

    if (symptoms.length === 0) {
      symptoms.push("General Malaise");
    }

    // Suggested Diagnoses & Meds
    const diagnoses = [];
    const medications = [];

    if (text.includes("fever") || text.includes("cough") || text.includes("temp")) {
      diagnoses.push("Upper Respiratory Infection (Viral)");
      diagnoses.push("Influenza (Flu)");
      medications.push({ name: "Paracetamol (Tylenol)", dose: "650mg", time: "08:00, 14:00, 20:00", duration: "5 days" });
      medications.push({ name: "Cough Syrup (Guaifenesin)", dose: "10ml", time: "As needed every 6 hours", duration: "5 days" });
    } else if (text.includes("chest") || text.includes("breath")) {
      diagnoses.push("Suspected Cardiovascular Insufficiency");
      diagnoses.push("Atypical Angina");
      medications.push({ name: "Aspirin (Cardio)", dose: "81mg", time: "08:00", duration: "30 days" });
      medications.push({ name: "Atorvastatin (Lipitor)", dose: "10mg", time: "20:00", duration: "30 days" });
    } else if (text.includes("headache") || text.includes("migraine")) {
      diagnoses.push("Migraine Headache");
      diagnoses.push("Tension Cephalgia");
      medications.push({ name: "Ibuprofen (Advil)", dose: "400mg", time: "08:00, 20:00", duration: "3 days" });
      medications.push({ name: "Sumatriptan (Imitrex)", dose: "50mg", time: "Once at onset of headache", duration: "1 day" });
    } else {
      diagnoses.push("General Viral Syndrome");
      medications.push({ name: "Vitamin C Supplements", dose: "1000mg", time: "08:00", duration: "10 days" });
    }

    // Generate clinical summary
    const symptomStr = symptoms.join(", ");
    const diagnosisStr = diagnoses[0];
    const summary = `The patient presented with complaints of ${symptomStr}. Based on the clinical details, the symptoms are suggestive of ${diagnosisStr}. Recommended management includes rest, fluid hydration, and symptomatic pharmacotherapy.`;

    res.json({
      summary,
      symptoms,
      diagnoses,
      medications,
    });
  } catch (error) {
    next(error);
  }
}
