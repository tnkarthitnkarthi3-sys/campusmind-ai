"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
  BookOpen,
  RefreshCw,
} from "lucide-react";

type Entry = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  room?: string | null;
  section?: string | null;
  subject: {
    name: string;
    code: string;
  };
  faculty: {
    name: string;
    email: string;
  };
};

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function TimetablePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [loading, setLoading] = useState(true);

  async function loadTimetable() {
    try {
      setLoading(true);

      const response = await fetch("/api/campus/timetable", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        setEntries(data.timetable || []);
      }
    } catch (error) {
      console.error("Timetable loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTimetable();
  }, []);

  const todayEntries = useMemo(() => {
    return entries
      .filter(
        (item) =>
          item.day.toLowerCase() === selectedDay.toLowerCase()
      )
      .sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
  }, [entries, selectedDay]);

  return (
    <main className="min-h-screen bg-slate-100 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-cyan-600">
              <CalendarDays size={20} />
              <span className="font-bold">
                Academic Schedule
              </span>
            </div>

            <h1 className="text-3xl font-black text-slate-950 md:text-4xl">
              My Timetable
            </h1>

            <p className="mt-2 text-slate-500">
              View your complete weekly class schedule.
            </p>
          </div>

          <button
            onClick={loadTimetable}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                selectedDay === day
                  ? "bg-slate-950 text-white shadow-lg"
                  : "bg-white text-slate-600 hover:bg-slate-200"
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-12 text-center text-slate-500">
            Loading timetable...
          </div>
        ) : todayEntries.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <CalendarDays
              className="mx-auto mb-4 text-slate-400"
              size={42}
            />

            <h2 className="text-xl font-bold text-slate-900">
              No classes scheduled
            </h2>

            <p className="mt-2 text-slate-500">
              There are no timetable entries for {selectedDay}.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {todayEntries.map((item, index) => (
              <div
                key={item.id}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center">

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black text-slate-950">
                        {item.subject.name}
                      </h2>

                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                        {item.subject.code}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-3">

                      <span className="flex items-center gap-2">
                        <Clock3 size={16} />
                        {item.startTime} - {item.endTime}
                      </span>

                      <span className="flex items-center gap-2">
                        <UserRound size={16} />
                        {item.faculty.name}
                      </span>

                      <span className="flex items-center gap-2">
                        <MapPin size={16} />
                        {item.room || "Room not assigned"}
                      </span>

                    </div>
                  </div>

                  <BookOpen
                    className="hidden text-slate-300 md:block"
                    size={30}
                  />

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
