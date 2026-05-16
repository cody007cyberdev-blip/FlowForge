import React, { useState } from 'react';
import { Button, Card, Badge, Input } from '@/components/DesignSystemComponents';
import { Search, Star, Download, ChevronRight } from 'lucide-react';

export default function MarketplaceRedesigned() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['All', 'Integration', 'Automation', 'Analytics', 'AI'];

  const templates = [
    {
      id: 1,
      name: 'Email Marketing Automation',
      description: 'Automate email campaigns with segmentation and analytics',
      category: 'Automation',
      rating: 4.8,
      downloads: 1234,
      author: 'FlowForge Team',
      icon: '📧',
    },
    {
      id: 2,
      name: 'Data Pipeline ETL',
      description: 'Extract, transform, and load data from multiple sources',
      category: 'Integration',
      rating: 4.9,
      downloads: 2456,
      author: 'Community',
      icon: '📊',
    },
    {
      id: 3,
      name: 'AI Content Generator',
      description: 'Generate content using OpenAI with custom prompts',
      category: 'AI',
      rating: 4.7,
      downloads: 3456,
      author: 'FlowForge Team',
      icon: '🤖',
    },
    {
      id: 4,
      name: 'Slack Notifications',
      description: 'Send rich notifications to Slack channels',
      category: 'Integration',
      rating: 4.6,
      downloads: 1890,
      author: 'Community',
      icon: '💬',
    },
  ];

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: '8px' }}>
          Marketplace
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: 0 }}>
          Discover and install workflow templates and integrations
        </p>
      </div>

      {/* Search and Filter */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {/* Categories */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat.toLowerCase() ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedCategory(cat.toLowerCase())}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filteredTemplates.map((template) => (
          <Card key={template.id} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Icon and Title */}
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <div style={{ fontSize: '32px' }}>{template.icon}</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: '4px' }}>
                  {template.name}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>
                  {template.description}
                </p>
              </div>
            </div>

            {/* Category and Rating */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Badge variant="default">{template.category}</Badge>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                <Star size={14} fill="currentColor" />
                {template.rating}
              </div>
            </div>

            {/* Author and Downloads */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-tertiary)' }}>
              <span>By {template.author}</span>
              <span>{template.downloads.toLocaleString()} downloads</span>
            </div>

            {/* Action Button */}
            <Button variant="primary" size="sm" style={{ width: '100%' }}>
              <Download size={14} />
              Install
            </Button>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card style={{ padding: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
            No templates found. Try adjusting your search or filters.
          </p>
        </Card>
      )}
    </div>
  );
}
