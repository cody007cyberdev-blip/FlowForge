# FlowForge - Guia de Setup e Deployment

Este documento descreve como configurar e fazer deploy do FlowForge em diferentes ambientes.

## Índice

1. [Requisitos](#requisitos)
2. [Setup Local](#setup-local)
3. [Variáveis de Ambiente](#variáveis-de-ambiente)
4. [Docker Deployment](#docker-deployment)
5. [Configuração de Produção](#configuração-de-produção)
6. [Troubleshooting](#troubleshooting)

## Requisitos

### Desenvolvimento Local

- Node.js 22.13.0 ou superior
- pnpm 10.4.1 ou superior
- MySQL 8.0 ou superior (ou Docker)
- Redis (ou Docker)

### Produção

- Docker 20.10+
- Docker Compose 2.0+
- Mínimo 2GB RAM
- 10GB espaço em disco

## Setup Local

### 1. Clonar Repositório

```bash
git clone https://github.com/cody007cyberdev-blip/FlowForge.git
cd FlowForge
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite `.env` com suas configurações:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/flowforge"

# Redis
REDIS_URL="redis://localhost:6379"

# OAuth (Manus)
VITE_APP_ID="seu-app-id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://login.manus.im"
JWT_SECRET="seu-jwt-secret-aleatorio"

# Storage (S3)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="sua-chave"
AWS_SECRET_ACCESS_KEY="seu-segredo"
AWS_S3_BUCKET="seu-bucket"

# LLM (Manus)
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="sua-chave-api"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_KEY="sua-chave-frontend"
```

### 4. Inicializar Banco de Dados

```bash
# Gerar migrações
pnpm drizzle-kit generate

# Executar migrações
pnpm db:push
```

### 5. Iniciar Servidor de Desenvolvimento

```bash
pnpm dev
```

Acesse http://localhost:3000

## Variáveis de Ambiente

### Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão MySQL | `mysql://user:pass@host/db` |
| `JWT_SECRET` | Chave para assinar JWTs | `random-32-char-string` |
| `VITE_APP_ID` | ID da aplicação OAuth | `app-123456` |

### Recomendadas

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `REDIS_URL` | URL do Redis | `redis://localhost:6379` |
| `NODE_ENV` | Ambiente | `development` |
| `PORT` | Porta do servidor | `3000` |

### LLM e Storage

Configurar para usar assistente IA e upload de ficheiros:

```env
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua-chave-api
AWS_S3_BUCKET=seu-bucket
AWS_REGION=us-east-1
```

## Docker Deployment

### Usando Docker Compose (Recomendado)

```bash
# Copiar variáveis de ambiente
cp .env.example .env

# Editar .env com suas configurações
nano .env

# Iniciar serviços
docker-compose up -d

# Ver logs
docker-compose logs -f app
```

### Estrutura do Docker Compose

```yaml
services:
  app:
    - Node.js application
    - Port: 3000
    - Depends on: mysql, redis

  mysql:
    - Database server
    - Port: 3306
    - Volume: ./data/mysql

  redis:
    - Cache and job queue
    - Port: 6379
    - Volume: ./data/redis
```

### Comandos Úteis

```bash
# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f app

# Parar serviços
docker-compose down

# Reiniciar
docker-compose restart

# Remover volumes (CUIDADO - apaga dados)
docker-compose down -v
```

## Configuração de Produção

### Segurança

1. **HTTPS**: Configure um reverse proxy (nginx, Traefik)
2. **Firewall**: Restrinja acesso ao banco de dados
3. **Secrets**: Use um gerenciador de secrets (Vault, AWS Secrets Manager)
4. **Backups**: Configure backups automáticos do banco de dados

### Performance

1. **Redis**: Use para cache e job queue
2. **CDN**: Distribua assets estáticos
3. **Load Balancer**: Escale horizontalmente
4. **Monitoring**: Configure alertas

### Exemplo com Nginx

```nginx
upstream flowforge {
  server app:3000;
}

server {
  listen 443 ssl http2;
  server_name flowforge.example.com;

  ssl_certificate /etc/ssl/certs/cert.pem;
  ssl_certificate_key /etc/ssl/private/key.pem;

  location / {
    proxy_pass http://flowforge;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Troubleshooting

### Erro de Conexão ao Banco de Dados

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solução**:
- Verifique se MySQL está rodando
- Verifique `DATABASE_URL` em `.env`
- Verifique credenciais

### Erro de OAuth

```
Error: Invalid OAuth configuration
```

**Solução**:
- Verifique `VITE_APP_ID` e `OAUTH_SERVER_URL`
- Certifique-se que a aplicação está registrada
- Verifique URL de callback

### Erro de LLM

```
Error: LLM service unavailable
```

**Solução**:
- Verifique `BUILT_IN_FORGE_API_URL`
- Verifique `BUILT_IN_FORGE_API_KEY`
- Verifique conectividade de rede

### Porta Já em Uso

```
Error: listen EADDRINUSE :::3000
```

**Solução**:
```bash
# Encontrar processo na porta
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar porta diferente
PORT=3001 pnpm dev
```

### Problemas com Docker

```bash
# Reconstruir imagens
docker-compose build --no-cache

# Limpar volumes
docker-compose down -v

# Reiniciar do zero
docker-compose up -d --force-recreate
```

## Verificação de Saúde

### Endpoints de Health Check

```bash
# Health check básico
curl http://localhost:3000/api/health

# Verificar banco de dados
curl http://localhost:3000/api/health/db

# Verificar Redis
curl http://localhost:3000/api/health/redis
```

## Logs

### Localização dos Logs

```
.manus-logs/
├── devserver.log          # Logs do servidor
├── browserConsole.log     # Logs do cliente
├── networkRequests.log    # Requisições HTTP
└── sessionReplay.log      # Eventos de sessão
```

### Ver Logs em Tempo Real

```bash
# Servidor
tail -f .manus-logs/devserver.log

# Cliente
tail -f .manus-logs/browserConsole.log

# Docker
docker-compose logs -f app
```

## Próximos Passos

1. Configure um domínio customizado
2. Configure backups automáticos
3. Configure monitoramento e alertas
4. Teste fluxos de recuperação de desastres

---

**Versão**: 1.0  
**Última Atualização**: Maio 2026
