---
name: tipagem-rigorosa
description: |
  Ativar quando o usuário mencionar "tipo", "TypeScript", "interface", "tipagem", "schema", "validação", "any", ou quando estiver criando/defindo estruturas de dados, funções ou componentes. Use esta skill SEMPRE que escrever código TypeScript para garantir tipagem completa e sem uso de `any`.
---

# Skill: Tipagem Rigorosa

## Princípio Fundamental

Tipagem completa e explícita. Proibido uso de `any`. Criar tipos reutilizáveis e contratos bem definidos. Validação de dados obrigatória.

## Regras de Ferro

### 1. NUNCA use `any`

```typescript
// ❌ RUIM
function processData(data: any): any {
  return data.map((item: any) => item.value);
}

// ✅ BOM
function processData<T extends { value: unknown }>(data: T[]): unknown[] {
  return data.map((item) => item.value);
}
```

### 2. Sempre defina tipos explícitos

```typescript
// ❌ RUIM - types implícitos
const user = { name: 'John', age: 30 };
function fetchUser(id) { return fetch(`/api/${id}`); }

// ✅ BOM - types explícitos
interface User {
  id: string;
  name: string;
  age: number;
  email: string;
  createdAt: Date;
}

function fetchUser(id: string): Promise<User> {
  return fetch(`/api/users/${id}`).then(res => res.json());
}
```

## Tipos Reutilizáveis

### Tipos Genéricos
```typescript
// types/common.ts
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<Result<T>>;
export type LoadingState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

// Uso
type UserId = string;
type UserOptional = Optional<User>;
type UserNullable = Nullable<User>;
```

### Tipos de API
```typescript
// types/api.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

### Tipos de Domínio
```typescript
// types/user.ts
export interface User {
  id: string;
  email: Email;
  profile: UserProfile;
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  language: SupportedLanguage;
}
```

## Validação com Schemas

Use Zod ou equivalente para validação em runtime:

```typescript
// schemas/user.schema.ts
import { z } from 'zod';

export const UserProfileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  profile: UserProfileSchema,
});

export const UpdateUserSchema = CreateUserSchema.partial();

// Inferir tipos dos schemas
export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;

// Validação em services
export async function createUser(data: unknown): Promise<Result<User>> {
  const validated = CreateUserSchema.safeParse(data);
  if (!validated.success) {
    return Result.fail(validated.error.message);
  }
  // proceeds with validated.data which is CreateUserDTO
}
```

## Contratos de Interface

```typescript
// contracts/IUserRepository.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findAll(filters: UserFilters): Promise<PaginatedResponse<User>>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: string, data: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface UserFilters {
  search?: string;
  status?: UserStatus;
  role?: UserRole;
  createdAfter?: Date;
  createdBefore?: Date;
}
```

## Checklist de Verificação

- [ ] Todos os tipos são explícitos?
- [ ] `any` foi completamente eliminado?
- [ ] Tipos reutilizáveis estão centralizados?
- [ ] Validação de dados com schema está implementada?
- [ ] Interfaces/contratos definem comunicação entre módulos?
- [ ] Genéricos são usados quando apropriado?

## Configuração TypeScript Recomendada

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Regras de Ouro

1. **NUNCA** use `any` - use `unknown` se necessário, com validação
2. **SEMPRE** defina interfaces para comunicação entre módulos
3. **USE** tipos genéricos para reutilização
4. **VALIDE** dados de entrada com schemas (Zod/Yup)
5. **CENTRALIZE** tipos comuns em arquivos dedicado
6. **EVITE** `as` para type casting - prefira validação
