import { useState, useEffect, useRef } from "react";
import api from "../../services/api.js";
import { MessageSquare, Send, BrainCircuit, Activity, User, HeartPulse, ClipboardCheck, Mic, MicOff, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ClinicalConversationUI() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  
  // Analysis & Prescription States
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [issuingPrescription, setIssuingPrescription] = useState(false);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Fetch assigned patients
  useEffect(() => {
    async function fetchPatients() {
      try {
        const res = await api.get("/doctors/patients");
        setPatients(res.data);
        if (res.data.length > 0) {
          setSelectedPatientId(res.data[0]._id);
        }
      } catch (err) {
        toast.error("Failed to load assigned patients.");
      }
    }
    fetchPatients();
  }, []);

  // Update default chat intro when patient changes
  useEffect(() => {
    if (!selectedPatientId) return;
    const pat = patients.find(p => p._id === selectedPatientId);
    setMessages([
      {
        sender: "bot",
        text: `Clinical Assistant active for Patient: ${pat?.full_name || "N/A"}. You can type notes, paste clinical transcripts, or use the microphone to record a live check-up.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
    setAnalysisResult(null);
  }, [selectedPatientId, patients]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Voice Recording using Web Speech API
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Web Speech API is not supported in this browser. Simulating input...");
      setInputText("Patient describes having chest tightness and shortness of breath for the last week.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setRecording(true);
        toast.success("Microphone active. Speak now...");
      };

      rec.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setInputText(finalTranscript || interimTranscript);
      };

      rec.onerror = () => {
        setRecording(false);
      };

      rec.onend = () => {
        setRecording(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error(err);
      setRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);
      toast.success("Voice recording finalized.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const docNote = {
      sender: "user", // Representing the doctor's record
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, docNote]);
    setInputText("");
    setSending(true);

    try {
      const response = await api.post("/chat/message", { message: docNote.text });
      const botMsg = {
        sender: "bot",
        text: response.data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      toast.error("Assistant failing to response.");
    } finally {
      setSending(false);
    }
  };

  // Trigger Clinical Text Analysis
  const handleAnalyzeConversation = async () => {
    if (messages.length < 2) {
      toast.error("Please record some clinical conversation or notes first.");
      return;
    }

    setAnalyzing(true);
    const transcript = messages
      .map((msg) => `${msg.sender === "user" ? "Clinical note" : "AI feedback"}: ${msg.text}`)
      .join("\n");

    try {
      const response = await api.post("/chat/analyze", { transcript });
      setAnalysisResult(response.data);
      setPrescriptionNotes(response.data.summary);
      toast.success("EHR conversation parsed!");
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "EHR Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  // Issue prescription using suggestions
  const handleIssuePrescription = async () => {
    if (!selectedPatientId || !analysisResult) return;
    setIssuingPrescription(true);

    try {
      const medsPayload = analysisResult.medications.map(m => ({
        name: m.name,
        dose: m.dose,
        time: m.time,
        duration: m.duration
      }));

      await api.post("/prescriptions", {
        patientId: selectedPatientId,
        date: new Date().toISOString().split("T")[0],
        medicines: medsPayload,
        notes: prescriptionNotes
      });

      toast.success("Prescription generated & securely encrypted in Patient records!");
      setAnalysisResult(null);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create prescription");
    } finally {
      setIssuingPrescription(false);
    }
  };

  const selectedPatient = patients.find(p => p._id === selectedPatientId);

  return (
    <div className="space-y-8">
      {/* Workspace Select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Select Patient Workspace</h3>
          <p className="text-xs text-slate-500">Isolate logs for specific patient reviews</p>
        </div>
        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-slate-900 outline-none focus:border-cyan-400 font-semibold"
        >
          {patients.map(p => (
            <option key={p._id} value={p._id}>
              {p.full_name} ({p.patient_id})
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1.2fr]">
        {/* Chat Window */}
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-[600px] justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-50 p-2.5 text-cyan-600">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">AI Clinical Conversation Assistant</h3>
                <p className="text-xs text-slate-500 font-medium">Auto-listening & EHR integration</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={recording ? stopRecording : startRecording}
                className={`p-3 rounded-2xl transition duration-200 ${
                  recording ? "bg-rose-600 text-white animate-pulse" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                title={recording ? "Stop Recording" : "Record Voice"}
              >
                {recording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <button
                type="button"
                onClick={handleAnalyzeConversation}
                disabled={analyzing}
                className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold transition disabled:opacity-50 inline-flex items-center gap-2"
              >
                <BrainCircuit size={14} className="text-cyan-400" />
                {analyzing ? "Analyzing..." : "Generate AI Summary"}
              </button>
            </div>
          </div>

          {/* Transcript/Message Display */}
          <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[80%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    msg.sender === "user" ? "bg-slate-900 text-white" : "bg-cyan-100 text-cyan-700"
                  }`}
                >
                  {msg.sender === "user" ? <User size={16} /> : "H"}
                </div>
                <div className="space-y-1">
                  <div
                    className={`rounded-3xl p-4 text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-slate-950 text-white rounded-tr-none"
                        : "bg-slate-50 border border-slate-150 text-slate-800 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <p className="text-[10px] text-slate-400 text-right">{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSendMessage} className="flex gap-3 border-t border-slate-100 pt-4">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe symptoms, add clinical notes, or talk..."
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
            />
            <button
              type="submit"
              disabled={sending}
              className="rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white p-3.5 transition shadow-lg shadow-cyan-200/20 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </section>

        {/* Suggestions & Action Panel */}
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-[600px] overflow-y-auto">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900">AI Clinical Suggestions</h3>
            <p className="text-xs text-slate-500">Treatment plans & automated prescriptions</p>
          </div>

          {!analysisResult ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-6">
              <BrainCircuit className="h-14 w-14 text-slate-200 mb-3 animate-pulse" />
              <p className="font-bold text-slate-700 text-sm mb-1">No Active Diagnosis Suggestions</p>
              <p className="text-xs leading-relaxed max-w-[240px]">
                Type clinical notes and click "Generate AI Summary" to suggest prescriptions.
              </p>
            </div>
          ) : (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                {/* AI Summary */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-700 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-full inline-flex items-center gap-1">
                    <ClipboardCheck size={12} /> Diagnosis Summary
                  </span>
                  <p className="text-xs leading-relaxed text-slate-600 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    {analysisResult.summary}
                  </p>
                </div>

                {/* Suggestions */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400">Diagnosis suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.diagnoses?.map((d, i) => (
                      <span key={i} className="text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Meds */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400">Treatment Recommendations:</p>
                  <div className="space-y-3">
                    {analysisResult.medications?.map((m, i) => (
                      <div key={i} className="border border-slate-150 p-4 rounded-2xl flex items-start gap-3">
                        <HeartPulse size={18} className="text-cyan-600 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{m.name} ({m.dose})</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Dose: {m.time} | Duration: {m.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Edit Prescription Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 block">Edit Prescription Notes:</label>
                  <textarea
                    value={prescriptionNotes}
                    onChange={(e) => setPrescriptionNotes(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-cyan-400"
                    rows={3}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleIssuePrescription}
                disabled={issuingPrescription}
                className="mt-6 w-full rounded-2xl bg-cyan-600 hover:bg-cyan-500 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <PlusCircle size={16} />
                {issuingPrescription ? "Writing..." : "Issue & Encrypt Prescription"}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
