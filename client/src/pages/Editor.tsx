import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Play, Settings } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";

export default function Editor() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { id } = useParams<{ id?: string }>();
  const [workflowName, setWorkflowName] = useState("Novo Workflow");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  const workflowQuery = trpc.workflows.get.useQuery(
    { id: parseInt(id || "0") },
    { enabled: isAuthenticated && !!id }
  );

  const createWorkflowMutation = trpc.workflows.create.useMutation({
    onSuccess: (data: any) => {
      navigate(`/editor/${data.id}`);
    },
  });

  const updateWorkflowMutation = trpc.workflows.update.useMutation();
  const executeWorkflowMutation = trpc.workflows.execute.useMutation();

  useEffect(() => {
    if (workflowQuery.data) {
      setWorkflowName(workflowQuery.data.name);
      setWorkflowDescription(workflowQuery.data.description || "");
      setNodes(workflowQuery.data.nodes || []);
      setEdges(workflowQuery.data.edges || []);
    }
  }, [workflowQuery.data]);

  const handleSave = async () => {
    if (id) {
      await updateWorkflowMutation.mutateAsync({
        id: parseInt(id),
        name: workflowName,
        description: workflowDescription,
        nodes,
        edges,
      });
    } else {
      await createWorkflowMutation.mutateAsync({
        name: workflowName,
        description: workflowDescription,
        nodes,
        edges,
        trigger: "manual",
      });
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
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
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
              <Button variant="outline" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
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
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nodes</CardTitle>
                <CardDescription>Arraste para o canvas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded cursor-move hover:bg-blue-100">
                    HTTP Request
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded cursor-move hover:bg-green-100">
                    Webhook
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded cursor-move hover:bg-purple-100">
                    Condicional
                  </div>
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded cursor-move hover:bg-orange-100">
                    Transformar
                  </div>
                  <div className="p-3 bg-red-50 border border-red-200 rounded cursor-move hover:bg-red-100">
                    Email
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Canvas</CardTitle>
                <CardDescription>Editor visual de workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-96 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-slate-500 mb-2">Arraste nodes aqui para começar</p>
                    <p className="text-xs text-slate-400">React Flow canvas será integrado aqui</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
