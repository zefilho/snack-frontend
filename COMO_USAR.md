# Como Usar o Sistema com Persistência

## Iniciando o Sistema

### 1. Backend (Obrigatório)
```bash
cd lanchonete-backend
source venv/bin/activate
python src/main.py
```
O servidor iniciará na porta 5000 e criará automaticamente:
- Banco de dados SQLite em `src/database/app.db`
- Tabelas necessárias
- Dados iniciais (clientes e menu)

### 2. Frontend
```bash
cd lanchonete
npm run dev
```
O frontend iniciará na porta 3000 e se conectará automaticamente ao backend.

## Funcionalidades Disponíveis

### Gerenciamento de Clientes
- **Visualizar**: Lista todos os clientes cadastrados
- **Adicionar**: Criar novos clientes com nome e telefone
- **Editar**: Atualizar informações dos clientes
- **Remover**: Deletar clientes (se não tiverem anotações)

### Gerenciamento do Menu
- **Visualizar**: Lista todos os itens do menu por categoria
- **Adicionar**: Criar novos itens com nome, preço e categoria
- **Editar**: Atualizar informações dos itens
- **Remover**: Desativar itens (soft delete)

### Sistema de Anotações (Comandas)
- **Criar**: Nova anotação para um cliente
- **Adicionar Itens**: Incluir produtos na anotação
- **Visualizar Total**: Cálculo automático do valor
- **Fechar**: Finalizar anotação gerando transação

### Controle de Vendas
- **Histórico**: Visualizar todas as transações
- **Estatísticas**: Vendas do dia, ticket médio, total de pedidos
- **Relatórios**: Dados por período e método de pagamento

## Fluxo de Trabalho Típico

### 1. Atendimento ao Cliente
1. Selecionar cliente existente ou criar novo
2. Criar nova anotação para o cliente
3. Adicionar itens do menu à anotação
4. Visualizar total da anotação
5. Fechar anotação escolhendo método de pagamento

### 2. Gestão do Estabelecimento
1. Acompanhar vendas em tempo real no dashboard
2. Gerenciar itens do menu (adicionar/remover/editar)
3. Cadastrar novos clientes
4. Consultar histórico de vendas

## Dados Persistidos

Todos os dados são automaticamente salvos no banco SQLite:
- ✅ Clientes cadastrados
- ✅ Itens do menu
- ✅ Anotações (abertas e fechadas)
- ✅ Transações de venda
- ✅ Histórico completo

## Backup e Recuperação

### Backup Manual
```bash
cp lanchonete-backend/src/database/app.db backup_$(date +%Y%m%d).db
```

### Restaurar Backup
```bash
cp backup_YYYYMMDD.db lanchonete-backend/src/database/app.db
```

## Solução de Problemas

### Backend não inicia
- Verificar se o ambiente virtual está ativado
- Instalar dependências: `pip install -r requirements.txt`
- Verificar se a porta 5000 está livre

### Frontend não conecta
- Verificar se o backend está rodando
- Confirmar URL da API em `src/services/api.ts`
- Verificar console do navegador para erros

### Dados não aparecem
- Verificar se o backend criou o banco de dados
- Confirmar se as tabelas foram criadas
- Verificar logs do servidor para erros

## Estrutura do Banco de Dados

O arquivo `app.db` contém todas as tabelas:
- `customers` - Clientes
- `menu_items` - Itens do menu
- `annotations` - Anotações/comandas
- `order_items` - Itens dos pedidos
- `transactions` - Transações de venda

## APIs Disponíveis

Base URL: `http://localhost:5000/api`

### Principais Endpoints
- `GET /customers` - Listar clientes
- `GET /menu-items` - Listar menu
- `GET /annotations` - Listar anotações
- `GET /transactions` - Listar vendas
- `GET /transactions/stats/daily` - Estatísticas do dia

## Configuração de Produção

Para usar em produção:
1. Alterar `debug=False` no `main.py`
2. Configurar variáveis de ambiente
3. Usar servidor WSGI (Gunicorn)
4. Configurar backup automático
5. Implementar SSL/HTTPS

