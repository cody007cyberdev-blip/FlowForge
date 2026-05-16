import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Search,
  Sparkles,
  LayoutTemplate,
  Bell,
  BarChart3,
  Inbox,
  FolderOpen,
  Calendar,
  FileText,
  HelpCircle,
  Settings,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'search', label: 'Search', icon: Search, href: '/' },
  { id: 'ai', label: 'AI Assistant', icon: Sparkles, href: '/ai' },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate, href: '/templates' },
  { id: 'notification', label: 'Notifications', icon: Bell, href: '/notifications' },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/dashboard' },
  { id: 'inbox', label: 'Inbox', icon: Inbox, href: '/inbox' },
  { id: 'project', label: 'Projects', icon: FolderOpen, href: '/projects' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/calendar' },
  { id: 'reports', label: 'Reports', icon: FileText, href: '/reports' },
  { id: 'help', label: 'Help & Center', icon: HelpCircle, href: '/help' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const [location] = useLocation();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const navigate = (path: string) => {
    window.location.href = path;
  };

  const handleLogout = () => {
    window.location.href = '/api/oauth/logout';
  };

  // Mock user data - in real app would come from auth context
  const user = {
    name: 'Davide Fonseca',
    email: 'cody007.cyberdev@gmail.com',
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-60 flex flex-col"
      style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          FlowForge
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.href)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150 text-left"
              style={{
                backgroundColor: isActive ? 'var(--bg-active-nav)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              <Icon size={16} />
              <span className="text-sm font-400">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Upgrade Section */}
      {!showUpgrade && (
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setShowUpgrade(true)}
            className="w-full py-3 rounded-md font-500 text-sm transition-all duration-150"
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-strong)',
            }}
          >
            Upgrade to Pro!
          </button>
        </div>
      )}

      {/* User Profile */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-600 text-xs"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--text-primary)',
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-500" style={{ color: 'var(--text-primary)' }}>
                {user?.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 hover:bg-opacity-10 rounded transition-all duration-150"
            style={{ color: 'var(--text-secondary)' }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
