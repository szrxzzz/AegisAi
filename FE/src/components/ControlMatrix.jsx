import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Wind, Power, Cpu } from 'lucide-react';

export default function ControlMatrix({ deviceState, toggleDevice }) {
  const quadrants = ['Q1', 'Q2', 'Q3', 'Q4'];

  return (
    <div className="glass-panel rounded-3xl p-8 border border-white/5">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-xl font-black holographic-text uppercase tracking-tight">Device Control Matrix</h3>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Smart Interaction Grid</p>
        </div>
        <div className="flex gap-4">
          <StatusChip label="Edge Online" color="bg-brand-teal" />
          <StatusChip label="MQTT Sync" color="bg-brand-cyan" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {quadrants.map(q => (
          <ControlCard 
            key={q} 
            id={q} 
            state={deviceState[q] || { light: {}, fan: {} }} 
            onToggle={(dev) => toggleDevice(q, dev)} 
          />
        ))}
      </div>
    </div>
  );
}

function ControlCard({ id, state, onToggle }) {
  return (
    <div className="relative group overflow-hidden">
      {/* Background Frame */}
      <div className="absolute inset-0 bg-slate-900 border border-white/5 rounded-2xl group-hover:border-white/10 transition-all duration-500" />
      
      <div className="relative p-6 flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <span className="text-xl font-black text-slate-700 italic group-hover:text-white transition-colors">{id}</span>
          <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${state.light?.manual || state.fan?.manual ? 'bg-brand-purple/20 text-brand-purple' : 'bg-brand-teal/20 text-brand-teal'}`}>
            {state.light?.manual || state.fan?.manual ? 'Manual' : 'Aegis Mode'}
          </div>
        </div>

        <div className="space-y-4">
          <ToggleItem 
            icon={<Lightbulb size={14} />} 
            label="Lighting" 
            isActive={state.light?.manual || state.light?.auto}
            isOverride={state.light?.manual}
            onToggle={() => onToggle('light')} 
          />
          <ToggleItem 
            icon={<Wind size={14} />} 
            label="Climate" 
            isActive={state.fan?.manual || state.fan?.auto} 
            isOverride={state.fan?.manual}
            onToggle={() => onToggle('fan')} 
            spinning={state.fan?.manual || state.fan?.auto}
          />
        </div>
      </div>

      {/* Hover Light Stripe */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent group-hover:via-brand-cyan/80 transition-all duration-700" />
    </div>
  );
}

function ToggleItem({ icon, label, isActive, isOverride, onToggle, spinning }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <motion.div 
            animate={spinning && isActive ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={`p-2 rounded-lg transition-all ${isActive ? (isOverride ? 'bg-brand-purple/20 text-brand-purple' : 'bg-brand-cyan/20 text-brand-cyan') : 'bg-slate-800 text-slate-600'}`}
        >
          {icon}
        </motion.div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-600'}`}>{label}</span>
      </div>
      
      <button 
        onClick={onToggle}
        className={`w-10 h-5 rounded-full relative transition-all duration-500 overflow-hidden ${isActive ? (isOverride ? 'bg-brand-purple' : 'bg-brand-teal') : 'bg-slate-800'}`}
      >
        <div className={`absolute inset-0 bg-white/10 ${isActive ? 'translate-x-0' : 'translate-x-[-100%]'}`} />
        <motion.div 
          animate={{ x: isActive ? 20 : 4 }}
          className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-lg z-10"
        />
      </button>
    </div>
  );
}

function StatusChip({ label, color }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full">
      <div className={`w-1.5 h-1.5 rounded-full ${color} animate-pulse`} />
      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
    </div>
  );
}
