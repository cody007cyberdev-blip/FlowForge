import { ReactNode } from "react";

// Custom Tooltip for Line Charts
export function LineChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="backdrop-blur-md bg-slate-900/95 border border-white/20 rounded-lg p-4 shadow-2xl shadow-black/50">
      <p className="text-sm font-semibold text-white mb-3">{label}</p>
      <div className="space-y-2">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-slate-300">{entry.name}</span>
            </div>
            <span className="text-sm font-bold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Custom Tooltip for Bar Charts
export function BarChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const total = payload.reduce((sum, entry) => sum + entry.value, 0);
  const percentage = payload.map((entry) => ({
    ...entry,
    percent: ((entry.value / total) * 100).toFixed(1),
  }));

  return (
    <div className="backdrop-blur-md bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-white/20 rounded-lg p-4 shadow-2xl shadow-black/50">
      <p className="text-sm font-semibold text-white mb-3">{label}</p>
      <div className="space-y-2 mb-3">
        {percentage.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-slate-300">{entry.name}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-white">{entry.value}</div>
              <div className="text-xs text-slate-400">{entry.percent}%</div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 pt-3 mt-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Total</span>
          <span className="text-sm font-bold text-blue-400">{total}</span>
        </div>
      </div>
    </div>
  );
}

// Custom Tooltip for Pie Charts
export function PieChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; percent: number }>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const entry = payload[0];

  return (
    <div className="backdrop-blur-md bg-slate-900/95 border border-white/20 rounded-lg p-4 shadow-2xl shadow-black/50">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: entry.color }}
        />
        <p className="text-sm font-semibold text-white">{entry.name}</p>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-xs text-slate-400">Valor</span>
          <span className="text-sm font-bold text-white">{entry.value}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-xs text-slate-400">Percentagem</span>
          <span className="text-sm font-bold text-emerald-400">{entry.percent}%</span>
        </div>
      </div>
    </div>
  );
}

// Custom Tooltip for Area Charts
export function AreaChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="backdrop-blur-md bg-slate-900/95 border border-white/20 rounded-lg p-4 shadow-2xl shadow-black/50">
      <p className="text-sm font-semibold text-white mb-3">{label}</p>
      <div className="space-y-2">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-slate-300">{entry.name}</span>
            </div>
            <span className="text-sm font-bold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tooltip Wrapper Component
export function TooltipWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-200">
      {children}
    </div>
  );
}

// Format tooltip value with units
export function formatTooltipValue(value: number, unit?: string): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M${unit ? ` ${unit}` : ""}`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K${unit ? ` ${unit}` : ""}`;
  }
  return `${value}${unit ? ` ${unit}` : ""}`;
}

// Format tooltip date
export function formatTooltipDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-PT", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Format tooltip time
export function formatTooltipTime(time: string): string {
  return new Date(`2000-01-01 ${time}`).toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
