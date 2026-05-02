"use client";
import { motion } from "framer-motion";

export default function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.min(100, Math.max(0, (step / total) * 100));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={step}
      className="fixed top-0 left-0 right-0 z-40 h-[3px] bg-green/[0.08]"
    >
      <motion.div
        className="h-full bg-gradient-to-r from-orange to-orange-soft"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
