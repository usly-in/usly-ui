"use client";

import { useState, useEffect } from "react";
import { differenceInDays, differenceInSeconds } from "date-fns";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface CountdownTimerProps {
  readonly startDate: string;
  readonly label?: string;
}

export function CountdownTimer({ startDate, label = "together" }: CountdownTimerProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const start = new Date(startDate);
  const totalSeconds = Math.max(0, differenceInSeconds(now, start));
  const days = Math.floor(totalSeconds / 86400);
  const remaining = totalSeconds % 86400;
  const hh = Math.floor(remaining / 3600);
  const mm = Math.floor((remaining % 3600) / 60);
  const ss = remaining % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  // Next anniversary
  const nextAnniversary = new Date(start);
  nextAnniversary.setFullYear(now.getFullYear());
  if (nextAnniversary <= now) nextAnniversary.setFullYear(now.getFullYear() + 1);
  const daysToAnniversary = differenceInDays(nextAnniversary, now);

  let anniversaryMsg: string;
  if (daysToAnniversary === 1) {
    anniversaryMsg = "🎉 Tomorrow is your anniversary!";
  } else if (daysToAnniversary <= 7) {
    anniversaryMsg = `🌸 Anniversary in ${daysToAnniversary} days`;
  } else {
    anniversaryMsg = `Next anniversary in ${daysToAnniversary} days`;
  }

  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-5">
      <div className="flex items-center gap-2 mb-4">
        <motion.span
          className="inline-flex"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <Heart className="w-4 h-4 text-[#e4a0a0] fill-current" />
        </motion.span>
        <span className="text-xs text-[#888] font-medium uppercase tracking-wider">{label}</span>
      </div>

      {/* Total days — big number */}
      <div className="mb-3">
        <p className="text-4xl font-light text-[#f5f5f5] tabular-nums leading-none">
          {days.toLocaleString()}
        </p>
        <p className="text-xs text-[#555] mt-1 uppercase tracking-widest">days</p>
      </div>

      {/* Live HH:MM:SS ticker */}
      <div className="rounded-xl bg-[#0d0d0d] border border-[#1e1e1e] px-3 py-2.5 mb-3 font-mono select-none">
        <p className="text-lg text-[#e4a0a0]/70 tabular-nums tracking-[0.15em] text-center">
          {pad(hh)}
          <motion.span
            animate={{ opacity: [1, 0.12, 1] }}
            transition={{ repeat: Infinity, duration: 1, times: [0, 0.5, 1], ease: "linear" }}
          >:</motion.span>
          {pad(mm)}
          <motion.span
            animate={{ opacity: [1, 0.12, 1] }}
            transition={{ repeat: Infinity, duration: 1, times: [0, 0.5, 1], ease: "linear" }}
          >:</motion.span>
          {pad(ss)}
        </p>
        <p className="text-[10px] text-[#383838] text-center mt-0.5 uppercase tracking-[0.25em]">live</p>
      </div>

      {daysToAnniversary > 0 && (
        <p className="text-xs text-[#888] text-center">{anniversaryMsg}</p>
      )}
    </div>
  );
}
