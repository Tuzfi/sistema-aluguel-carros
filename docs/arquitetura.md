# Arquitetura proposta

## Organização

Monólito modular: um deploy de back-end e um front-end React. Os dois subsistemas citados
no enunciado correspondem à gestão de pedidos/contratos no Java e à construção das páginas
no React. MVC no servidor: controllers HTTP, modelos de domínio e serviços/repositórios;
a apresentação é desacoplada no React, consumindo representações JSON.

```text
backend/src/main/java/br/edu/viacar/
  auth/       controller, DTOs, configuração Security, provisionamento
  cliente/    controller, service, entidade, repository, DTOs
  veiculo/    controller, service, entidade, repository, DTOs
  pedido/     controller, service, avaliação, histórico, DTOs, repository
  contrato/   controller, service, crédito, DTOs, repository
  shared/     erros, auditoria, configuração e tipos compartilhados
backend/src/main/resources/db/migration/
backend/src/test/
frontend/src/
  app/        rotas, sessão e layout
  features/   auth, perfil, frota, pedidos, contratos
  shared/     cliente HTTP, componentes, formatação e validação de UX
```

Controller adapta HTTP e valida DTOs; service implementa casos de uso, transações e
autorização sobre objetos; repository persiste. Entidades não são retornadas diretamente
na API. O front-end não determina perfil, proprietário, status nem valores finais.
Dependência entre módulos ocorre por serviços; evitar controllers chamando repositories.

## Autenticação e autorização

- Spring Security com sessão no servidor e hash adaptativo de senha (BCrypt).
- Cookie de sessão HttpOnly, SameSite=Lax; Secure no ambiente HTTPS.
- Proteção CSRF em operações de escrita, inclusive login/logout, com token obtido
  por endpoint dedicado. Sessão renovada no login; logout e inativação invalidam acesso.
- Desenvolvimento usa proxy do Vite para `/api`; produção usa origem única via proxy reverso.
  Não configurar CORS com credenciais para origens arbitrárias.
- Apenas cadastro, token CSRF e login são públicos. Demais operações exigem usuário ativo.
- Cadastro recebe DTO sem papel. Provisionamento de agentes é comando operacional, não rota pública.
- Revalidar atividade do usuário e regras de objeto em cada requisição. Cliente não pode
  consultar IDs de outros clientes. Agente só altera sua frota e banco só altera sua oferta.
- Credenciais e CPF não aparecem nos logs; erros de login são genéricos. Limitar tentativas
  de login por combinação de origem/usuário na implementação do protótipo.

## Persistência e consistência

Supabase é usado como PostgreSQL por JDBC no servidor. O navegador não recebe senha de
banco, chave service-role nem acesso direto às tabelas. A autorização da aplicação fica no
Spring; criar schema dedicado sem exposição pela Data API do Supabase.
Migrações Flyway controlam estrutura; `ddl-auto=validate` evita alteração silenciosa do banco.

Execução de contrato: bloquear pedido e veículo em ordem consistente, validar versão,
estado, proprietário, parecer, oferta e disponibilidade; gravar contrato, atualizar estado
e eventual titularidade na mesma transação. Consultar sobreposição com
`inicioExistente < fimNovo AND fimExistente > inicioNovo`.
Índice único em contrato.pedido_id assegura um contrato por pedido.
Edição e avaliação usam versionamento otimista; conflitos devolvem 409, sem sobrescrever dados.

## Erros e observabilidade

Resposta uniforme com código de negócio, mensagem, erros por campo e identificador de
correlação. Não incluir SQL, stack traces, hashes ou dados pessoais de terceiros.
Logs contêm ação, ID técnico, resultado e correlação. Histórico de domínio registra
revisão, autor e instante UTC; datas de aluguel são datas civis sem fuso.

## Decisões e trade-offs

Sessão simplifica revogação e evita token persistido em localStorage; escalonamento com
múltiplas instâncias exigiria armazenamento compartilhado de sessões, fora do MVP.
Monólito facilita transações do aluguel e evita infraestrutura de microsserviços.
Supabase remoto será validado quando o responsável fornecer acesso; testes usam PostgreSQL
isolado, não substituição por H2. As mesmas migrações devem rodar em ambos.
