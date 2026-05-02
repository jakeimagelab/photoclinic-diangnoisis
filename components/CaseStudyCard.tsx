"use client";
import { motion } from "framer-motion";

interface Props {
  name: string;
  dept: string;
  desc: string;
  delay?: number;
}

export default function CaseStudyCard({ name, dept, desc, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -3 }}
      className="rounded-[10px] border border-line-soft bg-elev p-6 transition-all hover:border-green-line hover:shadow-[0_12px_28px_-16px_rgba(15,82,84,0.25)]"
    >
      <div className="text-green text-[11px] tracking-wider2 font-semibold mb-3.5">CASE STUDY</div>
      <div className="text-primary text-base font-semibold">{name}</div>
      <div className="mt-1.5 text-xs text-muted">{dept}</div>
      <div className="mt-[18px] text-sm text-secondary leading-[1.65]">{desc}</div>
    </motion.div>
  );
}
