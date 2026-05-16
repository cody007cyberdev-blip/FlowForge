/**
 * Analytics Dashboard
 * Real-time metrics, trends, and insights
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Zap, DollarSign, AlertCircle, Activity } from "lucide-react";

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  trend: "up" | "down";
}

interface ChartData {
  name: string;
  value?: number;
  executions?: number;
  success?: number;
  failures?: number;
  [key: string]: any;
}

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch analytics data from API
    const mockMetrics: MetricCard[] = [
      {
        title: "Total Workflows",
        value: 1234,
        change: 12.5,
        icon: <Zap className="w-4 h-4" />,
        trend: "up",
      },
      {
        title: "Active Users",
        value: 456,
        change: 8.2,
        icon: <Users className="w-4 h-4" />,
        trend: "up",
      },
      {
        title: "Success Rate",
        value: "98.5%",
        change: 2.1,
        icon: <TrendingUp className="w-4 h-4" />,
        trend: "up",
      },
      {
        title: "Revenue",
        value: "$12,450",
        change: 15.3,
        icon: <DollarSign className="w-4 h-4" />,
        trend: "up",
      },
    ];

    const mockChartData: ChartData[] = [
      { name: "Jan", executions: 4000, success: 3900, failures: 100 },
      { name: "Feb", executions: 3000, success: 2900, failures: 100 },
      { name: "Mar", executions: 2000, success: 1900, failures: 100 },
      { name: "Apr", executions: 2780, success: 2700, failures: 80 },
      { name: "May", executions: 1890, success: 1800, failures: 90 },
      { name: "Jun", executions: 2390, success: 2300, failures: 90 },
    ];

    setMetrics(mockMetrics);
    setChartData(mockChartData);
    setLoading(false);
  }, [period]);

  if (loading) {
    return <div className="p-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-600">Real-time metrics and insights</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod("day")}
            className={`px-4 py-2 rounded ${period === "day" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Day
          </button>
          <button
            onClick={() => setPeriod("week")}
            className={`px-4 py-2 rounded ${period === "week" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`px-4 py-2 rounded ${period === "month" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className="text-gray-500">{metric.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {metric.trend === "up" ? "↑" : "↓"} {Math.abs(metric.change)}% from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="executions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="executions">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="executions" stroke="#3b82f6" />
                  <Line type="monotone" dataKey="success" stroke="#10b981" />
                  <Line type="monotone" dataKey="failures" stroke="#ef4444" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="executions" fill="#3b82f6" />
                  <Bar dataKey="success" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <span>Active Users Today</span>
                  </div>
                  <span className="text-2xl font-bold">156</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    <span>New Users This Month</span>
                  </div>
                  <span className="text-2xl font-bold">42</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    <span>User Retention Rate</span>
                  </div>
                  <span className="text-2xl font-bold">92.5%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Free", value: 30 },
                      { name: "Pro", value: 45 },
                      { name: "Business", value: 20 },
                      { name: "Enterprise", value: 5 },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alerts */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="p-3 bg-white rounded border-l-4 border-yellow-500">
              <p className="font-medium">High CPU Usage</p>
              <p className="text-sm text-gray-600">CPU usage is above 80% for the last 2 hours</p>
            </div>
            <div className="p-3 bg-white rounded border-l-4 border-orange-500">
              <p className="font-medium">Storage Quota Warning</p>
              <p className="text-sm text-gray-600">You are using 85% of your storage quota</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
