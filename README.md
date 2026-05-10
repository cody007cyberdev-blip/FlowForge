# FlowForge - Open Source Workflow Automation Platform

Uma plataforma elegante e sofisticada de automação de workflows, inspirada em ferramentas como n8n e Zapier. FlowForge oferece um editor visual intuitivo, biblioteca de nodes modulares, executor escalável e integração com múltiplas fontes de dados.

## Características Principais

### Editor Visual
- **Canvas Drag-and-Drop**: Interface intuitiva com React Flow para criar workflows visualmente
- **Node Library**: Biblioteca completa de nodes pré-construídos (HTTP, Email, Condicional, Transformação, etc.)
- **Real-time Execution**: Visualização em tempo real da execução de workflows

### Automação Avançada
- **Múltiplos Triggers**: Manual, Webhook HTTP, Cron/Schedule
- **Executor Topológico**: Execução eficiente de nodes em ordem correta
- **Retry Logic**: Políticas de retry automáticas para falhas transitórias
- **Error Handling**: Tratamento robusto de erros com logging detalhado

### Gestão de Workflows
- **CRUD Completo**: Criar, ler, atualizar e eliminar workflows
- **Histórico de Execuções**: Registro detalhado de cada execução com logs por node
- **Ativação/Desativação**: Controle fácil sobre workflows ativos
- **Versionamento**: Rastreamento de mudanças (em desenvolvimento)

### Segurança
- **Autenticação OAuth**: Integração com Manus OAuth
- **Encriptação de Credenciais**: AES-256-GCM para armazenar credenciais de forma segura
- **Controle de Acesso**: Diferenciação entre owner e utilizadores comuns
- **Isolamento de Dados**: Cada utilizador vê apenas seus próprios workflows

### Dashboard
- **Métricas em Tempo Real**: Total de workflows, execuções recentes, taxa de sucesso
- **Histórico de Execuções**: Visualização rápida de execuções recentes
- **Monitoramento**: Acompanhamento de falhas e alertas

## Arquitetura

```
FlowForge/
├── client/                 # Frontend React 19 + Tailwind CSS
│   ├── src/
│   │   ├── pages/         # Páginas (Home, Editor, Executions)
│   │   ├── components/    # Componentes reutilizáveis
│   │   └── lib/           # Utilitários e hooks
│   └── public/            # Assets estáticos
├── server/                # Backend Node.js + Express
│   ├── executor.ts        # Engine de execução com topological sort
│   ├── runner.ts          # Workflow runner com retry logic
│   ├── nodes/             # Sistema de nodes modulares
│   ├── crypto.ts          # Encriptação de credenciais
│   ├── routers.ts         # API endpoints (tRPC)
│   └── db.ts              # Query helpers
├── drizzle/               # Migrations e schema
└── docker-compose.yml     # Configuração de deployment
```

## Stack Técnico

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4, React Flow |
| Backend | Node.js, Express 4, NestJS (planejado), TypeScript |
| Database | MySQL/TiDB, Drizzle ORM |
| API | tRPC 11, REST endpoints |
| Auth | Manus OAuth, JWT |
| Caching | Redis (planejado) |
| Jobs | BullMQ (planejado) |
| Deployment | Docker, Docker Compose |

## Instalação Rápida

### Pré-requisitos
- Node.js 22+
- pnpm 10+
- MySQL 8+
- Docker (opcional, para deployment)

### Setup Local

1. **Clone o repositório**
```bash
gh repo clone cody007cyberdev-blip/FlowForge
cd FlowForge
```

2. **Instale dependências**
```bash
pnpm install
```

3. **Configure variáveis de ambiente**
```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais
```

4. **Execute migrações de banco de dados**
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

5. **Inicie o servidor de desenvolvimento**
```bash
pnpm dev
```

O aplicativo estará disponível em `http://localhost:3000`

## Estrutura de Dados

### Workflows
Armazena definições de workflows com nodes, edges e configurações de trigger.

```sql
CREATE TABLE workflows (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  isActive BOOLEAN DEFAULT 0,
  nodes JSON NOT NULL,
  edges JSON NOT NULL,
  trigger ENUM('manual', 'webhook', 'cron'),
  triggerConfig JSON,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);
```

### Executions
Registra cada execução de workflow com status e duração.

```sql
CREATE TABLE executions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workflowId INT NOT NULL,
  status ENUM('running', 'success', 'failed', 'cancelled'),
  startTime TIMESTAMP,
  endTime TIMESTAMP,
  duration INT,
  error TEXT,
  triggerSource ENUM('manual', 'webhook', 'cron', 'api'),
  triggerData JSON,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### ExecutionSteps
Logs detalhados de cada node executado.

```sql
CREATE TABLE executionSteps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  executionId INT NOT NULL,
  nodeId VARCHAR(255) NOT NULL,
  nodeName VARCHAR(255),
  nodeType VARCHAR(100) NOT NULL,
  status ENUM('pending', 'running', 'success', 'failed', 'skipped'),
  input JSON,
  output JSON,
  error TEXT,
  startTime TIMESTAMP,
  endTime TIMESTAMP,
  duration INT,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

## Nodes Disponíveis

### Triggers
- **Manual**: Inicia workflow manualmente
- **Webhook**: Recebe dados via HTTP POST
- **Schedule (Cron)**: Executa em horários programados

### Actions
- **HTTP Request**: Faz chamadas HTTP para APIs externas
- **Send Email**: Envia emails via SMTP
- **Log**: Registra dados no histórico de execução

### Logic
- **Conditional (If/Else)**: Ramifica workflow baseado em condição

### Data
- **Transform**: Transforma dados com JavaScript
- **Set Variable**: Define variáveis globais

## API Endpoints (tRPC)

### Workflows
```typescript
// Listar workflows do utilizador
trpc.workflows.list.useQuery()

// Obter workflow específico
trpc.workflows.get.useQuery({ id: 1 })

// Criar novo workflow
trpc.workflows.create.useMutation()

// Atualizar workflow
trpc.workflows.update.useMutation()

// Eliminar workflow
trpc.workflows.delete.useMutation()

// Executar workflow
trpc.workflows.execute.useMutation()
```

### Executions
```typescript
// Listar execuções de um workflow
trpc.executions.list.useQuery({ workflowId: 1 })

// Obter detalhes de execução
trpc.executions.get.useQuery({ id: 1 })
```

## Desenvolvimento

### Adicionar Novo Node

1. **Registre o node em `server/nodes/index.ts`**:
```typescript
registerNode(
  {
    id: "action-custom",
    type: "action-custom",
    label: "Custom Action",
    category: "action",
    description: "Descrição do node",
    inputs: [{ id: "input", label: "Input", type: "object" }],
    outputs: [{ id: "output", label: "Output", type: "object" }],
    config: {
      option1: { type: "text", label: "Option 1", required: true }
    }
  },
  {
    async execute(config, inputs) {
      // Implementação do node
      return { result: "output" };
    }
  }
);
```

2. **Use no frontend** - O node aparecerá automaticamente na biblioteca

### Testes

```bash
# Rodar testes
pnpm test

# Testes em watch mode
pnpm test:watch

# Cobertura
pnpm test:coverage
```

## Deployment

### Docker Compose

```bash
docker-compose up -d
```

Isto inicia:
- Aplicação FlowForge (porta 3000)
- MySQL (porta 3306)
- Redis (porta 6379)

### Variáveis de Ambiente Necessárias

```env
DATABASE_URL=mysql://user:password@localhost:3306/flowforge
JWT_SECRET=your-secret-key
CREDENTIAL_MASTER_KEY=your-master-key-for-encryption
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
```

## Roadmap

### Curto Prazo (v1.0)
- [x] Editor visual com React Flow
- [x] Nodes básicos (HTTP, Email, Condicional, Transformação)
- [x] Executor com topological sort
- [x] Dashboard com métricas
- [ ] Webhook triggers com endpoints HTTP
- [ ] Cron scheduler
- [ ] File upload/download

### Médio Prazo (v1.1)
- [ ] LLM Assistant para sugestões de nodes
- [ ] Marketplace de nodes comunitários
- [ ] Versionamento de workflows
- [ ] Templates pré-construídos
- [ ] Notificações em tempo real
- [ ] BullMQ para jobs assíncronos

### Longo Prazo (v2.0)
- [ ] Suporte a Python nodes
- [ ] Docker containers para custom code
- [ ] Multi-tenancy avançado
- [ ] Analytics e relatórios
- [ ] Integração com ferramentas populares
- [ ] Mobile app

## Contribuição

Contribuições são bem-vindas! Por favor:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através de support@flowforge.dev

## Autores

- **Manus AI** - Desenvolvimento inicial e arquitetura

## Agradecimentos

Inspirado por n8n, Zapier, Node-RED e ActivePieces. Obrigado à comunidade open-source!

---

**FlowForge** - Automação de workflows elegante e sofisticada para todos.
