import React, { useState, useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import { useEffect } from "react";

// Suppress ResizeObserver loop error
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (args[0]?.includes?.("ResizeObserver loop completed")) {
      return;
    }
    originalError(...args);
  };
}
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Search, ChevronDown } from "lucide-react";

// Node registry with categories
const nodeCategories = {
  triggers: {
    label: "Triggers",
    color: "bg-green-50 border-green-200",
    nodes: ["webhook", "schedule"],
  },
  actions: {
    label: "Actions",
    color: "bg-blue-50 border-blue-200",
    nodes: ["httpRequest", "sendEmail", "sendTelegram", "log"],
  },
  logic: {
    label: "Logic",
    color: "bg-purple-50 border-purple-200",
    nodes: ["conditional", "switch"],
  },
  data: {
    label: "Data",
    color: "bg-orange-50 border-orange-200",
    nodes: ["transform", "merge", "split"],
  },
  integrations: {
    label: "Integrations",
    color: "bg-indigo-50 border-indigo-200",
    nodes: ["openai", "database", "googleSheets", "slack"],
  },
  iot: {
    label: "IoT",
    color: "bg-cyan-50 border-cyan-200",
    nodes: ["mqtt", "httpDevice"],
  },
  advanced: {
    label: "Advanced",
    color: "bg-yellow-50 border-yellow-200",
    nodes: ["pythonScript", "javascript", "delay", "retry"],
  },
};

const nodeMetadata: Record<string, { label: string; color: string; icon: string }> = {
  webhook: { label: "Webhook", color: "bg-green-100 border-green-300", icon: "⚡" },
  schedule: { label: "Schedule", color: "bg-green-100 border-green-300", icon: "🕐" },
  httpRequest: { label: "HTTP Request", color: "bg-blue-100 border-blue-300", icon: "🌐" },
  sendEmail: { label: "Send Email", color: "bg-blue-100 border-blue-300", icon: "📧" },
  sendTelegram: { label: "Send Telegram", color: "bg-blue-100 border-blue-300", icon: "💬" },
  log: { label: "Log", color: "bg-blue-100 border-blue-300", icon: "📝" },
  conditional: { label: "Conditional", color: "bg-purple-100 border-purple-300", icon: "🔀" },
  switch: { label: "Switch", color: "bg-purple-100 border-purple-300", icon: "🔀" },
  transform: { label: "Transform", color: "bg-orange-100 border-orange-300", icon: "🔄" },
  merge: { label: "Merge", color: "bg-orange-100 border-orange-300", icon: "🔀" },
  split: { label: "Split", color: "bg-orange-100 border-orange-300", icon: "✂️" },
  openai: { label: "OpenAI", color: "bg-purple-100 border-purple-400", icon: "🤖" },
  database: { label: "Database", color: "bg-indigo-100 border-indigo-300", icon: "🗄️" },
  googleSheets: { label: "Google Sheets", color: "bg-indigo-100 border-indigo-300", icon: "📊" },
  slack: { label: "Slack", color: "bg-indigo-100 border-indigo-300", icon: "💬" },
  mqtt: { label: "MQTT", color: "bg-cyan-100 border-cyan-300", icon: "📡" },
  httpDevice: { label: "HTTP Device", color: "bg-cyan-100 border-cyan-300", icon: "🔌" },
  pythonScript: { label: "Python", color: "bg-yellow-100 border-yellow-300", icon: "🐍" },
  javascript: { label: "JavaScript", color: "bg-yellow-100 border-yellow-300", icon: "⚙️" },
  delay: { label: "Delay", color: "bg-yellow-100 border-yellow-300", icon: "⏱️" },
  retry: { label: "Retry", color: "bg-yellow-100 border-yellow-300", icon: "🔁" },
};

const CustomNode = ({ data, selected }: any) => {
  const meta = nodeMetadata[data.type] || { label: data.type, color: "bg-gray-100", icon: "?" };
  return (
    <div
      className={`px-3 py-2 rounded-lg border-2 ${meta.color} ${
        selected ? "ring-2 ring-blue-500" : ""
      } min-w-[120px] text-center`}
    >
      <div className="text-2xl mb-1">{meta.icon}</div>
      <div className="font-semibold text-sm">{meta.label}</div>
      <div className="text-xs text-gray-500">{data.label}</div>
    </div>
  );
};

interface WorkflowEditorV2Props {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
}

export function WorkflowEditorV2({ initialNodes = [], initialEdges = [], onSave }: WorkflowEditorV2Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeConfig, setNodeConfig] = useState<Record<string, unknown>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(nodeCategories))
  );
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges(eds => addEdge(connection, eds));
    },
    [setEdges]
  );

  const addNode = (type: string, position?: { x: number; y: number }) => {
    const meta = nodeMetadata[type] || { label: type };
    const newNode: Node = {
      id: `node-${Date.now()}`,
      data: { label: meta.label, type },
      position: position || { x: Math.random() * 400, y: Math.random() * 400 },
      type: "default",
    };
    setNodes(nds => [...nds, newNode]);
  };

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    setDraggedNode(nodeType);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropOnCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedNode) return;

    // Get canvas position relative to viewport
    const canvasElement = (e.target as HTMLElement).closest("[class*='react-flow']");
    if (!canvasElement) return;

    const rect = canvasElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    addNode(draggedNode, { x, y });
    setDraggedNode(null);
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  };

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
    setNodeConfig(node.data || {});
  };

  const updateNodeConfig = (key: string, value: unknown) => {
    const updated = { ...nodeConfig, [key]: value };
    setNodeConfig(updated);
    if (selectedNode) {
      setNodes(nds =>
        nds.map(n => (n.id === selectedNode.id ? { ...n, data: { ...n.data, ...updated } } : n))
      );
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = useMemo(() => {
    const result: Record<string, string[]> = {};
    Object.entries(nodeCategories).forEach(([category, { nodes: categoryNodes }]) => {
      const filtered = categoryNodes.filter(nodeId => {
        const meta = nodeMetadata[nodeId];
        return meta && meta.label.toLowerCase().includes(searchQuery.toLowerCase());
      });
      if (filtered.length > 0) {
        result[category] = filtered;
      }
    });
    return result;
  }, [searchQuery]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 h-screen bg-gray-50">
      {/* Sidebar - Node Library */}
      <div className="lg:col-span-1 border-r border-gray-300 bg-white overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="font-bold text-lg mb-3">Nodes</h3>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 py-2"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {Object.entries(filteredCategories).map(([category, nodes]) => (
            <div key={category} className="border-b border-gray-100">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 font-semibold text-sm"
              >
                <span>{nodeCategories[category as keyof typeof nodeCategories].label}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expandedCategories.has(category) ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedCategories.has(category) && (
                <div className="px-2 py-2 space-y-1 bg-gray-50">
                  {nodes.map(nodeId => {
                    const meta = nodeMetadata[nodeId];
                    return (
                      <Button
                        key={nodeId}
                        variant="outline"
                        className={`w-full justify-start text-left h-auto py-2 px-3 ${meta.color} cursor-move`}
                        onClick={() => addNode(nodeId)}
                        onDragStart={(e) => handleDragStart(e as any, nodeId)}
                        draggable
                      >
                        <span className="text-lg mr-2">{meta.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{meta.label}</div>
                        </div>
                        <Plus className="h-4 w-4" />
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div
        className="lg:col-span-3 bg-gray-100 relative"
        onDragOver={handleDragOver}
        onDrop={handleDropOnCanvas}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => handleNodeClick(node)}
          nodeTypes={{ default: CustomNode }}
          fitView
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {/* Properties Panel */}
      <div className="lg:col-span-1 border-l border-gray-300 bg-white overflow-y-auto flex flex-col">
        {selectedNode ? (
          <Card className="m-4 border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{selectedNode.data.label}</CardTitle>
              <CardDescription className="text-xs">{selectedNode.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm">Name</Label>
                <Input
                  value={selectedNode.data.label}
                  onChange={e => updateNodeConfig("label", e.target.value)}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <Label className="text-sm">Type</Label>
                <Input value={selectedNode.data.type} disabled className="mt-1 text-sm bg-gray-50" />
              </div>

              {selectedNode.data.type === "httpRequest" && (
                <>
                  <div>
                    <Label className="text-sm">URL</Label>
                    <Input
                      placeholder="https://api.example.com"
                      value={(nodeConfig.url as string) || ""}
                      onChange={e => updateNodeConfig("url", e.target.value)}
                      className="mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Method</Label>
                    <select
                      value={(nodeConfig.method as string) || "GET"}
                      onChange={e => updateNodeConfig("method", e.target.value)}
                      className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option>GET</option>
                      <option>POST</option>
                      <option>PUT</option>
                      <option>DELETE</option>
                    </select>
                  </div>
                </>
              )}

              {selectedNode.data.type === "conditional" && (
                <div>
                  <Label className="text-sm">Condition</Label>
                  <textarea
                    placeholder="input.status === 'success'"
                    value={(nodeConfig.condition as string) || ""}
                    onChange={e => updateNodeConfig("condition", e.target.value)}
                    className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    rows={3}
                  />
                </div>
              )}

              {selectedNode.data.type === "openai" && (
                <>
                  <div>
                    <Label className="text-sm">API Key</Label>
                    <Input
                      type="password"
                      placeholder="sk-..."
                      value={(nodeConfig.apiKey as string) || ""}
                      onChange={e => updateNodeConfig("apiKey", e.target.value)}
                      className="mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Model</Label>
                    <select
                      value={(nodeConfig.model as string) || "gpt-4"}
                      onChange={e => updateNodeConfig("model", e.target.value)}
                      className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm">Prompt</Label>
                    <textarea
                      placeholder="Your prompt..."
                      value={(nodeConfig.prompt as string) || ""}
                      onChange={e => updateNodeConfig("prompt", e.target.value)}
                      className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      rows={2}
                    />
                  </div>
                </>
              )}

              <Button
                variant="destructive"
                size="sm"
                className="w-full mt-4"
                onClick={() => deleteNode(selectedNode.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p className="text-sm">Select a node to edit</p>
          </div>
        )}

        <div className="p-4 border-t border-gray-200">
          <Button className="w-full" onClick={() => onSave?.(nodes, edges)}>
            Save Workflow
          </Button>
        </div>
      </div>
    </div>
  );
}
