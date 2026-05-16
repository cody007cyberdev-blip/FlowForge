# FlowForge - Guia do Utilizador

Bem-vindo ao FlowForge, uma plataforma elegante e sofisticada para automação de workflows. Este guia vai ajudá-lo a criar, executar e gerir seus workflows com facilidade.

## Índice

1. [Primeiros Passos](#primeiros-passos)
2. [Dashboard](#dashboard)
3. [Criar um Workflow](#criar-um-workflow)
4. [Editor Visual](#editor-visual)
5. [Nodes Disponíveis](#nodes-disponíveis)
6. [Executar Workflows](#executar-workflows)
7. [Ver Logs de Execução](#ver-logs-de-execução)
8. [Assistente IA](#assistente-ia)
9. [Dicas e Boas Práticas](#dicas-e-boas-práticas)

## Primeiros Passos

### Acesso à Plataforma

1. Navegue para a URL do FlowForge
2. Faça login com sua conta Manus (OAuth)
3. Será redirecionado para o dashboard

### Autenticação

FlowForge usa autenticação OAuth integrada com a plataforma Manus. Sua sessão é mantida de forma segura com cookies HTTP-only.

## Dashboard

O dashboard é sua central de controlo com as seguintes informações:

- **Total de Workflows**: Número total de workflows criados
- **Execuções Recentes**: Últimas 10 execuções com status
- **Taxa de Sucesso**: Percentagem de execuções bem-sucedidas

### Ações Rápidas

- **Novo Workflow**: Botão azul no canto superior direito
- **Listar Workflows**: Visualize todos os seus workflows
- **Editar**: Clique em um workflow para editar
- **Executar**: Dispare uma execução manual

## Criar um Workflow

### Passo 1: Iniciar Novo Workflow

1. Clique em "Novo Workflow" no dashboard
2. Insira um nome descritivo (ex: "Enviar Email Diário")
3. Adicione uma descrição (opcional)
4. Clique em "Criar"

### Passo 2: Configurar Trigger

Escolha como o workflow será disparado:

- **Manual**: Executar sob demanda
- **Webhook**: Disparar via HTTP POST
- **Cron**: Executar em horários programados

## Editor Visual

O editor visual permite construir workflows de forma intuitiva com drag-and-drop.

### Interface

- **Canvas Central**: Área onde você desenha o workflow
- **Sidebar Esquerda**: Biblioteca de nodes disponíveis
- **Painel Direita**: Configurações do node selecionado

### Adicionar Nodes

1. Clique em um node na sidebar
2. Arraste para o canvas
3. Solte para adicionar

### Conectar Nodes

1. Clique na porta de saída de um node
2. Arraste até a porta de entrada de outro node
3. Solte para criar conexão

### Configurar Nodes

1. Clique no node para selecioná-lo
2. Configure as opções no painel direito
3. Use o Assistente IA para sugestões

## Nodes Disponíveis

### HTTP Request

Fazer requisições HTTP para APIs externas.

**Configuração**:
- URL: Endereço da API
- Método: GET, POST, PUT, DELETE
- Headers: Cabeçalhos HTTP customizados
- Body: Dados a enviar (JSON)

**Exemplo**: Chamar uma API de previsão do tempo

### Email

Enviar emails com conteúdo dinâmico.

**Configuração**:
- Para: Endereço de email do destinatário
- Assunto: Título do email
- Corpo: Conteúdo em HTML ou texto

**Exemplo**: Notificação de erro para administrador

### Condicional (If/Else)

Ramificar o workflow baseado em condições.

**Configuração**:
- Condição: Expressão JavaScript que retorna true/false
- Ramo Verdadeiro: Nodes a executar se verdadeiro
- Ramo Falso: Nodes a executar se falso

**Exemplo**: Enviar email diferente baseado no status

### Transformar Dados

Transformar dados com JavaScript.

**Configuração**:
- Expressão: Código JavaScript para processar dados
- Formato de Saída: JSON, Texto, Número

**Exemplo**: Converter CSV para JSON

### Log

Registar mensagens para debugging.

**Configuração**:
- Mensagem: Texto a registar
- Nível: Info, Warning, Error

### Webhook

Receber dados via HTTP POST.

**Configuração**:
- URL: Gerada automaticamente
- Ativo: Ativar/desativar webhook

### Cron/Schedule

Agendar execuções em horários específicos.

**Configuração**:
- Expressão Cron: Padrão de agendamento
- Fuso Horário: UTC ou local

## Executar Workflows

### Execução Manual

1. Clique em "Executar" no editor
2. Aguarde a conclusão
3. Visualize o resultado

### Execução por Webhook

1. Configure o node Webhook
2. Copie a URL gerada
3. Faça POST para essa URL com dados JSON

```bash
curl -X POST https://seu-flowforge.com/api/webhooks/123/token \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

### Execução Agendada

1. Configure o node Cron com expressão válida
2. Ative o workflow
3. O sistema executará automaticamente nos horários especificados

**Exemplos de Expressões Cron**:
- `0 9 * * *` - Todos os dias às 9:00
- `0 */6 * * *` - A cada 6 horas
- `0 0 * * 0` - Toda segunda-feira à meia-noite

## Ver Logs de Execução

### Acessar Logs

1. Clique em uma execução recente no dashboard
2. Ou navegue para /executions/:id

### Filtrar Logs

- **Pesquisa**: Procure por nome de node, tipo ou mensagem de erro
- **Status**: Filtre por success, failed, ou pending
- **Expandir**: Clique em um passo para ver detalhes

### Informações Disponíveis

- **Input**: Dados que entraram no node
- **Output**: Dados que saíram do node
- **Erro**: Mensagem de erro (se houver)
- **Duração**: Tempo de execução em ms

## Assistente IA

O Assistente IA ajuda você a configurar nodes e gerar expressões de transformação.

### Usar o Assistente

1. Clique no botão "Assistente IA" no painel de configuração
2. Descreva o que deseja fazer em linguagem natural
3. O assistente gerará uma sugestão de configuração
4. Clique "Copiar" para usar a sugestão

### Exemplos de Prompts

- "Enviar um email para notificações de erro"
- "Converter dados CSV para JSON"
- "Extrair o campo 'email' de um objeto"

## Dicas e Boas Práticas

### Design de Workflows

1. **Comece Simples**: Crie workflows pequenos primeiro
2. **Teste Manualmente**: Execute e verifique os logs
3. **Use Logs**: Adicione nodes de Log para debugging
4. **Trate Erros**: Use nodes Condicional para tratamento de erros

### Performance

1. **Minimize Requisições**: Agrupe operações quando possível
2. **Use Timeouts**: Configure timeouts apropriados em HTTP requests
3. **Monitore Execuções**: Verifique regularmente os logs

### Segurança

1. **Credenciais**: Use variáveis de ambiente para chaves de API
2. **Validação**: Valide dados de entrada em nodes Condicional
3. **Logs**: Não registre dados sensíveis em Logs

### Troubleshooting

**Workflow não executa**:
- Verifique se está ativo
- Confira a expressão Cron
- Verifique os logs de erro

**Nodes falham**:
- Verifique a configuração
- Use o Assistente IA para sugestões
- Veja os logs detalhados

**Performance lenta**:
- Reduza o número de nodes
- Otimize expressões de transformação
- Verifique APIs externas

## Suporte

Para questões ou problemas:

1. Verifique os logs de execução
2. Consulte este guia
3. Use o Assistente IA para ajuda
4. Contacte o suporte da plataforma

---

**Versão**: 1.0  
**Última Atualização**: Maio 2026
