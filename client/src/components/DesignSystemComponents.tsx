import React from 'react';

// Button Component
export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}) => {
  const baseStyles = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-root)] focus:ring-[var(--accent)]';
  
  const variants = {
    primary: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]',
    secondary: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-active-nav)]',
    ghost: 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-12px',
    md: 'px-4 py-2 text-13px',
    lg: 'px-6 py-3 text-14px',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Card Component
export const Card = ({ 
  children, 
  className = '',
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={`bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] p-4 hover:border-[var(--border-accent)] transition-colors ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Badge Component
export const Badge = ({ 
  variant = 'default', 
  children,
  ...props 
}: React.HTMLAttributes<HTMLSpanElement> & { 
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}) => {
  const variants = {
    default: 'bg-[var(--bg-secondary)] text-[var(--text-primary)]',
    success: 'bg-[#10B981]/10 text-[#10B981]',
    warning: 'bg-[#F59E0B]/10 text-[#F59E0B]',
    error: 'bg-[#EF4444]/10 text-[#EF4444]',
    info: 'bg-[#3B82F6]/10 text-[#3B82F6]',
  };

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-11px font-medium ${variants[variant]}`}
      {...props}
    >
      {children}
    </span>
  );
};

// Priority Badge with dot
export const PriorityBadge = ({ 
  priority = 'medium',
  ...props 
}: React.HTMLAttributes<HTMLSpanElement> & { 
  priority?: 'high' | 'medium' | 'low';
}) => {
  const colors = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#10B981',
  };

  const labels = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  return (
    <Badge 
      variant={priority === 'high' ? 'error' : priority === 'medium' ? 'warning' : 'success'}
      {...props}
    >
      <span 
        className="w-1.5 h-1.5 rounded-full" 
        style={{ backgroundColor: colors[priority] }}
      />
      {labels[priority]}
    </Badge>
  );
};

// Input Component
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`w-full px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg text-13px focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-colors placeholder:text-[var(--text-tertiary)] ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';

// Tab Component
export const Tabs = ({ 
  tabs, 
  activeTab, 
  onTabChange,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}) => {
  return (
    <div className="flex gap-2 border-b border-[var(--border-subtle)]" {...props}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2.5 text-13px font-medium border-b-2 transition-colors ${
            activeTab === tab.id
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// Progress Bar Component
export const ProgressBar = ({ 
  value = 0, 
  max = 100,
  className = '',
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  value?: number;
  max?: number;
}) => {
  const percentage = (value / max) * 100;

  return (
    <div 
      className={`w-full h-0.75 bg-[var(--bg-secondary)] rounded-full overflow-hidden ${className}`}
      {...props}
    >
      <div
        className="h-full bg-[var(--accent)] transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// Modal/Dialog Component
export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[var(--bg-root)] rounded-lg border border-[var(--border-subtle)] shadow-lg max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {title && (
          <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
            <h2 className="text-16px font-semibold text-[var(--text-primary)]">{title}</h2>
          </div>
        )}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// Skeleton Loader
export const Skeleton = ({ 
  className = '',
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={`bg-[var(--bg-secondary)] rounded animate-pulse ${className}`}
      {...props}
    />
  );
};

// Stat Card Component
export const StatCard = ({ 
  label, 
  value, 
  change,
  icon,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: string | number;
  change?: { value: number; direction: 'up' | 'down' };
  icon?: React.ReactNode;
}) => {
  return (
    <Card {...props}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-12px text-[var(--text-tertiary)] mb-1">{label}</p>
          <p className="text-20px font-semibold text-[var(--text-primary)]">{value}</p>
          {change && (
            <p className={`text-11px mt-1 ${change.direction === 'up' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {change.direction === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="text-[var(--accent)] text-24px">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
