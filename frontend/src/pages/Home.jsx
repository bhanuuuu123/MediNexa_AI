import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, ArrowRight, HeartPulse, ShieldCheck, Send, BrainCircuit, Activity, ClipboardCheck, Sparkles } from "lucide-react";
import api from "../services/api.js";
import toast from "react-hot-toast";

export default function Home() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am the MediNexa AI Doctor Assistant. Describe your symptoms (e.g., 'fever', 'headache', 'cough') below to check potential conditions and actions.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setSending(true);

    try {
      const response = await api.post("/chat/message", { message: text });
      const botMsg = {
        sender: "bot",
        text: response.data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      if (response.data.analysis) {
        setCurrentAnalysis(response.data.analysis);
      }
    } catch (error) {
      toast.error("Failed to connect to the AI Assistant.");
    } finally {
      setSending(false);
    }
  };

  // Voice Input using SpeechRecognition API
  const toggleSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech Recognition is not supported in this browser.");
      return;
    }

    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
    } else {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setRecording(true);
          toast.success("Listening...");
        };

        rec.onresult = (event) => {
          const resultText = event.results[0][0].transcript;
          setInputText(resultText);
          toast.success(`Captured: "${resultText}"`);
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
        setRecording(false);
      }
    }
  };

  const handleExampleClick = (symptom) => {
    handleSendMessage(`I am experiencing ${symptom.toLowerCase()}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-cyan-50 px-6 py-10 lg:px-16">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        {/* Left Side: Hero */}
        <section className="space-y-8">
          <div className="max-w-xl space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-700 font-bold">MediNexa AI Platform</p>
            <h1 className="text-5xl font-extrabold text-slate-900 lg:text-6xl tracking-tight leading-tight">
              Premium AI-powered healthcare for modern patient journeys.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Book appointments, track medicines, upload records, and consult with our smart clinical assistants from one professional ecosystem.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl backdrop-blur-xl flex items-center gap-4">
              <HeartPulse className="h-10 w-10 rounded-2xl bg-cyan-50 p-2 text-cyan-600 shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold">Care metrics</p>
                <p className="mt-1 text-lg font-bold text-slate-900">92% Medication Adherence</p>
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl backdrop-blur-xl flex items-center gap-4">
              <ShieldCheck className="h-10 w-10 rounded-2xl bg-cyan-50 p-2 text-cyan-600 shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold">Encrypted EHR</p>
                <p className="mt-1 text-lg font-bold text-slate-900">Secure AES Storage</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 hover:bg-slate-800 transition"
            >
              Patient Portal
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center rounded-3xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-900 hover:border-cyan-300 shadow-sm transition"
            >
              Portal Login
            </button>
          </div>
        </section>

        {/* Right Side: Working Chat widget */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-xl flex flex-col h-[650px] justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.1),_transparent_40%)] pointer-events-none" />
          
          <div className="relative flex flex-col h-full justify-between">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-700 font-bold">Symptom Checker</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BrainCircuit className="text-cyan-600" />
                  AI Doctor Assistant
                </h2>
              </div>
              <button
                type="button"
                onClick={toggleSpeech}
                className={`p-2.5 rounded-full transition ${
                  recording ? "bg-rose-600 text-white animate-pulse" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                title="Voice Input"
              >
                {recording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      msg.sender === "user" ? "bg-slate-900 text-white" : "bg-cyan-50 text-cyan-700 border"
                    }`}
                  >
                    {msg.sender === "user" ? "Me" : "AI"}
                  </div>
                  <div>
                    <div
                      className={`rounded-2xl p-3.5 text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-slate-950 text-white rounded-tr-none"
                          : "bg-slate-50 border text-slate-800 rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 text-right">{msg.time}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Analysis card if present */}
            {currentAnalysis && (
              <div className="border border-cyan-100 bg-cyan-50/20 rounded-2xl p-4 mb-4 space-y-3 max-h-48 overflow-y-auto">
                <div className="flex items-center gap-1.5 text-cyan-800 font-bold text-xs">
                  <Sparkles size={14} className="text-cyan-600" />
                  Symptom Diagnostic Output
                </div>
                <div className="text-xs space-y-2 text-slate-700">
                  <p><strong>Possible Conditions:</strong> {currentAnalysis.conditions.join(", ")}</p>
                  <p><strong>Recommended Actions:</strong></p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {currentAnalysis.actions.map((act, i) => <li key={i}>{act}</li>)}
                  </ul>
                  <p className="text-rose-600"><strong>Emergency Guideline:</strong> {currentAnalysis.contactDoctor}</p>
                </div>
              </div>
            )}

            {/* Example pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-[10px] text-slate-400 font-bold self-center mr-1">Try examples:</span>
              {["Fever", "Headache", "Cough", "Cold", "Fatigue"].map((symp) => (
                <button
                  key={symp}
                  type="button"
                  onClick={() => handleExampleClick(symp)}
                  className="bg-slate-100 hover:bg-slate-200 border text-[10px] font-bold text-slate-700 px-3 py-1.5 rounded-full transition"
                >
                  {symp}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2 border-t border-slate-100 pt-4"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe symptoms..."
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-cyan-400 transition"
              />
              <button
                type="submit"
                disabled={sending}
                className="rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white px-4 transition disabled:opacity-50 flex items-center justify-center"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
