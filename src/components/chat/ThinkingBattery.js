import React from 'react';

const ThinkingBattery = ({ level = 100, compact = false }) => {
  const safeLevel = Math.max(0, Math.min(100, Number(level) || 0));
  const color = safeLevel >= 70 ? 'bg-emerald-500' : safeLevel >= 40 ? 'bg-amber-400' : safeLevel >= 10 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div
      className={`chat-thinking-battery flex shrink-0 items-center ${compact ? 'gap-0.5' : 'gap-1 sm:gap-2'}`}
      title={`Năng lượng tư duy: ${safeLevel}%`}
    >
      <span className="hidden text-sm sm:inline" aria-hidden="true">🧠</span>
      <span className={`overflow-hidden rounded border border-slate-400 bg-white p-0.5 shadow-sm dark:border-slate-600 dark:bg-slate-900 ${
        compact ? 'h-2.5 w-8 sm:h-5 sm:w-40 sm:rounded-md' : 'h-3.5 w-12 xs:w-16 sm:h-5 sm:w-40 sm:rounded-md'
      }`}>
        <span className={`block h-full rounded-[3px] transition-all duration-500 ${color}`} style={{ width: `${safeLevel}%` }} />
      </span>
      <span className={`font-medium text-slate-600 dark:text-slate-300 ${compact ? 'text-[10px] sm:text-xs' : 'text-[10px] sm:text-xs'}`}>
        {safeLevel}%
      </span>
    </div>
  );
};

export default ThinkingBattery;
