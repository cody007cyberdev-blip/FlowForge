import { trpc } from "@/lib/trpc";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, Zap, TrendingUp, Clock } from "lucide-react";
import { LineChartTooltip, BarChartTooltip, PieChartTooltip } from "@/components/ChartTooltips";

// Mock data for charts
const workflowExecutionData = [
  { name: "Mon", executions: 12, successful: 10, failed: 2 },
  { name: "Tue", executions: 19, successful: 17, failed: 2 },
  { name: "Wed", executions: 15, successful: 14, failed: 1 },
  { name: "Thu", executions: 25, successful: 23, failed: 2 },
  { name: "Fri", executions: 22, successful: 20, failed: 2 },
  { name: "Sat", executions: 8, successful: 8, failed: 0 },
  { name: "Sun", executions: 5, successful: 5, failed: 0 },
];

const workflowStatusData = [
  { name: "Active", value: 45, color: "#10b981" },
  { name: "Inactive", value: 32, color: "#6b7280" },
  { name: "Error", value: 8, color: "#ef4444" },
  { name: "Paused", value: 15, color: "#f59e0b" },
];

const performanceData = [
  { name: "Avg Duration", value: 2.4, unit: "min" },
  { name: "Success Rate", value: 94.2, unit: "%" },
  { name: "Throughput", value: 156, unit: "ops/min" },
  { name: "Error Rate", value: 5.8, unit: "%" },
];

export default function DashboardEnhanced() {
  const { data: workflows } = trpc.workflows.list.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Bem-vindo ao FlowForge</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {performanceData.map((metric, idx) => (
          <Card key={idx} className="backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                {idx === 0 && <Clock className="w-4 h-4 text-blue-400" />}
                {idx === 1 && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                {idx === 2 && <Zap className="w-4 h-4 text-purple-400" />}
                {idx === 3 && <Activity className="w-4 h-4 text-red-400" />}
                {metric.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {metric.value}
                <span className="text-lg text-slate-400 ml-1">{metric.unit}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Execution Trend */}
        <Card className="lg:col-span-2 backdrop-blur-md bg-white/5 border border-white/10">
          <CardHeader>
            <CardTitle>Execução de Workflows (7 dias)</CardTitle>
            <CardDescription>Tendência de execuções bem-sucedidas vs falhadas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={workflowExecutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip content={<LineChartTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="successful" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Workflow Status */}
        <Card className="backdrop-blur-md bg-white/5 border border-white/10">
          <CardHeader>
            <CardTitle>Status dos Workflows</CardTitle>
            <CardDescription>Distribuição por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={workflowStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {workflowStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Execution Volume */}
      <Card className="backdrop-blur-md bg-white/5 border border-white/10">
        <CardHeader>
          <CardTitle>Volume de Execuções</CardTitle>
          <CardDescription>Comparação diária de execuções</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workflowExecutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip content={<BarChartTooltip />} />
              <Legend />
              <Bar dataKey="executions" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
