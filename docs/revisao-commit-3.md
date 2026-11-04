# Revisão da entrega final

Verificação de 04/11/2026, em Windows, JDK 25, Node.js 24.22.1 e npm 12.2.0.

## Resultados executados

| Verificação | Resultado |
| --- | --- |
| Maven test / package | 24 testes aprovados, sem falhas ou erros; JAR gerado |
| Vitest | 7 testes aprovados (componentes e adaptação dos DTOs reais) |
| Build React / TypeScript | Aprovado |
| Playwright / Chromium | 2 jornadas completas aprovadas, com API e PostgreSQL reais |
| Lint | Sem erros; avisos de hooks e Fast Refresh registrados |
| Capturas | 8 imagens reais em docs/screenshots, incluindo mobile de 390 px |

## Correções da revisão

- Build: tipos do Vitest/jest-dom, configuração de testes e import sem uso.
- Detalhe de pedido: leitura do envelope real, cálculo de diárias e dados do veículo.
- Contrato: campos lidos do retrato imutável em termos e data criadoEm.
- Login: renovar CSRF após autenticação; sessão expirada limpa identidade da interface.
- Frota: consulta meus=true no servidor, sem filtro por propriedade ausente no DTO.
- Edição por clientes e agentes; cancelamento exclusivo do cliente.
- Oferta de crédito: edição pelo banco concedente e exibição da emissão só ao proprietário.
- Pareceres e justificativas apresentados separadamente dos eventos do pedido.
- Documentação: execução local, Supabase, provisionador interativo e modelo de classes v3.

## Jornadas E2E executadas

1. Cadastro com renda → login → catálogo → criar pedido → editar como cliente →
   editar como banco → parecer favorável → criar/editar crédito → frota da empresa →
   contrato emitido com crédito → leitura de perfil → catálogo mobile sem overflow.
   A jornada também verifica que o banco não recebe ação de emitir contrato e não
   recebe ação de cancelar pedido; nenhuma exceção JavaScript não tratada foi observada.
2. Cadastro → edição persistida do perfil → criação/cancelamento de pedido → encerramento
   lógico de conta e redirecionamento ao login.

Os 24 testes do back-end cobrem ainda autorização por objeto, transições, invalidação
financeira, transferência, datas vencidas e contratação concorrente. As duas migrações
foram aplicadas em PostgreSQL 14.22 temporário. Não foi usado H2.

## Limites da entrega

- Supabase: integração JDBC configurada, mas homologação remota pendente de credenciais.
- Sem deploy público; o repositório GitHub é privado.
- Participante: Keven Lino. Licença de distribuição a definir.
- Lint emite avisos de estilo/hooks; não foram tratados como prova de falha funcional.
- Não há pagamento, assinatura digital ou transferência jurídica real de propriedade.

As capturas usam somente pessoas, empresas e dados fictícios. O servidor temporário de
apoio fica no classpath de teste, exige senha via ambiente e não integra o JAR de produção.
