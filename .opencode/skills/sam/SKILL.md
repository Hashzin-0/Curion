---
name: sam
description: Avalia os repositórios de registry (skills, agents, mcp). Use quando o usuário mencionar "SAM", "avaliar repos", "status dos repos", "SAM iniciar", "relatório dos registries", "quantos skills", "quantos agents", "quantos mcp" ou quiser verificar o estado dos registries no GitHub.
---

# SAM - Sistema de Avaliação de MCP

Avalia os repositórios de registry (Skills, Agents e MCPs) usando o MCP github-registry e gera um relatório detalhado.

## Configuração do MCP

O MCP github-registry está disponível em:
- **Endpoint:** `https://github-registry.onrender.com/mcp`
- **Owner:** `Hashzin-0`
- **Repositórios:**
  - Skills: `Skills`
  - Agents: `Agentes`
  - MCPs: `MCPs`

## Fluxo de Execução

### Passo 1: Verificar conexão com o MCP

Tente chamar uma tool básica do MCP para verificar se está online. Use `registry_get_index` com cada tipo.

### Passo 2: Buscar dados dos registries

Execute as seguintes chamadas ao MCP (pode ser em paralelo):

1. `registry_get_index` com `{ type: "skills" }`
2. `registry_get_index` com `{ type: "agents" }`
3. `registry_get_index` com `{ type: "mcp" }`

### Passo 3: Gerar relatório

Compile os resultados em um relatório Markdown estruturado:

```markdown
# SAM - Relatório de Repositórios

**MCP:** ✅ Online | **Data:** [DATA_ATUAL]

---

## 📦 Skills ([QUANTIDADE])

| Nome | Descrição | Tags | Atualizado |
|------|-----------|------|------------|
| [nome] | [descrição] | [tags] | [data] |

---

## 🤖 Agents ([QUANTIDADE])

| Nome | Descrição | Tags | Atualizado |
|------|-----------|------|------------|
| [nome] | [descrição] | [tags] | [data] |

---

## 🔌 MCPs ([QUANTIDADE])

| Nome | Descrição | Tags | Atualizado |
|------|-----------|------|------------|
| [nome] | [descrição] | [tags] | [data] |

---

### Resumo
- **Total de Skills:** X
- **Total de Agents:** X
- **Total de MCPs:** X
- **Total Geral:** X
```

### Tratamento de erros

Se o MCP estiver offline ou retornar erro:
- Mostrar status como ❌ Offline
- Exibir a mensagem de erro retornada
- Sugerir verificar se o servidor está rodando

## Formato da saída

A saída deve ser um relatório completo em Markdown, pronto para visualização. Use emojis sesuai a convenção:
- ✅ para online/sucesso
- ❌ para offline/erro
- 📦 para skills
- 🤖 para agents
- 🔌 para MCPs

## Exemplos de ativação

- "SAM"
- "SAM iniciar"
- "avaliar repos"
- "status dos repos"
- "quantos skills temos?"
- "relatório dos registries"