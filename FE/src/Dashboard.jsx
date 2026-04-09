import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutGrid, Video, BarChart3, Settings, 
  Shield, Zap, Cpu, Clock, Activity, Download, Lightbulb, Fan 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

// --- MOCK DATA ---
const energyData = [
  { time: '00:00', legacy: 42, aegis: 18 },
  { time: '06:00', legacy: 65, aegis: 35 },
  { time: '12:00', legacy: 92, aegis: 31 },
  { time: '18:00', legacy: 70, aegis: 30 },
  { time: '23:59', legacy: 45, aegis: 20 },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-[#070a0f] text-slate-300 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0a0e17] border-r border-slate-800 flex flex-col p-4">
        <div className="flex items-center gap-3 text-emerald-400 font-bold text-xl mb-10 px-2">
          <Shield className="fill-emerald-500/20" /> 
          <div className="leading-tight">AegisAI<br/><span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Energy Platform</span></div>
        </div>
        
        <nav className="space-y-2 flex-1">
          <TabBtn id="dashboard" icon={<LayoutGrid size={18}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={setActiveTab} />
          <TabBtn id="live" icon={<Video size={18}/>} label="Live Rooms" active={activeTab === 'live'} onClick={setActiveTab} />
          <TabBtn id="analytics" icon={<BarChart3 size={18}/>} label="Analytics" active={activeTab === 'analytics'} onClick={setActiveTab} />
          <TabBtn id="settings" icon={<Settings size={18}/>} label="System Settings" active={activeTab === 'settings'} onClick={setActiveTab} />
        </nav>

        <div className="space-y-3">
          <div className="bg-[#111827] border border-slate-800 p-3 rounded-xl">
            <p className="text-[10px] uppercase text-slate-500 font-bold mb-2">Node Status</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-white">Luckfox Mega</span>
              </div>
              <Zap size={14} className="text-emerald-500" />
            </div>
            <p className="text-[10px] text-emerald-500 mt-1 font-bold">Active</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'live' && <LiveRoomsView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

// --- TAB COMPONENT ---
function TabBtn({ id, icon, label, active, onClick }) {
  return (
    <button 
      onClick={() => onClick(id)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
        active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      {icon} <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}

// --- 1. DASHBOARD VIEW ---
function DashboardView() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Energy Management Hub</h1>
          <p className="text-slate-500 text-sm">Real-time occupancy detection and energy optimization</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Zone Energy Savings" value="2,847 kWh" sub="↑ 12%" color="emerald" icon={<Zap />} />
        <StatCard title="Quadrant Status" value="3 / 4" sub="↑ 8%" color="emerald" icon={<LayoutGrid />} />
        <StatCard title="Current Power Load" value="34.2 kW" sub="↘ 5%" color="blue" icon={<Activity />} />
        <StatCard title="Node Status" value="99.8%" sub="Up" color="purple" icon={<Cpu />} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-[#111827] border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Zone Intelligence Enabled</h3>
              <h2 className="text-xl font-bold text-white">Smart Energy Optimization</h2>
            </div>
            <div className="text-right">
                <span className="text-3xl font-bold text-emerald-400">66%</span>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Savings</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyData}>
                <defs>
                  <linearGradient id="colorAegis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="legacy" stroke="#475569" fill="transparent" strokeWidth={2} />
                <Area type="monotone" dataKey="aegis" stroke="#10b981" fill="url(#colorAegis)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-6">Zone Occupancy by Time</h3>
            <div className="space-y-5">
                {['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'].map((z, i) => (
                    <div key={z}>
                        <div className="flex justify-between text-xs mb-1 font-bold">
                            <span>{z}</span>
                            <span className="text-emerald-400">{14 - i*2} People</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${80 - i*15}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

// --- 2. LIVE ROOMS VIEW ---
function LiveRoomsView() {
  const [activeQs, setActiveQs] = useState({ Q1: 0, Q2: 0, Q3: 0, Q4: 0 });
  const [deviceStates, setDeviceStates] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [streamKey, setStreamKey] = useState(null);
  const [streamError, setStreamError] = useState(false);
  const [streamLoaded, setStreamLoaded] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:8000/status')
        .then(res => res.json())
        .then(data => {
            if (data.active_quadrants) {
                setActiveQs(data.active_quadrants);
            }
        })
        .catch(err => console.error(err));
      
      fetch('http://localhost:8000/device_status')
        .then(res => res.json())
        .then(data => {
            setDeviceStates(data);
        })
        .catch(err => console.error(err));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
    e.target.value = '';
  };

  const handleStart = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setStreamError(false);
    setStreamLoaded(false);
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const res = await fetch('http://localhost:8000/upload_video/', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      setStreamKey(Date.now());
      setStreamActive(true);
    } catch (err) {
      console.error('Upload error:', err);
      setStreamError(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStreamEnd = () => {
    setStreamActive(false);
    setStreamKey(null);
    setSelectedFile(null);
    setStreamError(false);
    setStreamLoaded(false);
    setActiveQs({ Q1: 0, Q2: 0, Q3: 0, Q4: 0 });
  };

  const getActiveText = () => {
      const actives = Object.keys(activeQs).filter(k => activeQs[k] === 1);
      if (actives.length === 0) return "No Detections";
      return actives.join(', ') + " Active";
  };

  const handleManualControl = async (quadrant, device, status) => {
    try {
      await fetch(`http://localhost:8000/manual_control?quadrant=${quadrant}&device=${device}&status=${status}`, {
        method: 'POST'
      });
    } catch (err) {
      console.error('Failed to update manual control:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Zone-Level Classroom Monitoring</h1>
        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} className="hidden" accept="video/mp4" onChange={handleFileSelect} />
          {!streamActive ? (
            <>
              <button
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-5 rounded-xl transition-all text-sm border border-slate-700">
                {selectedFile ? `📁 ${selectedFile.name}` : 'Select Video (MP4)'}
              </button>
              {selectedFile && (
                <button
                  onClick={handleStart}
                  disabled={isUploading}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold py-2 px-6 rounded-xl transition-all shadow-lg text-sm">
                  {isUploading ? 'Starting...' : '▶ Start'}
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleStreamEnd}
              className="bg-red-500/20 hover:bg-red-500/40 text-red-400 font-bold py-2 px-5 rounded-xl transition-all text-sm border border-red-500/30">
              ⏹ Stop Stream
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Video Feed + Table */}
        <div className="col-span-2 space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
              <div className="flex items-center gap-2"><Video size={16} className="text-emerald-500"/> <span className="font-bold text-sm">Room 1</span></div>
              <div className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest ${streamActive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-700/40 text-slate-500'}`}>
                {streamActive ? 'Live Feed Active' : 'Idle — Select a Video'}
              </div>
            </div>
            <div className="aspect-video bg-black/40 relative flex items-center justify-center overflow-hidden">
              {streamActive && streamKey ? (
                <div className="relative w-full h-full bg-black">
                  <img
                    key={streamKey}
                    src={`http://localhost:8000/video_feed?room=Room1&t=${streamKey}`}
                    className="w-full h-full object-contain"
                    alt=""
                    onLoad={() => setStreamLoaded(true)}
                  />
                  {!streamLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80">
                      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-slate-400 font-bold">Loading YOLO model...</span>
                    </div>
                  )}
                </div>
              ) : streamError ? (
                <div className="flex flex-col items-center gap-3 text-red-500">
                  <Video size={48} />
                  <span className="text-sm font-bold">Upload failed — try again</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-600">
                  <Video size={48} />
                  <span className="text-sm font-bold">Select a video and click Start</span>
                </div>
              )}
            </div>
          </div>

          {/* Localized Fan & Light Status Table */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Localized Fan &amp; Light Status</h3>
            <table className="w-full text-xs text-left">
                <thead>
                    <tr className="text-slate-600 border-b border-slate-800">
                        <th className="pb-3 uppercase">Zone</th>
                        <th className="pb-3 uppercase">Fan</th>
                        <th className="pb-3 uppercase">Light</th>
                        <th className="pb-3 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                    {['Q1','Q2','Q3','Q4'].map(q => (
                        <tr key={q} className={activeQs[q] === 1 ? 'bg-emerald-500/5' : 'hover:bg-white/5'}>
                            <td className="py-3 font-bold text-white">{q}</td>
                            <td className={activeQs[q] === 1 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>{activeQs[q] === 1 ? 'ON' : 'OFF'}</td>
                            <td className={activeQs[q] === 1 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>{activeQs[q] === 1 ? 'ON' : 'OFF'}</td>
                            <td><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeQs[q] === 1 ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'}`}>{activeQs[q] === 1 ? 'Active' : 'Standby'}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </div>

        {/* Right: Manual Device Controls */}
        <div className="space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-6 tracking-widest">Manual Device Controls</h3>
            <div className="space-y-6">
              {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                <ManualControlPanel 
                  key={q} 
                  quadrant={q} 
                  deviceState={deviceStates[q]} 
                  onControl={handleManualControl}
                />
              ))}
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Current Detection</h3>
            <p className="text-emerald-400 font-bold text-lg">{getActiveText()}</p>
          </div>
        </div>
      </div>

      {/* Quadrant Device Status Monitoring Section */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
        <div className="mb-2">
          <h2 className="text-lg font-bold text-white">Quadrant Device Status Monitoring</h2>
          <p className="text-xs text-slate-500">AI-Detection (Auto) vs. Smart-Switch (Manual)</p>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-6">
          {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
            <QuadrantDeviceCard key={q} quadrant={q} deviceState={deviceStates[q]} />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 3. ANALYTICS VIEW ---
function AnalyticsView() {
    const [energyData, setEnergyData] = useState({
        total_energy_kwh: 0,
        total_duration_s: 0,
        quadrant_breakdown: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
        quadrant_duration_s: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
        power_per_quadrant_kw: 1.0
    });
    const [isExporting, setIsExporting] = useState(false);

    const fetchEnergy = () => {
        fetch('http://localhost:8000/energy/Room1')
            .then(res => res.json())
            .then(data => setEnergyData(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchEnergy();
        const interval = setInterval(fetchEnergy, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const res = await fetch('http://localhost:8000/export_logs/Room1');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'energy_logs_Room1.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Export failed', e);
        } finally {
            setIsExporting(false);
        }
    };

    const qBreakdown = energyData.quadrant_breakdown || { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    const qDuration = energyData.quadrant_duration_s || { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    const totalEnergy = Object.values(qBreakdown).reduce((a, b) => a + b, 0);
    const peakZone = totalEnergy > 0 
        ? Object.entries(qBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] 
        : 'N/A';
    const maxEnergy = Math.max(...Object.values(qBreakdown), 0.00001);

    const fmtDur = (s) => {
        if (!s || s < 1) return '0s';
        if (s < 60) return `${s.toFixed(1)}s`;
        return `${(s / 60).toFixed(1)}m`;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Top metric cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] uppercase text-slate-500 font-bold">Total Room Energy</p>
                    <p className="text-2xl font-bold text-emerald-400">{totalEnergy.toFixed(6)} kWh</p>
                    <p className="text-xs text-slate-500 mt-1">{(totalEnergy * 1000).toFixed(4)} Wh</p>
                </div>
                <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] uppercase text-slate-500 font-bold">Total ON Duration</p>
                    <p className="text-2xl font-bold text-blue-400">{fmtDur(energyData.total_duration_s)}</p>
                    <p className="text-xs text-slate-500 mt-1">{(energyData.total_duration_s || 0).toFixed(1)} seconds</p>
                </div>
                <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
                    <p className="text-[10px] uppercase text-slate-500 font-bold">Peak Zone</p>
                    <p className="text-2xl font-bold text-purple-400">{peakZone}</p>
                    <p className="text-xs text-slate-500 mt-1">{(qBreakdown[peakZone] || 0).toFixed(6)} kWh</p>
                </div>
                <div className="bg-emerald-500 p-5 rounded-2xl text-black flex flex-col justify-between cursor-pointer hover:bg-emerald-400 transition-colors" onClick={handleExport}>
                    <Download size={24} className="mb-2" />
                    <p className="text-[10px] uppercase font-bold">Export Logs</p>
                    <p className="text-lg font-bold">{isExporting ? 'Downloading...' : 'Download CSV'}</p>
                </div>
            </div>

            {/* Bar chart + Per-quadrant table side by side */}
            <div className="flex gap-6">
                <div className="flex-1 bg-[#111827] border border-slate-800 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-white">Energy Breakdown by Quadrant</h3>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Power: 1000W/quadrant</span>
                    </div>
                    <div className="h-52 rounded-xl flex items-end gap-6 justify-center border border-slate-800 p-4">
                        {['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
                            const val = qBreakdown[q] || 0;
                            const dur = qDuration[q] || 0;
                            const height = (val / maxEnergy) * 100;
                            return (
                                <div key={q} className="flex flex-col items-center justify-end h-full group relative">
                                    <div className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {fmtDur(dur)} ON • {(val * 1000).toFixed(4)} Wh
                                    </div>
                                    <div className={`w-16 rounded-t-md transition-all ${val > 0 ? 'bg-emerald-500' : 'bg-slate-700'}`} style={{ height: Math.max(height, val > 0 ? 4 : 0) + "%" }} />
                                    <span className="text-[10px] font-bold text-slate-400 mt-2">{(val * 1000).toFixed(3)} Wh</span>
                                    <span className="text-xs font-bold text-white mt-1">{q}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="w-96 bg-[#111827] border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white mb-4">Per-Quadrant Summary</h3>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-slate-500 border-b border-slate-800">
                                <th className="pb-2 text-left uppercase">Zone</th>
                                <th className="pb-2 text-right uppercase">Duration</th>
                                <th className="pb-2 text-right uppercase">Energy (Wh)</th>
                                <th className="pb-2 text-right uppercase">Share</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {['Q1','Q2','Q3','Q4'].map(q => {
                                const val = qBreakdown[q] || 0;
                                const dur = qDuration[q] || 0;
                                const share = totalEnergy > 0 ? ((val / totalEnergy) * 100).toFixed(1) : '0.0';
                                return (
                                    <tr key={q} className="hover:bg-white/5">
                                        <td className="py-2 font-bold text-white">{q}</td>
                                        <td className="py-2 text-right text-blue-400">{fmtDur(dur)}</td>
                                        <td className="py-2 text-right text-emerald-400">{(val * 1000).toFixed(4)}</td>
                                        <td className="py-2 text-right text-slate-400">{share}%</td>
                                    </tr>
                                );
                            })}
                            <tr className="border-t-2 border-slate-700">
                                <td className="py-2 font-bold text-white">Total</td>
                                <td className="py-2 text-right font-bold text-blue-400">{fmtDur(energyData.total_duration_s)}</td>
                                <td className="py-2 text-right font-bold text-emerald-400">{(totalEnergy * 1000).toFixed(4)}</td>
                                <td className="py-2 text-right text-slate-400">100%</td>
                            </tr>
                        </tbody>
                    </table>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="mt-6 w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                        <Download size={14} />
                        {isExporting ? 'Downloading...' : 'Export Energy Log (CSV)'}
                    </button>
                    <button
                        onClick={async () => { if(window.confirm('Clear all logs for Room1? This cannot be undone.')) { await fetch('http://localhost:8000/clear_logs/Room1', {method:'DELETE'}); fetchEnergy(); } }}
                        className="mt-2 w-full bg-red-500/20 hover:bg-red-500/40 text-red-400 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
                        🗑 Clear All Logs
                    </button>
                </div>
            </div>
        </div>
    );
}


// --- 4. SETTINGS VIEW ---
function SettingsView() {
  return (
    <div className="max-w-4xl space-y-6 animate-in slide-in-from-right-4 duration-500">
      <h1 className="text-2xl font-bold text-white">System Configuration</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
          <h3 className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest mb-6">Occupancy Decision Logic</h3>
          <div className="space-y-4">
            <InputField label="Empty Zone Timeout (min)" value="5" />
            <InputField label="Target Eco Temperature (°C)" value="26" />
          </div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
          <h3 className="text-blue-400 font-bold text-[10px] uppercase tracking-widest mb-6">Automation Controls</h3>
          <div className="space-y-4">
            <Toggle label="Lighting Automation" active />
            <Toggle label="Fan Automation" active />
            <Toggle label="HVAC Automation" />
          </div>
        </div>
        <div className="col-span-2 bg-[#111827] border border-slate-800 rounded-2xl p-6">
          <h3 className="text-purple-400 font-bold text-[10px] uppercase tracking-widest mb-6">Edge Node Configuration</h3>
          <div className="grid grid-cols-2 gap-6">
            <InputField label="Detection Model" value="YOLOv8n" />
            <InputField label="API Endpoint" value="http://192.168.1.100:8080/api" />
          </div>
        </div>
      </div>
      <button className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm">
        Save System Changes
      </button>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function StatCard({ title, value, sub, icon, color }) {
  const colors = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  };
  return (
    <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-wider">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className={`text-[10px] font-bold ${sub.includes('↑') ? 'text-emerald-500' : 'text-slate-500'}`}>{sub}</span>
      </div>
    </div>
  );
}

function InputField({ label, value }) {
  return (
    <div>
      <label className="text-[10px] text-slate-500 uppercase font-bold block mb-2">{label}</label>
      <input type="text" defaultValue={value} className="w-full bg-[#0a0e17] border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm" />
    </div>
  );
}

function Toggle({ label, active = false }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">{label}</span>
            <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${active ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${active ? 'left-5.5' : 'left-0.5'}`} />
            </div>
        </div>
    )
}

// --- GLOWING STATUS BADGE ---
function StatusBadge({ on, type = 'auto' }) {
  if (on) {
    const glowStyles = {
      auto:   'bg-violet-500/20 text-violet-300 border border-violet-500/60 shadow-[0_0_10px_rgba(167,139,250,0.5)]',
      manual: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.5)]',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${glowStyles[type]}`}>
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${type === 'auto' ? 'bg-violet-400' : 'bg-cyan-400'}`} />
        ON
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-slate-800/80 text-slate-600 border border-slate-700/50">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
      OFF
    </span>
  );
}

// --- QUADRANT DEVICE STATUS CARD ---
function QuadrantDeviceCard({ quadrant, deviceState }) {
  const light = deviceState?.light || { auto: false, manual: null, final: false };
  const fan = deviceState?.fan || { auto: false, manual: null, final: false };

  const cardActive = light.final || fan.final;

  return (
    <div className={`border rounded-xl p-5 transition-all duration-300 ${
      cardActive
        ? 'bg-slate-900/80 border-slate-600/60 shadow-[0_0_24px_rgba(99,102,241,0.08)]'
        : 'bg-slate-900/40 border-slate-800/60'
    }`}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-white tracking-wide">{quadrant}</h3>
        <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-500 tracking-widest border border-slate-700/50">ZONE NODE</span>
      </div>

      {/* Light */}
      <div className="mb-4 pb-4 border-b border-slate-800/40">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={14} className={light.final ? 'text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.8)]' : 'text-slate-600'} />
          <span className="text-[11px] font-bold text-slate-300 tracking-widest uppercase">Light</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Auto Status</span>
            <StatusBadge on={light.auto} type="auto" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Manual Switch</span>
            <StatusBadge on={light.manual === true} type="manual" />
          </div>
        </div>
      </div>

      {/* Fan */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Fan size={14} className={fan.final ? 'text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]' : 'text-slate-600'} />
          <span className="text-[11px] font-bold text-slate-300 tracking-widest uppercase">Fan</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Auto Status</span>
            <StatusBadge on={fan.auto} type="auto" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Manual Switch</span>
            <StatusBadge on={fan.manual === true} type="manual" />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MANUAL CONTROL PANEL (Sidebar) ---
function ManualControlPanel({ quadrant, deviceState, onControl }) {
  if (!deviceState) {
    return (
      <div className="border-b border-slate-800/50 pb-6 last:border-b-0 last:pb-0">
        <h4 className="text-sm font-bold text-white mb-4">{quadrant} CONTROLS</h4>
        
        {/* Light Toggle */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase font-bold">Light</span>
            <ToggleSwitch 
              active={false} 
              onChange={(val) => onControl(quadrant, 'light', val ? true : false)}
            />
          </div>
        </div>
        
        {/* Fan Toggle */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase font-bold">Fan</span>
            <ToggleSwitch 
              active={false} 
              onChange={(val) => onControl(quadrant, 'fan', val ? true : false)}
            />
          </div>
        </div>
      </div>
    );
  }

  const { light, fan } = deviceState;

  return (
    <div className="border-b border-slate-800/50 pb-6 last:border-b-0 last:pb-0">
      <h4 className="text-sm font-bold text-white mb-4">{quadrant} CONTROLS</h4>
      
      {/* Light Toggle */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 uppercase font-bold">Light</span>
          <ToggleSwitch 
            active={light?.manual === true} 
            onChange={(val) => onControl(quadrant, 'light', val ? true : false)}
          />
        </div>
      </div>
      
      {/* Fan Toggle */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 uppercase font-bold">Fan</span>
          <ToggleSwitch 
            active={fan?.manual === true} 
            onChange={(val) => onControl(quadrant, 'fan', val ? true : false)}
          />
        </div>
      </div>
    </div>
  );
}

// --- TOGGLE SWITCH COMPONENT ---
function ToggleSwitch({ active, onChange }) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`w-12 h-6 rounded-full relative transition-all duration-300 ease-in-out ${
        active ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-slate-700'
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform duration-300 ease-in-out shadow-md ${
          active ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  );
}