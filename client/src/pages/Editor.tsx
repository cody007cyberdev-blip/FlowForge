import { useAuth } from "@/_core/hooks/useAuth";
import { WorkflowEditorV3 } from "@/components/WorkflowEditorV3";

export default function Editor() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Acesso negado</div>;
  }

  return <WorkflowEditorV3 />;
}
