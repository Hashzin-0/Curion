---
name: acesso-dados-api
description: |
  Ativar quando o usuário mencionar "API", "fetch", "axios", "supabase", "banco de dados", "service", "repositório", "endpoint", "requisição", "response", ou quando precisar criar integrações com serviços externos. Use esta skill SEMPRE que implementar comunicação com APIs ou banco de dados para garantir tratamento padronizado.
---

# Skill: Acesso a Dados e API

## Princípio Fundamental

Toda comunicação externa deve passar por camada de service. Nunca acessar API diretamente de componentes. Implementar tratamento de erro padronizado. Retry e fallback para falhas críticas.

## Camada de Service

### Estrutura de Service

```typescript
// services/userService.ts
import { supabase } from '@/infra/supabase';
import type { User, CreateUserDTO, UpdateUserDTO } from '@/types/user';
import { CreateUserSchema, UpdateUserSchema } from '@/schemas/user.schema';

export const userService = {
  async findById(id: string): Promise<Result<User>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return Result.fail('Usuário não encontrado');

      return Result.ok(data as User);
    } catch (err) {
      return Result.fail(handleServiceError(err));
    }
  },

  async create(data: CreateUserDTO): Promise<Result<User>> {
    try {
      const validated = CreateUserSchema.parse(data);
      
      const { data: created, error } = await supabase
        .from('users')
        .insert(validated)
        .select()
        .single();

      if (error) throw error;

      return Result.ok(created as User);
    } catch (err) {
      if (err instanceof ZodError) {
        return Result.fail(err.errors.join(', '));
      }
      return Result.fail(handleServiceError(err));
    }
  },

  async update(id: string, data: UpdateUserDTO): Promise<Result<User>> {
    try {
      const validated = UpdateUserSchema.partial().parse(data);
      
      const { data: updated, error } = await supabase
        .from('users')
        .update(validated)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return Result.ok(updated as User);
    } catch (err) {
      return Result.fail(handleServiceError(err));
    }
  },

  async delete(id: string): Promise<Result<void>> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return Result.ok();
    } catch (err) {
      return Result.fail(handleServiceError(err));
    }
  },
};
```

### Client HTTP Centralizado

```typescript
// infra/apiClient.ts
interface ApiClientOptions {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(options: ApiClientOptions) {
    this.baseURL = options.baseURL;
    this.timeout = options.timeout || 30000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  private async request<T>(
    method: string,
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<Result<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return Result.fail(error.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return Result.ok(data as T);
    } catch (err) {
      clearTimeout(timeoutId);
      return Result.fail(handleNetworkError(err));
    }
  }

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>('GET', endpoint, options);
  }

  post<T>(endpoint: string, body: unknown, options?: RequestOptions) {
    return this.request<T>('POST', endpoint, { ...options, body });
  }

  put<T>(endpoint: string, body: unknown, options?: RequestOptions) {
    return this.request<T>('PUT', endpoint, { ...options, body });
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>('DELETE', endpoint, options);
  }
}

export const apiClient = new ApiClient({ baseURL: process.env.API_URL });
```

## Retry com Fallback

```typescript
// utils/retry.ts
interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoff?: boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      
      if (attempt < options.maxAttempts) {
        const delay = options.backoff 
          ? options.delayMs * Math.pow(2, attempt - 1)
          : options.delayMs;
        await sleep(delay);
      }
    }
  }

  throw lastError!;
}

// Uso
async function fetchUserWithRetry(id: string) {
  return withRetry(
    () => userService.findById(id),
    { maxAttempts: 3, delayMs: 1000, backoff: true }
  );
}
```

## Hook com Treatmento de Erro

```typescript
// hooks/useService.ts
export function useService<T>(
  serviceFn: () => Promise<Result<T>>,
  deps: DependencyList = []
) {
  const [state, setState] = useState<LoadingState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    async function execute() {
      setState(s => ({ ...s, loading: true, error: null }));
      
      const result = await serviceFn();
      
      if (mounted) {
        if (result.isOk) {
          setState({ data: result.value, loading: false, error: null });
        } else {
          setState({ data: null, loading: false, error: new Error(result.error) });
        }
      }
    }

    execute();

    return () => { mounted = false; };
  }, deps);

  return state;
}

// Uso
function UserProfile({ userId }: { userId: string }) {
  const { data: user, loading, error, refetch } = useService(
    () => userService.findById(userId),
    [userId]
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;
  return <div>{user.name}</div>;
}
```

## Padrão Result

```typescript
// shared/Result.ts
export type Result<T> = 
  | { isOk: true; value: T }
  | { isOk: false; error: string };

export const Result = {
  ok<T>(value: T): Result<T> {
    return { isOk: true, value };
  },
  
  fail<T = never>(error: string): Result<T> {
    return { isOk: false, error };
  },
};

// Helper para uso em async functions
export async function toResult<T>(
  promise: Promise<T>
): Promise<Result<T>> {
  try {
    const value = await promise;
    return Result.ok(value);
  } catch (error) {
    return Result.fail(error instanceof Error ? error.message : 'Unknown error');
  }
}
```

## Checklist de Verificação

- [ ] Comunicação com API está em camada de service?
- [ ] Componentes não acessam API diretamente?
- [ ] Erros são tratados de forma padronizada?
- [ ] Retry está implementado para operações críticas?
- [ ] Fallback de dados está disponível?
- [ ] Tipos de retorno estão definidos?
- [ ] Loading e error states estão implementados?

## Regras de Ouro

1. **NUNCA** faça fetch/axios direto em componentes
2. **SEMPRE** crie services para cada recurso/domínio
3. **IMPLEMENTE** tratamento de erro padronizado
4. **USE** padrão Result para retorno de services
5. **ADICIONE** retry com backoff para operações críticas
6. **FORNEÇA** fallback para falhas de dados
7. **MANTENHA** hooks de consumo de services
