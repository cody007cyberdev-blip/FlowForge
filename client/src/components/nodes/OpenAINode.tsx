import React, { useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Brain } from "lucide-react";

interface OpenAINodeData {
  label: string;
  apiKey?: string;
  mode?: "chat" | "embedding" | "moderation";
  model?: string;
  prompt?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export function OpenAINode({ data }: NodeProps<OpenAINodeData>) {
  const [config, setConfig] = React.useState<OpenAINodeData>(data);

  const handleChange = useCallback(
    (field: string, value: any) => {
      setConfig((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  return (
    <div className="w-96 bg-white rounded-lg border border-slate-200 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-slate-200">
        <Brain className="w-5 h-5 text-purple-600" />
        <span className="font-semibold text-slate-900">{config.label || "OpenAI"}</span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* API Key */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">API Key</Label>
          <Input
            type="password"
            placeholder="sk-..."
            value={config.apiKey || ""}
            onChange={(e) => handleChange("apiKey", e.target.value)}
            className="text-xs"
          />
          <p className="text-xs text-slate-500">Your OpenAI API key (stored securely)</p>
        </div>

        {/* Mode Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Mode</Label>
          <Select value={config.mode || "chat"} onValueChange={(value) => handleChange("mode", value)}>
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chat">Chat Completion (GPT-4)</SelectItem>
              <SelectItem value="embedding">Embeddings</SelectItem>
              <SelectItem value="moderation">Moderation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Model Selection (Chat mode only) */}
        {config.mode === "chat" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Model</Label>
            <Select value={config.model || "gpt-4"} onValueChange={(value) => handleChange("model", value)}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* System Prompt (Chat mode only) */}
        {config.mode === "chat" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">System Prompt</Label>
            <Textarea
              placeholder="You are a helpful assistant..."
              value={config.systemPrompt || ""}
              onChange={(e) => handleChange("systemPrompt", e.target.value)}
              className="text-xs min-h-20"
            />
          </div>
        )}

        {/* Prompt (Chat and Moderation modes) */}
        {(config.mode === "chat" || config.mode === "moderation") && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {config.mode === "chat" ? "Prompt" : "Text to Moderate"}
            </Label>
            <Textarea
              placeholder={config.mode === "chat" ? "Enter your prompt..." : "Enter text to check..."}
              value={config.prompt || ""}
              onChange={(e) => handleChange("prompt", e.target.value)}
              className="text-xs min-h-20"
            />
          </div>
        )}

        {/* Temperature (Chat mode only) */}
        {config.mode === "chat" && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm font-medium">Temperature</Label>
              <span className="text-xs text-slate-600">{(config.temperature || 0.7).toFixed(2)}</span>
            </div>
            <Slider
              min={0}
              max={2}
              step={0.1}
              value={[config.temperature || 0.7]}
              onValueChange={(value) => handleChange("temperature", value[0])}
              className="w-full"
            />
            <p className="text-xs text-slate-500">Higher = more creative, Lower = more focused</p>
          </div>
        )}

        {/* Max Tokens (Chat mode only) */}
        {config.mode === "chat" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Max Tokens</Label>
            <Input
              type="number"
              min="1"
              max="4000"
              value={config.maxTokens || 1000}
              onChange={(e) => handleChange("maxTokens", parseInt(e.target.value))}
              className="text-xs"
            />
          </div>
        )}

        {/* Top P (Chat mode only) */}
        {config.mode === "chat" && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm font-medium">Top P</Label>
              <span className="text-xs text-slate-600">{(config.topP || 1).toFixed(2)}</span>
            </div>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={[config.topP || 1]}
              onValueChange={(value) => handleChange("topP", value[0])}
              className="w-full"
            />
            <p className="text-xs text-slate-500">Nucleus sampling parameter</p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-xs text-blue-900">
            {config.mode === "chat" && "💬 Sends a prompt to GPT-4 and returns the completion."}
            {config.mode === "embedding" && "📊 Generates vector embeddings for semantic search."}
            {config.mode === "moderation" && "🛡️ Checks text for harmful content."}
          </p>
        </div>
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
