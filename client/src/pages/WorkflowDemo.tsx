import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, AlertCircle, CheckCircle, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { PremiumButton } from "@/components/PremiumComponents";

interface WorkflowNode {
  id: string;
  name: string;
  type: "trigger" | "processor" | "output";
  status: "idle" | "running" | "success" | "error";
  progress: number;
  duration: number;
  message?: string;
}

interface WorkflowEdge {
  from: string;
  to: string;
}

const DEMO_WORKFLOW: { nodes: WorkflowNode[]; edges: WorkflowEdge[] } = {
  nodes: [
    {
      id: "trigger-1",
      name: "Trigger: Schedule",
      type: "trigger",
      status: "idle",
      progress: 0,
      duration: 0,
    },
    {
      id: "processor-1",
      name: "OpenAI: Generate Report",
      type: "processor",
      status: "idle",
      progress: 0,
      duration: 3000,
    },
    {
      id: "processor-2",
      name: "PDF: Convert HTML",
      type: "processor",
      status: "idle",
      progress: 0,
      duration: 2000,
    },
    {
      id: "output-1",
      name: "Email: Send Report",
      type: "output",
      status: "idle",
      progress: 0,
      duration: 1500,
    },
  ],
  edges: [
    { from: "trigger-1", to: "processor-1" },
    { from: "processor-1", to: "processor-2" },
    { from: "processor-2", to: "output-1" },
  ],
};

export default function WorkflowDemo() {
  const [nodes, setNodes] = useState<WorkflowNode[]>(DEMO_WORKFLOW.nodes);
  const [isRunning, setIsRunning] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const { success, error, info, warning } = useNotificationContext();

  const executeWorkflow = async () => {
    setIsRunning(true);
    setCurrentNodeIndex(0);

      info("Workflow", "🚀 Iniciado!");

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      setCurrentNodeIndex(i);

      // Update node status to running
      setNodes((prev) =>
        prev.map((n) => (n.id === node.id ? { ...n, status: "running", progress: 0 } : n))
      );

      info("Executando", `⏳ ${node.name}`);

      // Simulate execution with progress
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / node.duration) * 100, 100);

        setNodes((prev) =>
          prev.map((n) =>
            n.id === node.id ? { ...n, progress: Math.round(progress) } : n
          )
        );

        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 100);

      // Wait for node execution
      await new Promise((resolve) => setTimeout(resolve, node.duration));

      // Simulate random success/error (90% success rate)
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === node.id
              ? { ...n, status: "success", progress: 100, message: "Concluído com sucesso" }
              : n
          )
        );
        success("Sucesso", `✅ ${node.name} concluído`);
      } else {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === node.id
              ? { ...n, status: "error", progress: 0, message: "Erro na execução" }
              : n
          )
        );
        error("Erro", `❌ ${node.name} falhou`);
        setIsRunning(false);
        return;
      }

      // Add delay between nodes
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    success("Completo", "🎉 Workflow concluído com sucesso!");
    setIsRunning(false);
  };

  const resetWorkflow = () => {
    setNodes(DEMO_WORKFLOW.nodes);
    setCurrentNodeIndex(0);
    setIsRunning(false);
    info("Reset", "🔄 Workflow resetado");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-blue-500/20 border-blue-500/50";
      case "success":
        return "bg-emerald-500/20 border-emerald-500/50";
      case "error":
        return "bg-red-500/20 border-red-500/50";
      default:
        return "bg-slate-700/20 border-slate-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Zap className="w-5 h-5 text-blue-400 animate-pulse" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Demonstração de Workflow</h1>
        <p className="text-slate-400">
          Veja como os nodes são executados em sequência com notificações em tempo real
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-8">
        <PremiumButton
          onClick={executeWorkflow}
          disabled={isRunning}
          variant="primary"
        >
          <Play className="w-4 h-4" />
          Executar Workflow
        </PremiumButton>
        <PremiumButton
          onClick={resetWorkflow}
          disabled={isRunning}
          variant="secondary"
        >
          <RotateCcw className="w-4 h-4" />
          Resetar
        </PremiumButton>
      </div>

      {/* Workflow Visualization */}
      <Card className="backdrop-blur-md bg-white/5 border border-white/10 mb-8">
        <CardHeader>
          <CardTitle>Fluxo de Execução</CardTitle>
          <CardDescription>Visualização dos nodes em execução</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nodes.map((node, index) => (
              <div key={node.id}>
                <div
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-300
                    ${getStatusColor(node.status)}
                  `}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(node.status)}
                      <div>
                        <h3 className="font-semibold text-white">{node.name}</h3>
                        {node.message && (
                          <p className="text-xs text-slate-300 mt-1">{node.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{node.progress}%</p>
                      <p className="text-xs text-slate-400">
                        {node.duration / 1000}s
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        node.status === "success"
                          ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                          : node.status === "error"
                          ? "bg-gradient-to-r from-red-400 to-red-600"
                          : node.status === "running"
                          ? "bg-gradient-to-r from-blue-400 to-blue-600"
                          : "bg-slate-600"
                      }`}
                      style={{ width: `${node.progress}%` }}
                    />
                  </div>
                </div>

                {/* Arrow between nodes */}
                {index < nodes.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="w-1 h-8 bg-gradient-to-b from-slate-500/50 to-slate-500/20 rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="backdrop-blur-md bg-white/5 border border-white/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Total de Nodes</p>
              <p className="text-3xl font-bold text-white">{nodes.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-white/5 border border-white/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Concluídos</p>
              <p className="text-3xl font-bold text-emerald-400">
                {nodes.filter((n) => n.status === "success").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-white/5 border border-white/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Erros</p>
              <p className="text-3xl font-bold text-red-400">
                {nodes.filter((n) => n.status === "error").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-white/5 border border-white/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Tempo Total</p>
              <p className="text-3xl font-bold text-blue-400">
                {(nodes.reduce((sum, n) => sum + n.duration, 0) / 1000).toFixed(1)}s
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
