# Docker Compose para o Sistema de Lanchonete

Este guia descreve como usar o Docker Compose para orquestrar o frontend (Next.js) e o backend (Flask) do sistema de lanchonete em contêineres Docker.

## Pré-requisitos

Certifique-se de ter o Docker e o Docker Compose instalados em sua máquina.

- [Instalar Docker](https://docs.docker.com/get-docker/)
- [Instalar Docker Compose](https://docs.docker.com/compose/install/)

## Estrutura de Arquivos

Certifique-se de que a estrutura do seu projeto seja a seguinte:

```
lanchonete/
├── Dockerfile              # Dockerfile para o Frontend (Next.js)
├── docker-compose.yml      # Arquivo de orquestração Docker Compose
├── src/                    # Código-fonte do Frontend
│   └── ...
├── lanchonete-backend/     # Código-fonte do Backend
│   ├── Dockerfile          # Dockerfile para o Backend (Flask)
│   ├── src/
│   │   └── ...
│   └── requirements.txt
└── ...
```

## Como Usar

### 1. Navegue até o diretório raiz do projeto

```bash
cd /caminho/para/seu/projeto/lanchonete
```

### 2. Construa e inicie os serviços

Execute o seguinte comando para construir as imagens Docker e iniciar os contêineres em segundo plano:

```bash
docker compose up --build -d
```

**Parâmetros:**
- `docker compose up`: Inicia os serviços definidos no `docker-compose.yml`
- `--build`: Reconstrói as imagens Docker antes de iniciar os contêineres
- `-d`: Executa os contêineres em modo detached (segundo plano)

### 3. Verificar se os serviços estão rodando

```bash
docker compose ps
```

Você deve ver algo como:

```
NAME                    COMMAND                  SERVICE             STATUS              PORTS
lanchonete-backend-1    "python main.py"         backend             running             0.0.0.0:5000->5000/tcp
lanchonete-frontend-1   "docker-entrypoint.s…"   frontend            running             0.0.0.0:3000->3000/tcp
```

### 4. Acessar a aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## Comandos Úteis

### Parar os serviços
```bash
docker compose down
```

### Ver logs dos serviços
```bash
# Todos os serviços
docker compose logs

# Apenas o frontend
docker compose logs frontend

# Apenas o backend
docker compose logs backend

# Seguir logs em tempo real
docker compose logs -f
```

### Reconstruir apenas um serviço
```bash
# Reconstruir apenas o frontend
docker compose build frontend

# Reconstruir apenas o backend
docker compose build backend
```

### Executar comandos dentro dos contêineres
```bash
# Acessar shell do backend
docker compose exec backend /bin/bash

# Acessar shell do frontend
docker compose exec frontend /bin/sh
```

### Reiniciar um serviço específico
```bash
docker compose restart frontend
docker compose restart backend
```

## Configuração dos Serviços

### Backend (Flask)
- **Porta**: 5000
- **Volume**: `./lanchonete-backend/src/database:/app/src/database` (persiste o banco SQLite)
- **Variáveis de ambiente**: `FLASK_ENV=development`

### Frontend (Next.js)
- **Porta**: 3000
- **Dependência**: Aguarda o backend estar disponível
- **Variáveis de ambiente**: `NEXT_PUBLIC_API_BASE_URL=http://backend:5000/api`

## Rede

Os serviços se comunicam através da rede `lanchonete-network`:
- O frontend acessa o backend via `http://backend:5000/api`
- Externamente, o backend está disponível em `http://localhost:5000/api`

## Persistência de Dados

O banco de dados SQLite é persistido através de um volume Docker:
```yaml
volumes:
  - ./lanchonete-backend/src/database:/app/src/database
```

Isso garante que os dados não sejam perdidos quando os contêineres são recriados.

## Solução de Problemas

### Erro de porta em uso
Se receber erro de porta em uso, pare outros serviços que possam estar usando as portas 3000 ou 5000:

```bash
# Verificar processos usando as portas
lsof -i :3000
lsof -i :5000

# Parar serviços Docker existentes
docker compose down
```

### Problemas de build
Se houver problemas na construção das imagens:

```bash
# Limpar cache do Docker
docker system prune -a

# Reconstruir sem cache
docker compose build --no-cache
```

### Frontend não consegue conectar ao backend
Verifique se:
1. O backend está rodando: `docker compose logs backend`
2. A variável de ambiente está correta no `docker-compose.yml`
3. A rede Docker está funcionando: `docker network ls`

### Banco de dados não persiste
Verifique se:
1. O diretório `./lanchonete-backend/src/database` existe
2. As permissões do diretório estão corretas
3. O volume está montado corretamente: `docker compose config`

## Desenvolvimento

Para desenvolvimento, você pode:

1. **Usar volumes para hot-reload** (adicione ao `docker-compose.yml`):
```yaml
volumes:
  - ./src:/app/src
  - /app/node_modules
```

2. **Executar apenas o backend em Docker**:
```bash
docker compose up backend -d
npm run dev  # No diretório do frontend
```

3. **Usar modo de desenvolvimento**:
```yaml
environment:
  - NODE_ENV=development
  - FLASK_ENV=development
```

## Produção

Para produção, considere:

1. **Usar imagens otimizadas**
2. **Configurar variáveis de ambiente de produção**
3. **Usar proxy reverso (Nginx)**
4. **Configurar SSL/HTTPS**
5. **Implementar health checks**

Exemplo de health check:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## Backup

Para fazer backup do banco de dados:

```bash
# Copiar banco de dados do contêiner
docker compose cp backend:/app/src/database/app.db ./backup_$(date +%Y%m%d).db
```

## Monitoramento

Para monitorar os contêineres:

```bash
# Uso de recursos
docker stats

# Logs em tempo real
docker compose logs -f --tail=100
```

