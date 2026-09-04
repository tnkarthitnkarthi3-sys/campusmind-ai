"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { day: "Mon", attendance: 88 },
  { day: "Tue", attendance: 91 },
  { day: "Wed", attendance: 89 },
  { day: "Thu", attendance: 94 },
  { day: "Fri", attendance: 92 },
  { day: "Sat", attendance: 95 },
];

export default function AttendanceChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} />
          <YAxis
            domain={[70, 100]}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip formatter={(value) => [`${value}%`, "Attendance"]} />

          <Area
            type="monotone"
            dataKey="attendance"
            stroke="#4f46e5"
            strokeWidth={3}
            fill="url(#attendanceFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
