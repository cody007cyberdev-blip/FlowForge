import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronDown, ChevronUp, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import { useState, useMemo } from "react";

export default function ExecutionLogs() {
  const { isAuthenticated } = useAuth();
  const { executionId } = useParams<{ executionId: string }>();
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const executionQuery = trpc.executions.get.useQuery(
    { id: parseInt(executionId || "0") },
    { enabled: isAuthenticated && !!executionId }
  );

  const toggleStep = (stepId: number) => {
    const newSet = new Set(expandedSteps);
    if (newSet.has(stepId)) {
      newSet.delete(stepId);
    } else {
      newSet.add(stepId);
    }
    setExpandedSteps(newSet);
  };

  if (!isAuthenticated) {
    return <div>Acesso negado</div>;
  }

  if (executionQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  const execution = executionQuery.data;
  if (!execution) {
    return <div>Execução não encontrada</div>;
  }

  const steps = execution.steps || [];

  const filteredSteps = useMemo(() => {
    if (!steps) return [];
    return steps.filter((step: any) => {
      const matchesSearch =
        step.nodeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        step.nodeType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        step.error?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || step.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [steps, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Logs de Execução</h1>
          <p className="text-slate-600 mt-1">Execução #{execution.id}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={execution.status === "success" ? "default" : "destructive"}>
                {execution.status}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Duração</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{execution.duration || 0}ms</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Início</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">{execution.startedAt ? new Date(execution.startedAt).toLocaleString() : 'N/A'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Trigger</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">Manual</Badge>
            </CardContent>
          </Card>
        </div>

        {execution.error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Erro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-800 font-mono text-sm">{execution.error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Logs de Execução</CardTitle>
            <CardDescription>{steps.length} passos executados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Pesquisar por nome, tipo ou erro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-1">
                {["success", "failed", "pending"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(statusFilter === status ? null : status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            {filteredSteps.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Nenhum passo encontrado com os filtros selecionados
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSteps.map((step: any) => (
                  <div key={step.id} className="border border-slate-200 rounded-lg">
                    <button
                      onClick={() => toggleStep(step.id)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <Badge
                          variant={
                            step.status === "success"
                              ? "default"
                              : step.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {step.status}
                        </Badge>
                        <div>
                          <div className="font-semibold text-slate-900">{step.nodeName}</div>
                          <div className="text-xs text-slate-500">{step.nodeType}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">{step.duration}ms</span>
                        {expandedSteps.has(step.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </button>

                    {expandedSteps.has(step.id) && (
                      <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 space-y-3">
                        {step.input && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-1">Input</h4>
                            <pre className="bg-white p-3 rounded border border-slate-200 text-xs overflow-auto max-h-40">
                              {JSON.stringify(JSON.parse(step.input), null, 2)}
                            </pre>
                          </div>
                        )}

                        {step.output && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-1">Output</h4>
                            <pre className="bg-white p-3 rounded border border-slate-200 text-xs overflow-auto max-h-40">
                              {JSON.stringify(JSON.parse(step.output), null, 2)}
                            </pre>
                          </div>
                        )}

                        {step.error && (
                          <div>
                            <h4 className="text-sm font-semibold text-red-900 mb-1">Erro</h4>
                            <pre className="bg-red-50 p-3 rounded border border-red-200 text-xs text-red-800 overflow-auto max-h-40">
                              {step.error}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
