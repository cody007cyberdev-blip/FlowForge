import React, { useState } from 'react';
import { Button, Card, Badge, Input, Tabs } from '@/components/DesignSystemComponents';
import { ChevronLeft, Save, Play, Settings, Copy, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';

export default function EditorRedesigned() {
  const [, navigate] = useLocation();
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [activeTab, setActiveTab] = useState('canvas');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const tabs = [
    { id: 'canvas', label: 'Canvas' },
    { id: 'logs', label: 'Logs' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-root)' }}>
      {/* Left Sidebar - Nodes */}
      <div
        style={{
          width: '280px',
          borderRight: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)',
          overflowY: 'auto',
          padding: '16px',
        }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Nodes
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['Trigger', 'Action', 'Transform', 'Condition', 'Loop'].map((node) => (
            <Card
              key={node}
              style={{
                padding: '12px',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--text-primary)',
                textAlign: 'center',
              }}
            >
              {node}
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-root)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ChevronLeft size={18} />
            </Button>
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              style={{ maxWidth: '300px' }}
              placeholder="Workflow name"
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm" onClick={handleSave} disabled={isSaving}>
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="primary" size="sm">
              <Play size={16} />
              Run
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingLeft: '24px' }}>
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Canvas Area */}
        <div
          style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            display: activeTab === 'canvas' ? 'flex' : 'none',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              flex: 1,
              border: '2px dashed var(--border-accent)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-tertiary)',
              fontSize: '14px',
            }}
          >
            Drag nodes here to build your workflow
          </div>
        </div>

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            <Card style={{ padding: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>No logs yet</p>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            <div style={{ maxWidth: '600px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Workflow Settings
              </h3>
              <Card style={{ padding: '16px', marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Trigger Type
                </label>
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
                  <option>Manual</option>
                  <option>Webhook</option>
                  <option>Schedule</option>
                </select>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Properties */}
      <div
        style={{
          width: '280px',
          borderLeft: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)',
          padding: '16px',
          overflowY: 'auto',
        }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Properties
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Select a node to view its properties</p>
      </div>
    </div>
  );
}
