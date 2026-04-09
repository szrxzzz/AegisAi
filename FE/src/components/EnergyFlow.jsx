import React from 'react';
import { motion } from 'framer-motion';
import { Video, Cpu, MessageSquare, Zap, LayoutGrid } from 'lucide-react';

export default function EnergyFlow({ active }) {
  const steps = [
    { label: 'CCTV Feed', icon: <Video size={16} />, activeColor: 'brand-cyan' },
    { label: 'AI Engine', icon: <Cpu size={16} />, activeColor: 'brand-teal' },
    { label: 'Logic Kernel', icon: <MessageSquare size={16} />, activeColor: 'brand-purple' },
    { label: 'Relay Control', icon: <Zap size={16} />, activeColor: 'neon-green' },
    { label: 'Zones', icon: <LayoutGrid size={16} />, activeColor: 'brand-cyan' }
  ];

  return (
    <div className="glass-panel rounded-3xl p-6 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[10px] font-black holographic-text uppercase tracking-[0.3em]">AI Pipeline Flow</h3>
        <div className={`flex items-center gap-2 px-2 py-1 rounded bg-slate-900 border border-white/5`}>
          <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-brand-teal animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-slate-700'}`} />
          <span className="text-[8px] font-black text-slate-500 uppercase">{active ? 'Live Processing' : 'Standby'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 relative">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flex items-center gap-4 group">
              <motion.div
                animate={active ? { 
                  scale: [1, 1.1, 1],
                  borderColor: idx % 2 === 0 ? ['rgba(255,255,255,0.05)', 'rgba(0,242,255,0.4)', 'rgba(255,255,255,0.05)'] : ['rgba(255,255,255,0.05)', 'rgba(16,185,129,0.4)', 'rgba(255,255,255,0.05)']
                } : {}}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.4 }}
                className={`
                  w-10 h-10 rounded-xl border flex items-center justify-center transition-all bg-slate-900
                  ${active ? `text-${step.activeColor} shadow-[0_0_15px_rgba(255,255,255,0.05)]` : 'text-slate-700 border-white/5'}
                `}
              >
                {step.icon}
              </motion.div>
              <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-slate-700'}`}>{step.label}</span>
                <span className="text-[8px] font-bold text-slate-600 uppercase">Process Node 0{idx + 1}</span>
              </div>
            </div>
            
            {idx < steps.length - 1 && (
              <div className="ml-5 h-6 w-[2px] bg-slate-800/50 relative overflow-hidden">
                {active && (
                  <motion.div
                    animate={{ y: [-24, 24] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.4, ease: "linear" }}
                    className="absolute inset-0 w-full h-1/2 bg-gradient-to-b from-transparent via-brand-cyan to-transparent"
                  />
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-white/5">
        <p className="text-[8px] font-black text-slate-600 uppercase leading-relaxed">
          Latency: <span className="text-brand-teal">84ms</span><br />
          Throughput: <span className="text-brand-teal">30 FPS</span><br />
          Confidence: <span className="text-brand-teal">98.4%</span>
        </p>
      </div>
    </div>
  );
}
