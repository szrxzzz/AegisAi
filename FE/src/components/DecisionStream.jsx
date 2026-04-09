import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export default function DecisionStream({ activeQs }) {
  const [logs, setLogs] = useState([
    { id: 1, time: '23:10:45', msg: 'Neural Core Initialization Sequence Complete', type: 'system' },
    { id: 2, time: '23:10:48', msg: 'AEC-01 Stream Handshake: Successful', type: 'vision' },
    { id: 3, time: '23:10:52', msg: 'Occupancy Logic v4.2 Deployment: Online', type: 'engine' },
  ]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const activeList = Object.keys(activeQs).filter(k => activeQs[k] === 1);
    if (activeList.length > 0) {
      const newLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        msg: `Detected Occupancy in ${activeList[0]} → Initiating Zone Activation`,
        type: 'activation'
      };
      setLogs(prev => [newLog, ...prev.slice(0, 50)]);
    }
  }, [activeQs]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
    }
  }, [logs]);

  return (
    <div className="glass-panel rounded-3xl p-6 h-full flex flex-col overflow-hidden border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-cyan/10 rounded-lg"><Terminal className="text-brand-cyan" size={16} /></div>
            <h3 className="text-[10px] font-black holographic-text uppercase tracking-[0.3em]">AI Decision Stream</h3>
        </div>
        <div className="flex gap-1.5">
           <div className="w-1 h-1 bg-brand-cyan/50 rounded-full animate-bounce" />
           <div className="w-1 h-1 bg-brand-cyan/50 rounded-full animate-bounce [animation-delay:0.2s]" />
           <div className="w-1 h-1 bg-brand-cyan/50 rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              className="relative pl-4 border-l-2 border-slate-800 flex flex-col pb-4"
            >
              <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-brand-cyan/70">{log.time}</span>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-tighter ${getLogColor(log.type)}`}>
                  {log.type}
                </span>
              </div>
              <p className="text-[11px] font-bold text-white/90 leading-relaxed font-mono">
                {log.msg}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[8px] font-black text-slate-600 uppercase">
        <span>Nodes Scanned: 4 Zone Matrix</span>
        <span className="text-brand-cyan">Buffer: 99.8% Optimized</span>
      </div>
    </div>
  );
}

function getLogColor(type) {
  switch (type) {
    case 'activation': return 'border-brand-teal/20 text-brand-teal bg-brand-teal/5';
    case 'vision': return 'border-brand-cyan/20 text-brand-cyan bg-brand-cyan/5';
    case 'system': return 'border-slate-700 text-slate-400 bg-slate-900';
    default: return 'border-brand-purple/20 text-brand-purple bg-brand-purple/5';
  }
}
