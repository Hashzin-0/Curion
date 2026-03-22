---
name: anti-padroes-proibidos
description: |
  Ativar quando o usuário mencionar "anti-pattern", "má prática", "código ruim", "problema", "placeholder", ou quando detectar qualquer um dos seguintes: código duplicado, lógica em componente, uso de "any", acesso direto a API no UI, acoplamento entre módulos, dados não validados, exposição de segredos, ou placeholders/TODOs. Esta skill é uma verificação final antes de entregar código.
---

# Skill: Anti-Padrões Proibidos

## Princípio Fundamental

Proibido terminantemente: código duplicado, lógica em componente, uso de `any`, acesso direto a API no UI, acoplamento entre módulos, dados não validados, exposição de segredos, e placeholders/TODOs não funcionais.

## Lista de Infrações e Correções

### 1. Código Duplicado

**PROIBIDO:**
```tsx
// Duplicação - componentes similares
function UserCard({ user }) {
  return (
    <div className="p-4 border rounded">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <div className="p-4 border rounded">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
    </div>
  );
}
```

**CORREÇÃO:**
```tsx
// Abstração - componente genérico
function Card({ title, description, children }) {
  return (
    <div className="p-4 border rounded">
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}

function UserCard({ user }) {
  return <Card title={user.name} description={user.email} />;
}

function ProductCard({ product }) {
  return <Card title={product.name} description={product.description} />;
}
```

### 2. Lógica em Componente

**PROIBIDO:**
```tsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);
  
  // Lógica de formatação no componente!
  const formatDate = (date) => new Date(date).toLocaleDateString();
  
  return <div>{users.map(u => <div key={u.id}>{formatDate(u.created)}</div>)}</div>;
}
```

**CORREÇÃO:**
```tsx
// Hook - lógica isolada
function useUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    userService.getAll().then(setUsers);
  }, []);
  return users;
}

// Componente - apenas renderização
function UserList() {
  const users = useUsers();
  return <div>{users.map(u => <UserItem key={u.id} user={u} />)}</div>;
}
```

### 3. Uso de `any`

**PROIBIDO:**
```typescript
function processData(data: any): any {
  return data.items.map((item: any) => item.value);
}
```

**CORREÇÃO:**
```typescript
interface DataItem {
  value: string;
}

interface Data {
  items: DataItem[];
}

function processData(data: Data): string[] {
  return data.items.map(item => item.value);
}

// Se o tipo for desconhecido, use unknown com validação
function processUnknown(data: unknown): string[] {
  const validated = DataSchema.parse(data);
  return validated.items.map(item => item.value);
}
```

### 4. Acesso Direto a API no UI

**PROIBIDO:**
```tsx
function Profile() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Acesso direto!
    fetch(`${API_URL}/users/${id}`).then(res => res.json());
  }, []);
  
  return <div>{user?.name}</div>;
}
```

**CORREÇÃO:**
```tsx
// Service - comunicação com API
export const userService = {
  async getById(id: string) {
    return fetch(`${API_URL}/users/${id}`).then(res => res.json());
  }
};

// Hook - consome service
function useUser(id: string) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    userService.getById(id).then(setUser);
  }, [id]);
  return user;
}

// Componente
function Profile({ id }) {
  const user = useUser(id);
  return <div>{user?.name}</div>;
}
```

### 5. Acoplamento entre Módulos

**PROIBIDO:**
```typescript
// users/service.ts
import { ProductService } from '../products/service'; // Acoplamento!

export const UserService = {
  async createUser(data: CreateUserDTO) {
    const user = await db.users.create(data);
    await ProductService.assignDefaultProducts(user.id); // Não!
  }
};
```

**CORREÇÃO:**
```typescript
// users/service.ts
export const UserService = {
  async createUser(data: CreateUserDTO) {
    return db.transaction(async (tx) => {
      const user = await tx.users.create(data);
      await tx.emit('user:created', user); // Evento!
      return user;
    });
  }
};

// products/listener.ts
events.on('user:created', async (user) => {
  await ProductService.assignDefaultProducts(user.id);
});
```

### 6. Dados Não Validados

**PROIBIDO:**
```typescript
function createUser(data: any) {
  // Sem validação!
  return db.users.create(data);
}
```

**CORREÇÃO:**
```typescript
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

function createUser(data: unknown) {
  const validated = CreateUserSchema.parse(data); // Validação!
  return db.users.create(validated);
}
```

### 7. Exposição de Segredos

**PROIBIDO:**
```typescript
const apiKey = 'sk_live_abc123def456';
const dbPassword = 'super_secret_password';

function connect() {
  return new Database({
    password: process.env.DB_PASS || 'fallback_password',
  });
}
```

**CORREÇÃO:**
```typescript
// Configuração de ambiente
const apiKey = process.env.SUPABASE_API_KEY;
if (!apiKey) throw new Error('SUPABASE_API_KEY não configurada');

const dbPassword = process.env.DB_PASSWORD;
if (!dbPassword) throw new Error('DB_PASSWORD não configurada');

function connect() {
  return new Database({ password: dbPassword });
}

// Logs seguros - nunca exponha valores sensíveis
console.log('API request failed', { url, error: error.message }); // ✅
console.log('Token:', token); // ❌ NUNCA
```

## Checklist de Verificação Final

Antes de entregar código, confirme:

- [ ] Não há código duplicado?
- [ ] Lógica está em hooks/services?
- [ ] Nenhum `any` no código?
- [ ] API é acessada via services?
- [ ] Módulos estão desacoplados?
- [ ] Dados são validados com schemas?
- [ ] Secrets estão em variáveis de ambiente?
- [ ] Logs não expõem dados sensíveis?

## 8. Placeholders Não Funcionais

**PROIBIDO:**
```tsx
// Placeholder vazio ou incompleto
function ServicesSection() {
  return <div>Em breve...</div>;
}

function BlogPostEditor() {
  return (
    <div>
      <h2>Blog</h2>
      {/* TODO: Implementar depois */}
    </div>
  );
}
```

**CORREÇÃO:**
```tsx
// Componente funcional completo com empty state real
function ServicesSection({ services }: { services: Service[] }) {
  if (!services?.length) {
    return (
      <EmptyState 
        icon={Package}
        title="Nenhum serviço cadastrado"
        description="Adicione seus serviços para exibir aqui"
        action={<Button>Adicionar Serviço</Button>}
      />
    );
  }
  return <ServiceGrid services={services} />;
}

// Empty state reutilizável
function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-12">
      <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-gray-500 mt-1">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

**REGRA:** Nunca entregue código com placeholders. Se a feature não pode ser completa:
1. Implemente empty state funcional
2. Documente o que falta em COMMENTários de IMPLEMENTAÇÃO
3. Comunique o usuário sobre o que foi entregue

## Regras de Ouro

1. **NUNCA** tolere código duplicado - abstraia imediatamente
2. **NUNCA** coloque lógica em componentes UI
3. **NUNCA** use `any` - use `unknown` com validação
4. **NUNCA** acesse APIs direto de componentes
5. **NUNCA** acople features diretamente
6. **NUNCA** use dados sem validação
7. **NUNCA** exponha secrets em código ou logs
8. **NUNCA** entregue placeholders - implemente empty states funcionais
