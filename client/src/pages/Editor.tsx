import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Play } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { WorkflowEditor } from "@/components/WorkflowEditor";
import type { Node, Edge } from "reactflow";

export default function Editor() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { id } = useParams<{ id?: string }>();
  const [workflowName, setWorkflowName] = useState("Novo Workflow");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const workflowQuery = trpc.workflows.get.useQuery(
    { id: parseInt(id || "0") },
    { enabled: isAuthenticated && !!id }
  );

  const createWorkflowMutation = trpc.workflows.create.useMutation({
    onSuccess: () => {
      navigate("/");
    },
  });

  const updateWorkflowMutation = trpc.workflows.update.useMutation({
    onSuccess: () => {
      navigate("/");
    },
  });

  const executeWorkflowMutation = trpc.workflows.execute.useMutation();

  useEffect(() => {
    if (workflowQuery.data) {
      setWorkflowName(workflowQuery.data.name);
      setWorkflowDescription(workflowQuery.data.description || "");
      setNodes(workflowQuery.data.nodes || []);
      setEdges(workflowQuery.data.edges || []);
    }
  }, [workflowQuery.data]);

  const handleSave = async (updatedNodes: Node[], updatedEdges: Edge[]) => {
    setIsSaving(true);
    try {
      if (id) {
        await updateWorkflowMutation.mutateAsync({
          id: parseInt(id),
          name: workflowName,
          description: workflowDescription,
          nodes: updatedNodes,
          edges: updatedEdges,
        });
      } else {
        await createWorkflowMutation.mutateAsync({
          name: workflowName,
          description: workflowDescription,
          nodes: updatedNodes,
          edges: updatedEdges,
          trigger: "manual",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecute = async () => {
    if (id) {
      await executeWorkflowMutation.mutateAsync({ id: parseInt(id) });
    }
  };

  if (!isAuthenticated) {
    return <div>Acesso negado</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="border-b border-slate-200 bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            <Input
              value={workflowName}
              onChange={e => setWorkflowName(e.target.value)}
              className="text-2xl font-bold border-0 p-0 h-auto"
              placeholder="Nome do Workflow"
            />
            <Input
              value={workflowDescription}
              onChange={e => setWorkflowDescription(e.target.value)}
              className="text-sm text-slate-500 border-0 p-0 h-auto mt-1"
              placeholder="Descrição (opcional)"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave(nodes, edges)}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar
            </Button>
            {id && (
              <Button onClick={handleExecute}>
                <Play className="h-4 w-4 mr-2" />
                Executar
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <WorkflowEditor
          initialNodes={nodes}
          initialEdges={edges}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
