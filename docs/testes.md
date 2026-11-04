# Plano de testes e rastreabilidade

## Matriz de cobertura

| Requisito | Histórias | Modelos vigentes | Cenários de verificação |
| --- | --- | --- | --- |
| RF01 | HU01-02 | casos-uso, classes, pacotes | T01, T02, T03 |
| RF02 | HU03-04 | classes, casos-uso | T04, T05 |
| RF03 | HU01, HU03 | classes | T04 |
| RF04 | HU06-09 | estados-pedido, sequencia-contrato | T06, T07, T08 |
| RF05 | HU08, HU10 | casos-uso, classes, estados-pedido | T03, T07, T09 |
| RF06 | HU11 | sequencia-contrato, classes | T09, T10 |
| RF07 | HU05, HU13 | classes | T11 |
| RF08 | HU11, HU13 | classes, sequencia-contrato | T12 |
| RF09 | HU12 | classes, casos-uso | T13 |
| RF10 | HU07 | estados-pedido, casos-uso | T08, T14 |
| RNF01-04 | HU14 | pacotes | Build, migração, integração PostgreSQL e inspeção MVC |
| RNF05-07 | HU14 | todos | Links, UML, histórico de modelos, README e apresentação |
| RNF08-09 | HU02-14 | pacotes e fluxos | T03, T15, T16 |

## Cenários funcionais planejados

- T01: cadastro válido atômico; rejeitar CPF/usuário duplicado, CPF inválido e papel forjado.
- T02: login válido/inválido, logout, expiração e conta inativa; hash nunca serializado.
- T03: cliente A não lê/edita pedido de B; cliente não avalia; empresa não cria crédito;
  banco não altera oferta de outro banco; agente não edita carro de terceiro; CSRF obrigatório.
- T04: persistir zero e três empregos, rejeitar quatro e renda inválida, editar removendo vínculo.
- T05: encerramento bloqueado por pedidos ativos/contrato futuro; inativação elegível
  invalida sessões; histórico e identidade únicos permanecem. Cliente com pedido
  REPROVADO encerra a conta; tentativas posteriores do agente de editar, reavaliar,
  oferecer crédito ou contratar retornam 409. Disputar inativação e aprovação em
  transações concorrentes: aprovação anterior bloqueia a inativação; inativação
  anterior bloqueia a aprovação, sem estado final incompatível.
- T06: datas inválidas/passadas, carro inativo, total calculado com decimal e dias corretos;
  fim exclusivo permite contrato seguinte começar exatamente na devolução anterior.
  Criar/aprovar pedido com início em 10/12/2026 e tentar contratar em 11/12/2026:
  esperar 409, sem contrato ou mudança de propriedade. Usar relógio controlado em
  America/Sao_Paulo; contratação no próprio dia do início é permitida se as demais
  condições forem válidas. Cobrir mudança de dia entre aprovação e contratação.
- T07: tabela de transições inteira, estados terminais e conflito de versão; edição material
  invalida parecer e oferta sem apagar histórico.
- T08: status, valores e histórico corretos no detalhe; paginação e filtros sem vazamento.
- T09: parecer requer justificativa e revisão atual; captura renda; alteração de perfil
  posterior não modifica retrato; somente parecer positivo corrente permite contrato.
- T10: duas transações contratando mesmo pedido ou períodos sobrepostos: um sucesso,
  um conflito; nenhuma gravação parcial de contrato, crédito ou titularidade.
- T11: matrícula/placa duplicada, validação de ano/diária, catálogo e frota do proprietário.
- T12: locação mantém proprietário, transferência altera para cliente; transação revertida
  não altera proprietário; agente que não é dono não emite contrato; transferência é
  rejeitada quando há outro contrato vigente/futuro, mesmo sem sobreposição.
  Exemplo: transferência de 10 a 12/12 e contrato existente de 20 a 22/12, com
  data atual 01/12, deve retornar 409 sem alterar o dono. Contrato encerrado
  (fim <= data atual) não bloqueia transferência; locação simples continua
  permitindo períodos futuros sem sobreposição.
- T13: crédito opcional, sem oferta também contrata; limites dos termos, oferta invalidada,
  banco concedente correto, invalidação por reprovação ou não seleção na contratação
  e imutabilidade após associação ao contrato.
- T14: jornada E2E cadastro → login → pedido → reprovação → edição → aprovação → contrato.
- T15: mensagens sem stack trace/SQL/segredo; sessão protegida; login limitado; DTOs não
  aceitam atribuição de papel, proprietário, preço ou status pelo navegador.
- T16: teclado, foco, erro por campo, confirmação, 360 px, 1280 px e estados vazios/erro.

## Estratégia

Regras e cálculos: testes unitários JUnit. Serviços, segurança e migrações: Spring Test
com PostgreSQL isolado (Testcontainers quando Docker estiver disponível). Concorrência:
transações reais em conexões distintas, sincronizadas para disputar o mesmo recurso.
Front-end: Vitest para comportamentos relevantes e Playwright para jornadas integradas.
Não usar H2 como evidência de semântica PostgreSQL. O Supabase exige validação própria
quando houver conexão; registrar separadamente testes locais e remotos.

## Resultado desta etapa

Commit 1 não contém aplicação. A verificação se limita aos arquivos e modelos do projeto.
O relatório da revisão lista os checks realmente executados; nenhum cenário T01-T16 é
marcado como aprovado antecipadamente.


## Execução final

Resultados de 04/11/2026 e limites em [revisão final](revisao-commit-3.md).
As jornadas de navegador estão em frontend/e2e/jornada.spec.ts; os testes de DTO
estão em frontend/src/test/adapters.test.ts.
