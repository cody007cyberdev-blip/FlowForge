import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Play, Trash2, Eye } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);

  const workflowsQuery = trpc.workflows.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const executionsQuery = trpc.executions.list.useQuery(
    { workflowId: selectedWorkflow || 0, limit: 10 },
    { enabled: isAuthenticated && selectedWorkflow !== null }
  );

  const executeWorkflowMutation = trpc.workflows.execute.useMutation();
  const deleteWorkflowMutation = trpc.workflows.delete.useMutation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">FlowForge</h1>
            <p className="text-slate-400">Automação de workflows elegante</p>
          </div>
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle>Bem-vindo</CardTitle>
              <CardDescription>Faça login para começar</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href={getLoginUrl()}>Fazer Login</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalWorkflows = workflowsQuery.data?.length || 0;
  const activeWorkflows = workflowsQuery.data?.filter(w => w.isActive).length || 0;
  const recentExecutions = executionsQuery.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">FlowForge</h1>
              <p className="text-slate-600 mt-1">Bem-vindo, {user?.name}</p>
            </div>
            <Link href="/editor">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Novo Workflow
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total de Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalWorkflows}</div>
              <p className="text-xs text-slate-500 mt-1">{activeWorkflows} ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Execuções Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{recentExecutions.length}</div>
              <p className="text-xs text-slate-500 mt-1">Últimas 10</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Taxa de Sucesso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {recentExecutions.length > 0
                  ? Math.round(
                      (recentExecutions.filter(e => e.status === "success").length /
                        recentExecutions.length) *
                        100
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-slate-500 mt-1">Últimas execuções</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Meus Workflows</CardTitle>
                <CardDescription>Gerencie seus workflows</CardDescription>
              </CardHeader>
              <CardContent>
                {workflowsQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin h-6 w-6 text-slate-400" />
                  </div>
                ) : workflowsQuery.data && workflowsQuery.data.length > 0 ? (
                  <div className="space-y-3">
                    {workflowsQuery.data.map(workflow => (
                      <div
                        key={workflow.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                      >
                        <div className="flex-1" onClick={() => setSelectedWorkflow(workflow.id)}>
                          <h3 className="font-semibold text-slate-900">{workflow.name}</h3>
                          <p className="text-sm text-slate-500 mt-1">{workflow.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant={workflow.isActive ? "default" : "secondary"}>
                              {workflow.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                            <Badge variant="outline">{workflow.trigger}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/editor/${workflow.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => executeWorkflowMutation.mutate({ id: workflow.id })}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteWorkflowMutation.mutate({ id: workflow.id })}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">Nenhum workflow criado</p>
                    <Link href="/editor">
                      <Button variant="outline" className="mt-4">
                        Criar Primeiro
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Execuções Recentes</CardTitle>
                <CardDescription>Histórico</CardDescription>
              </CardHeader>
              <CardContent>
                {executionsQuery.isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin h-4 w-4 text-slate-400" />
                  </div>
                ) : recentExecutions.length > 0 ? (
                  <div className="space-y-2">
                    {recentExecutions.map(execution => (
                      <div key={execution.id} className="p-3 border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <Badge
                            variant={
                              execution.status === "success"
                                ? "default"
                                : execution.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {execution.status}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {execution.duration ? `${execution.duration}ms` : "-"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(execution.startTime).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">Nenhuma execução</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
