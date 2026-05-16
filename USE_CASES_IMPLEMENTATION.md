# FlowForge - Use Cases Implementation Guide

## Completed Nodes

### Caso 1: IA para Relatórios com Estrutura Definida ✅

**Nodes Implementados:**
1. **PDF Generator** (`server/nodes/pdf.ts`)
   - Converte HTML para PDF usando Puppeteer
   - Suporta formatos A4/Letter, landscape, margens customizadas
   - Ideal para gerar relatórios estruturados

2. **Email Sender** (`server/nodes/email.ts`)
   - Suporta SMTP e Gmail OAuth2
   - Anexos, CC, BCC, reply-to
   - Integração com credenciais encriptadas

**Workflow Típico:**
```
Trigger (Schedule) 
  → OpenAI (gera conteúdo)
  → Template (estrutura HTML)
  → PDF Generator (converte)
  → Email Sender (envia)
```

---

### Caso 2: Análise de Logs e Visualização ✅

**Nodes Implementados:**
1. **InfluxDB** (`server/nodes/influxdb.ts`)
   - Write: Armazena métricas com tags e fields
   - Query: Busca dados com Flux queries
   - Ideal para time-series de logs

2. **Elasticsearch** (`server/nodes/elasticsearch.ts`)
   - Search: Busca full-text em logs
   - Index: Armazena documentos
   - Suporta auth básica e API Key

3. **Log Parser** (`server/nodes/logParser.ts`)
   - Formatos: JSON, regex, CSV, space-delimited
   - Agregação: count, sum, avg, min, max
   - Detecção automática de log levels
   - Padrões pré-definidos: Apache, Nginx, Syslog

**Workflow Típico:**
```
File Tail (lê logs em tempo real)
  → Log Parser (extrai fields)
  → InfluxDB (armazena métricas)
  → Elasticsearch (indexa para busca)
  → Grafana (visualiza)
```

---

## Próximos Nodes a Implementar

### Caso 3: Gráficos para Monitorização de Sistemas

**Nodes Necessários:**
1. **Prometheus Node** - Query de métricas
2. **Grafana Node** - Criar/atualizar dashboards
3. **System Metrics Node** - CPU, RAM, Disk, Network
4. **Slack Alerts Node** - Enviar alertas
5. **MQTT Subscribe Node** - Receber dados de IoT

**Configuração Exemplo:**
```javascript
// Prometheus Query
{
  "query": "rate(http_requests_total[5m])",
  "prometheusUrl": "http://prometheus:9090"
}

// System Metrics
{
  "metrics": ["cpu", "memory", "disk"],
  "interval": 5000
}

// Slack Alert
{
  "channel": "#alerts",
  "message": "CPU usage: {{cpu}}%",
  "threshold": 80
}
```

### Caso 4: Automação Multi-IA + Propostas + Análise Financeira

**Nodes Necessários:**
1. **Multiple OpenAI** - 4 instâncias com prompts diferentes
2. **Google Sheets** - Ler/escrever dados
3. **Telegram Bot** - Enviar propostas
4. **Financial APIs** - Alpha Vantage, Binance, Yahoo Finance
5. **HubSpot/Pipedrive** - CRM integration
6. **Join/Merge** - Aguardar múltiplas execuções

**Arquitetura Multi-IA:**
```
Schedule Trigger (9h diariamente)
  ├─→ [Paralelo] HTTP Request (dados mercado)
  ├─→ [Paralelo] Google Sheets (histórico cliente)
  └─→ [Paralelo] Financial API (preços)
       ↓
  Merge (aguarda tudo)
       ↓
  OpenAI 1: Análise de Mercado
       ↓
  OpenAI 2: Análise de Risco
       ↓
  OpenAI 3: Gera Proposta
       ↓
  OpenAI 4: Revisão QA
       ↓
  Merge (4 outputs)
       ↓
  HTML to PDF
       ↓
  Gmail + Telegram + HubSpot
```

---

## Instalação de Dependências

```bash
# Caso 3: Monitorização
pnpm add prom-client axios

# Caso 4: Multi-IA + Propostas
pnpm add google-auth-library googleapis telegraf
```

---

## Configuração de Credenciais

Adicione ao `.env`:

```env
# InfluxDB
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=your-token
INFLUXDB_ORG=your-org
INFLUXDB_BUCKET=your-bucket

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USER=elastic
ELASTICSEARCH_PASSWORD=password

# Prometheus
PROMETHEUS_URL=http://localhost:9090

# Gmail
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token

# Financial APIs
ALPHA_VANTAGE_API_KEY=your-key
BINANCE_API_KEY=your-key

# HubSpot
HUBSPOT_API_KEY=your-key
```

---

## Próximas Etapas

1. Implementar Caso 3 nodes (Prometheus, Grafana, System Metrics, Slack, MQTT)
2. Implementar Caso 4 nodes (OpenAI multi-instance, Google Sheets, Telegram, Financial APIs, HubSpot)
3. Criar templates de workflows pré-configurados para cada caso
4. Adicionar testes unitários para cada node
5. Documentar exemplos de uso completos
