"use client";
import { motion } from "framer-motion";

interface Props {
  qNumber: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}

export default function QuestionCard({ qNumber, title, hint, children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="text-orange text-[13px] tracking-wider2 mb-3 font-semibold">— {qNumber}</div>
      <h2 className="text-[22px] md:text-[32px] leading-[1.4] text-primary font-bold tracking-tight">
        {title}
      </h2>
      {hint && <p className="mt-3.5 text-sm text-muted">{hint}</p>}
      <div className="mt-10">{children}</div>
    </motion.div>
  );
}
