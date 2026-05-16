import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Search, Zap, LayoutGrid, Bell, BarChart3, Inbox, FolderOpen,
  Calendar, FileText, HelpCircle, Settings, LogOut, ChevronDown,
  Menu, X
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'search', label: 'Search', icon: <Search size={20} />, href: '/search' },
  { id: 'ai', label: 'AI Assistant', icon: <Zap size={20} />, href: '/ai' },
  { id: 'templates', label: 'Templates', icon: <LayoutGrid size={20} />, href: '/templates' },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={20} />, href: '/notifications', badge: 3 },
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={20} />, href: '/dashboard' },
  { id: 'inbox', label: 'Inbox', icon: <Inbox size={20} />, href: '/inbox' },
  { id: 'projects', label: 'Projects', icon: <FolderOpen size={20} />, href: '/projects' },
  { id: 'calendar', label: 'Calendar', icon: <Calendar size={20} />, href: '/calendar' },
  { id: 'reports', label: 'Reports', icon: <FileText size={20} />, href: '/reports' },
];

const bottomItems: NavItem[] = [
  { id: 'help', label: 'Help & Center', icon: <HelpCircle size={20} />, href: '/help' },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} />, href: '/settings' },
];

export function SidebarPro() {
  const [location, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string) => location === href;

  const handleLogout = () => {
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-all duration-300"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} className="text-[var(--accent)]" /> : <Menu size={24} className="text-[var(--accent)]" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 h-screen bg-[var(--bg-sidebar)] border-r border-[var(--border)]
          flex flex-col transition-all duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0 md:translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
          w-64
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap size={24} className="text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-[var(--text-primary)] truncate">FlowForge</h1>
                <p className="text-xs text-[var(--text-muted)] truncate">Automation</p>
              </div>
            )}
          </div>
          {/* Desktop Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-all duration-300 flex-shrink-0 ml-2"
            aria-label="Toggle sidebar collapse"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronDown 
              size={18} 
              className={`text-[var(--accent)] transition-transform duration-300 ${isCollapsed ? 'rotate-90' : '-rotate-90'}`}
            />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.href);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 flex-shrink-0
                ${isActive(item.href)
                  ? 'bg-[var(--accent)] text-white shadow-lg'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                }
                ${index > 0 ? 'mt-1' : ''}
              `}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!isCollapsed && <span className="flex-1 text-left text-sm font-500">{item.label}</span>}
              {item.badge && !isCollapsed && (
                <span className="flex-shrink-0 px-2 py-1 bg-[var(--accent-error)] text-white text-xs rounded-full font-600">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <nav className="p-4 flex flex-col gap-3 border-t border-[var(--border)] transition-all duration-300">
          {bottomItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.href);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive(item.href)
                  ? 'bg-[var(--accent)] text-white shadow-lg'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                }
              `}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!isCollapsed && <span className="flex-1 text-left text-sm font-500">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Profile & Upgrade */}
        <div className="p-4 border-t border-[var(--border)] flex flex-col gap-3 transition-all duration-300">
          {/* Upgrade Card */}
          <button
            className="w-full px-4 py-3 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] text-white rounded-lg font-600 text-sm hover:opacity-90 transition-all duration-300 hover:shadow-lg"
            title="Upgrade to Pro"
          >
            {isCollapsed ? '⭐' : 'Upgrade to Pro!'}
          </button>

          {/* User Profile */}
          {!isCollapsed && (
            <div className="px-4 py-3 bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-between transition-all duration-300">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  D
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-500 text-[var(--text-primary)] truncate">Davide Fonseca</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">cody007.cyberdev@gmail.com</p>
                </div>
              </div>
              <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0">
                <ChevronDown size={16} />
              </button>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] rounded-lg transition-all duration-300 justify-center md:justify-start"
            title="Logout"
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="text-sm font-500">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
