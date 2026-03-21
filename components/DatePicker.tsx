"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import {
  format, parse, isValid,
  addMonths, addYears,
  setMonth as fnsSetMonth, setYear as fnsSetYear,
  getMonth, getYear,
} from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, X, ChevronDown } from "lucide-react";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function Chevron({ orientation }: Readonly<{ orientation?: string }>) {
  return orientation === "left" ? (
    <ChevronLeft className="w-4 h-4" />
  ) : (
    <ChevronRight className="w-4 h-4" />
  );
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  className?: string;
  /** Force the popover to open upward or downward. Defaults to "auto" (smart flip). */
  placement?: "auto" | "up" | "down";
}

const DAY_CLASSNAMES = {
  root: "select-none",
  months: "flex flex-col",
  month: "flex flex-col",
  month_caption: "hidden",
  caption_label: "",
  nav: "hidden",
  button_previous: "",
  button_next: "",
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday: "w-9 h-8 text-[10px] font-medium text-[#555] flex items-center justify-center",
  weeks: "flex flex-col gap-0.5",
  week: "flex",
  day: "p-0 w-9",
  day_button:
    "w-9 h-9 text-sm rounded-lg text-[#888] hover:bg-[#2a2a2a] hover:text-[#f5f5f5] transition-colors flex items-center justify-center",
  selected: "!bg-[#e4a0a0] !text-[#0b0b0b] hover:!bg-[#c47a7a] font-medium",
  today: "!text-[#e4a0a0] font-medium",
  outside: "!text-[#333] hover:!text-[#555]",
  disabled: "!text-[#2a2a2a] cursor-not-allowed hover:!bg-transparent hover:!text-[#2a2a2a]",
  hidden: "invisible",
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  min,
  className,
  placement = "auto",
}: Readonly<DatePickerProps>) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [view, setView] = useState<"days" | "months" | "years">("days");
  const [month, setMonth] = useState<Date>(new Date());
  const [yearBase, setYearBase] = useState(Math.floor(new Date().getFullYear() / 16) * 16);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = value
    ? (() => { const d = parse(value, "yyyy-MM-dd", new Date()); return isValid(d) ? d : undefined; })()
    : undefined;

  const minDate = min
    ? (() => { const d = parse(min, "yyyy-MM-dd", new Date()); return isValid(d) ? d : undefined; })()
    : undefined;

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleOpen = () => {
    if (!open) {
      const base = selected ?? new Date();
      setMonth(base);
      setYearBase(Math.floor(getYear(base) / 16) * 16);
      setView("days");
      if (placement === "up") {
        setOpenUp(true);
      } else if (placement === "down") {
        setOpenUp(false);
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setOpenUp(rect.bottom + 340 > window.innerHeight);
      }
    }
    setOpen((o) => !o);
  };

  const handleSelect = (day: Date | undefined) => {
    onChange(day ? format(day, "yyyy-MM-dd") : "");
    setOpen(false);
  };

  const label = selected ? format(selected, "d MMM yyyy") : "";

  const navBtnCls = "flex items-center justify-center w-7 h-7 rounded-lg text-[#888] hover:text-[#f5f5f5] hover:bg-[#2a2a2a] transition-colors";
  const gridBtnCls = (active: boolean) =>
    `py-2 rounded-lg text-sm transition-colors ${
      active ? "bg-[#e4a0a0] text-[#0b0b0b] font-medium" : "text-[#888] hover:bg-[#2a2a2a] hover:text-[#f5f5f5]"
    }`;

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-left text-sm transition-colors hover:border-[#888]/40 focus:outline-none focus:border-[#e4a0a0]/60"
      >
        <Calendar className="w-4 h-4 text-[#888] shrink-0" />
        <span className={`flex-1 ${label ? "text-[#f5f5f5]" : "text-[#555]"}`}>
          {label || placeholder}
        </span>
        {label && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="text-[#555] hover:text-[#888] transition-colors leading-none"
            aria-label="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </button>

      {/* Popover */}
      {open && (
        <div className={`absolute z-50 rounded-2xl border border-[#2a2a2a] bg-[#141414] shadow-2xl p-3 w-72 ${openUp ? "bottom-full mb-1" : "mt-1"}`}>

          {/* ── Custom header ── */}
          <div className="flex items-center justify-between mb-3 px-0.5">
            <button
              type="button"
              className={navBtnCls}
              onClick={() => {
                if (view === "days") setMonth((m) => addMonths(m, -1));
                else if (view === "months") setMonth((m) => addYears(m, -1));
                else setYearBase((y) => y - 16);
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {view === "days" && (
              <button
                type="button"
                onClick={() => setView("months")}
                className="flex items-center gap-1 text-sm font-medium text-[#f5f5f5] hover:text-[#e4a0a0] transition-colors"
              >
                {format(month, "MMMM yyyy")}
                <ChevronDown className="w-3.5 h-3.5 text-[#888]" />
              </button>
            )}
            {view === "months" && (
              <button
                type="button"
                onClick={() => { setYearBase(Math.floor(getYear(month) / 16) * 16); setView("years"); }}
                className="flex items-center gap-1 text-sm font-medium text-[#f5f5f5] hover:text-[#e4a0a0] transition-colors"
              >
                {getYear(month)}
                <ChevronDown className="w-3.5 h-3.5 text-[#888]" />
              </button>
            )}
            {view === "years" && (
              <span className="text-sm font-medium text-[#888]">
                {yearBase} – {yearBase + 15}
              </span>
            )}

            <button
              type="button"
              className={navBtnCls}
              onClick={() => {
                if (view === "days") setMonth((m) => addMonths(m, 1));
                else if (view === "months") setMonth((m) => addYears(m, 1));
                else setYearBase((y) => y + 16);
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* ── Day grid ── */}
          {view === "days" && (
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              month={month}
              onMonthChange={setMonth}
              disabled={minDate ? { before: minDate } : undefined}
              classNames={DAY_CLASSNAMES}
              components={{ Chevron }}
            />
          )}

          {/* ── Month grid ── */}
          {view === "months" && (
            <div className="grid grid-cols-3 gap-1">
              {MONTH_NAMES.map((name, i) => (
                <button
                  key={name}
                  type="button"
                  className={gridBtnCls(getMonth(month) === i)}
                  onClick={() => {
                    setMonth((m) => fnsSetMonth(m, i));
                    setView("days");
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* ── Year grid ── */}
          {view === "years" && (
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: 16 }, (_, i) => yearBase + i).map((y) => (
                <button
                  key={y}
                  type="button"
                  className={gridBtnCls(getYear(month) === y)}
                  onClick={() => {
                    setMonth((m) => fnsSetYear(m, y));
                    setView("months");
                  }}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
