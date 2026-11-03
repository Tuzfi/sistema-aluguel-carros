# Projeto da interface

Interface em português brasileiro, valores em BRL e datas exibidas em formato brasileiro.
Design proposto: fundo claro, azul profundo para navegação, verde para ações principais,
tipografia de sistema e cartões com bordas discretas. Logo vetorial local, sem dependência
de CDN. Nenhuma tela funcional ou captura de aplicativo foi produzida nesta etapa.

## Rotas de apresentação

| Rota | Conteúdo e ações | Acesso |
| --- | --- | --- |
| /login | Usuário, senha, entrar, link para cadastro | Visitante |
| /cadastro | Identificação, profissão, endereço e 0..3 empregos, senha | Visitante |
| /inicio | Resumo de pedidos próprios ou fila de agentes | Autenticado |
| /perfil | Consultar/editar cadastro; adicionar/remover emprego; encerrar conta | Cliente |
| /veiculos | Filtros e catálogo; ação de solicitar com período | Autenticado |
| /frota | Tabela da frota própria; cadastro, edição e inativação | Agente |
| /pedidos | Lista com status, carro, período, total e filtros | Cliente: próprios; agente: fila |
| /pedidos/novo | Selecionar carro, datas e tipo; resumo e confirmar | Cliente |
| /pedidos/:id | Dados, linha do tempo, pareceres, editar/cancelar quando permitido | Cliente dono ou agente |
| /pedidos/:id/avaliacao | Dados financeiros, justificativa, aprovar/reprovar | Agente |
| /pedidos/:id/credito | Principal, taxa, parcelas; criar/editar oferta do próprio banco | Banco |
| /contratos/:id | Partes, carro, período, valor, titularidade e crédito opcional | Cliente dono ou agente |

A emissão do contrato ocorre em painel de confirmação no detalhe do pedido, disponível
apenas ao agente proprietário. Exibir os termos e a oferta opcional antes de confirmar.

## Esboço do detalhe de pedido

```text
ViaCar        Veículos   Pedidos   Meu perfil               Sair

Pedido #...                                  [PENDENTE]
Marca / modelo / placa
Retirada: dd/mm/aaaa     Devolução: dd/mm/aaaa
3 diárias x R$ 150,00                         R$ 450,00
Tipo: Locação simples

Histórico
  Pedido criado                     data e hora
  Parecer do agente                 justificativa

[Editar pedido] [Cancelar pedido]
```

Os botões variam por papel, estado e propriedade; ocultá-los não substitui a autorização
do servidor. A interface do agente acrescenta avaliação, oferta (banco) e emissão (dono).

## Comportamentos de UX

- Label explícito, navegação por teclado, foco visível e mensagens por campo.
- Não depender somente de cor para status: combinar texto e indicador visual.
- Skeleton/indicador ao carregar; estado vazio com ação apropriada; erro com opção de repetir.
- Impedir envio duplicado enquanto aguarda resposta; após 409 recarregar e explicar conflito.
- Ao receber 401, limpar dados privados e encaminhar ao login; não deixar cache de outro usuário.
- Confirmar cancelamento, inativação e emissão de contrato com resumo das consequências.
- Layout de coluna única a 360 px; tabelas adaptadas em cartões ou rolagem restrita à tabela.
- Remover espaços em identificadores somente conforme regra de normalização; senha preservada.
- A lista de vínculos informa o limite de três e mantém erros associados ao vínculo correto.
- Disponibilidade e orçamento na tela são indicativos até a confirmação pelo servidor.
