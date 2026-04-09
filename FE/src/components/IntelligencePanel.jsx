import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Target, TrendingDown } from 'lucide-react';

export default function IntelligencePanel() {
  const insights = [
    { 
      label: 'Energy Saved', 
      value: '2.4 kWh', 
      detail: 'Today vs Baseline', 
      icon: <Zap size={14} />, 
      color: 'text-brand-teal', 
      bg: 'bg-brand-teal/10' 
    },
    { 
      label: 'Optimization', 
      value: '34%', 
      detail: 'Efficiency Increase', 
      icon: <Brain size={14} />, 
      color: 'text-brand-cyan', 
      bg: 'bg-brand-cyan/10' 
    },
    { 
      label: 'Detection Acc', 
      value: '99.2%', 
      detail: 'YOLOv8 Edge Performance', 
      icon: <Target size={14} />, 
      color: 'text-brand-purple', 
      bg: 'bg-brand-purple/10' 
    },
    { 
      label: 'Redundancy', 
      value: '1.2 kWh', 
      detail: 'Prevented Idle Waste', 
      icon: <TrendingDown size={14} />, 
      color: 'text-brand-teal', 
      bg: 'bg-brand-teal/10' 
    }
  ];

  return (
    <div className="glass-panel rounded-3xl p-6 border border-brand-teal/10 relative overflow-hidden group">
      {/* Background Pulse */}
      <div className="absolute top-0 right-0 w-full h-full bg-brand-teal/5 blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-teal/10 transition-all duration-1000" />
      
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-teal/10 rounded-lg"><Brain className="text-brand-teal" size={16} /></div>
            <h3 className="text-[10px] font-black holographic-text uppercase tracking-[0.3em]">AI Intelligence Insights</h3>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-4">
        {insights.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            className={`p-4 rounded-2xl border border-white/5 bg-slate-900/60 transition-all shadow-inner`}
          >
            <div className={`p-1.5 rounded-lg w-fit ${item.bg} ${item.color} mb-3`}>
              {item.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-black text-white uppercase tracking-tight">{item.value}</span>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{item.label}</span>
              <p className="text-[7px] font-bold text-slate-600 uppercase mt-1 leading-tight">{item.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 mt-6 pt-6 border-t border-white/5">
        <div className="flex justify-between items-center mb-2">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">System Health: Optimal</span>
            <span className="text-[8px] font-black text-brand-teal uppercase">99.8%</span>
        </div>
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '99.8%' }}
                transition={{ duration: 2, delay: 0.5 }}
                className="h-full bg-brand-teal shadow-[0_0_10px_#10b981]" 
            />
        </div>
      </div>
    </div>
  );
}
