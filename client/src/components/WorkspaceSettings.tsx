import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, UserPlus, Shield } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface WorkspaceSettingsProps {
  workspaceId: number;
}

export default function WorkspaceSettings({ workspaceId }: WorkspaceSettingsProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberId, setNewMemberId] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"editor" | "admin" | "viewer">("editor");

  const { data: workspace } = trpc.workspaces.get.useQuery({ id: workspaceId });
  const updateMutation = trpc.workspaces.update.useMutation();
  const addMemberMutation = trpc.workspaces.addMember.useMutation();
  const removeMemberMutation = trpc.workspaces.removeMember.useMutation();
  const updateRoleMutation = trpc.workspaces.updateMemberRole.useMutation();

  const handleStartEdit = () => {
    setEditName(workspace?.name || "");
    setEditDesc(workspace?.description || "");
    setIsEditMode(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateMutation.mutateAsync({
        id: workspaceId,
        name: editName,
        description: editDesc,
      });
      setIsEditMode(false);
    } catch (error) {
      console.error("Failed to update workspace:", error);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberId.trim()) return;

    try {
      const userId = parseInt(newMemberId);
      await addMemberMutation.mutateAsync({
        workspaceId,
        userId,
        role: newMemberRole,
      });
      setNewMemberId("");
      setIsAddMemberOpen(false);
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!confirm("Tem a certeza que quer remover este membro?")) return;

    try {
      await removeMemberMutation.mutateAsync({
        workspaceId,
        userId,
      });
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      await updateRoleMutation.mutateAsync({
        workspaceId,
        userId,
        role: newRole as "owner" | "admin" | "editor" | "viewer",
      });
    } catch (error) {
      console.error("Failed to update member role:", error);
    }
  };

  if (!workspace) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      {/* Workspace Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditMode ? (
            <>
              <div>
                <label className="text-sm font-semibold">Nome</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Descrição</label>
                <Textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
                <Button variant="outline" onClick={() => setIsEditMode(false)}>
                  Cancelar
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="text-sm text-gray-600">Nome</div>
                <div className="text-lg font-semibold">{workspace.name}</div>
              </div>
              {workspace.description && (
                <div>
                  <div className="text-sm text-gray-600">Descrição</div>
                  <div className="text-gray-700">{workspace.description}</div>
                </div>
              )}
              <Button onClick={handleStartEdit} variant="outline">
                Editar
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Membros ({workspace.members?.length || 0})</CardTitle>
          <Button onClick={() => setIsAddMemberOpen(true)} size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {workspace.members && workspace.members.length > 0 ? (
              workspace.members.map((member) => (
                <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{member.userId}</div>
                    <div className="text-xs text-gray-500">Membro desde {new Date(member.joinedAt).toLocaleDateString()}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={member.role} onValueChange={(val) => handleUpdateRole(member.userId, val)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.userId)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">Nenhum membro</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Membro</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold">ID do Utilizador</label>
              <Input
                placeholder="Ex: 123"
                value={newMemberId}
                onChange={(e) => setNewMemberId(e.target.value)}
                className="mt-1"
                type="number"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Role</label>
              <Select value={newMemberRole} onValueChange={(val: any) => setNewMemberRole(val)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={!newMemberId.trim() || addMemberMutation.isPending}
              >
                {addMemberMutation.isPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
