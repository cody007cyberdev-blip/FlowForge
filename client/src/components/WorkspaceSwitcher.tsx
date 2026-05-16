import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface WorkspaceSwitcherProps {
  currentWorkspaceId?: number;
  onWorkspaceChange?: (workspaceId: number) => void;
}

export default function WorkspaceSwitcher({
  currentWorkspaceId,
  onWorkspaceChange,
}: WorkspaceSwitcherProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState("");

  const { data: workspaces, isLoading } = trpc.workspaces.list.useQuery();
  const createMutation = trpc.workspaces.create.useMutation();

  const currentWorkspace = workspaces?.find((w) => w.id === currentWorkspaceId);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;

    try {
      const result = await createMutation.mutateAsync({
        name: newWorkspaceName,
        description: newWorkspaceDesc,
      });
      setNewWorkspaceName("");
      setNewWorkspaceDesc("");
      setIsCreateOpen(false);
      onWorkspaceChange?.(result.id);
    } catch (error) {
      console.error("Failed to create workspace:", error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <div className="flex-1 text-left">
              <div className="text-sm font-semibold">
                {currentWorkspace?.name || "Selecione Workspace"}
              </div>
              <div className="text-xs text-gray-500">{workspaces?.length || 0} workspaces</div>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-56">
          {isLoading ? (
            <DropdownMenuItem disabled>Carregando...</DropdownMenuItem>
          ) : workspaces && workspaces.length > 0 ? (
            <>
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => onWorkspaceChange?.(workspace.id)}
                  className={currentWorkspaceId === workspace.id ? "bg-blue-50" : ""}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{workspace.name}</div>
                    {workspace.description && (
                      <div className="text-xs text-gray-500">{workspace.description}</div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          ) : null}

          <DropdownMenuItem onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Workspace
          </DropdownMenuItem>

          {currentWorkspaceId && (
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Workspace Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Workspace</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Nome do Workspace</label>
              <Input
                placeholder="Ex: Meu Projeto"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Descrição (opcional)</label>
              <Textarea
                placeholder="Descreva o propósito do workspace..."
                value={newWorkspaceDesc}
                onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateWorkspace}
                disabled={!newWorkspaceName.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? "Criando..." : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
