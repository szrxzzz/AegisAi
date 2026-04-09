import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function AICore() {
  return (
    <div className="relative flex items-center justify-center py-12">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 bg-brand-cyan/20 blur-[100px] rounded-full animate-pulse" />
      </div>

      {/* Rotating Rings */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-full h-full border-2 border-dashed border-brand-cyan/20 rounded-full"
        />
        
        {/* Middle Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-[80%] h-[80%] border border-brand-teal/30 rounded-full flex items-center justify-center"
        >
          <div className="w-2 h-2 bg-brand-teal rounded-full absolute top-0 -translate-x-1/2 shadow-[0_0_10px_#10b981]" />
        </motion.div>

        {/* Inner Ring */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute w-[60%] h-[60%] border-2 border-brand-cyan/50 rounded-full backdrop-blur-md shadow-[inset_0_0_30px_rgba(0,242,255,0.2)]"
        />

        {/* The Core Content */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            animate={{ 
              boxShadow: ["0 0 20px rgba(0,242,255,0.4)", "0 0 50px rgba(0,242,255,0.6)", "0 0 20px rgba(0,242,255,0.4)"] 
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-24 h-24 bg-gradient-to-br from-brand-cyan to-brand-teal rounded-3xl flex items-center justify-center relative overflow-hidden group mb-4"
          >
            <Shield className="text-cyber-black w-12 h-12 relative z-10" />
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </motion.div>
          
          <div className="text-center">
            <h2 className="text-2xl font-black holographic-text tracking-widest uppercase mb-1">AegisAI Core</h2>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-brand-teal rounded-full animate-ping" />
              <span className="text-[10px] font-black text-brand-teal uppercase tracking-[0.3em]">System Active</span>
            </div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2">Real-time Building Brain</p>
          </div>
        </div>
      </div>

      {/* Energy Particles (Simplified CSS animation) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 400 - 200, 
              y: Math.random() * 400 - 200,
              opacity: 0 
            }}
            animate={{ 
              y: [0, -100], 
              opacity: [0, 1, 0],
              scale: [0, 1, 0.5] 
            }}
            transition={{ 
              duration: 2 + Math.random() * 4, 
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute left-1/2 top-1/2 w-1 h-1 bg-brand-cyan rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
