import React from 'react';
import { Card, Badge, StatCard, ProgressBar } from '@/components/DesignSystemComponents';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const data = [
  { name: 'Mon', workflows: 4, executions: 24 },
  { name: 'Tue', workflows: 3, executions: 13 },
  { name: 'Wed', workflows: 2, executions: 9 },
  { name: 'Thu', workflows: 5, executions: 29 },
  { name: 'Fri', workflows: 3, executions: 20 },
  { name: 'Sat', workflows: 2, executions: 14 },
  { name: 'Sun', workflows: 4, executions: 22 },
];

const pieData = [
  { name: 'Success', value: 400 },
  { name: 'Failed', value: 80 },
  { name: 'Pending', value: 120 },
];

const COLORS = ['#10B981', '#EF4444', '#F59E0B'];

export default function DashboardRedesigned() {
  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: '8px' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: 0 }}>
          Overview of your workflows and executions
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard
          label="Total Workflows"
          value="24"
          change={{ value: 12, direction: 'up' }}
          icon={<TrendingUp />}
        />
        <StatCard
          label="Executions (24h)"
          value="156"
          change={{ value: 8, direction: 'up' }}
          icon={<Clock />}
        />
        <StatCard
          label="Success Rate"
          value="94.2%"
          change={{ value: 2, direction: 'up' }}
          icon={<CheckCircle />}
        />
        <StatCard
          label="Failed Executions"
          value="9"
          change={{ value: 3, direction: 'down' }}
          icon={<AlertCircle />}
        />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Line Chart */}
        <Card style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Weekly Activity
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="name" stroke="var(--text-tertiary)" />
              <YAxis stroke="var(--text-tertiary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="workflows" stroke="var(--accent)" strokeWidth={2} />
              <Line type="monotone" dataKey="executions" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Execution Status
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Bar Chart */}
        <Card style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Execution Time
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="name" stroke="var(--text-tertiary)" />
              <YAxis stroke="var(--text-tertiary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                }}
              />
              <Bar dataKey="executions" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Executions */}
      <Card style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Recent Executions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: 'var(--bg-root)',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            >
              <span style={{ color: 'var(--text-primary)' }}>Workflow #{i}</span>
              <Badge variant={i % 2 === 0 ? 'success' : 'warning'}>
                {i % 2 === 0 ? 'Success' : 'Running'}
              </Badge>
              <span style={{ color: 'var(--text-tertiary)' }}>2 min ago</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
