---
name: arquitetura-escalavel
description: |
  Ativar quando o usuário mencionar "arquitetura", "escalabilidade", "desacoplamento", "inversão de dependência", "DI", "interface", "contrato", "feature-based", ou quando precisar estruturar um projeto novo, criar abstrações, ou planejar como módulos devem se comunicar. Use esta skill SEMPRE que estiver desenhando a estrutura de um sistema ou conectando módulos.
---

# Skill: Arquitetura Escalável e Desacoplada

## Princípio Fundamental

Use arquitetura baseada em domínio (feature-based + layered). O código deve ser preparado para substituição de qualquer módulo sem impacto global.

## Regras de Ouro

### 1. Proíba Dependências Diretas Entre Features

**RUIM:**
```typescript
// feature-a.ts - dependência direta na feature-b
import { UserService } from '../features/users/service';
```

**BOM:**
```typescript
// feature-a.ts - usa interface/contrato
import type { IUserService } from '@/contracts/IUserService';

class ComponentA {
  constructor(private userService: IUserService) {}
}
```

### 2. Comunicação Apenas Via Interfaces/Contratos

Defina contratos claros entre módulos:
```typescript
// contracts/IUserRepository.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findAll(filters: UserFilters): Promise<User[]>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: string, data: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<void>;
}

// contracts/IEmailService.ts
export interface IEmailService {
  send(to: string, template: EmailTemplate): Promise<void>;
  sendBulk(recipients: string[], template: EmailTemplate): Promise<void>;
}
```

### 3. Inversão de Depência Obrigatória (DI)

Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações.

```typescript
// DOMAIN - Regras de negócio (alto nível)
export class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService
  ) {}

  async execute(data: CreateUserDTO): Promise<Result<User>> {
    // Regras de negócio
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      return Result.fail('Email já cadastrado');
    }

    const user = User.create(data);
    await this.userRepository.create(user);
    
    // Notificação via contrato, não implementação
    await this.emailService.send(user.email, EmailTemplate.WELCOME);
    
    return Result.ok(user);
  }
}

// INFRA - Implementação concreta (baixo nível)
export class SupabaseUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    // Implementação Supabase específica
  }
}

// DI Container / Factory
const userRepository = new SupabaseUserRepository(config);
const emailService = new ResendEmailService(config);
const createUserUseCase = new CreateUserUseCase(userRepository, emailService);
```

## Estrutura de Arquitetura Recomendada

```
src/
├── features/                    # Features desacopladas
│   ├── users/
│   │   ├── domain/              # Entidades, value objects, regras
│   │   ├── application/         # Use cases, DTOs
│   │   ├── infrastructure/      # Repositórios concretos
│   │   └── presentation/        # Componentes, hooks
│   ├── products/
│   │   └── ...
│   └── orders/
│       └── ...
├── contracts/                   # Interfaces compartilhadas
│   ├── IUserRepository.ts
│   ├── IEmailService.ts
│   └── IPaymentGateway.ts
├── shared/                      # Código compartilhado
│   ├── domain/                  # BaseEntity, ValueObject, Result
│   ├── application/             # UseCase base, Service base
│   └── infrastructure/          # DI container
└── config/                      # Configurações
```

## Checklist de Verificação

- [ ] Features não dependem diretamente de outras features?
- [ ] Toda comunicação entre módulos usa interfaces?
- [ ] Módulos de alto nível não dependem de módulos de baixo nível?
- [ ] É possível substituir qualquer módulo sem quebrar outros?
- [ ] A inversão de dependência está aplicada?

## Padrão de Feature Desacoplada

Cada feature deve ser autocontida:

```
features/users/
├── domain/
│   ├── User.ts              # Entidade
│   ├── UserEmail.ts         # Value object
│   └── UserRules.ts         # Regras de negócio
├── application/
│   ├── CreateUser.ts        # Use case
│   ├── UpdateUser.ts        # Use case
│   └── dto/
│       ├── CreateUserDTO.ts
│       └── UpdateUserDTO.ts
├── infrastructure/
│   └── SupabaseUserRepository.ts  # Implementação concreta
└── presentation/
    ├── hooks/
    └── components/
```

## Benefícios desta Arquitetura

1. **Testabilidade**: Mockar interfaces é trivial
2. **Manutenibilidade**: Mudanças isoladas
3. **Escalabilidade**: Novas features não afetam existentes
4. **Flexibilidade**: Trocar implementações (ex: Supabase → PostgreSQL) sem modificar domínio
5. **Equipe**: Múltiplos devs podem trabalhar em features diferentes simultaneamente
