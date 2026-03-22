---
name: escalabilidade-futura
description: |
  Ativar quando o usuário mencionar "escalabilidade", "múltiplos ambientes", "multi-tenancy", "futuro", "crescimento", "expansão", "plugin", "extensível", ou quando estiver projetando arquitetura ou adicionando novas features. Use esta skill para garantir que decisões técnicas não limitem o crescimento do projeto.
---

# Skill: Escalabilidade Futura

## Princípio Fundamental

Preparar para múltiplos ambientes, múltiplos usuários simultâneos e crescimento de features. Evitar decisões que limitem expansão futura.

## Arquitetura Preparada para Expansão

### Inversão de Dependência

```typescript
// contracts/IUserRepository.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findAll(filters?: UserFilters): Promise<User[]>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: string, data: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<void>;
}

// Implementação atual (Supabase)
export class SupabaseUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    // Implementação Supabase
  }
}

// Futura implementação (PostgreSQL direto)
export class PostgresUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    // Implementação PostgreSQL
  }
}

// DI Container
const container = {
  userRepository: new SupabaseUserRepository(),
  // Substituir facilmente: userRepository: new PostgresUserRepository()
};
```

### Strategy Pattern para Funcionalidades Variáveis

```typescript
// strategies/discountCalculator.ts
export interface IDiscountStrategy {
  calculate(items: CartItem[]): number;
}

// Estratégia atual
export class NoDiscountStrategy implements IDiscountStrategy {
  calculate(): number { return 0; }
}

// Estratégia futura para VIPs
export class VipDiscountStrategy implements IDiscountStrategy {
  calculate(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.price * 0.1, 0);
  }
}

// Seletor de estratégia
export function getDiscountStrategy(user: User): IDiscountStrategy {
  if (user.tier === 'vip') return new VipDiscountStrategy();
  return new NoDiscountStrategy();
}
```

## Múltiplos Ambientes

### Configuração Flexível

```typescript
// config/env.ts
interface EnvironmentConfig {
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  featureFlags: FeatureFlags;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

interface FeatureFlags {
  enableNewCheckout: boolean;
  enableBetaFeatures: boolean;
  maxItemsPerOrder: number;
}

const configs: Record<string, EnvironmentConfig> = {
  development: {
    apiUrl: 'http://localhost:3000',
    supabaseUrl: process.env.SUPABASE_DEV_URL!,
    supabaseAnonKey: process.env.SUPABASE_DEV_ANON_KEY!,
    featureFlags: {
      enableNewCheckout: true,
      enableBetaFeatures: true,
      maxItemsPerOrder: 100,
    },
    logLevel: 'debug',
  },
  staging: {
    apiUrl: 'https://staging.api.example.com',
    supabaseUrl: process.env.SUPABASE_STAGING_URL!,
    supabaseAnonKey: process.env.SUPABASE_STAGING_ANON_KEY!,
    featureFlags: {
      enableNewCheckout: true,
      enableBetaFeatures: false,
      maxItemsPerOrder: 50,
    },
    logLevel: 'info',
  },
  production: {
    apiUrl: 'https://api.example.com',
    supabaseUrl: process.env.SUPABASE_PROD_URL!,
    supabaseAnonKey: process.env.SUPABASE_PROD_ANON_KEY!,
    featureFlags: {
      enableNewCheckout: false,
      enableBetaFeatures: false,
      maxItemsPerOrder: 20,
    },
    logLevel: 'warn',
  },
};

export const config = configs[process.env.NODE_ENV || 'development'];
```

### Feature Flags

```typescript
// hooks/useFeatureFlag.ts
export function useFeatureFlag(flagName: keyof FeatureFlags): boolean {
  const { featureFlags } = useConfig();
  return featureFlags[flagName];
}

// Uso em componentes
function CheckoutPage() {
  const useNewCheckout = useFeatureFlag('enableNewCheckout');
  
  if (useNewCheckout) {
    return <NewCheckout />;
  }
  return <LegacyCheckout />;
}
```

## Preparação para Múltiplos Usuários

### Isolamento por Usuário

```typescript
// Supabase RLS (Row Level Security)
-- Policy: Usuários só veem seus próprios dados
CREATE POLICY "Users can only view own data"
ON users
FOR SELECT
USING (auth.uid() = id);

-- Policy: Usuários só modificam seus próprios dados
CREATE POLICY "Users can only update own data"
ON users
FOR UPDATE
USING (auth.uid() = id);
```

### Cache Isolado

```typescript
// utils/cache.ts
interface CacheOptions {
  scope: 'global' | 'user' | 'session';
}

class CacheManager {
  private caches = new Map<string, Cache>();
  
  getCache(options: CacheOptions): Cache {
    const key = this.getCacheKey(options);
    if (!this.caches.has(key)) {
      this.caches.set(key, new Cache());
    }
    return this.caches.get(key)!;
  }
  
  private getCacheKey(options: CacheOptions): string {
    if (options.scope === 'user') {
      return `user:${getCurrentUserId()}`;
    }
    if (options.scope === 'session') {
      return `session:${getCurrentSessionId()}`;
    }
    return 'global';
  }
}
```

## Crescimento de Features

### Arquitetura de Plugin

```typescript
// plugins/registry.ts
interface Plugin {
  name: string;
  version: string;
  register(context: PluginContext): void;
}

interface PluginContext {
  registerHook(hook: string, handler: Function): void;
  registerService(name: string, service: unknown): void;
  getConfig(): AppConfig;
}

class PluginRegistry {
  private plugins = new Map<string, Plugin>();

  register(plugin: Plugin) {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already registered`);
    }
    this.plugins.set(plugin.name, plugin);
  }

  initialize(context: PluginContext) {
    for (const plugin of this.plugins.values()) {
      plugin.register(context);
    }
  }
}
```

### Sistema de Eventos para Extensibilidade

```typescript
// events/emitter.ts
type EventHandler<T = unknown> = (data: T) => void | Promise<void>;

class EventEmitter {
  private handlers = new Map<string, Set<EventHandler>>();

  on<T>(event: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => this.handlers.get(event)?.delete(handler);
  }

  async emit<T>(event: string, data: T): Promise<void> {
    const handlers = this.handlers.get(event);
    if (handlers) {
      await Promise.all(
        [...handlers].map(handler => handler(data))
      );
    }
  }
}

// Uso
events.on('user:created', async (user) => {
  await sendWelcomeEmail(user.email);
});

events.on('user:created', async (user) => {
  await initializeUserPreferences(user.id);
});
```

## Checklist de Verificação

- [ ] Comunicação entre módulos usa interfaces?
- [ ] Dependências são injetadas (não hardcoded)?
- [ ] Feature flags controlam funcionalidades?
- [ ] Configuração é por ambiente?
- [ ] Cache é isolado por escopo?
- [ ] Eventos permitem extensibilidade?
- [ ] Sistema permite plugins?

## Regras de Ouro

1. **NUNCA** hardcode dependências - use injeção
2. **DEFINA** interfaces antes de implementações
3. **USE** feature flags para funcionalidades em desenvolvimento
4. **Separe** configuração por ambiente
5. **IMPLEMENTE** eventos para comunicação desacoplada
6. **PREPARE** cache com escopo apropriado
7. **EVITE** decisões que prendam a uma tecnologia específica
