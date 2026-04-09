import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Wind, Users, Activity } from 'lucide-react';

export default function DigitalTwin({ activeQs, deviceState }) {
  // activeQs: { Q1: 0, Q2: 1, ... }
  // deviceState: { Q1: { light: { auto, manual }, fan: { auto, manual } }, ... }

  const quadrants = [
    { id: 'Q1', top: '0%', left: '0%' },
    { id: 'Q2', top: '0%', left: '50%' },
    { id: 'Q3', top: '50%', left: '0%' },
    { id: 'Q4', top: '50%', left: '50%' },
  ];

  return (
    <div className="relative w-full aspect-[16/10] glass-panel rounded-3xl overflow-hidden p-8 border border-white/5 perspective-[2000px]">
      <div className="absolute top-6 left-8 flex flex-col z-20">
        <h3 className="text-xl font-black holographic-text uppercase tracking-tight">Digital Twin Simulation</h3>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Live Occupancy Monitoring</span>
      </div>

      {/* Isometric Grid Container */}
      <div 
        className="w-full h-full flex items-center justify-center transform-gpu"
        style={{ 
          transform: 'rotateX(50deg) rotateZ(-30deg) translateY(-20px)',
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="relative w-[80%] aspect-square grid grid-cols-2 grid-rows-2 gap-4">
          {quadrants.map((q) => {
            const isActive = activeQs[q.id] === 1;
            const state = deviceState[q.id] || { light: {}, fan: {} };
            const isManual = state.light?.manual || state.fan?.manual;

            return (
              <motion.div
                key={q.id}
                layout
                className={`
                  relative rounded-2xl border-2 transition-all duration-700
                  ${isActive 
                    ? 'border-brand-cyan/50 bg-brand-cyan/10 shadow-[0_0_50px_rgba(0,242,255,0.2)]' 
                    : isManual 
                      ? 'border-brand-purple/50 bg-brand-purple/10 shadow-[0_0_50px_rgba(147,51,234,0.2)]' 
                      : 'border-white/5 bg-slate-900/40 hover:border-white/20'
                  }
                `}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Visual Label */}
                <div className="absolute top-4 left-4 flex flex-col transform-gpu z-10" style={{ transform: 'translateZ(20px)' }}>
                   <span className={`text-2xl font-black italic tracking-tighter ${isActive ? 'text-brand-cyan' : isManual ? 'text-brand-purple' : 'text-slate-700'}`}>
                    {q.id}
                   </span>
                </div>

                {/* Occupancy Indicator (Pulse) */}
                {isActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 rounded-full bg-brand-cyan/20"
                    />
                    <div className="w-12 h-12 rounded-full bg-brand-cyan/40 blur-md flex items-center justify-center" style={{ transform: 'translateZ(30px)' }}>
                      <Users className="text-white w-6 h-6" />
                    </div>
                  </div>
                )}

                {/* Device Status floating Icons */}
                <div className="absolute bottom-4 right-4 flex gap-2 transform-gpu" style={{ transform: 'translateZ(40px)' }}>
                  <DeviceIndicator 
                    icon={<Lightbulb size={12} />} 
                    active={state.light?.auto || state.light?.manual} 
                    color={state.light?.manual ? 'brand-purple' : 'brand-cyan'}
                  />
                  <DeviceIndicator 
                    icon={<Wind size={12} />} 
                    active={state.fan?.auto || state.fan?.manual} 
                    color={state.fan?.manual ? 'brand-purple' : 'brand-teal'}
                    spinning={state.fan?.auto || state.fan?.manual}
                  />
                </div>

                {/* Depth Effect (Bottom layer) */}
                <div 
                  className="absolute inset-0 border-b-8 border-r-8 border-black/20 rounded-2xl -z-10 translate-x-1 translate-y-1" 
                  style={{ transform: 'translateZ(-10px)' }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 left-8 flex gap-6 z-20">
         <LegendItem color="bg-brand-cyan" label="Active & Auto" />
         <LegendItem color="bg-brand-purple" label="Manual Override" />
         <LegendItem color="bg-slate-800" label="Energy Standby" />
      </div>
    </div>
  );
}

function DeviceIndicator({ icon, active, color, spinning }) {
  return (
    <motion.div
      animate={spinning ? { rotate: 360 } : {}}
      transition={spinning ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
      className={`
        p-2 rounded-xl border backdrop-blur-md transition-all
        ${active 
          ? `bg-${color}/20 border-${color}/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]` 
          : 'bg-slate-900/80 border-white/5 text-slate-700'
        }
      `}
    >
      {icon}
    </motion.div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-sm ${color} shadow-sm`} />
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}
