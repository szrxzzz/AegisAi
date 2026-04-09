import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid, Video, BarChart3, Settings,
  Shield, Zap, Cpu, Activity, Download, Lightbulb, Fan, Radio
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const energyData = [
  { time: '00:00', legacy: 42, aegis: 18 },
  { time: '06:00', legacy: 65, aegis: 35 },
  { time: '12:00', legacy: 92, aegis: 31 },
  { time: '18:00', legacy: 70, aegis: 30 },
  { time: '23:59', legacy: 45, aegis: 20 },
];

const cardBase = 'glass-card';
const glass = 'glass-card';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  return (
    <div className="flex h-screen font-sans overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 120% 80% at 50% -5%, #0a1628 0%, #050a12 55%, #020508 100%)' }}>

      {/* ── animated grid ── */}
      <div className="pointer-events-none fixed inset-0 animate-grid-fade"
        style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.35) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.35) 1px,transparent 1px)', backgroundSize: '52px 52px' }} />

      {/* ── scan line ── */}
      <div className="pointer-events-none fixed left-0 right-0 h-px animate-scan z-0"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(6,182,212,0.4),transparent)', top: 0 }} />

      {/* ── ambient orbs ── */}
      <div className="pointer-events-none fixed top-[-15%] left-[-8%] w-[700px] h-[700px] rounded-full animate-orb-drift"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 65%)' }} />
      <div className="pointer-events-none fixed bottom-[-20%] right-[-8%] w-[600px] h-[600px] rounded-full animate-orb-drift2"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)' }} />
      <div className="pointer-events-none fixed top-[40%] right-[20%] w-[300px] h-[300px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.04) 0%, transparent 70%)' }} />

      {/* ── SIDEBAR ── */}
      <aside className="relative z-20 w-64 flex flex-col p-5 shrink-0"
        style={{ background: 'linear-gradient(180deg,rgba(5,10,20,0.97) 0%,rgba(3,6,14,0.99) 100%)', borderRight: '1px solid rgba(6,182,212,0.1)' }}>

        {/* top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(6,182,212,0.5),rgba(99,102,241,0.5),transparent)' }} />

        {/* logo */}
        <div className="flex items-center gap-3 mb-10 px-1 animate-float-up">
          <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#06b6d4,#6366f1)', boxShadow: '0 0 24px rgba(6,182,212,0.5), 0 0 48px rgba(6,182,212,0.15)' }}>
            <Shield size={18} className="text-white" />
            <div className="absolute inset-0 rounded-xl opacity-50"
              style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.2),transparent)' }} />
          </div>
          <div className="leading-tight">
            <p className="shimmer-text font-bold text-lg tracking-tight">AegisAI</p>
            <p className="text-[9px] text-cyan-500/60 uppercase tracking-[0.22em] font-semibold">Energy Platform</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {[
            { id: 'dashboard', icon: <LayoutGrid size={15}/>, label: 'Dashboard' },
            { id: 'live',      icon: <Video size={15}/>,       label: 'Live Rooms' },
            { id: 'analytics', icon: <BarChart3 size={15}/>,   label: 'Analytics' },
            { id: 'settings',  icon: <Settings size={15}/>,    label: 'System Settings' },
          ].map(({ id, icon, label }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-250 group relative overflow-hidden"
                style={active ? {
                  background: 'linear-gradient(90deg,rgba(6,182,212,0.14),rgba(99,102,241,0.08))',
                  border: '1px solid rgba(6,182,212,0.25)',
                  color: '#67e8f9',
                  boxShadow: '0 0 20px rgba(6,182,212,0.08), inset 0 0 20px rgba(6,182,212,0.04)',
                } : { color: '#475569', border: '1px solid transparent' }}>
                {/* hover shimmer */}
                {!active && <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                  style={{ background: 'linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.04),rgba(255,255,255,0.02))' }} />}
                <span className={`transition-colors duration-200 ${active ? 'text-cyan-400' : 'text-slate-600 group-hover:text-slate-400'}`}>{icon}</span>
                <span className={`transition-colors duration-200 ${active ? '' : 'group-hover:text-slate-300'}`}>{label}</span>
                {active && (
                  <span className="ml-auto relative flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 8px rgba(34,211,238,1)' }} />
                    <span className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping opacity-60" />
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* node status */}
        <div className="rounded-xl p-3.5 animate-border-pulse"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(6,182,212,0.15)' }}>
          <p className="text-[9px] uppercase text-slate-600 font-bold tracking-[0.2em] mb-2.5">Node Status</p>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="relative flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px rgba(52,211,153,0.9)' }} />
                <span className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-50" />
              </span>
              <span className="text-sm font-semibold text-white">Luckfox Mega</span>
            </div>
            <Zap size={13} className="text-emerald-400" style={{ filter: 'drop-shadow(0 0 4px rgba(52,211,153,0.8))' }} />
          </div>
          <p className="text-[10px] text-emerald-400 font-bold tracking-wide" style={{ textShadow: '0 0 8px rgba(52,211,153,0.5)' }}>● Online · Active</p>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="relative z-10 flex-1 overflow-y-auto p-8">
        {activeTab === 'dashboard'  && <DashboardView />}
        {activeTab === 'live'       && <LiveRoomsView />}
        {activeTab === 'analytics'  && <AnalyticsView />}
        {activeTab === 'settings'   && <SettingsView />}
      </main>
    </div>
  );
}

/* ════════════════════════════════════════
   1. DASHBOARD VIEW
════════════════════════════════════════ */
function DashboardView() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <p className="text-[10px] text-cyan-500/70 uppercase tracking-[0.25em] font-bold mb-1">AI Energy Command Center</p>
        <h1 className="text-3xl font-bold text-white tracking-tight">Energy Management Hub</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time occupancy detection · intelligent energy optimization</p>
      </header>

      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Zone Energy Savings" value="2,847 kWh" sub="↑ 12%" color="cyan"    icon={<Zap size={18}/>} />
        <StatCard title="Quadrant Status"     value="3 / 4"     sub="↑ 8%"  color="emerald" icon={<LayoutGrid size={18}/>} />
        <StatCard title="Current Power Load"  value="34.2 kW"   sub="↘ 5%"  color="violet"  icon={<Activity size={18}/>} />
        <StatCard title="Node Uptime"         value="99.8%"     sub="Online" color="blue"   icon={<Cpu size={18}/>} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className={`col-span-2 ${cardBase} p-6`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] text-cyan-400/80 uppercase tracking-widest font-bold mb-1">Zone Intelligence Active</p>
              <h2 className="text-xl font-bold text-white">Smart Energy Optimization</h2>
            </div>
            <div className="text-right">
              <span className="text-4xl font-bold" style={{ color: '#34d399', textShadow: '0 0 20px rgba(52,211,153,0.5)' }}>66%</span>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Savings</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyData}>
                <defs>
                  <linearGradient id="gAegis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                <XAxis dataKey="time" stroke="#334155" fontSize={10} tickLine={false} axisLine={false}/>
                <YAxis stroke="#334155" fontSize={10} tickLine={false} axisLine={false}/>
                <Tooltip contentStyle={{ background: 'rgba(6,11,20,0.95)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '10px', color: '#e2e8f0' }}/>
                <Area type="monotone" dataKey="legacy" stroke="#334155" fill="transparent" strokeWidth={1.5}/>
                <Area type="monotone" dataKey="aegis"  stroke="#06b6d4" fill="url(#gAegis)" strokeWidth={2.5}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${cardBase} p-6`}>
          <h3 className="text-sm font-bold text-white mb-6">Zone Occupancy</h3>
          <div className="space-y-5">
            {['Zone 1','Zone 2','Zone 3','Zone 4'].map((z, i) => (
              <div key={z}>
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-400">{z}</span>
                  <span className="text-cyan-400">{14 - i*2} People</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${80 - i*15}%`, background: 'linear-gradient(90deg,#06b6d4,#6366f1)', boxShadow: '0 0 8px rgba(6,182,212,0.5)' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   2. LIVE ROOMS VIEW
════════════════════════════════════════ */
function LiveRoomsView() {
  const [activeQs, setActiveQs]       = useState({ Q1:0, Q2:0, Q3:0, Q4:0 });
  const [deviceStates, setDeviceStates] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading]   = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [streamKey, setStreamKey]       = useState(null);
  const [streamError, setStreamError]   = useState(false);
  const [streamLoaded, setStreamLoaded] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const iv = setInterval(() => {
      fetch('http://localhost:8000/status').then(r=>r.json()).then(d=>{ if(d.active_quadrants) setActiveQs(d.active_quadrants); }).catch(()=>{});
      fetch('http://localhost:8000/device_status').then(r=>r.json()).then(d=>setDeviceStates(d)).catch(()=>{});
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const handleFileSelect = e => { const f=e.target.files[0]; if(f) setSelectedFile(f); e.target.value=''; };

  const handleStart = async () => {
    if (!selectedFile) return;
    setIsUploading(true); setStreamError(false); setStreamLoaded(false);
    const fd = new FormData(); fd.append('file', selectedFile);
    try {
      const r = await fetch('http://localhost:8000/upload_video/', { method:'POST', body:fd });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setStreamKey(Date.now()); setStreamActive(true);
    } catch(err) {
      console.error('Upload error:', err);
      setStreamError(true);
    }
    finally { setIsUploading(false); }
  };

  const handleStreamEnd = () => {
    setStreamActive(false); setStreamKey(null); setSelectedFile(null);
    setStreamError(false); setStreamLoaded(false);
    setActiveQs({ Q1:0, Q2:0, Q3:0, Q4:0 });
  };

  const handleRetry = () => {
    setStreamError(false);
    setSelectedFile(null);
  };

  const handleManualControl = async (quadrant, device, status) => {
    try { await fetch(`http://localhost:8000/manual_control?quadrant=${quadrant}&device=${device}&status=${status}`, { method:'POST' }); } catch {}
  };

  const activeList = Object.keys(activeQs).filter(k => activeQs[k]===1);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[10px] text-cyan-500/70 uppercase tracking-[0.25em] font-bold mb-1">Live Monitoring</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Zone-Level Classroom Monitoring</h1>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} className="hidden" accept="video/mp4" onChange={handleFileSelect}/>
          {!streamActive ? (
            <>
              <button onClick={() => fileInputRef.current?.click()}
                className={`${glass} hover:border-cyan-500/30 text-slate-300 hover:text-white font-semibold py-2 px-5 rounded-xl transition-all text-sm`}>
                {selectedFile ? `📁 ${selectedFile.name}` : 'Select Video (MP4)'}
              </button>
              {selectedFile && (
                <button onClick={handleStart} disabled={isUploading}
                  className="font-bold py-2 px-6 rounded-xl transition-all text-sm text-black disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#06b6d4,#6366f1)', boxShadow: '0 0 20px rgba(6,182,212,0.35)' }}>
                  {isUploading ? 'Starting…' : '▶ Start'}
                </button>
              )}
            </>
          ) : (
            <button onClick={handleStreamEnd}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-2 px-5 rounded-xl transition-all text-sm border border-red-500/25">
              ⏹ Stop Stream
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ── left col ── */}
        <div className="col-span-2 space-y-5">
          {/* video panel */}
          <div className={`${cardBase} overflow-hidden`}>
            <div className="px-4 py-3 border-b border-white/[0.06] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Video size={15} className="text-cyan-400"/>
                <span className="font-bold text-sm text-white">Room 1</span>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ${
                streamActive
                  ? 'text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-500 border border-white/[0.06]'
              }`}
                style={streamActive ? { background:'rgba(16,185,129,0.1)', boxShadow:'0 0 10px rgba(16,185,129,0.15)' } : {}}>
                {streamActive ? '● Live Feed Active' : 'Idle — Select a Video'}
              </span>
            </div>
            <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
              {streamActive && streamKey ? (
                <div className="relative w-full h-full bg-black">
                  <img key={streamKey} src={`http://localhost:8000/video_feed?room=Room1&t=${streamKey}`}
                    className="w-full h-full object-contain" alt="" onLoad={() => setStreamLoaded(true)}/>
                  {!streamLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/90">
                      <div className="w-10 h-10 rounded-full border-2 border-t-transparent border-cyan-400 animate-spin"
                        style={{ boxShadow:'0 0 15px rgba(6,182,212,0.4)' }}/>
                      <span className="text-xs text-cyan-400/70 font-bold tracking-widest uppercase">Initializing YOLO Model…</span>
                    </div>
                  )}
                </div>
              ) : streamError ? (
                <div className="flex flex-col items-center gap-3 text-red-400">
                  <Video size={40}/>
                  <span className="text-sm font-bold">Upload failed — backend may be offline</span>
                  <button onClick={handleRetry}
                    className="text-xs px-4 py-1.5 rounded-lg font-bold border border-red-500/30 hover:bg-red-500/10 transition-all">
                    ↩ Try Again
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background:'rgba(6,182,212,0.06)', border:'1px solid rgba(6,182,212,0.15)' }}>
                    <Video size={28} className="text-cyan-500/40"/>
                  </div>
                  <span className="text-sm font-semibold text-slate-600">Select a video and click Start</span>
                </div>
              )}
            </div>
          </div>

          {/* status table */}
          <div className={`${cardBase} p-5`}>
            <p className="text-[10px] text-cyan-500/70 uppercase tracking-widest font-bold mb-4">Localized Fan &amp; Light Status</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Zone','Fan','Light','Status'].map(h => (
                    <th key={h} className="pb-3 text-left text-[10px] uppercase tracking-widest text-slate-600 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Q1','Q2','Q3','Q4'].map(q => {
                  const on = activeQs[q]===1;
                  return (
                    <tr key={q} className="border-b border-white/[0.03] transition-all duration-300"
                      style={on ? { background:'linear-gradient(90deg,rgba(6,182,212,0.05),transparent)' } : {}}>
                      <td className="py-3">
                        <span className="font-bold text-white text-sm">{q}</span>
                        {on && <span className="ml-2 w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_6px_rgba(34,211,238,0.8)] animate-pulse"/>}
                      </td>
                      <td className="py-3">
                        <TableStatusChip on={on}/>
                      </td>
                      <td className="py-3">
                        <TableStatusChip on={on}/>
                      </td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          on ? 'text-emerald-300 border border-emerald-500/30' : 'text-slate-600 border border-white/[0.06]'
                        }`}
                          style={on ? { background:'rgba(16,185,129,0.1)', boxShadow:'0 0 8px rgba(16,185,129,0.2)' } : { background:'rgba(255,255,255,0.02)' }}>
                          {on ? 'Active' : 'Standby'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── right col ── */}
        <div className="space-y-5">
          {/* manual controls */}
          <div className={`${cardBase} p-5`}>
            <p className="text-[10px] text-cyan-500/70 uppercase tracking-widest font-bold mb-5">Manual Device Controls</p>
            <div className="space-y-5">
              {['Q1','Q2','Q3','Q4'].map(q => (
                <ManualControlPanel key={q} quadrant={q} deviceState={deviceStates[q]} onControl={handleManualControl}/>
              ))}
            </div>
          </div>

          {/* detection */}
          <div className={`${cardBase} p-5`}
            style={activeList.length ? { boxShadow:'0 0 30px rgba(6,182,212,0.08)', borderColor:'rgba(6,182,212,0.2)' } : {}}>
            <div className="flex items-center gap-2 mb-3">
              <Radio size={13} className="text-cyan-400"/>
              <p className="text-[10px] text-cyan-500/70 uppercase tracking-widest font-bold">AI Occupancy Detection</p>
            </div>
            {activeList.length ? (
              <div className="flex flex-wrap gap-2">
                {activeList.map(q => (
                  <span key={q} className="px-3 py-1 rounded-full text-sm font-bold text-cyan-300 border border-cyan-500/30"
                    style={{ background:'rgba(6,182,212,0.1)', boxShadow:'0 0 10px rgba(6,182,212,0.2)' }}>
                    {q}
                  </span>
                ))}
                <span className="text-xs text-slate-400 self-center ml-1">Active</span>
              </div>
            ) : (
              <p className="text-slate-600 font-semibold text-sm">No Detections</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Quadrant Device Status Monitoring ── */}
      <div className={`${cardBase} p-6`}
        style={{ background:'linear-gradient(135deg,rgba(6,182,212,0.03),rgba(99,102,241,0.03))', borderColor:'rgba(255,255,255,0.08)' }}>
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[10px] text-cyan-500/70 uppercase tracking-[0.2em] font-bold mb-1">Live Intelligence</p>
            <h2 className="text-xl font-bold text-white tracking-tight">Quadrant Device Status Monitoring</h2>
            <p className="text-xs text-slate-500 mt-0.5">AI-Detection (Auto) vs. Smart-Switch (Manual)</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.8)]"/>Auto
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)] ml-2"/>Manual
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {['Q1','Q2','Q3','Q4'].map(q => (
            <QuadrantDeviceCard key={q} quadrant={q} deviceState={deviceStates[q]}/>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   3. ANALYTICS VIEW
════════════════════════════════════════ */
function AnalyticsView() {
  const [energyData, setEnergyData] = useState({
    total_energy_kwh:0, total_duration_s:0,
    quadrant_breakdown:{Q1:0,Q2:0,Q3:0,Q4:0},
    quadrant_duration_s:{Q1:0,Q2:0,Q3:0,Q4:0},
  });
  const [isExporting, setIsExporting] = useState(false);

  const fetchEnergy = () =>
    fetch('http://localhost:8000/energy/Room1').then(r=>r.json()).then(setEnergyData).catch(()=>{});

  useEffect(() => { fetchEnergy(); const iv=setInterval(fetchEnergy,5000); return ()=>clearInterval(iv); }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const r=await fetch('http://localhost:8000/export_logs/Room1');
      const blob=await r.blob(); const url=URL.createObjectURL(blob);
      const a=document.createElement('a'); a.href=url; a.download='energy_logs_Room1.csv';
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch {} finally { setIsExporting(false); }
  };

  const qB = energyData.quadrant_breakdown||{Q1:0,Q2:0,Q3:0,Q4:0};
  const qD = energyData.quadrant_duration_s||{Q1:0,Q2:0,Q3:0,Q4:0};
  const total = Object.values(qB).reduce((a,b)=>a+b,0);
  const peak  = total>0 ? Object.entries(qB).sort((a,b)=>b[1]-a[1])[0]?.[0] : 'N/A';
  const maxE  = Math.max(...Object.values(qB),0.00001);
  const fmt   = s => !s||s<1?'0s':s<60?`${s.toFixed(1)}s`:`${(s/60).toFixed(1)}m`;

  const metricCards = [
    { label:'Total Room Energy',  value:`${total.toFixed(6)} kWh`, sub:`${(total*1000).toFixed(4)} Wh`,  color:'#06b6d4' },
    { label:'Total ON Duration',  value:fmt(energyData.total_duration_s), sub:`${(energyData.total_duration_s||0).toFixed(1)}s`, color:'#6366f1' },
    { label:'Peak Zone',          value:peak, sub:`${(qB[peak]||0).toFixed(6)} kWh`, color:'#a78bfa' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <p className="text-[10px] text-cyan-500/70 uppercase tracking-[0.25em] font-bold mb-1">Energy Intelligence</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
      </header>

      <div className="grid grid-cols-4 gap-4">
        {metricCards.map(({ label, value, sub, color }) => (
          <div key={label} className={`${cardBase} p-5`}
            style={{ borderColor:`${color}22` }}>
            <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-2">{label}</p>
            <p className="text-2xl font-bold" style={{ color, textShadow:`0 0 20px ${color}55` }}>{value}</p>
            <p className="text-xs text-slate-600 mt-1">{sub}</p>
          </div>
        ))}
        <div className="rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:scale-[1.02]"
          style={{ background:'linear-gradient(135deg,#06b6d4,#6366f1)', boxShadow:'0 0 30px rgba(6,182,212,0.3)' }}
          onClick={handleExport}>
          <Download size={22} className="text-white/80 mb-2"/>
          <p className="text-[10px] uppercase font-bold text-white/70 tracking-widest">Export Logs</p>
          <p className="text-base font-bold text-white">{isExporting?'Downloading…':'Download CSV'}</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* bar chart */}
        <div className={`flex-1 ${cardBase} p-6`}>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-bold text-white">Energy Breakdown by Quadrant</h3>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">1000W / quadrant</span>
          </div>
          <div className="h-52 flex items-end gap-6 justify-center rounded-xl border border-white/[0.05] p-4"
            style={{ background:'rgba(0,0,0,0.2)' }}>
            {['Q1','Q2','Q3','Q4'].map(q => {
              const val=qB[q]||0, dur=qD[q]||0, h=(val/maxE)*100;
              return (
                <div key={q} className="flex flex-col items-center justify-end h-full group relative">
                  <div className="absolute -top-9 text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10 text-white"
                    style={{ background:'rgba(6,11,20,0.95)', border:'1px solid rgba(6,182,212,0.2)' }}>
                    {fmt(dur)} ON · {(val*1000).toFixed(4)} Wh
                  </div>
                  <div className="w-14 rounded-t-lg transition-all duration-700 group-hover:scale-105"
                    style={{ height:`${Math.max(h,val>0?4:0)}%`, background:val>0?'linear-gradient(180deg,#06b6d4,#6366f1)':'rgba(255,255,255,0.06)', boxShadow:val>0?'0 0 15px rgba(6,182,212,0.3)':'' }}/>
                  <span className="text-[10px] font-bold text-slate-500 mt-2">{(val*1000).toFixed(3)} Wh</span>
                  <span className="text-xs font-bold text-white mt-1">{q}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* table */}
        <div className={`w-96 ${cardBase} p-6`}>
          <h3 className="text-sm font-bold text-white mb-4">Per-Quadrant Summary</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Zone','Duration','Energy (Wh)','Share'].map(h=>(
                  <th key={h} className={`pb-2 text-[10px] uppercase tracking-widest text-slate-600 font-bold ${h==='Zone'?'text-left':'text-right'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {['Q1','Q2','Q3','Q4'].map(q=>{
                const val=qB[q]||0, dur=qD[q]||0;
                const share=total>0?((val/total)*100).toFixed(1):'0.0';
                return (
                  <tr key={q} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-2.5 font-bold text-white">{q}</td>
                    <td className="py-2.5 text-right text-violet-400">{fmt(dur)}</td>
                    <td className="py-2.5 text-right text-cyan-400">{(val*1000).toFixed(4)}</td>
                    <td className="py-2.5 text-right text-slate-500">{share}%</td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-white/[0.08]">
                <td className="py-2.5 font-bold text-white">Total</td>
                <td className="py-2.5 text-right font-bold text-violet-400">{fmt(energyData.total_duration_s)}</td>
                <td className="py-2.5 text-right font-bold text-cyan-400">{(total*1000).toFixed(4)}</td>
                <td className="py-2.5 text-right text-slate-500">100%</td>
              </tr>
            </tbody>
          </table>
          <button onClick={handleExport} disabled={isExporting}
            className="mt-5 w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 text-white disabled:opacity-50 hover:scale-[1.02]"
            style={{ background:'linear-gradient(135deg,#06b6d4,#6366f1)', boxShadow:'0 0 20px rgba(6,182,212,0.25)' }}>
            <Download size={13}/>{isExporting?'Downloading…':'Export Energy Log (CSV)'}
          </button>
          <button onClick={async()=>{ if(window.confirm('Clear all logs for Room1?')){ await fetch('http://localhost:8000/clear_logs/Room1',{method:'DELETE'}); fetchEnergy(); }}}
            className="mt-2 w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border border-red-500/20">
            🗑 Clear All Logs
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   4. SETTINGS VIEW
════════════════════════════════════════ */
function SettingsView() {
  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-500">
      <header>
        <p className="text-[10px] text-cyan-500/70 uppercase tracking-[0.25em] font-bold mb-1">Configuration</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
      </header>
      <div className="grid grid-cols-2 gap-5">
        <div className={`${cardBase} p-6`}>
          <p className="text-[10px] text-cyan-400/80 uppercase tracking-widest font-bold mb-5">Occupancy Decision Logic</p>
          <div className="space-y-4">
            <InputField label="Empty Zone Timeout (min)" value="5"/>
            <InputField label="Target Eco Temperature (°C)" value="26"/>
          </div>
        </div>
        <div className={`${cardBase} p-6`}>
          <p className="text-[10px] text-violet-400/80 uppercase tracking-widest font-bold mb-5">Automation Controls</p>
          <div className="space-y-4">
            <Toggle label="Lighting Automation" active/>
            <Toggle label="Fan Automation" active/>
            <Toggle label="HVAC Automation"/>
          </div>
        </div>
        <div className={`col-span-2 ${cardBase} p-6`}>
          <p className="text-[10px] text-indigo-400/80 uppercase tracking-widest font-bold mb-5">Edge Node Configuration</p>
          <div className="grid grid-cols-2 gap-5">
            <InputField label="Detection Model" value="YOLOv8n"/>
            <InputField label="API Endpoint" value="http://192.168.1.100:8080/api"/>
          </div>
        </div>
      </div>
      <button className="font-bold py-3 px-8 rounded-xl transition-all text-sm text-white hover:scale-[1.02]"
        style={{ background:'linear-gradient(135deg,#06b6d4,#6366f1)', boxShadow:'0 0 25px rgba(6,182,212,0.3)' }}>
        Save System Changes
      </button>
    </div>
  );
}

/* ════════════════════════════════════════
   SHARED COMPONENTS
════════════════════════════════════════ */
function StatCard({ title, value, sub, icon, color }) {
  const palette = {
    cyan:    { text:'#22d3ee', glow:'rgba(6,182,212,0.5)',   bg:'rgba(6,182,212,0.09)',   border:'rgba(6,182,212,0.22)',   shadow:'rgba(6,182,212,0.15)' },
    emerald: { text:'#34d399', glow:'rgba(52,211,153,0.5)',  bg:'rgba(52,211,153,0.09)',  border:'rgba(52,211,153,0.22)',  shadow:'rgba(52,211,153,0.12)' },
    violet:  { text:'#c4b5fd', glow:'rgba(167,139,250,0.5)', bg:'rgba(167,139,250,0.09)', border:'rgba(167,139,250,0.22)', shadow:'rgba(167,139,250,0.12)' },
    blue:    { text:'#93c5fd', glow:'rgba(96,165,250,0.5)',  bg:'rgba(96,165,250,0.09)',  border:'rgba(96,165,250,0.22)',  shadow:'rgba(96,165,250,0.12)' },
  };
  const p = palette[color] || palette.cyan;
  return (
    <div className="glass-card p-5 group cursor-default animate-float-up"
      style={{ borderColor:p.border }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
        style={{ background:p.bg, color:p.text, boxShadow:`0 0 20px ${p.glow}`, border:`1px solid ${p.border}` }}>
        {icon}
      </div>
      <p className="text-[10px] uppercase text-slate-500 font-bold tracking-[0.15em] mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white" style={{ textShadow:`0 0 20px ${p.shadow}` }}>{value}</span>
        <span className="text-[10px] font-bold" style={{ color: sub.includes('↑') ? p.text : '#475569' }}>{sub}</span>
      </div>
    </div>
  );
}

function TableStatusChip({ on }) {
  if (on) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-300 border border-emerald-500/30"
      style={{ background:'rgba(16,185,129,0.1)', boxShadow:'0 0 8px rgba(16,185,129,0.2)' }}>
      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"/>ON
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-600 border border-white/[0.05]"
      style={{ background:'rgba(255,255,255,0.02)' }}>
      <span className="w-1 h-1 rounded-full bg-slate-700"/>OFF
    </span>
  );
}

/* ── Glowing Status Badge ── */
function StatusBadge({ on, type = 'auto' }) {
  if (on) {
    const styles = {
      auto:   { color:'#c4b5fd', border:'rgba(167,139,250,0.5)', bg:'rgba(167,139,250,0.11)', glow:'0 0 16px rgba(167,139,250,0.55), inset 0 0 8px rgba(167,139,250,0.08)', dot:'#a78bfa' },
      manual: { color:'#67e8f9', border:'rgba(34,211,238,0.5)',  bg:'rgba(34,211,238,0.11)',  glow:'0 0 16px rgba(34,211,238,0.55), inset 0 0 8px rgba(34,211,238,0.08)',  dot:'#22d3ee' },
      final:  { color:'#6ee7b7', border:'rgba(52,211,153,0.6)',  bg:'rgba(52,211,153,0.13)',  glow:'0 0 18px rgba(52,211,153,0.6), inset 0 0 10px rgba(52,211,153,0.1)',   dot:'#34d399' },
    };
    const s = styles[type] || styles.auto;
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest animate-badge-pop"
        style={{ color:s.color, border:`1px solid ${s.border}`, background:s.bg, boxShadow:s.glow }}>
        <span className="relative flex w-1.5 h-1.5 shrink-0">
          <span className="absolute w-1.5 h-1.5 rounded-full animate-ping opacity-70" style={{ background:s.dot }}/>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background:s.dot, boxShadow:`0 0 6px ${s.dot}` }}/>
        </span>
        ON
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
      style={{ color:'#3f4f63', border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background:'#1e293b' }}/>OFF
    </span>
  );
}

/* ── Quadrant Device Card ── */
function QuadrantDeviceCard({ quadrant, deviceState }) {
  const light = deviceState?.light || { auto:false, manual:null, final:false };
  const fan   = deviceState?.fan   || { auto:false, manual:null, final:false };
  const alive = light.final || fan.final;

  return (
    <div className={`rounded-2xl p-5 transition-all duration-500 cursor-default group ${alive ? 'card-active' : 'glass-card'}`}
      style={alive ? { boxShadow:'0 0 40px rgba(6,182,212,0.1), 0 0 80px rgba(6,182,212,0.04), inset 0 0 40px rgba(6,182,212,0.03)' } : {}}>

      {/* top accent line when active */}
      {alive && <div className="absolute top-0 left-4 right-4 h-px rounded-full"
        style={{ background:'linear-gradient(90deg,transparent,rgba(6,182,212,0.6),rgba(99,102,241,0.4),transparent)' }}/>}

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-white tracking-wide">{quadrant}</span>
          {alive && (
            <span className="relative flex w-2 h-2">
              <span className="absolute w-2 h-2 rounded-full animate-ping opacity-60" style={{ background:'#06b6d4' }}/>
              <span className="w-2 h-2 rounded-full" style={{ background:'#06b6d4', boxShadow:'0 0 8px rgba(6,182,212,1)' }}/>
            </span>
          )}
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded font-bold tracking-widest"
          style={{ color:'#334155', border:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.02)' }}>ZONE NODE</span>
      </div>

      <DeviceBlock icon={<Lightbulb size={13}/>} label="LIGHT"
        iconColor={light.final ? '#fde047' : '#334155'}
        iconGlow={light.final ? 'drop-shadow(0 0 6px rgba(253,224,71,0.8))' : 'none'}
        auto={light.auto} manual={light.manual} final={light.final}/>

      <div className="my-3.5 h-px" style={{ background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)' }}/>

      <DeviceBlock icon={<Fan size={13}/>} label="FAN"
        iconColor={fan.final ? '#22d3ee' : '#334155'}
        iconGlow={fan.final ? 'drop-shadow(0 0 6px rgba(34,211,238,0.8))' : 'none'}
        auto={fan.auto} manual={fan.manual} final={fan.final}/>
    </div>
  );
}

function DeviceBlock({ icon, label, iconColor, iconGlow, auto, manual, final }) {
  const active = final;
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2.5">
        <span style={{ color:iconColor, filter:iconGlow, transition:'all 0.4s' }}>{icon}</span>
        <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: active ? '#cbd5e1' : '#475569' }}>{label}</span>
        {active && <span className="ml-auto text-[9px] font-bold tracking-widest animate-badge-pop"
          style={{ color:'#34d399', textShadow:'0 0 8px rgba(52,211,153,0.7)' }}>● LIVE</span>}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color:'#334155' }}>Auto</span>
          <StatusBadge on={auto} type="auto"/>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color:'#334155' }}>Manual</span>
          <StatusBadge on={manual===true} type="manual"/>
        </div>
        <div className="flex items-center justify-between pt-1.5"
          style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: active ? '#94a3b8' : '#334155' }}>Final Output</span>
          <StatusBadge on={final} type="final"/>
        </div>
      </div>
    </div>
  );
}

/* ── Manual Control Panel ── */
function ManualControlPanel({ quadrant, deviceState, onControl }) {
  const light = deviceState?.light || { manual:null };
  const fan   = deviceState?.fan   || { manual:null };
  return (
    <div className="pb-5 border-b border-white/[0.05] last:border-b-0 last:pb-0">
      <p className="text-xs font-bold text-white mb-3 tracking-wide">{quadrant} Controls</p>
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb size={12} className="text-slate-500"/>
            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Light</span>
          </div>
          <ToggleSwitch active={light.manual===true} onChange={v => onControl(quadrant,'light',v)}/>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fan size={12} className="text-slate-500"/>
            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Fan</span>
          </div>
          <ToggleSwitch active={fan.manual===true} onChange={v => onControl(quadrant,'fan',v)}/>
        </div>
      </div>
    </div>
  );
}

/* ── Toggle Switch ── */
function ToggleSwitch({ active, onChange }) {
  return (
    <button onClick={() => onChange(!active)}
      className="w-11 h-6 rounded-full relative transition-all duration-300 flex-shrink-0"
      style={{
        background: active ? 'linear-gradient(135deg,#06b6d4,#6366f1)' : 'rgba(255,255,255,0.07)',
        boxShadow: active ? '0 0 16px rgba(6,182,212,0.6), 0 0 32px rgba(6,182,212,0.2)' : '',
        border: `1px solid ${active ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.08)'}`,
      }}>
      <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform duration-300"
        style={{
          transform: active ? 'translateX(24px)' : 'translateX(2px)',
          boxShadow: active ? '0 0 8px rgba(255,255,255,0.5)' : '0 1px 4px rgba(0,0,0,0.4)',
        }}/>
    </button>
  );
}

/* ── Input Field ── */
function InputField({ label, value }) {
  return (
    <div>
      <label className="text-[10px] text-slate-500 uppercase font-bold block mb-2 tracking-wider">{label}</label>
      <input type="text" defaultValue={value}
        className="w-full rounded-xl p-3 text-white text-sm font-medium outline-none transition-all duration-200"
        style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}
        onFocus={e => { e.target.style.borderColor='rgba(6,182,212,0.4)'; e.target.style.boxShadow='0 0 15px rgba(6,182,212,0.1)'; }}
        onBlur={e  => { e.target.style.borderColor='rgba(255,255,255,0.08)'; e.target.style.boxShadow=''; }}
      />
    </div>
  );
}

/* ── Toggle (settings) ── */
function Toggle({ label, active = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-300">{label}</span>
      <div className="w-10 h-5 rounded-full relative transition-all duration-300"
        style={{
          background: active ? 'linear-gradient(135deg,#06b6d4,#6366f1)' : 'rgba(255,255,255,0.08)',
          boxShadow: active ? '0 0 10px rgba(6,182,212,0.4)' : '',
        }}>
        <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform duration-300 shadow-sm"
          style={{ transform: active ? 'translateX(20px)' : 'translateX(2px)' }}/>
      </div>
    </div>
  );
}
