import React, { useState, useEffect } from 'react';
import { Activity, Zap, Shield, LayoutGrid } from 'lucide-react';

const Dashboard = () => {
  // Mock State - In production, fetch this from your Node.js/Python API
  const [zones, setZones] = useState({
    Q1: { active: true, persons: 2, light: "ON", fan: "ON" },
    Q2: { active: false, persons: 0, light: "OFF", fan: "OFF" },
    Q3: { active: true, persons: 3, light: "ON", fan: "ON" },
    Q4: { active: true, persons: 1, light: "DIM", fan: "LOW" },
  });

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-200 p-8 font-sans">
      {/* Sidebar Hint */}
      <div className="flex">
        <aside className="w-64 border-r border-slate-800 pr-8 hidden lg:block">
          <div className="flex items-center gap-2 mb-10 text-emerald-400 font-bold text-xl">
            <Shield size={28} /> AegisAI
          </div>
          <nav className="space-y-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center gap-3">
              <LayoutGrid size={20}/> Dashboard
            </div>
            <div className="p-3 text-slate-500 flex items-center gap-3 hover:text-slate-300 cursor-pointer">
              <Activity size={20}/> Live Rooms
            </div>
          </nav>
        </aside>

        <main className="flex-1 pl-8">
          {/* Top Energy Engine Section */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span> Energy Engine
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Live kWh Usage" value="0.1202 kWh" icon={<Zap size={20}/>} color="emerald" />
              <StatCard title="Weekly Savings" value="0.310 kWh" icon={<Activity size={20}/>} color="emerald" />
              <StatCard title="Efficiency" value="66.4%" icon={<Zap size={20}/>} color="purple" />
            </div>
          </section>

          {/* Quadrant Map Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-medium mb-6">Zone Intelligence (Room 204)</h3>
              <div className="grid grid-cols-2 gap-4 aspect-square max-w-[400px] mx-auto">
                {Object.keys(zones).map((key) => (
                  <div 
                    key={key}
                    className={`border-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                      zones[key].active ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-slate-800 bg-slate-900/50'
                    }`}
                  >
                    <span className="text-2xl font-bold">{key}</span>
                    <span className="text-xs text-slate-400">{zones[key].persons} Persons</span>
                    {zones[key].active && <div className="mt-2 px-2 py-1 bg-emerald-500 text-[10px] rounded uppercase font-bold text-black">Active</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Table View */}
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 overflow-hidden">
              <h3 className="text-lg font-medium mb-6">Localized Status</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="pb-4">ZONE</th>
                    <th className="pb-4">FAN</th>
                    <th className="pb-4">LIGHT</th>
                    <th className="pb-4">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {Object.entries(zones).map(([name, data]) => (
                    <tr key={name} className="hover:bg-slate-800/30">
                      <td className="py-4 font-medium">{name}</td>
                      <td className={`py-4 ${data.fan !== 'OFF' ? 'text-emerald-400' : 'text-slate-600'}`}>{data.fan}</td>
                      <td className={`py-4 ${data.light !== 'OFF' ? 'text-emerald-400' : 'text-slate-600'}`}>{data.light}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-[10px] ${data.active ? 'bg-emerald-900 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                          {data.active ? 'ACTIVE' : 'STANDBY'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-sm">
    <div className={`mb-4 w-10 h-10 rounded-lg flex items-center justify-center ${color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'}`}>
      {icon}
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-xs text-slate-500 uppercase font-medium">{title}</div>
  </div>
);

export default Dashboard;