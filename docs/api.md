# Contrato HTTP proposto

Base `/api`. JSON UTF-8, IDs UUID, datas `YYYY-MM-DD`, timestamps ISO 8601 UTC.
Decimais monetários transmitidos como strings (ex.: `"150.00"`) para preservar precisão.
Autenticação por cookie de sessão, token CSRF em `X-CSRF-TOKEN` nas escritas.
Cliente HTTP envia credenciais apenas para a origem da aplicação.

## Rotas e permissões

| Método e rota | Permissão | Resultado |
| --- | --- | --- |
| GET /auth/csrf | Público | 200 token para formulário/login |
| POST /auth/cadastro | Público | 201 cria usuário CLIENTE e perfil; não aceita papel |
| POST /auth/login | Público + CSRF | 200 sessão e usuário resumido; 401 credenciais inválidas |
| GET /auth/me | Autenticado ativo | 200 id, usuário, papel |
| POST /auth/logout | Autenticado | 204 invalida sessão |
| GET /clientes/me | CLIENTE | 200 perfil e empregos |
| PUT /clientes/me | CLIENTE | 200 substitui dados e empregos, com versao |
| DELETE /clientes/me?versao=N | CLIENTE | 204 inativa se elegível; 409 impedimento |
| GET /veiculos | Autenticado | 200 página; filtros marca, modelo, inicio, fim |
| GET /veiculos/{id} | Autenticado | 200 detalhes públicos do carro |
| POST /veiculos | EMPRESA/BANCO | 201 cria frota do agente da sessão |
| PUT /veiculos/{id} | Agente proprietário | 200 campos do carro e diária; com versao; sem troca de dono |
| POST /veiculos/{id}/inativacao | Agente proprietário | 200 inativa se elegível, com versao |
| GET /pedidos | Autenticado | 200 página; cliente só vê seus; agentes veem fila; filtro status |
| POST /pedidos | CLIENTE | 201 pedido PENDENTE; Location do recurso |
| GET /pedidos/{id} | Cliente dono ou agente | 200 pedido, pareceres, eventos e contrato |
| PUT /pedidos/{id} | Cliente dono ou agente | 200 revisa pedido elegível e retorna PENDENTE |
| POST /pedidos/{id}/cancelamento | Cliente dono | 200 CANCELADO; body com versao |
| GET /pedidos/{id}/dados-financeiros | Agente | 200 perfil/renda necessários à análise |
| POST /pedidos/{id}/avaliacoes | Agente | 201 parecer e novo estado; versao, decisao, justificativa |
| POST /pedidos/{id}/ofertas-credito | BANCO | 201 oferta ATIVA; principal, taxaMensal, parcelas, versaoPedido |
| PUT /ofertas-credito/{id} | Banco concedente | 200 altera termos da oferta ATIVA; versao e versaoPedido |
| POST /pedidos/{id}/contrato | Agente proprietário | 201 contrato; versaoPedido e ofertaCreditoId opcional |
| GET /contratos/{id} | Cliente do contrato ou agente | 200 termos imutáveis; sem hash ou credenciais |

Cadastro requer `usuario`, `senha`, `nome`, `cpf`, `rg`, `endereco`, `profissao`,
`empregos: [{empregador, rendaMensal}]`. DTO de edição de cliente exclui usuário e senha
e inclui `versao`. Mudança de credenciais não faz parte deste MVP.

Criar pedido requer `veiculoId`, `inicio`, `fim`, `tipoContrato`.
Editar exige os mesmos campos mais `versao`; tipo permite LOCACAO_SIMPLES ou
TRANSFERENCIA_AO_CLIENTE. Identidades, preços, revisões e status são determinados no servidor.

```json
{
  "veiculoId": "4f16c5dd-0bb4-4f17-948a-548e64773466",
  "inicio": "2026-12-10",
  "fim": "2026-12-13",
  "tipoContrato": "LOCACAO_SIMPLES"
}
```

Exemplo de payload, não resposta capturada de uma aplicação. Com diária de `150.00`,
o servidor calculará três diárias e total `450.00`.

## Convenções

- Listagens: `page` baseado em zero, `size` padrão 20 e máximo 100; ordem estável por
  data/id. Envelope `{items, page, size, totalElements, totalPages}`.
- 400: JSON/campo inválido; 401: não autenticado; 403: papel proibido ou CSRF ausente;
  404: recurso inexistente ou objeto de outro cliente; 409: duplicidade, versão antiga,
  estado inválido ou indisponibilidade; 429: limite de login; 500: erro genérico.
- Campos desconhecidos sensíveis, como papel/status/clienteId, não são aceitos nos DTOs.
- Mutações de pedidos de cliente inativo retornam 409, inclusive avaliação e crédito.
- Contratação retorna 409 se o início já passou ou fim <= início, considerando a data
  atual em America/Sao_Paulo. Transferência também retorna 409 quando houver outro
  contrato do veículo com fim > data atual, mesmo em período sem sobreposição.
- Avaliações e emissão usam versão do pedido; somente uma requisição concorrente prevalece.
  Após timeout, a interface consulta o pedido antes de tentar novamente emitir contrato.
- Ao login, atualizar token CSRF se a sessão for renovada; logout limpa estado do front-end.

Erro proposto:

```json
{
  "codigo": "PEDIDO_CONFLITANTE",
  "mensagem": "O pedido foi alterado. Atualize os dados antes de tentar novamente.",
  "campos": {},
  "correlacaoId": "identificador-tecnico"
}
```

Documentação OpenAPI executável será acrescentada junto à API, refletindo as rotas efetivas.
