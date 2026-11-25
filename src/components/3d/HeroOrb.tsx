"use client";

import { motion } from "framer-motion";

export default function HeroOrb() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Outer Glow */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-[400px] h-[400px] rounded-full blur-[80px]"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)",
        }}
      />

      {/* Rotating Rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-[320px] h-[320px] rounded-full border border-purple/20 border-dashed"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute w-[360px] h-[360px] rounded-full border border-cyan/20 border-dotted"
      />

      {/* Main Orb */}
      <motion.div
        animate={{
          y: [-10, 10, -10],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative w-[200px] h-[200px] rounded-full"
        style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
          boxShadow: "0 0 60px rgba(124,58,237,0.6), inset 0 0 40px rgba(255,255,255,0.4)",
        }}
      >
        {/* Inner Core */}
        <div
          className="absolute inset-[20px] rounded-full blur-[10px]"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, transparent 100%)",
          }}
        />
      </motion.div>
    </div>
  );
}
