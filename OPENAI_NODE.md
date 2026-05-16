# OpenAI Node Integration Guide

O node OpenAI permite integrar a plataforma OpenAI diretamente nos seus workflows do FlowForge, com suporte a GPT-4, embeddings e análise de conteúdo.

## 📋 Visão Geral

O node OpenAI oferece três modos de operação:

| Modo | Descrição | Casos de Uso |
|------|-----------|-------------|
| **Chat Completion** | Gera respostas usando GPT-4 | Chatbots, análise de texto, geração de conteúdo |
| **Embeddings** | Cria vetores semânticos | Busca semântica, clustering, recomendações |
| **Moderation** | Verifica conteúdo prejudicial | Filtragem de spam, content moderation |

## 🔧 Configuração

### 1. Obter API Key

1. Aceda a [platform.openai.com](https://platform.openai.com)
2. Crie uma conta ou faça login
3. Vá para "API keys" → "Create new secret key"
4. Copie a chave (ela será ocultada depois)

### 2. Adicionar Node ao Workflow

1. No editor visual, clique em "OpenAI" na sidebar
2. Arraste para o canvas
3. Cole a API key no campo "API Key"
4. Selecione o modo desejado

## 💬 Chat Completion Mode

### Configuração

| Campo | Descrição | Padrão |
|-------|-----------|--------|
| **API Key** | Sua chave OpenAI (obrigatória) | - |
| **Model** | Modelo a usar (GPT-4, GPT-4 Turbo, GPT-3.5) | gpt-4 |
| **Prompt** | Instrução para o modelo | - |
| **System Prompt** | Contexto/personalidade do assistente | - |
| **Temperature** | Criatividade (0-2, maior = mais criativo) | 0.7 |
| **Max Tokens** | Comprimento máximo da resposta | 1000 |
| **Top P** | Diversidade de amostragem (0-1) | 1 |

### Exemplo 1: Resumo de Texto

```
System Prompt: Você é um resumidor de textos profissional.
Prompt: Resuma o seguinte texto em 3 frases:
{{ input.text }}
```

**Input:**
```json
{
  "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
}
```

**Output:**
```json
{
  "success": true,
  "result": "Resumo gerado pelo GPT-4...",
  "tokens": 150
}
```

### Exemplo 2: Análise de Sentimento

```
System Prompt: Você é um especialista em análise de sentimento.
Prompt: Analise o sentimento do seguinte texto e retorne JSON:
{{ input.comment }}

Retorne: { "sentiment": "positive|negative|neutral", "score": 0-1, "explanation": "..." }
```

### Exemplo 3: Geração de Conteúdo

```
System Prompt: Você é um copywriter criativo.
Prompt: Gere 3 títulos criativos para um artigo sobre {{ input.topic }}
Temperature: 1.5 (mais criativo)
Max Tokens: 500
```

## 📊 Embeddings Mode

Cria vetores semânticos para busca e análise semântica.

### Configuração

| Campo | Descrição |
|-------|-----------|
| **Text** | Texto para gerar embedding |
| **Model** | Sempre usa `text-embedding-3-small` |

### Exemplo: Busca Semântica

```
Mode: Embeddings
Text: {{ input.query }}
```

**Output:**
```json
{
  "success": true,
  "embedding": [0.123, -0.456, 0.789, ...],
  "dimension": 1536,
  "tokens": 10
}
```

**Usar com Database Node:**
1. Gere embedding da query com este node
2. Compare com embeddings armazenados na BD
3. Retorne os mais similares (cosine similarity)

## 🛡️ Moderation Mode

Verifica se o conteúdo viola as políticas de uso.

### Configuração

| Campo | Descrição |
|-------|-----------|
| **Text** | Texto a verificar |

### Exemplo: Filtro de Comentários

```
Mode: Moderation
Text: {{ input.comment }}
```

**Output:**
```json
{
  "success": true,
  "flagged": false,
  "categories": {
    "hate": false,
    "hate/threatening": false,
    "self-harm": false,
    "sexual": false,
    "sexual/minors": false,
    "violence": false,
    "violence/graphic": false
  },
  "scores": {
    "hate": 0.001,
    "hate/threatening": 0.0,
    ...
  }
}
```

## 🔐 Segurança

- **API Keys são encriptadas** com AES-256-GCM
- **Nunca são expostas** no frontend ou logs
- **Armazenadas seguramente** na base de dados
- **Acesso controlado** por RBAC

## 💰 Custos

| Modelo | Custo (por 1K tokens) |
|--------|----------------------|
| GPT-4 | $0.03 (input) / $0.06 (output) |
| GPT-4 Turbo | $0.01 / $0.03 |
| GPT-3.5 Turbo | $0.0005 / $0.0015 |
| Embeddings | $0.00002 |

**Dica:** Use GPT-3.5 Turbo para tarefas simples e economize custos.

## 🚀 Boas Práticas

### 1. Otimizar Prompts

```javascript
// ❌ Prompt genérico
"Resuma isto"

// ✅ Prompt específico
"Resuma o seguinte texto em 2-3 frases, focando em pontos-chave:
{{ input.text }}"
```

### 2. Usar System Prompts

```javascript
// Define o comportamento do modelo
System Prompt: "Você é um especialista em {{input.domain}}. 
Responda de forma concisa e profissional."
```

### 3. Controlar Custos

```javascript
// Limitar tokens
Max Tokens: 500  // Em vez de 4000

// Usar modelo mais barato para tarefas simples
Model: "gpt-3.5-turbo"  // Para classificação
Model: "gpt-4"  // Para análise complexa
```

### 4. Tratar Erros

```javascript
// Adicionar node Conditional após OpenAI
Condition: "{{ input.success === true }}"

// Se falhar, usar fallback
True: Continuar workflow
False: Enviar notificação de erro
```

## 🔗 Integração com Outros Nodes

### Com HTTP Request

```
1. OpenAI (gera resposta)
   ↓
2. HTTP Request (envia para API externa)
   ↓
3. Log (registra resultado)
```

### Com Email

```
1. OpenAI (gera conteúdo)
   ↓
2. Send Email (envia para utilizador)
   ↓
3. Log (confirma envio)
```

### Com Database

```
1. Database (lê dados)
   ↓
2. OpenAI (analisa/processa)
   ↓
3. Database (armazena resultado)
```

## 📝 Exemplos Completos

### Exemplo 1: Chatbot de Suporte

```
Trigger: Webhook (recebe mensagem)
  ↓
OpenAI (Chat mode)
  System: "Você é um agente de suporte amigável"
  Prompt: "{{ input.message }}"
  ↓
Send Email (envia resposta)
  To: "{{ input.email }}"
  Body: "{{ openai.result }}"
  ↓
Log (registra interação)
```

### Exemplo 2: Análise de Sentimento em Massa

```
Trigger: Cron (diário)
  ↓
Database (lê comentários não analisados)
  ↓
Transform (loop sobre comentários)
  ↓
OpenAI (Chat mode)
  Prompt: "Analise sentimento: {{ comment }}"
  ↓
Database (armazena resultado)
  ↓
Log (resumo de análise)
```

### Exemplo 3: Busca Semântica

```
Trigger: HTTP Request (recebe query)
  ↓
OpenAI (Embeddings mode)
  Text: "{{ input.query }}"
  ↓
Database (busca similares)
  ↓
HTTP Response (retorna resultados)
```

## ⚠️ Limitações

- **Rate Limits:** OpenAI tem limites de requisições por minuto
- **Contexto:** GPT-4 tem limite de 8K tokens (contexto)
- **Latência:** Pode levar 1-5 segundos por requisição
- **Custo:** Cuidado com loops infinitos (custos elevados)

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| "Invalid API key" | Verifique a chave em platform.openai.com |
| "Rate limit exceeded" | Aguarde 1 minuto ou use backoff exponencial |
| "Context length exceeded" | Reduza o tamanho do prompt ou use GPT-4 Turbo |
| "No response" | Verifique timeout (padrão 30s) |

## 📚 Recursos

- [OpenAI Documentation](https://platform.openai.com/docs)
- [API Reference](https://platform.openai.com/docs/api-reference)
- [Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
- [Pricing](https://openai.com/pricing)

## 🤝 Suporte

Para problemas ou sugestões:
- Abra uma issue no GitHub
- Contacte o suporte do FlowForge
- Consulte a documentação do OpenAI
