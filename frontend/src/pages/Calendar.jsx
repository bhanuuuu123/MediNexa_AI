import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ArrowLeft, ArrowRight } from "lucide-react";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildMonth(year, month) {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = [];
  let current = 1 - startOffset;

  while (current <= daysInMonth) {
    weeks.push(
      Array.from({ length: 7 }, () => {
        const day = new Date(year, month, current);
        const isCurrentMonth = current > 0 && current <= daysInMonth;
        return { day, isCurrentMonth };
      })
    );
    current += 7;
  }
  return weeks;
}

export default function CalendarPage() {
  const [current, setCurrent] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents([
      { id: 1, date: "2026-06-19", title: "Dr. Sharma consultation", type: "appointment" },
      { id: 2, date: "2026-06-20", title: "Medicine reminder: Aspirin", type: "medicine" },
      { id: 3, date: "2026-06-23", title: "Health checkup", type: "checkup" },
    ]);
  }, []);

  const monthName = current.toLocaleString("default", { month: "long" });
  const weeks = useMemo(() => buildMonth(current.getFullYear(), current.getMonth()), [current]);

  const formatDateKey = (date) => date.toISOString().slice(0, 10);
  const eventMap = events.reduce((acc, event) => {
    acc[event.date] = acc[event.date] ? [...acc[event.date], event] : [event];
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-cyan-700">Calendar overview</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">Schedule tracker</h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                className="rounded-2xl bg-slate-100 p-3 text-slate-600 hover:bg-slate-200"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                className="rounded-2xl bg-slate-100 p-3 text-slate-600 hover:bg-slate-200"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-7 gap-2 text-xs uppercase tracking-[0.35em] text-slate-500">
              {weekdays.map((day) => (
                <span key={day} className="text-center">{day}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weeks.flat().map((cell, index) => {
                const formatted = formatDateKey(cell.day);
                const dayEvents = eventMap[formatted] || [];
                return (
                  <div
                    key={index}
                    className={`rounded-3xl border p-3 text-center ${cell.isCurrentMonth ? "bg-white shadow-sm" : "bg-slate-50 text-slate-400"}`}
                  >
                    <p className="font-semibold">{cell.day.getDate()}</p>
                    {dayEvents.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <span key={event.id} className="block rounded-full bg-cyan-50 px-2 py-1 text-[11px] font-medium text-cyan-700">
                            {event.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-900">
            <CalendarDays size={20} className="text-cyan-600" />
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-700">Upcoming events</p>
              <h3 className="mt-2 text-xl font-semibold">Next 3 sessions</h3>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            {events.map((event) => (
              <div key={event.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                <p className="mt-1 text-sm text-slate-500">{event.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
