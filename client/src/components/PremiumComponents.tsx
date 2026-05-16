import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

// Premium Card with glassmorphism
export function PremiumCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`
        backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5
        border border-white/20 rounded-xl p-6
        hover:border-white/30 hover:bg-gradient-to-br hover:from-white/15 hover:to-white/10
        transition-all duration-300 shadow-lg shadow-black/20
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Premium Button
export function PremiumButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  [key: string]: any;
}) {
  const baseStyles = "font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2";

  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50 hover:shadow-blue-500/75",
    secondary: "bg-slate-700/50 hover:bg-slate-600/50 text-white border border-white/20 hover:border-white/40",
    ghost: "hover:bg-white/10 text-slate-200 hover:text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// Premium Badge
export function PremiumBadge({ children, variant = "default" }: { children: ReactNode; variant?: "default" | "success" | "warning" | "error" }) {
  const variants: Record<string, string> = {
    default: "bg-blue-500/20 text-blue-200 border border-blue-500/30",
    success: "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-200 border border-amber-500/30",
    error: "bg-red-500/20 text-red-200 border border-red-500/30",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
}

// Premium Section Header
export function PremiumSectionHeader({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon?: any }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        {Icon && <Icon className="w-6 h-6 text-blue-400" />}
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          {title}
        </h2>
      </div>
      {subtitle && <p className="text-slate-400 text-lg">{subtitle}</p>}
    </div>
  );
}

// Premium Stat Card
export function PremiumStatCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  change?: { value: number; positive: boolean };
  icon?: any;
}) {
  return (
    <PremiumCard>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        {Icon && <Icon className="w-8 h-8 text-blue-400/50" />}
      </div>
      {change && (
        <div className={`text-sm font-semibold ${change.positive ? "text-emerald-400" : "text-red-400"}`}>
          {change.positive ? "↑" : "↓"} {Math.abs(change.value)}%
        </div>
      )}
    </PremiumCard>
  );
}

// Premium Input
export function PremiumInput({
  placeholder,
  icon: Icon,
  className = "",
  ...props
}: {
  placeholder?: string;
  icon?: any;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />}
      <input
        placeholder={placeholder}
        className={`
          w-full bg-slate-800/50 border border-white/10 rounded-lg
          ${Icon ? "pl-10 pr-4" : "px-4"} py-2.5
          text-white placeholder:text-slate-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-300
          ${className}
        `}
        {...props}
      />
    </div>
  );
}

// Premium Feature Card
export function PremiumFeatureCard({
  icon: Icon,
  title,
  description,
  badge,
}: {
  icon: any;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <PremiumCard className="relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <Icon className="w-8 h-8 text-blue-400" />
          {badge && <PremiumBadge>{badge}</PremiumBadge>}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </PremiumCard>
  );
}

// Premium Divider
export function PremiumDivider() {
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/10" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-3 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <Sparkles className="w-4 h-4 text-blue-400" />
        </span>
      </div>
    </div>
  );
}

// Premium Grid
export function PremiumGrid({ children, cols = 3 }: { children: ReactNode; cols?: number }) {
  const colsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return <div className={`grid ${colsClass[cols as keyof typeof colsClass]} gap-6`}>{children}</div>;
}
