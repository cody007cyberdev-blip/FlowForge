import { useState, useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  Handle,
  Position,
  NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Play, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Custom node component with handles and config
function ConfigurableNode({ data, selected }: any) {
  return (
    <div
      className={`px-4 py-2 shadow-lg rounded-lg border-2 ${
        selected ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
      }`}
    >
      <div className="font-bold text-sm">{data.label}</div>
      <div className="text-xs text-gray-600 mt-1">{data.nodeType}</div>
      
      {data.hasInput && (
        <Handle type="target" position={Position.Left} style={{ background: "#555" }} />
      )}
      
      {data.hasOutput && (
        <Handle type="source" position={Position.Right} style={{ background: "#555" }} />
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  configurable: ConfigurableNode,
};

// Node registry
const nodeRegistry = {
  webhook: { label: "Webhook", nodeType: "Trigger", hasInput: false, hasOutput: true },
  schedule: { label: "Schedule", nodeType: "Trigger", hasInput: false, hasOutput: true },
  httpRequest: { label: "HTTP Request", nodeType: "Action", hasInput: true, hasOutput: true },
  sendEmail: { label: "Send Email", nodeType: "Action", hasInput: true, hasOutput: true },
  pdfGenerator: { label: "PDF Generator", nodeType: "Action", hasInput: true, hasOutput: true },
  slackalerts: { label: "Slack Alerts", nodeType: "Action", hasInput: true, hasOutput: true },
  conditional: { label: "Conditional", nodeType: "Logic", hasInput: true, hasOutput: true },
  transform: { label: "Transform", nodeType: "Data", hasInput: true, hasOutput: true },
  openai: { label: "OpenAI", nodeType: "Integration", hasInput: true, hasOutput: true },
  influxdb: { label: "InfluxDB", nodeType: "Integration", hasInput: true, hasOutput: true },
  elasticsearch: { label: "Elasticsearch", nodeType: "Integration", hasInput: true, hasOutput: true },
  logParser: { label: "Log Parser", nodeType: "Integration", hasInput: true, hasOutput: true },
  prometheus: { label: "Prometheus", nodeType: "Integration", hasInput: true, hasOutput: true },
  systemmetrics: { label: "System Metrics", nodeType: "Integration", hasInput: true, hasOutput: true },
  mqttsubscribe: { label: "MQTT Subscribe", nodeType: "Integration", hasInput: true, hasOutput: true },
  googlesheets: { label: "Google Sheets", nodeType: "Integration", hasInput: true, hasOutput: true },
  telegrambot: { label: "Telegram Bot", nodeType: "Integration", hasInput: true, hasOutput: true },
  financialapis: { label: "Financial APIs", nodeType: "Integration", hasInput: true, hasOutput: true },
  joinmerge: { label: "Join/Merge", nodeType: "Logic", hasInput: true, hasOutput: true },
  log: { label: "Log", nodeType: "Action", hasInput: true, hasOutput: false },
};

export function WorkflowEditorV3({ workflowId }: { workflowId?: number }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState("Novo Workflow");
  const [nodeConfigs, setNodeConfigs] = useState<Record<string, any>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const executeWorkflow = trpc.workflows.execute.useMutation();
  const saveWorkflow = trpc.workflows.create.useMutation();

  // Add node
  const addNode = useCallback(
    (nodeType: string) => {
      const nodeInfo = nodeRegistry[nodeType as keyof typeof nodeRegistry];
      if (!nodeInfo) return;

      const newNode: Node = {
        id: `${nodeType}-${Date.now()}`,
        data: { ...nodeInfo },
        position: { x: Math.random() * 250, y: Math.random() * 250 },
        type: "configurable",
      };

      setNodes((nds) => [...nds, newNode]);
      setNodeConfigs((cfg) => ({
        ...cfg,
        [newNode.id]: { type: nodeType, config: {} },
      }));
    },
    [setNodes]
  );

  // Connect nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  // Delete node
  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setNodeConfigs((cfg) => {
      const newCfg = { ...cfg };
      delete newCfg[nodeId];
      return newCfg;
    });
    setSelectedNode(null);
  };

  // Update node config
  const updateNodeConfig = (nodeId: string, newConfig: any) => {
    setNodeConfigs((cfg) => ({
      ...cfg,
      [nodeId]: { ...cfg[nodeId], config: newConfig },
    }));
  };

  // Execute workflow
  const handleExecute = async () => {
    if (nodes.length === 0) {
      toast.error("Adicione nodes ao workflow");
      return;
    }

    setIsExecuting(true);
    try {
      const result = await executeWorkflow.mutateAsync({
        nodes: nodes.map((n) => ({
          id: n.id,
          type: nodeConfigs[n.id]?.type,
          config: nodeConfigs[n.id]?.config,
          position: n.position,
        })),
        edges: edges.map((e) => ({
          source: e.source,
          target: e.target,
        })),
      } as any);

      setExecutionResult(result);
      toast.success("Workflow executado com sucesso!");
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // Save workflow
  const handleSave = async () => {
    if (!workflowName.trim()) {
      toast.error("Digite um nome para o workflow");
      return;
    }

    try {
      await saveWorkflow.mutateAsync({
        name: workflowName,
        description: "",
        nodes: nodes.map((n) => ({
          id: n.id,
          type: nodeConfigs[n.id]?.type,
          config: nodeConfigs[n.id]?.config,
          position: n.position,
        })),
        edges: edges.map((e) => ({
          source: e.source,
          target: e.target,
        })),
        trigger: "manual",
      });

      toast.success("Workflow salvo com sucesso!");
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  const selectedNodeData = selectedNode ? nodeConfigs[selectedNode] : null;

  return (
    <div className="flex h-screen gap-4 p-4 bg-gray-50">
      {/* Sidebar */}
      <div className="w-48 bg-white rounded-lg shadow p-4 overflow-y-auto">
        <h3 className="font-bold mb-4">Nodes Disponíveis</h3>

        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">TRIGGERS</p>
          {["webhook", "schedule"].map((type) => (
            <Button
              key={type}
              onClick={() => addNode(type)}
              variant="outline"
              className="w-full justify-start mb-2 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              {nodeRegistry[type as keyof typeof nodeRegistry].label}
            </Button>
          ))}
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">ACTIONS</p>
          {["httpRequest", "sendEmail", "pdfGenerator", "slackalerts", "log"].map((type) => (
            <Button
              key={type}
              onClick={() => addNode(type)}
              variant="outline"
              className="w-full justify-start mb-2 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              {nodeRegistry[type as keyof typeof nodeRegistry].label}
            </Button>
          ))}
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">LOGIC</p>
          {["conditional", "joinmerge"].map((type) => (
            <Button
              key={type}
              onClick={() => addNode(type)}
              variant="outline"
              className="w-full justify-start mb-2 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              {nodeRegistry[type as keyof typeof nodeRegistry].label}
            </Button>
          ))}
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">DATA</p>
          {["transform"].map((type) => (
            <Button
              key={type}
              onClick={() => addNode(type)}
              variant="outline"
              className="w-full justify-start mb-2 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              {nodeRegistry[type as keyof typeof nodeRegistry].label}
            </Button>
          ))}
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">INTEGRATIONS</p>
          {["openai", "influxdb", "elasticsearch", "logParser", "prometheus", "systemmetrics", "mqttsubscribe", "googlesheets", "telegrambot", "financialapis"].map((type) => (
            <Button
              key={type}
              onClick={() => addNode(type)}
              variant="outline"
              className="w-full justify-start mb-2 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              {nodeRegistry[type as keyof typeof nodeRegistry].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
        <ReactFlow
          nodes={nodes.map((n) => ({ ...n, selected: n.id === selectedNode }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNode(node.id)}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {/* Right Panel */}
      <div className="w-80 bg-white rounded-lg shadow p-4 overflow-y-auto flex flex-col">
        <div className="mb-4 pb-4 border-b">
          <Label className="text-sm font-semibold">Nome do Workflow</Label>
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="mt-2"
            placeholder="Ex: Enviar email automático"
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave} size="sm" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button onClick={handleExecute} size="sm" variant="default" className="flex-1" disabled={isExecuting}>
              <Play className="w-4 h-4 mr-2" />
              {isExecuting ? "Executando..." : "Executar"}
            </Button>
          </div>
        </div>

        {selectedNode && selectedNodeData ? (
          <div className="flex-1">
            <h3 className="font-bold mb-4">Configuração do Node</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Tipo</Label>
                <p className="text-sm bg-gray-100 p-2 rounded mt-1">{selectedNodeData.type}</p>
              </div>

              {selectedNodeData.type === "httpRequest" && (
                <>
                  <div>
                    <Label className="text-xs">URL</Label>
                    <Input
                      placeholder="https://api.example.com"
                      value={selectedNodeData.config?.url || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, url: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Método</Label>
                    <select
                      value={selectedNodeData.config?.method || "GET"}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, method: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                    >
                      <option>GET</option>
                      <option>POST</option>
                      <option>PUT</option>
                      <option>DELETE</option>
                    </select>
                  </div>
                </>
              )}

              {selectedNodeData.type === "sendEmail" && (
                <>
                  <div>
                    <Label className="text-xs">Para</Label>
                    <Input
                      placeholder="email@example.com"
                      value={selectedNodeData.config?.to || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, to: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Assunto</Label>
                    <Input
                      placeholder="Assunto do email"
                      value={selectedNodeData.config?.subject || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, subject: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              {selectedNodeData.type === "pdfGenerator" && (
                <>
                  <div>
                    <Label className="text-xs">Conteúdo HTML</Label>
                    <textarea
                      placeholder="<h1>Relatório</h1>"
                      value={selectedNodeData.config?.html || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, html: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Formato</Label>
                    <select
                      value={selectedNodeData.config?.format || "A4"}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, format: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                    >
                      <option>A4</option>
                      <option>Letter</option>
                      <option>A3</option>
                    </select>
                  </div>
                </>
              )}

              {selectedNodeData.type === "influxdb" && (
                <>
                  <div>
                    <Label className="text-xs">URL</Label>
                    <Input
                      placeholder="http://localhost:8086"
                      value={selectedNodeData.config?.url || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, url: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Token</Label>
                    <Input
                      type="password"
                      placeholder="API Token"
                      value={selectedNodeData.config?.token || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, token: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Operação</Label>
                    <select
                      value={selectedNodeData.config?.operation || "query"}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, operation: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                    >
                      <option value="query">Query</option>
                      <option value="write">Write</option>
                    </select>
                  </div>
                </>
              )}

              {selectedNodeData.type === "elasticsearch" && (
                <>
                  <div>
                    <Label className="text-xs">Node URL</Label>
                    <Input
                      placeholder="http://localhost:9200"
                      value={selectedNodeData.config?.node || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, node: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Índice</Label>
                    <Input
                      placeholder="logs"
                      value={selectedNodeData.config?.index || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, index: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Operação</Label>
                    <select
                      value={selectedNodeData.config?.operation || "search"}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, operation: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                    >
                      <option value="search">Search</option>
                      <option value="index">Index</option>
                      <option value="delete">Delete</option>
                    </select>
                  </div>
                </>
              )}

              {selectedNodeData.type === "logParser" && (
                <>
                  <div>
                    <Label className="text-xs">Formato</Label>
                    <select
                      value={selectedNodeData.config?.format || "json"}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, format: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                    >
                      <option value="json">JSON</option>
                      <option value="regex">Regex</option>
                      <option value="csv">CSV</option>
                      <option value="apache">Apache</option>
                      <option value="nginx">Nginx</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Agregação</Label>
                    <select
                      value={selectedNodeData.config?.aggregation || "none"}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, aggregation: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                    >
                      <option value="none">None</option>
                      <option value="count">Count</option>
                      <option value="sum">Sum</option>
                      <option value="avg">Average</option>
                    </select>
                  </div>
                </>
              )}

              {selectedNodeData.type === "prometheus" && (
                <>
                  <div>
                    <Label className="text-xs">Prometheus URL</Label>
                    <Input
                      placeholder="http://localhost:9090"
                      value={selectedNodeData.config?.url || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, url: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Operação</Label>
                    <select
                      value={selectedNodeData.config?.operation || "query"}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, operation: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                    >
                      <option value="query">Query</option>
                      <option value="range">Range</option>
                      <option value="targets">Targets</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">PromQL Query</Label>
                    <textarea
                      placeholder='up{job="prometheus"}'
                      value={selectedNodeData.config?.query || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, query: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                      rows={2}
                    />
                  </div>
                </>
              )}

              {selectedNodeData.type === "systemmetrics" && (
                <>
                  <div>
                    <Label className="text-xs">Métricas</Label>
                    <textarea
                      placeholder='["cpu", "memory", "disk"]'
                      value={selectedNodeData.config?.metrics || "[]"}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, metrics: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Intervalo (ms)</Label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={selectedNodeData.config?.interval || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, interval: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              {selectedNodeData.type === "slackalerts" && (
                <>
                  <div>
                    <Label className="text-xs">Webhook URL</Label>
                    <Input
                      type="password"
                      placeholder="https://hooks.slack.com/services/..."
                      value={selectedNodeData.config?.webhookUrl || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, webhookUrl: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Mensagem</Label>
                    <textarea
                      placeholder="Alert message"
                      value={selectedNodeData.config?.message || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, message: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Severidade</Label>
                    <select
                      value={selectedNodeData.config?.severity || "info"}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, severity: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </>
              )}

              {selectedNodeData.type === "mqttsubscribe" && (
                <>
                  <div>
                    <Label className="text-xs">Broker URL</Label>
                    <Input
                      placeholder="mqtt://localhost:1883"
                      value={selectedNodeData.config?.brokerUrl || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, brokerUrl: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Tópico</Label>
                    <Input
                      placeholder="sensor/+/data"
                      value={selectedNodeData.config?.topic || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, topic: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">QoS</Label>
                    <select
                      value={selectedNodeData.config?.qos || "1"}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, qos: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                    >
                      <option value="0">0 - At most once</option>
                      <option value="1">1 - At least once</option>
                      <option value="2">2 - Exactly once</option>
                    </select>
                  </div>
                </>
              )}

              {selectedNodeData.type === "openai" && (
                <>
                  <div>
                    <Label className="text-xs">Modelo</Label>
                    <select
                      value={selectedNodeData.config?.model || "gpt-4"}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, model: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                    >
                      <option>gpt-4</option>
                      <option>gpt-3.5-turbo</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Prompt</Label>
                    <textarea
                      placeholder="Digite seu prompt..."
                      value={selectedNodeData.config?.prompt || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, prompt: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {selectedNodeData.type === "googlesheets" && (
                <>
                  <div>
                    <Label className="text-xs">Spreadsheet ID</Label>
                    <Input
                      placeholder="1a2b3c4d5e6f"
                      value={selectedNodeData.config?.spreadsheetId || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, spreadsheetId: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Sheet Name</Label>
                    <Input
                      placeholder="Sheet1"
                      value={selectedNodeData.config?.sheetName || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, sheetName: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Operation</Label>
                    <select
                      value={selectedNodeData.config?.operation || "read"}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, operation: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                    >
                      <option value="read">Read</option>
                      <option value="write">Write</option>
                      <option value="append">Append</option>
                    </select>
                  </div>
                </>
              )}

              {selectedNodeData.type === "telegrambot" && (
                <>
                  <div>
                    <Label className="text-xs">Bot Token</Label>
                    <Input
                      type="password"
                      placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                      value={selectedNodeData.config?.botToken || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, botToken: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Chat ID</Label>
                    <Input
                      placeholder="123456789"
                      value={selectedNodeData.config?.chatId || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, chatId: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Message</Label>
                    <textarea
                      placeholder="Your message here"
                      value={selectedNodeData.config?.message || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, message: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                      rows={2}
                    />
                  </div>
                </>
              )}

              {selectedNodeData.type === "financialapis" && (
                <>
                  <div>
                    <Label className="text-xs">Provider</Label>
                    <select
                      value={selectedNodeData.config?.provider || "binance"}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, provider: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                    >
                      <option value="alpha-vantage">Alpha Vantage (Stocks)</option>
                      <option value="binance">Binance (Crypto)</option>
                      <option value="coinmarketcap">CoinMarketCap (Crypto)</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Symbol</Label>
                    <Input
                      placeholder="AAPL or BTCUSDT"
                      value={selectedNodeData.config?.symbol || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, symbol: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">API Key (if required)</Label>
                    <Input
                      type="password"
                      placeholder="Your API key"
                      value={selectedNodeData.config?.apiKey || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, apiKey: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              {selectedNodeData.type === "joinmerge" && (
                <>
                  <div>
                    <Label className="text-xs">Mode</Label>
                    <select
                      value={selectedNodeData.config?.mode || "merge"}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, mode: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                    >
                      <option value="merge">Merge</option>
                      <option value="join">Join</option>
                      <option value="concat">Concat</option>
                      <option value="aggregate">Aggregate</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Join Key (for join mode)</Label>
                    <Input
                      placeholder="id"
                      value={selectedNodeData.config?.joinKey || ""}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, joinKey: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Aggregation</Label>
                    <select
                      value={selectedNodeData.config?.aggregation || "all"}
                      onChange={(e) =>
                        updateNodeConfig(selectedNode, { ...selectedNodeData.config, aggregation: e.target.value })
                      }
                      className="w-full mt-1 border rounded px-2 py-1 text-sm"
                    >
                      <option value="first">First</option>
                      <option value="last">Last</option>
                      <option value="all">All</option>
                      <option value="count">Count</option>
                    </select>
                  </div>
                </>
              )}

              <Button
                onClick={() => deleteNode(selectedNode)}
                variant="destructive"
                size="sm"
                className="w-full mt-4"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar Node
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p className="text-sm">Selecione um node para configurar</p>
          </div>
        )}

        {executionResult && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-bold mb-2 text-sm">Resultado da Execução</h3>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3">
                <p className="text-xs text-green-800">
                  {typeof executionResult === "string" ? executionResult : JSON.stringify(executionResult, null, 2)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
