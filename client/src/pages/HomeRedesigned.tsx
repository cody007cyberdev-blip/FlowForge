import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useLocation } from 'wouter';
import { LayoutGrid, List, Calendar, Table2, Search, Plus, MoreVertical } from 'lucide-react';
import { Button, Card, Badge, PriorityBadge, Input, Tabs, ProgressBar } from '@/components/DesignSystemComponents';

type ViewType = 'kanban' | 'list' | 'timeline' | 'table';
type StatusFilter = 'all' | 'active' | 'inactive';

export default function HomeRedesigned() {
  const { data: user } = trpc.auth.me.useQuery();
  const { addNotification } = useNotificationContext();
  const [, navigate] = useLocation();
  const [viewType, setViewType] = useState<ViewType>('kanban');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading] = useState(false);

  const { data: workflows } = trpc.workflows.list.useQuery();

  const filteredWorkflows = workflows?.filter((w) => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && w.isActive) ||
      (statusFilter === 'inactive' && !w.isActive);
    return matchesSearch && matchesStatus;
  }) || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'var(--color-red)';
      case 'Medium':
        return 'var(--color-orange)';
      case 'Low':
        return 'var(--color-blue)';
      default:
        return 'var(--color-gray)';
    }
  };

  const getPriorityDot = (priority: string) => {
    return (
      <span
        style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: getPriorityColor(priority),
          marginRight: '6px',
        }}
      />
    );
  };

  const WorkflowCard = ({ workflow }: { workflow: any }) => (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.backgroundColor = 'var(--bg-card-hover)';
        el.style.borderColor = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.backgroundColor = 'var(--bg-card)';
        el.style.borderColor = 'var(--border-subtle)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            {getPriorityDot('Medium')}
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginRight: '8px' }}>
              Saas
            </span>
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: 0, marginBottom: '4px' }}>
            {workflow.name}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0, marginBottom: '8px' }}>
            {workflow.description}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
            <span>📝 18</span>
            <span>💬 3</span>
            <span>⏱️ 4 days</span>
          </div>
        </div>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <MoreVertical size={16} />
        </button>
      </div>
      <div
        style={{
          marginTop: '12px',
          height: '3px',
          backgroundColor: 'var(--bg-progress)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: '70%',
            backgroundColor: 'var(--accent)',
            borderRadius: '2px',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
        <span>14 / 20</span>
        <div style={{ display: 'flex', position: 'relative', width: '60px', height: '20px' }}>
          {['DF', 'JD', 'MS'].map((initials, idx) => (
            <span
              key={idx}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: ['#4F46E5', '#10B981', '#F59E0B'][idx],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: 'white',
                fontWeight: 'bold',
                border: '2px solid var(--bg-card)',
                position: 'absolute',
                left: `${idx * 12}px`,
                zIndex: 3 - idx,
              }}
              title={initials}
            >
              {initials}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
        <span style={{ cursor: 'pointer', color: 'var(--accent)' }}>Project</span>
        <span>/</span>
        <span>Finance Dashboard</span>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: '8px' }}>
          Finance Dashboard
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: 0 }}>
          Bem-vindo, {user.name}
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '8px 12px',
            flex: 1,
            maxWidth: '300px',
          }}
        >
          <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Pesquisar workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              flex: 1,
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '8px 12px',
            color: 'var(--text-primary)',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>

        {/* View Type Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
          {[
            { type: 'kanban' as ViewType, icon: LayoutGrid, label: 'Kanban' },
            { type: 'list' as ViewType, icon: List, label: 'List' },
            { type: 'timeline' as ViewType, icon: Calendar, label: 'Timeline' },
            { type: 'table' as ViewType, icon: Table2, label: 'Table' },
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setViewType(type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                backgroundColor: viewType === type ? 'var(--bg-card)' : 'transparent',
                border: viewType === type ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: viewType === type ? 'var(--accent)' : 'var(--text-tertiary)',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.2s ease',
              }}
              title={label}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {viewType === 'kanban' && (
          <>
            {['To Do', 'In Progress', 'Done'].map((column) => (
              <div key={column}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>
                  {column}
                </h3>
                <div>
                  {filteredWorkflows.map((workflow) => (
                    <WorkflowCard key={workflow.id} workflow={workflow} />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {viewType === 'list' && (
          <div style={{ gridColumn: '1 / -1' }}>
            {filteredWorkflows.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        )}

        {viewType === 'timeline' && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredWorkflows.map((workflow, idx) => (
                <div
                  key={workflow.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    padding: '12px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.backgroundColor = 'var(--bg-card-hover)';
                    el.style.borderColor = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.backgroundColor = 'var(--bg-card)';
                    el.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  {/* Timeline dot */}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </div>
                  {/* Timeline content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{workflow.name}</span>
                      <PriorityBadge priority="low" />
                    </div>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginBottom: '6px' }}>
                      {workflow.description || 'No description'}
                    </p>
                    <div style={{ height: '3px', backgroundColor: 'var(--bg-progress)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '70%', backgroundColor: 'var(--accent)', borderRadius: '2px' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewType === 'table' && (
          <div style={{ gridColumn: '1 / -1', overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500' }}>Priority</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500' }}>Progress</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: '500' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkflows.map((workflow) => (
                  <tr 
                    key={workflow.id} 
                    style={{ 
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.backgroundColor = 'var(--bg-card-hover)';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{workflow.name}</td>
                    <td style={{ padding: '12px' }}>
                      <Badge variant={workflow.isActive ? 'success' : 'default'}>
                        {workflow.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <PriorityBadge priority="low" />
                    </td>
                    <td style={{ padding: '12px', width: '100px' }}>
                      <div style={{ height: '3px', backgroundColor: 'var(--bg-progress)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: '70%', backgroundColor: 'var(--accent)', borderRadius: '2px' }} />
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => navigate(`/editor/${workflow.id}`)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: 'var(--accent)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.backgroundColor = 'var(--accent-hover)';
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.backgroundColor = 'var(--accent)';
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
