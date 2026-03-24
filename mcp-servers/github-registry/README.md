# GitHub Registry MCP Server

MCP Server para gerenciar Skills, Agentes e MCPs em repositórios GitHub.

## Funcionalidades

### Operações GitHub Básicas
- `github_read_file` - Ler arquivo de qualquer repositório
- `github_write_file` - Criar/editar arquivo em qualquer repositório
- `github_list_directory` - Listar conteúdo de diretório

### Operações de Registry
- `registry_init` - Inicializar estrutura do repositório (index.json + diretórios)
- `registry_save` - Salvar item e atualizar index.json automaticamente
- `registry_search` - Buscar por nome ou tags no índice
- `registry_list` - Listar todos os itens com agrupamento opcional
- `registry_get_index` - Obter o index.json cru

## Configuração no OpenCode

### 1. Clone o repositório

```bash
cd mcp-servers/github-registry
npm install
npm run build
```

### 2. Configure o MCP no OpenCode

Adicione ao seu arquivo de configuração MCP:

```json
{
  "mcpServers": {
    "github-registry": {
      "command": "node",
      "args": ["/workspaces/Curion/mcp-servers/github-registry/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "seu_token_aqui"
      }
    }
  }
}
```

Alternativamente, edite o arquivo para incluir o token diretamente:

O token já está configurado no código para testes. Para produção, defina a variável de ambiente:

```bash
export GITHUB_TOKEN=github_pat_xxx
```

## Uso

### Inicializar um Registry

```javascript
// Inicializar registry de skills
await registry_init({ type: 'skills' })

// Inicializar registry de agentes
await registry_init({ type: 'agents' })

// Inicializar registry de MCPs
await registry_init({ type: 'mcp' })
```

### Salvar um Item

```javascript
await registry_save({
  type: 'skills',
  name: 'fetch-user-data',
  content: '# Fetch User Data\n\nSkill para buscar dados de usuário...',
  path: 'api',
  tags: ['api', 'user', 'fetch'],
  description: 'Fetch user data from API'
})
```

### Buscar Itens

```javascript
// Buscar por nome ou tag
await registry_search({ type: 'skills', query: 'api' })
```

### Listar Itens

```javascript
// Lista simples
await registry_list({ type: 'skills' })

// Lista agrupada por caminho
await registry_list({ type: 'skills', groupBy: 'path' })

// Lista agrupada por tags
await registry_list({ type: 'skills', groupBy: 'tags' })
```

## Estrutura dos Repositórios

Os repositórios devem seguir este padrão:

```
Skills/
├── index.json
├── api/
│   └── fetch-user-data.md
└── ai/
    └── summarizer.md

Agentes/
├── index.json
└── ...

MCPs/
└── index.json
```

### Estrutura do index.json

```json
{
  "type": "skills",
  "items": [
    {
      "name": "fetch-user-data",
      "path": "api/fetch-user-data.md",
      "tags": ["api", "user"],
      "description": "Fetch user data from API",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "version": "1.0.0",
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

## Desenvolvimento

```bash
# Desenvolvimento com hot reload
npm run dev

# Build de produção
npm run build

# Testar localmente
node dist/index.js
```

## Licença

MIT