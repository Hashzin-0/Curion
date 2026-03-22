---
name: modularizacao-total
description: |
  Ativar quando o usuário mencionar "modularização", "módulos", "separar arquivos", "responsabilidade única", "SRP", "arquitetura de arquivos", ou quando precisar criar/estruturar componentes, hooks, services ou qualquer tipo de arquivo em um projeto. Use esta skill SEMPRE que estiver criando novos arquivos ou reorganizando código para garantir separação adequada de responsabilidades.
---

# Skill: Modularização Total

## Princípio Fundamental

Quebre absolutamente tudo em módulos reutilizáveis. Cada arquivo deve possuir **responsabilidade única** (Single Responsibility Principle - SRP).

## Estrutura Obrigatória de Separação

Ao criar ou modificar código, organize SEMPRE nas seguintes camadas:

### UI (Componentes Puros)
- Componentes de interface do usuário
- Devem ser declarativos e receber dados via props
- NUNCA conter lógica de negócio ou estado complexo
- Exemplos: `Button`, `Card`, `Modal`, `Input`

### Layouts
- Estruturas de página que organizam componentes
- Definem regiões (header, sidebar, content, footer)
- Exemplos: `DashboardLayout`, `AuthLayout`

### Hooks (Estado e Lógica)
- Toda lógica de estado e efeitos colaterais
- Custom hooks para lógica reutilizável
- Exemplos: `useAuth`, `useFetch`, `useLocalStorage`

### Services (API, Banco, Integrações)
- Comunicação com APIs externas
- Operações de banco de dados
- Integrações com serviços terceiros
- Exemplos: `userService`, `authService`, `supabaseClient`

### Domain (Regras de Negócio)
- Lógica de domínio específica da aplicação
- Regras de validação de negócio
- Transformações de dados
- Exemplos: `validateUserData`, `calculateDiscount`, `UserEntity`

### Infra (Clientes Externos, Configs)
- Configurações de clientes externos
- Clientes de banco de dados
- Configurações de ambiente
- Exemplos: `supabase.ts`, `redis.ts`, `config.ts`

### Types
- Definições de tipos TypeScript
- Interfaces e tipos reutilizáveis
- Exemplos: `User`, `Product`, `ApiResponse<T>`

### Utils
- Funções utilitárias genéricas
- Helpers puros sem side effects
- Exemplos: `formatDate`, `debounce`, `capitalize`

### Constants
- Valores constantes da aplicação
- Configurações fixas
- Exemplos: `API_ENDPOINTS`, `ROUTES`, `ERROR_MESSAGES`

## Checklist de Verificação

Ao criar qualquer arquivo, confirme:

- [ ] O arquivo tem responsabilidade única?
- [ ] Está na camada correta?
- [ ] Pode ser reutilizado em outros contextos?
- [ ] Depende apenas de camadas inferiores?
- [ ] Não viola o princípio de responsabilidade única?

## Estrutura de Diretórios Sugerida

```
src/
├── components/          # UI - Componentes puros
├── layouts/             # Layouts de página
├── hooks/               # Hooks customizados
├── services/            # Services - API e banco
├── domain/              # Domain - Regras de negócio
├── infra/               # Infra - Configs externas
├── types/               # Types - Definições
├── utils/               # Utils - Funções helpers
└── constants/           # Constants - Valores fixos
```

## Regras de Ouro

1. **NUNCA** coloque lógica de negócio em componentes UI
2. **NUNCA** faça chamadas de API diretamente em componentes
3. **SEMPRE** extraia lógica repetida para hooks ou utils
4. **SEMPRE** crie tipos explícitos para dados compartilhados
5. **CADA** arquivo deve fazer uma coisa só, e fazê-la bem

## Exemplo de Aplicação

**RUIM:**
```typescript
// Componente com muitas responsabilidades
function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/user').then(res => res.json()).then(setUser);
  }, []);
  
  const calculateAge = (birthDate) => { /* ... */ };
  const formatAddress = (address) => { /* ... */ };
  
  return <div>/* muito código misturado */</div>;
}
```

**BOM:**
```typescript
// Componente puro - apenas apresentação
function UserProfile({ user, age, formattedAddress }) {
  return (
    <div>
      <Avatar src={user.avatar} />
      <Name>{user.name}</Name>
      <Age>{age} anos</Age>
      <Address>{formattedAddress}</Address>
    </div>
  );
}

// Hook - lógica de estado
function useUser(userId) {
  return useFetch(`/api/users/${userId}`);
}

// Utils - funções puras
function calculateAge(birthDate: Date): number { /* ... */ }
function formatAddress(address: Address): string { /* ... */ }

// Types
interface User { id: string; name: string; birthDate: Date; }
interface Address { street: string; city: string; }
```
