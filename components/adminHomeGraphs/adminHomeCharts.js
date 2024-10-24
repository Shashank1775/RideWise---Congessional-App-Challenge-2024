import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  HeatMapChart, // New component
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const dummyData = {
  boardedVsNotBoarded: [
    { time: '7:00', boarded: 20, notBoarded: 10 },
    { time: '7:30', boarded: 40, notBoarded: 5 },
    { time: '8:00', boarded: 60, notBoarded: 2 },
    { time: '8:30', boarded: 80, notBoarded: 0 },
  ],
  fuelEconomy: [
    { time: '7:00', bus1: 5, bus2: 6, bus3: 4, bus4: 7, bus5: 6 },
    { time: '7:30', bus1: 4, bus2: 6.5, bus3: 4.2, bus4: 7.1, bus5: 6.2 },
    { time: '8:00', bus1: 4.5, bus2: 6.3, bus3: 4.5, bus4: 7.4, bus5: 6.3 },
    { time: '8:30', bus1: 4.8, bus2: 6.1, bus3: 4.6, bus4: 7.2, bus5: 6.1 },
  ],
  studentAttendance: [
    { day: 'Monday', present: 200, absent: 20 },
    { day: 'Tuesday', present: 210, absent: 15 },
    { day: 'Wednesday', present: 195, absent: 25 },
    { day: 'Thursday', present: 205, absent: 18 },
    { day: 'Friday', present: 198, absent: 22 },
  ],
  busBreakdown: [
    { bus: 'Bus 1', breakdowns: 2 },
    { bus: 'Bus 2', breakdowns: 0 },
    { bus: 'Bus 3', breakdowns: 1 },
    { bus: 'Bus 4', breakdowns: 3 },
    { bus: 'Bus 5', breakdowns: 0 },
  ],
  staffPerformance: [
    { staff: 'Teacher A', rating: 4.5 },
    { staff: 'Teacher B', rating: 3.9 },
    { staff: 'Teacher C', rating: 4.7 },
    { staff: 'Teacher D', rating: 4.0 },
  ],
};

export default function AdminHomeCharts() {
  return (
    <div className="p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Interactive Metrics Dashboard</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Line Chart - Boarded vs Not Boarded Students Over Time */}
        <div className="bg-gray-100 h-64 border border-gray-300 rounded-lg p-4 shadow-inner">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Boarded vs Not Boarded Students</h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={dummyData.boardedVsNotBoarded}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`${value} Students`, name]} />
              <Legend />
              <Line type="monotone" dataKey="boarded" stroke="#0088FE" />
              <Line type="monotone" dataKey="notBoarded" stroke="#FF8042" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart - Average Bus Fuel Economy Over Time */}
        <div className="bg-gray-100 h-64 border border-gray-300 rounded-lg p-4 shadow-inner">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Average Bus Fuel Economy</h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={dummyData.fuelEconomy}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip formatter={(value) => [`Fuel Economy: ${value} km/l`]} />
              <Legend />
              <Line type="monotone" dataKey="bus1" stroke="#0088FE" />
              <Line type="monotone" dataKey="bus2" stroke="#00C49F" />
              <Line type="monotone" dataKey="bus3" stroke="#FFBB28" />
              <Line type="monotone" dataKey="bus4" stroke="#FF8042" />
              <Line type="monotone" dataKey="bus5" stroke="#FF5555" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Student Attendance */}
        <div className="bg-gray-100 h-64 border border-gray-300 rounded-lg p-4 shadow-inner">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Student Attendance</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={dummyData.studentAttendance}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} Students`]} />
              <Legend />
              <Bar dataKey="present" fill="#82ca9d" name="Present" />
              <Bar dataKey="absent" fill="#FF5555" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Bus Breakdown Analysis */}
        <div className="bg-gray-100 h-64 border border-gray-300 rounded-lg p-4 shadow-inner">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Bus Breakdown Analysis</h3>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie data={dummyData.busBreakdown} dataKey="breakdowns" nameKey="bus" cx="50%" cy="50%" outerRadius={80}>
                {dummyData.busBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Scatter Chart - Bus Efficiency Analysis */}
        <div className="bg-gray-100 h-64 border border-gray-300 rounded-lg p-4 shadow-inner">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Bus Efficiency Analysis</h3>
          <ResponsiveContainer width="100%" height="80%">
            <ScatterChart>
              <XAxis type="number" dataKey="bus1" name="Bus 1 Fuel Economy" unit="km/l" />
              <YAxis type="number" dataKey="bus2" name="Bus 2 Fuel Economy" unit="km/l" />
              <Scatter name="Fuel Economy Comparison" data={dummyData.fuelEconomy} fill="#0088FE" />
              <Tooltip />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
