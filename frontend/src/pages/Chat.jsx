import { useState, useRef, useEffect } from "react";
import api from "../services/api.js";
import { MessageSquare, Send, BrainCircuit, Activity, User, HeartPulse, ClipboardCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your MediNexa AI Clinical Assistant. You can describe your symptoms, ask about medication scheduling, or request a diagnosis analysis.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  // Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      sender: "user",
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setSending(true);

    try {
      const response = await api.post("/chat/message", { message: userMsg.text });
      const botMsg = {
        sender: "bot",
        text: response.data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      toast.error("Failed to connect to the AI Assistant.");
    } finally {
      setSending(false);
    }
  };

  const handleAnalyzeConversation = async () => {
    if (messages.length < 2) {
      toast.error("Please converse with the assistant first so we have clinical data to analyze.");
      return;
    }

    setAnalyzing(true);
    // Combine all user and bot messages into a single transcript text
    const transcript = messages
      .map((msg) => `${msg.sender === "user" ? "Patient" : "MediNexa Assistant"}: ${msg.text}`)
      .join("\n");

    try {
      const response = await api.post("/chat/analyze", { transcript });
      setAnalysisResult(response.data);
      toast.success("Conversation analyzed successfully!");
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        
        {/* Chat Console Section */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm flex flex-col h-[650px] justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-50 p-2 text-cyan-600">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-sans">MediNexa AI Doctor</h3>
                <p className="text-xs text-slate-500 font-semibold">Active Diagnostics Engine</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAnalyzeConversation}
              disabled={analyzing}
              className="rounded-3xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 text-xs font-bold transition disabled:opacity-50 inline-flex items-center gap-2"
            >
              <BrainCircuit size={14} className="text-cyan-400" />
              {analyzing ? "Analyzing..." : "Analyze Conversation"}
            </button>
          </div>

          {/* Messages Console */}
          <div className="flex-1 overflow-y-auto my-6 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
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

          {/* Form Input Console */}
          <form onSubmit={handleSendMessage} className="flex gap-3 border-t border-slate-100 pt-6">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. My head hurts and I have a minor fever of 100.2 F..."
              className="flex-1 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition"
            />
            <button
              type="submit"
              disabled={sending}
              className="rounded-3xl bg-cyan-600 hover:bg-cyan-500 text-white p-4 transition shadow-lg shadow-cyan-200/20 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </section>

        {/* Diagnostics & Clinical Dashboard */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm flex flex-col h-[650px] overflow-y-auto">
          <div className="mb-6 border-b border-slate-100 pb-6">
            <h3 className="text-xl font-bold text-slate-900">Clinical Dashboard</h3>
            <p className="text-sm text-slate-500">Extracted diagnostics, symptoms and medications</p>
          </div>

          {!analysisResult ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-6">
              <BrainCircuit className="h-16 w-16 text-slate-300 mb-4 animate-pulse" />
              <p className="font-semibold text-slate-600 mb-1">No Active Analysis</p>
              <p className="text-xs leading-relaxed max-w-[220px]">
                Click "Analyze Conversation" above to synthesize symptoms and suggested therapy.
              </p>
            </div>
          ) : (
            <div className="space-y-6 flex-1">
              {/* Summary */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-700 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-full inline-flex items-center gap-1">
                  <ClipboardCheck size={12} /> Diagnosis Summary
                </span>
                <p className="text-sm leading-relaxed text-slate-600 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  {analysisResult.summary}
                </p>
              </div>

              {/* Symptoms */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400">Extracted Symptoms:</p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.symptoms?.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Diagnoses */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400">Suggested Diagnoses:</p>
                <div className="space-y-2">
                  {analysisResult.diagnoses?.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-slate-700 bg-emerald-50/50 border border-emerald-100 p-3 rounded-2xl"
                    >
                      <Activity size={14} className="text-emerald-600 shrink-0" />
                      <span className="font-semibold">{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medications */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400">Suggested Medications:</p>
                <div className="space-y-3">
                  {analysisResult.medications?.map((m, i) => (
                    <div
                      key={i}
                      className="border border-slate-150 p-4 rounded-2xl flex items-start gap-3"
                    >
                      <div className="rounded-xl bg-cyan-50 p-2 text-cyan-600 mt-0.5">
                        <HeartPulse size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                        <p className="text-xs text-slate-600">Dose: {m.dose} | Duration: {m.duration}</p>
                        <p className="text-[10px] text-slate-400 mt-1">⏰ {m.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
