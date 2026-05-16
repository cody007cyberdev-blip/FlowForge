import { useRoute } from "wouter";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
import WorkspaceSettings from "@/components/WorkspaceSettings";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function WorkspaceSettingsPage() {
  const [, params] = useRoute("/workspace/:id/settings");
  const workspaceId = params?.id ? parseInt(params.id) : undefined;

  if (!workspaceId) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Workspace não encontrado</h1>
          <Button className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Configurações do Workspace</h1>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        <WorkspaceSwitcher currentWorkspaceId={workspaceId} />
      </div>

      <WorkspaceSettings workspaceId={workspaceId} />
    </div>
  );
}
