# Roteiro de apresentação

## Preparação

Siga a demonstração local do [README](../README.md). Crie uma senha de demonstração no
ambiente e inicie a API temporária e o front-end. Os agentes se chamam empresa e banco;
clientes são cadastrados pela interface. Para usar Supabase, configure e homologue o banco
remoto antes da apresentação; esse ambiente não foi validado nesta entrega.

## Comparação entre modelos e implementação

- v1: casos de uso, classes e pacotes definiram os atores, rendas, pedidos, avaliação,
  crédito, propriedade e contratos. Esses modelos iniciais permanecem versionados.
- v2: estados e sequência foram revisados para bloquear cliente inativo, datas vencidas
  e transferência com outros contratos vigentes/futuros.
- v3: classes mostram avaliacaoAtualId, referência explícita ao parecer corrente, evitando
  depender da ordenação por horário de avaliações simultâneas. Entidades Java usam UUIDs
  e as migrações preservam as FKs dos relacionamentos no PostgreSQL.
- A apresentação React consome os DTOs HTTP; o módulo api/pedidos.ts adapta o envelope
  do pedido e o retrato contratual aos campos exibidos. Controllers/serviços/repositórios
  mantêm a separação MVC descrita na arquitetura.

## Demonstração

1. Cadastrar cliente com identificação, profissão, endereço e uma fonte de renda.
2. Entrar, consultar catálogo, criar pedido, verificar preço e status PENDENTE.
3. Editar período como cliente e mostrar histórico; sair.
4. Entrar como banco, editar o pedido, avaliar com justificativa e criar/editar crédito.
5. Entrar como empresa proprietária, consultar frota e emitir contrato com crédito.
6. Mostrar valores, veículo, partes e crédito preservados no contrato.
7. Com outro pedido, mostrar cancelamento e encerramento do cliente sem compromissos.
8. Explicar testes de concorrência, isolamento, máximo de três vínculos e transferência.

## Evidências

[Revisão final](revisao-commit-3.md): 24 testes Java, 7 testes Vitest e 2 jornadas Playwright.
O README contém capturas reais regeneradas pela primeira jornada, inclusive mobile.
A suíte comprova execução local; não representa homologação do Supabase ou deploy.
