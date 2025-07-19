# Sistema de Lanchonete com Persistência de Dados

## Visão Geral

Este é um sistema completo de gerenciamento para lanchonetes, desenvolvido com **Next.js** (frontend) e **Flask** (backend), implementando persistência de dados com banco SQLite local.

## Funcionalidades

### 🎨 **Design Original Preservado**
- Interface moderna e responsiva
- Componentes UI com Tailwind CSS e shadcn/ui
- Dashboard com estatísticas em tempo real
- Navegação intuitiva entre seções

### 💾 **Persistência de Dados**
- Banco de dados SQLite local
- Modelos relacionais bem estruturados
- APIs RESTful completas
- Backup automático de dados

### 📊 **Funcionalidades de Negócio**
- **Clientes**: Cadastro e gerenciamento
- **Menu**: Itens organizados por categoria
- **Anotações**: Sistema de comandas
- **Vendas**: Controle de transações
- **Relatórios**: Estatísticas diárias

## Estrutura do Projeto

```
lanchonete/
├── src/                          # Frontend Next.js
│   ├── app/                      # App Router do Next.js
│   │   ├── dashboard/            # Páginas do dashboard
│   │   │   ├── annotations/      # Gestão de anotações
│   │   │   ├── customers/        # Gestão de clientes
│   │   │   ├── menu/             # Gestão do menu
│   │   │   ├── orders/           # Gestão de pedidos
│   │   │   ├── sales/            # Relatórios de vendas
│   │   │   └── tabs/             # Sistema de tabs
│   │   ├── globals.css           # Estilos globais
│   │   └── layout.tsx            # Layout principal
│   ├── components/               # Componentes React
│   │   ├── annotations/          # Componentes de anotações
│   │   ├── customers/            # Componentes de clientes
│   │   ├── dashboard/            # Componentes do dashboard
│   │   ├── layout/               # Componentes de layout
│   │   ├── menu/                 # Componentes do menu
│   │   ├── providers/            # Providers de contexto
│   │   ├── tabs/                 # Componentes de tabs
│   │   └── ui/                   # Componentes UI base
│   ├── contexts/                 # Contextos React
│   │   ├── AnnotationsContext.tsx
│   │   ├── CustomersContext.tsx
│   │   ├── MenuContext.tsx
│   │   ├── SalesContext.tsx
│   │   └── TabsContext.tsx
│   ├── services/                 # Serviços de API
│   │   └── api.ts                # Cliente HTTP para backend
│   ├── hooks/                    # Hooks customizados
│   ├── lib/                      # Utilitários
│   └── types/                    # Definições TypeScript
├── lanchonete-backend/           # Backend Flask
│   ├── src/
│   │   ├── models/               # Modelos SQLAlchemy
│   │   │   ├── customer.py
│   │   │   ├── menu_item.py
│   │   │   ├── annotation.py
│   │   │   ├── order_item.py
│   │   │   └── transaction.py
│   │   ├── routes/               # Rotas da API
│   │   │   ├── customers.py
│   │   │   ├── menu_items.py
│   │   │   ├── annotations.py
│   │   │   └── transactions.py
│   │   ├── database/             # Banco de dados
│   │   │   └── app.db            # SQLite database
│   │   └── main.py               # Aplicação principal
│   └── requirements.txt          # Dependências Python
├── package.json                  # Dependências Node.js
├── tailwind.config.ts            # Configuração Tailwind
├── tsconfig.json                 # Configuração TypeScript
├── IMPLEMENTACAO_PERSISTENCIA.md # Documentação técnica
└── COMO_USAR.md                  # Guia de uso
```

## Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- Python 3.11+
- npm ou yarn

### 1. Frontend (Next.js)

```bash
# Navegar para o diretório do projeto
cd lanchonete

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

O frontend estará disponível em: `http://localhost:3000`

### 2. Backend (Flask)

```bash
# Navegar para o diretório do backend
cd lanchonete-backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Executar servidor
python src/main.py
```

O backend estará disponível em: `http://localhost:5000`

## Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS
- **shadcn/ui** - Componentes UI
- **Lucide React** - Ícones
- **Recharts** - Gráficos

### Backend
- **Flask** - Framework web Python
- **SQLAlchemy** - ORM
- **Flask-CORS** - Suporte a CORS
- **SQLite** - Banco de dados

## Banco de Dados

### Esquema das Tabelas

#### customers
- `id` (String, PK)
- `name` (String)
- `phone` (String)
- `created_at` (DateTime)

#### menu_items
- `id` (String, PK)
- `name` (String)
- `price` (Float)
- `category` (String)
- `is_active` (Boolean)
- `created_at` (DateTime)

#### annotations
- `id` (String, PK)
- `customer_id` (String, FK)
- `customer_name` (String)
- `status` (String)
- `created_at` (DateTime)
- `closed_at` (DateTime, nullable)

#### order_items
- `id` (Integer, PK)
- `annotation_id` (String, FK)
- `transaction_id` (String, FK)
- `menu_item_id` (String, FK)
- `quantity` (Integer)
- `unit_price` (Float)
- `created_at` (DateTime)

#### transactions
- `id` (String, PK)
- `annotation_id` (String, FK)
- `total_amount` (Float)
- `payment_method` (String)
- `timestamp` (DateTime)

## APIs Disponíveis

### Base URL: `http://localhost:5000/api`

#### Clientes
- `GET /customers` - Listar clientes
- `POST /customers` - Criar cliente
- `GET /customers/{id}` - Obter cliente
- `PUT /customers/{id}` - Atualizar cliente
- `DELETE /customers/{id}` - Deletar cliente

#### Menu
- `GET /menu-items` - Listar itens
- `POST /menu-items` - Criar item
- `GET /menu-items/{id}` - Obter item
- `PUT /menu-items/{id}` - Atualizar item
- `DELETE /menu-items/{id}` - Remover item

#### Anotações
- `GET /annotations` - Listar anotações
- `POST /annotations` - Criar anotação
- `POST /annotations/{id}/items` - Adicionar item
- `POST /annotations/{id}/close` - Fechar anotação

#### Transações
- `GET /transactions` - Listar transações
- `GET /transactions/stats/daily` - Estatísticas diárias

## Fluxo de Uso

1. **Iniciar Backend**: Execute o servidor Flask
2. **Iniciar Frontend**: Execute o Next.js
3. **Acessar Sistema**: Navegue para `http://localhost:3000`
4. **Gerenciar Dados**: Use a interface para:
   - Cadastrar clientes
   - Gerenciar menu
   - Criar anotações
   - Processar vendas
   - Visualizar relatórios

## Dados Iniciais

O sistema inicializa com:
- 2 clientes de exemplo
- 6 itens no menu (lanches, bebidas, acompanhamentos)

## Backup e Manutenção

### Backup do Banco
```bash
cp lanchonete-backend/src/database/app.db backup_$(date +%Y%m%d).db
```

### Logs
- Backend: Logs no terminal do Flask
- Frontend: Console do navegador

## Desenvolvimento

### Estrutura de Desenvolvimento
- **Frontend**: Desenvolvimento com hot-reload
- **Backend**: Modo debug ativado
- **Banco**: SQLite para desenvolvimento local

### Extensões Recomendadas (VS Code)
- ES7+ React/Redux/React-Native snippets
- Python
- SQLite Viewer
- Tailwind CSS IntelliSense

## Produção

Para deploy em produção:
1. Build do frontend: `npm run build`
2. Configurar variáveis de ambiente
3. Usar servidor WSGI (Gunicorn) para Flask
4. Configurar proxy reverso (Nginx)
5. Implementar SSL/HTTPS

## Suporte

Para dúvidas ou problemas:
1. Consulte a documentação em `IMPLEMENTACAO_PERSISTENCIA.md`
2. Verifique o guia de uso em `COMO_USAR.md`
3. Analise os logs de erro no console

## Licença

Este projeto foi desenvolvido como sistema de gerenciamento para lanchonetes com foco em simplicidade e eficiência.

