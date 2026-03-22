---
name: manutenibilidade
description: |
  Ativar quando o usuário mencionar "manutenção", "legibilidade", "código limpo", "refatoração", "função pequena", "efeitos colaterais", "testes", "placeholder", "TODO", "funcional", "completo", ou quando precisar escrever código que outros devs vão manter. Use esta skill SEMPRE que criar funções ou componentes para garantir código legível, testável e COMPLETO - sem placeholders ou estados vazios não funcionais.
---

# Skill: Manutenibilidade

## Princípio Fundamental

Código deve ser legível e previsível. Funções curtas e específicas. Evitar efeitos colaterais ocultos. Facilitar testes unitários e integração.

## Funções Pequenas e Específicas

### Regra: Uma Função, Uma Responsabilidade

```typescript
// ❌ RUIM - Função grande com múltiplas responsabilidades
function processUser(userData) {
  // Valida email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    throw new Error('Email inválido');
  }
  
  // Criptografa senha
  const hashedPassword = bcrypt.hash(userData.password, 10);
  
  // Cria usuário no banco
  const user = db.users.create({
    email: userData.email,
    password: hashedPassword,
    name: userData.name,
  });
  
  // Envia email de boas-vindas
  emailService.send(userData.email, 'welcome');
  
  // Loga a ação
  console.log(`User created: ${user.id}`);
  
  return user;
}

// ✅ BOM - Funções pequenas e focadas
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function createUser(data: CreateUserDTO): Promise<User> {
  return db.users.create(data);
}

async function sendWelcomeEmail(email: string): Promise<void> {
  await emailService.send(email, 'welcome');
}

function logUserCreation(userId: string): void {
  console.log(`User created: ${userId}`);
}

// Use case principal - orquestra as funções menores
async function registerUser(userData: CreateUserDTO): Promise<Result<User>> {
  if (!validateEmail(userData.email)) {
    return Result.fail('Email inválido');
  }

  const hashedPassword = await hashPassword(userData.password);
  const user = await createUser({ ...userData, password: hashedPassword });
  
  await Promise.all([
    sendWelcomeEmail(user.email),
    logUserCreation(user.id),
  ]);

  return Result.ok(user);
}
```

## Nomes Descritivos

```typescript
// ❌ RUIM - Nomes vagos
function process(data) {
  const x = data.items.filter(i => i.s === 'active');
  const y = x.map(i => ({ ...i, p: i.p * 1.1 }));
  return y;
}

// ✅ BOM - Nomes descritivos
function applyTenPercentDiscountToActiveProducts(products: Product[]): Product[] {
  const activeProducts = products.filter(product => product.status === 'active');
  return activeProducts.map(product => ({
    ...product,
    price: calculateDiscountedPrice(product.price, DISCOUNT_RATES.TEN_PERCENT),
  }));
}
```

## Evitar Efeitos Colaterais

```typescript
// ❌ RUIM - Efeito colateral oculto
let total = 0;
function addToTotal(amount: number) {
  total += amount; // Modifica estado global!
}

// ✅ BOM - Função pura com retorno
function calculateTotal(currentTotal: number, amount: number): number {
  return currentTotal + amount;
}

// ❌ RUIM - Modifica objeto original
function addProperty(obj: object, key: string, value: unknown) {
  obj[key] = value; // Efeito colateral!
  return obj;
}

// ✅ BOM - Retorna novo objeto
function addProperty<T extends object>(
  obj: T, 
  key: string, 
  value: unknown
): T & Record<string, unknown> {
  return { ...obj, [key]: value };
}
```

## Código Legível

```typescript
// ✅ BOM - Condições claras com early returns
async function processOrder(order: Order): Promise<Result<void>> {
  // Validações primeiro
  if (!order.items.length) {
    return Result.fail('Pedido sem itens');
  }

  if (!isOrderValid(order)) {
    return Result.fail('Pedido inválido');
  }

  // Lógica principal
  const result = await chargeCustomer(order);
  if (!result.isOk) {
    return Result.fail('Falha ao processar pagamento');
  }

  // Sucesso
  await fulfillOrder(order);
  return Result.ok();
}

// ❌ RUIM - Else encadeado (pyramid of doom)
async function processOrder(order: Order) {
  if (order.items.length) {
    if (isOrderValid(order)) {
      const result = await chargeCustomer(order);
      if (result.isOk) {
        await fulfillOrder(order);
        return Result.ok();
      } else {
        return Result.fail('Pagamento falhou');
      }
    } else {
      return Result.fail('Pedido inválido');
    }
  } else {
    return Result.fail('Pedido sem itens');
  }
}
```

## Testabilidade

### Código Testável

```typescript
// ✅ BOM - Dependências injetadas (testável)
class EmailService {
  constructor(private emailClient: IEmailClient) {}
  
  async sendWelcomeEmail(user: User): Promise<void> {
    await this.emailClient.send({
      to: user.email,
      subject: 'Bem-vindo!',
      template: 'welcome',
    });
  }
}

// Teste fácil
const mockEmailClient = {
  send: jest.fn().mockResolvedValue(undefined),
};
const service = new EmailService(mockEmailClient);
await service.sendWelcomeEmail(testUser);
expect(mockEmailClient.send).toHaveBeenCalled();
```

```typescript
// ❌ RUIM - Dependência hardcoded (difícil de testar)
class UserService {
  async sendWelcomeEmail(user: User) {
    const emailClient = new RealEmailClient(); // Não testável!
    await emailClient.send({ to: user.email });
  }
}
```

## Documentação when Necessária

```typescript
// Para funções complexas ou domínio, documente o "porquê"
/**
 * Calcula o desconto progressivo baseado na quantidade de itens.
 * 
 * Lógica de negócio:
 * - 1-10 itens: 0% desconto
 * - 11-50 itens: 5% desconto
 * - 51-100 itens: 10% desconto
 * - 100+ itens: 15% desconto
 * 
 * @param quantity - Número de itens no pedido
 * @param unitPrice - Preço unitário do produto
 * @returns Valor total com desconto aplicado
 */
function calculateProgressiveDiscount(quantity: number, unitPrice: number): number {
  // implementação
}
```

## Completeza do Código

Antes de entregar qualquer código, confirme que está COMPLETO e FUNCIONAL:

### Checklist de Completeza

- [ ] Função faz apenas uma coisa?
- [ ] Nome da função descreve o que ela faz?
- [ ] Não há efeitos colaterais ocultos?
- [ ] Early returns evitam indentação excessiva?
- [ ] Variáveis têm nomes descritivos?
- [ ] Código é autoexplicativo?
- [ ] Funções são fáceis de testar?
- [ ] **NÃO há placeholders ("Em breve", "TODO", "将来")?**
- [ ] **Empty states estão implementados com estados reais?**
- [ ] **Código funciona end-to-end, não apenas visualmente?**

### NUNCA Entregue Placeholders

**PROIBIDO:**
```tsx
function BlogPostEditor() {
  return (
    <div>
      <h2>Blog</h2>
      {/* TODO: Implementar depois */}
    </div>
  );
}
```

**OBRIGATÓRIO:**
```tsx
function BlogPostEditor() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // ... lógica completa
  
  return (
    <div>
      <PostList posts={posts} onEdit={handleEdit} />
      {isAdding && <PostForm onSave={handleSave} />}
    </div>
  );
}
```

### Empty States Funcionais

Para cada lista/grid, implemente empty state real:

```tsx
function ServicesGrid({ services }: { services: Service[] }) {
  if (!services?.length) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">
          Nenhum serviço cadastrado
        </h3>
        <p className="text-gray-500 mt-1">
          Adicione seus serviços para começar
        </p>
      </div>
    );
  }
  
  return <div>{/* renderização real */}</div>;
}
```

## Regras de Ouro

1. **MANTENHA** funções com no máximo 20-30 linhas
2. **USE** nomes descritivos que revelem intenção
3. **EVITE** estado global e efeitos colaterais
4. **PREFIRA** early returns para evitar else
5. **INJETA** dependências para facilitar testes
6. **DOCUMENTE** apenas o "porquê", não o "o quê"
7. **REFATORE** quando código começar a ficar complexo
8. **IMPLEMENTE** empty states funcionais - nunca placeholders
9. **ENTREGUE** código completo - sem TODOs ou "Em breve"
