import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wand2, Copy, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface LLMAssistantProps {
  nodeType: string;
  currentConfig?: any;
  onConfigSuggested?: (config: any) => void;
}

export function LLMAssistant({ nodeType, currentConfig, onConfigSuggested }: LLMAssistantProps) {
  const [description, setDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const suggestConfigMutation = trpc.llm.suggestNodeConfig.useMutation({
    onSuccess: (config) => {
      toast.success("Sugestão gerada com sucesso!");
      if (onConfigSuggested) {
        onConfigSuggested(config);
      }
    },
    onError: () => {
      toast.error("Erro ao gerar sugestão");
    },
  });

  const handleSuggest = async () => {
    if (!description.trim()) {
      toast.error("Descreva o que deseja configurar");
      return;
    }

    await suggestConfigMutation.mutateAsync({
      nodeType,
      description,
    });
  };

  const handleCopy = () => {
    if (currentConfig) {
      navigator.clipboard.writeText(JSON.stringify(currentConfig, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Configuração copiada!");
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Wand2 className="h-4 w-4" />
        Assistente IA
      </Button>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Assistente IA</CardTitle>
            <CardDescription>Obtenha sugestões de configuração</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700">
            Descreva o que deseja fazer
          </label>
          <Input
            placeholder={`Ex: Enviar um email para notificações de erro`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2"
          />
        </div>

        <Button
          onClick={handleSuggest}
          disabled={suggestConfigMutation.isPending || !description.trim()}
          className="w-full"
        >
          {suggestConfigMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Gerando...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Gerar Sugestão
            </>
          )}
        </Button>

        {suggestConfigMutation.data && (
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">Sugestão Gerada</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <pre className="text-xs overflow-auto max-h-40 text-slate-700">
              {JSON.stringify(suggestConfigMutation.data, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-xs text-slate-500 text-center">
          Powered by AI - Use com cuidado
        </div>
      </CardContent>
    </Card>
  );
}
