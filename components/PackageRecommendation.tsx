"use client";
import { motion } from "framer-motion";
import type { Package } from "@/types";
import { packageInfo } from "@/lib/recommendation";

interface Props {
  pkg: Package;
  reason?: string;
  index: number;
  primary?: boolean;
}

export default function PackageRecommendation({ pkg, reason, index, primary }: Props) {
  const info = packageInfo(pkg);
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={`relative rounded-[14px] border p-[34px] bg-elev transition-shadow ${
        primary
          ? "border-green shadow-[0_24px_50px_-24px_rgba(15,82,84,0.4)]"
          : "border-line-soft hover:border-green-line hover:shadow-[0_18px_40px_-20px_rgba(15,82,84,0.25)]"
      }`}
    >
      {primary && (
        <span className="absolute -top-3 left-[30px] bg-green text-white px-3.5 py-[5px] text-[10px] tracking-wider2 rounded font-bold">
          BEST MATCH
        </span>
      )}
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-2xl md:text-[32px] text-green font-bold tracking-tight">{pkg}</span>
        <span className="text-[13px] text-muted font-medium">{info.ko}</span>
      </div>
      <ul className="mt-6 space-y-[11px]">
        {info.items.map((it) => (
          <li key={it} className="flex items-start gap-3 text-sm text-secondary leading-[1.65]">
            <span className="mt-[9px] inline-block h-px w-3.5 bg-green-soft shrink-0" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
      {reason && (
        <div className="mt-[26px] rounded-lg border border-green-line bg-green-bg px-[18px] py-3.5 text-sm text-primary leading-[1.65]">
          <span className="text-green text-[11px] tracking-wider2 mr-2.5 font-bold">WHY</span>
          {reason}
        </div>
      )}
    </motion.div>
  );
}
