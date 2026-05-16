/**
 * Admin Panel
 * Manage users, organizations, billing, and system settings
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Building2, CreditCard, Settings, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "user";
  status: "active" | "inactive" | "suspended";
  createdAt: Date;
  lastLogin?: Date;
}

interface Organization {
  id: number;
  name: string;
  plan: "free" | "pro" | "business" | "enterprise";
  users: number;
  workflows: number;
  status: "active" | "suspended";
  createdAt: Date;
}

interface SystemMetrics {
  totalUsers: number;
  totalOrganizations: number;
  totalWorkflows: number;
  totalExecutions: number;
  systemHealth: number;
  uptime: string;
}

export function AdminPanel() {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      email: "admin@example.com",
      name: "Admin User",
      role: "admin",
      status: "active",
      createdAt: new Date("2024-01-01"),
      lastLogin: new Date(),
    },
    {
      id: 2,
      email: "user@example.com",
      name: "Regular User",
      role: "user",
      status: "active",
      createdAt: new Date("2024-01-15"),
      lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [organizations, setOrganizations] = useState<Organization[]>([
    {
      id: 1,
      name: "Acme Corp",
      plan: "enterprise",
      users: 45,
      workflows: 234,
      status: "active",
      createdAt: new Date("2024-01-01"),
    },
    {
      id: 2,
      name: "Tech Startup",
      plan: "pro",
      users: 12,
      workflows: 45,
      status: "active",
      createdAt: new Date("2024-02-01"),
    },
  ]);

  const [metrics] = useState<SystemMetrics>({
    totalUsers: 1234,
    totalOrganizations: 156,
    totalWorkflows: 5678,
    totalExecutions: 234567,
    systemHealth: 99.8,
    uptime: "45 days",
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-600">Manage users, organizations, and system settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Report</Button>
          <Button>System Settings</Button>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold">{metrics.systemHealth}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Uptime: {metrics.uptime}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Active accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrganizations}</div>
            <p className="text-xs text-gray-500 mt-1">Active organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.totalExecutions / 1000).toFixed(0)}k</div>
            <p className="text-xs text-gray-500 mt-1">Total executions</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Search users..." className="flex-1" />
                  <Button>Add User</Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2">Email</th>
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">Role</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Last Login</th>
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{user.email}</td>
                          <td className="py-3">{user.name}</td>
                          <td className="py-3">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                user.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : user.status === "suspended"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3">{user.lastLogin?.toLocaleDateString()}</td>
                          <td className="py-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organizations Tab */}
        <TabsContent value="organizations">
          <Card>
            <CardHeader>
              <CardTitle>Organization Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Search organizations..." className="flex-1" />
                  <Button>Add Organization</Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">Plan</th>
                        <th className="text-left py-2">Users</th>
                        <th className="text-left py-2">Workflows</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {organizations.map((org) => (
                        <tr key={org.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{org.name}</td>
                          <td className="py-3">
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {org.plan}
                            </span>
                          </td>
                          <td className="py-3">{org.users}</td>
                          <td className="py-3">{org.workflows}</td>
                          <td className="py-3">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                org.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {org.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrg(org)}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded">
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold">$45,230</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded">
                    <p className="text-sm text-gray-600">Active Subscriptions</p>
                    <p className="text-2xl font-bold">234</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded">
                    <p className="text-sm text-gray-600">Churn Rate</p>
                    <p className="text-2xl font-bold">2.3%</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">Recent Transactions</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">Acme Corp - Pro Plan</p>
                        <p className="text-sm text-gray-600">Invoice #1234</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">$99.00</p>
                        <p className="text-xs text-green-600">Paid</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security & Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">SSL/TLS Encryption</p>
                        <p className="text-sm text-gray-600">All connections encrypted</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600">1,234 users enabled</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg border-yellow-200 bg-yellow-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium">Failed Login Attempts</p>
                        <p className="text-sm text-gray-600">45 attempts in last 24h</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Platform Name</label>
                  <Input defaultValue="FlowForge" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Support Email</label>
                  <Input defaultValue="support@flowforge.io" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Max File Upload Size (MB)</label>
                  <Input type="number" defaultValue="100" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Trial Days</label>
                  <Input type="number" defaultValue="14" />
                </div>

                <div className="flex gap-2">
                  <Button>Save Settings</Button>
                  <Button variant="outline">Reset to Defaults</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
