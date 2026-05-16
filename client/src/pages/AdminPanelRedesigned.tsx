import React, { useState } from 'react';
import { Button, Card, Badge, Input, Tabs, Modal } from '@/components/DesignSystemComponents';
import { Users, Settings, BarChart3, Shield, Trash2, Edit2, Plus } from 'lucide-react';

export default function AdminPanelRedesigned() {
  const [activeTab, setActiveTab] = useState('users');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tabs = [
    { id: 'users', label: 'Users', icon: <Users size={16} /> },
    { id: 'organizations', label: 'Organizations', icon: <Settings size={16} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
    { id: 'security', label: 'Security', icon: <Shield size={16} /> },
  ];

  const users = [
    { id: 1, name: 'Davide Fonseca', email: 'davide@example.com', role: 'admin', status: 'active' },
    { id: 2, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active' },
    { id: 3, name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'inactive' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: '8px' }}>
            Admin Panel
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: 0 }}>
            Manage users, organizations, and system settings
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          Add User
        </Button>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <Input placeholder="Search users..." />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {users.map((user) => (
              <Card key={user.id} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: '4px' }}>
                    {user.name}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>
                    {user.email}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Badge variant={user.role === 'admin' ? 'info' : 'default'}>
                    {user.role}
                  </Badge>
                  <Badge variant={user.status === 'active' ? 'success' : 'warning'}>
                    {user.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Organizations Tab */}
      {activeTab === 'organizations' && (
        <div>
          <Card style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Organizations
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
              Manage organizations and their settings
            </p>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Total Users', value: '1,234' },
              { label: 'Active Workflows', value: '456' },
              { label: 'Executions (24h)', value: '12,345' },
              { label: 'System Uptime', value: '99.9%' },
            ].map((stat, i) => (
              <Card key={i} style={{ padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0, marginBottom: '8px' }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {stat.value}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div>
          <Card style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Security Settings
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Two-Factor Authentication
                </label>
                <Badge variant="success">Enabled</Badge>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  IP Whitelist
                </label>
                <Badge variant="warning">Configured</Badge>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Session Timeout
                </label>
                <Badge variant="info">30 minutes</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New User">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input placeholder="Name" />
          <Input placeholder="Email" type="email" />
          <select
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              fontSize: '13px',
            }}
          >
            <option>Select Role</option>
            <option>Admin</option>
            <option>User</option>
            <option>Viewer</option>
          </select>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary">
              Add User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
