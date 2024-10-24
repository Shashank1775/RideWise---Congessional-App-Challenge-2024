import BusRouteMap from '../adminStuff/busRouteMap';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const dataPie = [
  { name: 'Boarded', value: 30 },
  { name: 'Remaining', value: 20 },
];

const dataBar = [
  { name: 'Bus 1', boarded: 30, arrived: 28 },
  { name: 'Bus 2', boarded: 25, arrived: 24 },
  { name: 'Bus 3', boarded: 50, arrived: 48 },
];

const CircularProgress = ({ percentage }) => {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const progress = (percentage / 100) * circumference;
  
    return (
      <svg className="w-16 h-16" viewBox="0 0 36 36">
        <path
          className="text-gray-300"
          fill="none"
          strokeWidth="3"
          stroke="currentColor"
          d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32"
        />
        <path
          className="text-green-500"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={`${progress} ${circumference - progress}`}
          d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32"
        />
      </svg>
    );
  };

export default function AdminHomeGraphs({busRoutes}){

    const busRoutePercentage = 62; // Example percentage for Bus Route Completion


    return(
<div className="p-8 space-y-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-5 w-8 h-8 mr-4"
            >
                <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                <path
                fillRule="evenodd"
                d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                clipRule="evenodd"
                />
            </svg>

            <h2 className="text-3xl font-bold text-gray-800">Monitor Buses</h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center shadow-inner">
                    <BusRouteMap />
                </div>

                {/* Pie Chart for Students Boarded */}
                <div className="bg-gray-100 h-64 border border-gray-300 rounded-lg p-4 shadow-inner hover:bg-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Students Boarded</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <PieChart>
                            <Pie
                                data={dataPie}
                                innerRadius={40}
                                outerRadius={60}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {dataPie.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart for Boarded and Arrived */}
                <div className="bg-gray-100 h-64 border border-gray-300 rounded-lg p-4 shadow-inner hover:bg-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Bus Routes: Students Boarded vs Arrived</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={dataBar} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="boarded" fill="#8884d8" />
                            <Bar dataKey="arrived" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Bus Route Percentage Bar */}
                <div className="col-span-2">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-semibold text-gray-700">Bus Route Percentage Done</span>
                        <span className="font-bold text-2xl">{busRoutePercentage}%</span>
                    </div>
                    <div className="w-full h-6 bg-gray-300 rounded-full">
                        <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${busRoutePercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    )
}