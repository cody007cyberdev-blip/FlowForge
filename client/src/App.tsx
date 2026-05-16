import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationContainer } from "./components/Notifications";
import { useNotificationContext } from "./contexts/NotificationContext";
import { AIAssistant } from "./components/AIAssistant";
import { SidebarPro } from "./components/SidebarPro";
import HomeRedesigned from "./pages/HomeRedesigned";
import Editor from "./pages/Editor";
import ExecutionLogs from "./pages/ExecutionLogs";
import WorkspaceSettingsPage from "./pages/WorkspaceSettingsPage";
import WorkflowDemo from "./pages/WorkflowDemo";
import DashboardRedesigned from "./pages/DashboardRedesigned";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedesigned} />
      <Route path="/dashboard" component={DashboardRedesigned} />
      <Route path="/editor/:id?" component={Editor} />
      <Route path="/executions/:executionId" component={ExecutionLogs} />
      <Route path="/workspace/:id/settings" component={WorkspaceSettingsPage} />
      <Route path="/demo" component={WorkflowDemo} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function AppContent() {
  const { notifications, removeNotification } = useNotificationContext();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="flex w-full" style={{ backgroundColor: 'var(--bg-root)', minHeight: '100vh' }}>
      <div className="hidden md:block">
        <SidebarPro />
      </div>
      <main 
        className="flex-1 transition-all duration-300 w-full md:w-auto" 
        style={{ backgroundColor: 'var(--bg-content)' }}
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <NotificationContainer notifications={notifications} onRemove={removeNotification} />
          <AIAssistant />
        </TooltipProvider>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
