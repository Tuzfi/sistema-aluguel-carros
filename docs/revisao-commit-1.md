# Revisão do commit 1

## O que revisar

1. Requisitos do PDF e decisões adicionais D01-D13 em [requisitos](requisitos.md).
2. Requisitos do PDF e decisões adicionais D01-D13 em [requisitos](requisitos.md).
3. Regras de estados, titularidade e crédito em [modelo de dados](modelo-de-dados.md).
4. Perfis, segurança e divisão MVC em [arquitetura](arquitetura.md).
5. Histórias, rotas e interface em [histórias](historias.md), [API](api.md) e [interface](interface.md).
6. UML e cobertura em [diagramas](uml/README.md) e [testes](testes.md).

## Decisões que merecem atenção

- Agentes acessam a fila geral de pedidos; emissão de contrato exige propriedade do carro.
- A transferência ao cliente acontece no registro do contrato, conforme tipo proposto.
- Crédito é oferta do banco, opcional, sem transação financeira real.
- Exclusão do cliente é lógica e bloqueada por compromissos ativos.
- Pedidos alterados voltam a PENDENTE e precisam de novo parecer.

## Estado da entrega

Modelagem inicial v1. Sem back-end/front-end executável, sem banco provisionado e sem
publicação. A pasta do projeto é um repositório Git local, com um commit desta etapa.
O próximo passo, após aprovação, é o commit 2. A revisão não implica autorizar deploy ou push.

## Verificação

Verificações executadas em 03/11/2026:

- Leitura das três páginas do PDF e conferência visual do enunciado.
- Geração local dos cinco diagramas com PlantUML 1.2026.8: sem erros de sintaxe.
- Inspeção visual dos cinco modelos e validação XML dos seis SVG (incluindo logo).
- Verificação de 40 links relativos da documentação: todos resolvidos.
- Conferência de cobertura: RF01-RF10, RNF01-RNF09 e HU01-HU14 mapeados no plano.
- Revisão das regras de propriedade, crédito opcional, estados e concorrência.
- Nenhum teste de aplicação executado: implementação reservada a C2/C3.

Ferramenta PlantUML obtida da release oficial; SHA-256 conferido:
`5e1ecfa8ecd32c90b03bbf3b1eb6f020943f98ab0fcf4032be31a0002ee2c462`.
O renderizador e os arquivos temporários não integram o projeto.
