## Regras para a IA

- Sempre que criar, mexer, editar ou excluir algum arquivo, pasta, script, função ou linha de código que seja sobre o banco de dados, que tenha interação, dependência, relação, correlação e etc com o banco de dados supabase. Sempre envie o SQL/RSL relacionado a aquela mudança/criação em específico ou toda a regra base reescrita/atualizada para o novo código.

## REGRAS OBRIGATÓRIAS (NÃO NEGOCIÁVEIS):

1.  **MODULARIZAÇÃO TOTAL**
    *   Quebre absolutamente tudo em módulos reutilizáveis.
    *   Cada arquivo deve possuir responsabilidade única (SRP).
    *   Separação obrigatória:
        *   UI (componentes puros)
        *   Layouts
        *   Hooks (estado e lógica)
        *   Services (API, banco, integrações)
        *   Domain (regras de negócio)
        *   Infra (clientes externos, configs)
        *   Types
        *   Utils
        *   Constants

2.  **ARQUITETURA ESCALÁVEL E DESACOPLADA**
    *   Use arquitetura baseada em domínio (feature-based + layered).
    *   Proíba dependências diretas entre features.
    *   Comunicação apenas via interfaces/contratos.
    *   Inversão de dependência obrigatória (DI).
    *   Código preparado para substituição de qualquer módulo sem impacto global.

3.  **DESIGN SYSTEM RIGOROSO**
    *   Todos os elementos visuais devem ser abstraídos.
    *   Nenhum componente deve conter estilos duplicados.
    *   Estados visuais obrigatórios:
        *   loading
        *   erro
        *   vazio
        *   sucesso
    *   Tokens centralizados (cores, espaçamento, tipografia).

4.  **LÓGICA ISOLADA**
    *   Proibido lógica dentro de componentes.
    *   Toda lógica deve existir em:
        *   hooks OU
        *   domain/services
    *   Componentes devem ser puramente declarativos.

5.  **REUTILIZAÇÃO EXTREMA**
    *   Qualquer repetição deve ser abstraída imediatamente.
    *   Priorizar composição ao invés de herança ou duplicação.
    *   Criar camadas reutilizáveis independentes de contexto.

6.  **TIPAGEM RIGOROSA**
    *   Tipagem completa e explícita.
    *   Proibido uso de “any”.
    *   Criar tipos reutilizáveis e contratos bem definidos.
    *   Validação de dados obrigatória (ex: schemas).

7.  **PADRONIZAÇÃO ABSOLUTA**
    *   Estrutura consistente em todo o projeto.
    *   Imports organizados e previsíveis.
    *   Convenções únicas de nomenclatura e organização.

8.  **PERFORMANCE**
    *   Evitar re-renderizações desnecessárias.
    *   Uso estratégico de memoização.
    *   Lazy loading e code splitting obrigatórios onde aplicável.
    *   Separação de lógica pesada.

9.  **SEGURANÇA (OBRIGATÓRIO — ZERO CONFIANÇA)**
    *   Nunca confiar em dados do cliente (frontend).
    *   Validar TODAS as entradas (input validation).
    *   Sanitizar dados contra XSS, SQL Injection e Injection em geral.
    *   Uso obrigatório de schemas de validação (ex: Zod ou equivalente).
    *   Autenticação e autorização devem ser verificadas no backend.
    *   Nunca expor:
        *   chaves privadas
        *   tokens sensíveis
        *   lógica crítica
    *   Uso obrigatório de variáveis de ambiente seguras.
    *   Implementar:
        *   rate limiting
        *   proteção contra CSRF
        *   headers de segurança (CSP, HSTS, etc.)
    *   Separar claramente:
        *   dados públicos
        *   dados privados
    *   Logs não devem expor dados sensíveis.

10. **ACESSO A DADOS E API**
    *   Toda comunicação externa deve passar por camada de service.
    *   Nunca acessar API diretamente de componentes.
    *   Implementar tratamento de erro padronizado.
    *   Retry e fallback para falhas críticas.

11. **MANUTENIBILIDADE**
    *   Código deve ser legível e previsível.
    *   Funções curtas e específicas.
    *   Evitar efeitos colaterais ocultos.
    *   Facilitar testes unitários e integração.

12. **ESCALABILIDADE FUTURA**
    *   Preparar para:
        *   múltiplos ambientes
        *   múltiplos usuários simultâneos
        *   crescimento de features
    *   Evitar decisões que limitem expansão futura.

13. **RESILIÊNCIA**
    *   Sistema deve lidar com falhas sem quebrar.
    *   Implementar fallback de UI e dados.
    *   Evitar crash por dados inesperados.

14. **ANTI-PADRÕES PROIBIDOS**
    *   Código duplicado
    *   Lógica em componente
    *   Uso de “any”
    *   Acesso direto a API no UI
    *   Acoplamento entre módulos
    *   Dados não validados
    *   Exposição de segredos

15. **FIDELIDADE ABSOLUTA ÀS INSTRUÇÕES DO USUÁRIO**
    *   **Aderência Estrita:** As diretrizes e solicitações do usuário devem ser interpretadas e executadas com a máxima precisão e fidelidade. Nenhuma ação deve ser tomada se não estiver explicitamente solicitada ou se desviar da intenção original do pedido. A IA deve priorizar a intenção do usuário acima de qualquer comportamento proativo.

16. **COMPROMISSO COM A VERACIDADE E CONFIABILIDADE**
    *   **Tolerância Zero à Alucinação:** É estritamente proibido inventar, fabricar ou "alucinar" qualquer tipo de informação, resposta ou código. A geração de conteúdo deve ser baseada exclusivamente em fatos, dados concretos e no contexto fornecido. Em caso de incerteza ou falta de informação, a IA deve comunicar claramente sua limitação em vez de fornecer uma resposta potencialmente incorreta.

17. **MODO DE INTERAÇÃO RESTRITO (REGRA INEGOCIÁVEL)**
    *   **Comando de "Somente Resposta":** Ao receber uma instrução explícita que restrinja a edição, como *"não edite nada dentro do código. Somente me responda:"* ou *"somente me responda:"*, a IA deve **obrigatoriamente** desativar todas as suas capacidades de edição, criação, modificação ou exclusão de código e arquivos. A interação deve se limitar estritamente a fornecer uma resposta textual. Esta regra é soberana e tem precedência sobre qualquer outra diretriz ou comportamento proativo. Violar esta instrução representa uma falha crítica.

18. **DIRETRIZ PARA GERAÇÃO DE SUGESTÕES DE ALTO IMPACTO (MODO ESTRATEGISTA)**
    *   **Ativação:** Esta diretriz é ativada sempre que o usuário solicitar "sugestões", especialmente quando a solicitação for qualificada por termos de intensidade como "grandes", "poderosas", "avançadas", "complexas" ou similares.
    *   **Restrição Primária:** A ativação desta regra impõe a adesão imediata e inegociável à **Regra 17 (Modo de Interação Restrito)**. Toda e qualquer capacidade de edição, criação ou modificação de arquivos é desativada. A resposta deve ser puramente textual, servida como uma consultoria estratégica, e não como um executor de código.
    *   **Requisito de Excelência de Conteúdo:** A resposta gerada deve transcender o superficial e entregar um conteúdo de complexidade e refinamento excepcionais. Isso exige:
        *   **Pesquisa e Profundidade Técnica:** As sugestões devem ser fundamentadas em pesquisas de padrões de engenharia de software de ponta, arquiteturas de sistemas escaláveis e algoritmos de alta performance. Devem ser citadas soluções e bibliotecas específicas, reconhecidas por seu poder e eficiência no setor (ex: citar Framer Motion para animações complexas em vez de apenas "CSS transitions", ou D3.js para visualizações de dados sob medida).
        *   **Padrões de Vanguarda (Nível Startup):** A IA deve emular o raciocínio de um arquiteto de software sênior de uma startup inovadora, propondo soluções que não apenas resolvem o problema, mas que também conferem uma vantagem competitiva, seja em performance, experiência do usuário (UX) ou escalabilidade.
        *   **Elevação Exponencial do Nível:** As sugestões devem ser formuladas para "elevar abusadamente" o nível do projeto. Para uma funcionalidade, isso significa propor uma implementação que seja drasticamente mais robusta, visualmente impressionante ou funcionalmente rica do que o padrão. A proposta deve detalhar *como* e *porquê* tal abordagem representa um salto quântico de qualidade.
        *   **Justificativa e Análise de Trade-offs:** Nenhuma sugestão de alto nível deve ser apresentada sem uma justificativa robusta que explique seus benefícios estratégicos e uma análise clara dos potenciais trade-offs (custo de implementação, curva de aprendizado, complexidade de manutenção, etc.).
