---
name: reutilizacao-extrema
description: |
  Ativar quando o usuário mencionar "reutilizar", "duplicação", "código repetido", "dry", "composição", "abstrair", "componente genérico", ou quando notar código sendo copiado/adaptado. Use esta skill SEMPRE que detectar repetição de código para garantir abstração imediata.
---

# Skill: Reutilização Extrema

## Princípio Fundamental

Qualquer repetição deve ser abstraída imediatamente. Priorizar composição ao invés de herança ou duplicação. Criar camadas reutilizáveis independentes de contexto.

## Detecção de Duplicação

### Sinais de Alerta

1. Código copiado e colado com pequenas modificações
2. Padrões similares em diferentes arquivos
3. Mesma lógica implementada de formas levemente diferentes
4. Componentes que recebem props quase idênticas

### Exemplo de Duplicação

```tsx
// ❌ RUIM - Duplicação
function UserCard({ user, onEdit, onDelete }) {
  return (
    <div className="card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <div className="actions">
        <button onClick={onEdit}>Editar</button>
        <button onClick={onDelete} className="danger">Excluir</button>
      </div>
    </div>
  );
}

function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="actions">
        <button onClick={onEdit}>Editar</button>
        <button onClick={onDelete} className="danger">Excluir</button>
      </div>
    </div>
  );
}
```

### Abstraindo para Composição

```tsx
// ✅ BOM - Composição com componentes reutilizáveis
function Card({ title, description, actions }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="actions">{actions}</div>
    </div>
  );
}

function ActionButton({ children, variant = 'primary', onClick }) {
  return (
    <button onClick={onClick} className={variant}>
      {children}
    </button>
  );
}

// Uso específico - componentes de domínio
function UserCard({ user, onEdit, onDelete }) {
  return (
    <Card
      title={user.name}
      description={user.email}
      actions={
        <>
          <ActionButton onClick={onEdit}>Editar</ActionButton>
          <ActionButton variant="danger" onClick={onDelete}>Excluir</ActionButton>
        </>
      }
    />
  );
}

function ProductCard({ product, onEdit, onDelete }) {
  return (
    <Card
      title={product.name}
      description={product.description}
      actions={
        <>
          <ActionButton onClick={onEdit}>Editar</ActionButton>
          <ActionButton variant="danger" onClick={onDelete}>Excluir</ActionButton>
        </>
      }
    />
  );
}
```

## Composição vs Herança

### ❌ Herança (Evitar)
```typescript
class UserRepository extends BaseRepository {}
class ProductRepository extends BaseRepository {}
```

### ✅ Composição (Preferir)
```typescript
// BaseRepository é injetado, não herdado
function createRepository<T>(client: DatabaseClient): IRepository<T> {
  return {
    findAll: () => client.query<T>(),
    findById: (id) => client.queryOne<T>(id),
    create: (data) => client.insert(data),
    // ...
  };
}

const userRepo = createRepository<User>(supabaseClient);
const productRepo = createRepository<Product>(supabaseClient);
```

## Camadas Reutilizáveis

### Utilities (Funções Puras)
```typescript
// utils/format.ts
export function formatCurrency(value: number, locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: format === 'long' ? 'full' : 'short',
  }).format(d);
}

export function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
}
```

### Custom Hooks Genéricos
```typescript
// hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue(prev => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      return valueToStore;
    });
  }, [key]);

  return [storedValue, setValue] as const;
}

// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
```

## Checklist de Verificação

- [ ] O código atual tem similar com algo existente?
- [ ] Posso criar um componente/hook/util genérico?
- [ ] A abstração não acopla contextos diferentes?
- [ ] Composição resolve o problema de forma mais limpa?
- [ ] A abstração será usada em mais de um lugar?

## Regras de Ouro

1. **NUNCA** copie e cole código com modificações
2. **SEMPRE** pare e pense: "isso já existe em algum lugar?"
3. **PRIORIZE** composição sobre herança
4. **CRIE** utilitários genéricos para funções puras
5. **EXTRAIA** hooks customizados para lógica reutilizável
6. **MANTENHA** abstrações independentes de domínio quando possível
