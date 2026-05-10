import React, { useCallback, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";

interface WorkflowEditorProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
}

const nodeTypes = {
  trigger: { label: "Webhook", color: "bg-green-100 border-green-300" },
  action: { label: "HTTP Request", color: "bg-blue-100 border-blue-300" },
  logic: { label: "Condicional", color: "bg-purple-100 border-purple-300" },
  data: { label: "Transformar", color: "bg-orange-100 border-orange-300" },
};

const CustomNode = ({ data, selected }: any) => {
  return (
    <div
      className={`px-4 py-2 rounded-lg border-2 ${
        nodeTypes[data.type as keyof typeof nodeTypes]?.color || "bg-gray-100 border-gray-300"
      } ${selected ? "ring-2 ring-blue-500" : ""}`}
    >
      <div className="font-semibold text-sm">{data.label}</div>
      <div className="text-xs text-gray-600">{data.type}</div>
    </div>
  );
};

export function WorkflowEditor({ initialNodes = [], initialEdges = [], onSave }: WorkflowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeConfig, setNodeConfig] = useState<Record<string, unknown>>({});

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges(eds => addEdge(connection, eds));
    },
    [setEdges]
  );

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      data: { label: nodeTypes[type as keyof typeof nodeTypes]?.label || type, type },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      type: "default",
    };
    setNodes(nds => [...nds, newNode]);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-screen">
      {/* Sidebar - Node Library */}
      <div className="lg:col-span-1 border-r border-slate-200 bg-white p-4 overflow-y-auto">
        <h3 className="font-semibold mb-4">Nodes Disponíveis</h3>
        <div className="space-y-2">
          {Object.entries(nodeTypes).map(([key, { label, color }]) => (
            <Button
              key={key}
              variant="outline"
              className={`w-full justify-start ${color}`}
              onClick={() => addNode(key)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="lg:col-span-2 bg-slate-50 relative">
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
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {/* Properties Panel */}
      <div className="lg:col-span-1 border-l border-slate-200 bg-white p-4 overflow-y-auto">
        {selectedNode ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{selectedNode.data.label}</CardTitle>
              <CardDescription>{selectedNode.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={selectedNode.data.label}
                  onChange={e => updateNodeConfig("label", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Tipo</Label>
                <Input value={selectedNode.data.type} disabled className="mt-1" />
              </div>

              {selectedNode.data.type === "action" && (
                <>
                  <div>
                    <Label>URL</Label>
                    <Input
                      placeholder="https://api.example.com/endpoint"
                      value={(nodeConfig.url as string) || ""}
                      onChange={e => updateNodeConfig("url", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Método</Label>
                    <select
                      value={(nodeConfig.method as string) || "GET"}
                      onChange={e => updateNodeConfig("method", e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md"
                    >
                      <option>GET</option>
                      <option>POST</option>
                      <option>PUT</option>
                      <option>DELETE</option>
                    </select>
                  </div>
                </>
              )}

              {selectedNode.data.type === "logic" && (
                <div>
                  <Label>Condição</Label>
                  <textarea
                    placeholder="input.status === 'success'"
                    value={(nodeConfig.condition as string) || ""}
                    onChange={e => updateNodeConfig("condition", e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
                    rows={4}
                  />
                </div>
              )}

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => deleteNode(selectedNode.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Node
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center text-slate-500 py-8">
            <p>Selecione um node para editar</p>
          </div>
        )}

        <Button className="w-full mt-4" onClick={() => onSave?.(nodes, edges)}>
          Guardar Workflow
        </Button>
      </div>
    </div>
  );
}
