# FlowForge Enterprise - Implementation Guide (Phases 4-9)

## Overview

Este documento fornece um guia completo para implementar as fases 4-9 do FlowForge Enterprise. Cada fase está documentada com exemplos de código, endpoints tRPC e componentes UI.

---

## Fase 4: API Keys Management ✅ (Service Criado)

### Arquivos Criados
- `server/apiKeyService.ts` - Serviço de gerenciamento de API keys

### Implementação Recomendada

**1. Adicionar endpoints tRPC em `server/routers.ts`:**

```typescript
apiKeys: router({
  create: protectedProcedure
    .input(z.object({ workspaceId: z.number(), name: z.string(), expiresInDays: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      const { checkWorkspacePermission } = await import("./workspaceService");
      const hasAccess = await checkWorkspacePermission(input.workspaceId, ctx.user.id, "admin");
      if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN" });
      
      const { createApiKey } = await import("./apiKeyService");
      return createApiKey(input.workspaceId, input.name, ["read", "write"], input.expiresInDays);
    }),
  
  list: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { checkWorkspacePermission } = await import("./workspaceService");
      const hasAccess = await checkWorkspacePermission(input.workspaceId, ctx.user.id, "viewer");
      if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN" });
      
      const { listApiKeys } = await import("./apiKeyService");
      return listApiKeys(input.workspaceId);
    }),
  
  rotate: protectedProcedure
    .input(z.object({ workspaceId: z.number(), keyId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { checkWorkspacePermission } = await import("./workspaceService");
      const hasAccess = await checkWorkspacePermission(input.workspaceId, ctx.user.id, "admin");
      if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN" });
      
      const { rotateApiKey } = await import("./apiKeyService");
      return rotateApiKey(input.keyId, input.workspaceId);
    }),
  
  revoke: protectedProcedure
    .input(z.object({ workspaceId: z.number(), keyId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { checkWorkspacePermission } = await import("./workspaceService");
      const hasAccess = await checkWorkspacePermission(input.workspaceId, ctx.user.id, "admin");
      if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN" });
      
      const { revokeApiKey } = await import("./apiKeyService");
      return revokeApiKey(input.keyId, input.workspaceId);
    }),
}),
```

**2. Criar componente UI em `client/src/components/ApiKeysManager.tsx`:**

```typescript
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function ApiKeysManager({ workspaceId }: { workspaceId: number }) {
  const [name, setName] = useState("");
  const { data: keys } = trpc.apiKeys.list.useQuery({ workspaceId });
  const createMutation = trpc.apiKeys.create.useMutation();
  const rotateMutation = trpc.apiKeys.rotate.useMutation();
  const revokeMutation = trpc.apiKeys.revoke.useMutation();

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="Nome da API Key" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={() => createMutation.mutate({ workspaceId, name })}>Criar</Button>
      </div>
      
      <div className="space-y-2">
        {keys?.map((key) => (
          <Card key={key.id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{key.name}</p>
              <p className="text-sm text-gray-500">Criada em: {new Date(key.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => rotateMutation.mutate({ workspaceId, keyId: key.id })}>Rotar</Button>
              <Button size="sm" variant="destructive" onClick={() => revokeMutation.mutate({ workspaceId, keyId: key.id })}>Revogar</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## Fase 5: Workflow Versioning

### Tabela: `workflow_versions`
```sql
CREATE TABLE workflow_versions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workflowId INT NOT NULL,
  version INT NOT NULL,
  snapshot JSON NOT NULL,
  description TEXT,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflowId) REFERENCES workflows(id),
  FOREIGN KEY (createdBy) REFERENCES users(id)
);
```

### Funcionalidades
- Criar snapshot automático a cada save
- Listar histórico de versões
- Rollback para versão anterior
- Comparar versões lado a lado

---

## Fase 6: Webhook Tracking

### Melhorias em `webhook_deliveries`
- Adicionar retry_count, last_error, status_code
- Implementar retry automático com exponential backoff
- Dashboard de webhook deliveries
- Replay de webhooks falhados

---

## Fase 7: Audit Logs

### Tabela: `audit_logs`
```sql
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspaceId INT NOT NULL,
  userId INT NOT NULL,
  action VARCHAR(255) NOT NULL,
  resourceType VARCHAR(255),
  resourceId INT,
  changes JSON,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Ações a Registrar
- Workflow created/updated/deleted
- Execution started/completed/failed
- Member added/removed
- API key created/rotated/revoked
- Settings changed

---

## Fase 8: Workflow Templates

### Tabela: `workflow_templates`
```sql
CREATE TABLE workflow_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  thumbnail VARCHAR(255),
  workflow JSON NOT NULL,
  author INT,
  isPublic BOOLEAN DEFAULT FALSE,
  downloads INT DEFAULT 0,
  rating FLOAT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author) REFERENCES users(id)
);
```

### Funcionalidades
- Criar template a partir de workflow
- Marketplace de templates
- Compartilhar templates
- Importar template como novo workflow

---

## Fase 9: IoT Devices

### Tabela: `iot_devices`
```sql
CREATE TABLE iot_devices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspaceId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  connectionString TEXT,
  mqttTopic VARCHAR(255),
  lastSeenAt TIMESTAMP,
  isOnline BOOLEAN DEFAULT FALSE,
  metadata JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspaceId) REFERENCES workspaces(id)
);
```

### Funcionalidades
- Descoberta automática de dispositivos
- Conexão MQTT
- Monitoramento de status
- Triggers baseados em eventos de dispositivos

---

## Timeline Estimado

- **Fase 4 (API Keys)**: 2-3 dias
- **Fase 5 (Versioning)**: 2-3 dias
- **Fase 6 (Webhook Tracking)**: 2 dias
- **Fase 7 (Audit Logs)**: 1-2 dias
- **Fase 8 (Templates)**: 3-4 dias
- **Fase 9 (IoT)**: 3-4 dias

**Total**: 13-19 dias (2-3 semanas)

---

## Próximos Passos

1. Implementar endpoints tRPC para cada fase
2. Criar componentes UI correspondentes
3. Adicionar testes unitários
4. Documentar APIs
5. Fazer deployment em produção

