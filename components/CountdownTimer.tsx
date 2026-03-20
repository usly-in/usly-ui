"use client";

import { useState } from "react";
import { differenceInDays, differenceInYears, formatDistanceToNow } from "date-fns";
import { Heart } from "lucide-react";

interface CountdownTimerProps {
  startDate: string; // ISO date string
  label?: string;
}

export function CountdownTimer({ startDate, label = "together" }: CountdownTimerProps) {
  const start = new Date(startDate);
  const now = new Date();
  const years = differenceInYears(now, start);
  const days = differenceInDays(now, start);

  // Next anniversary
  const nextAnniversary = new Date(start);
  nextAnniversary.setFullYear(now.getFullYear());
  if (nextAnniversary <= now) nextAnniversary.setFullYear(now.getFullYear() + 1);
  const daysToAnniversary = differenceInDays(nextAnniversary, now);

  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-4 h-4 text-[#e4a0a0] fill-current" />
        <span className="text-xs text-[#888] font-medium uppercase tracking-wider">{label}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#1c1c1c] p-3 text-center">
          <p className="text-2xl font-light text-[#f5f5f5] mb-0.5">{years}</p>
          <p className="text-xs text-[#888]">{years === 1 ? "year" : "years"}</p>
        </div>
        <div className="rounded-xl bg-[#1c1c1c] p-3 text-center">
          <p className="text-2xl font-light text-[#f5f5f5] mb-0.5">{days.toLocaleString()}</p>
          <p className="text-xs text-[#888]">days</p>
        </div>
      </div>

      {daysToAnniversary > 0 && (
        <p className="text-xs text-[#888] text-center mt-3">
          {daysToAnniversary === 1
            ? "🎉 Tomorrow is your anniversary!"
            : daysToAnniversary <= 7
            ? `🌸 Anniversary in ${daysToAnniversary} days`
            : `Next anniversary in ${daysToAnniversary} days`}
        </p>
      )}
    </div>
  );
}
