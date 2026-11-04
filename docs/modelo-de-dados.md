# Modelo de dados lógico

Nomes de tabelas propostos em snake_case; UUID como chave primária. Dinheiro em
numeric(12,2), taxa em numeric(7,4), timestamps em UTC. Entidades editáveis incluem `versao`.
DDL e índices estão em backend/src/main/resources/db/migration. Os relacionamentos
são representados por IDs UUID nas entidades e chaves estrangeiras no PostgreSQL.

| Entidade | Campos principais | Restrições |
| --- | --- | --- |
| Usuario | id, usuario, senha_hash, papel, ativo, criado_em | usuario único normalizado; papel CLIENTE/EMPRESA/BANCO; hash nunca exposto |
| Cliente | id, usuario_id, rg, cpf, nome, endereco, profissao, versao | usuario_id e CPF únicos; um perfil para usuário CLIENTE |
| VinculoEmprego | id, cliente_id, posicao, empregador, renda_mensal | posição 1..3; unique(cliente_id, posicao); renda > 0 |
| Agente | id, usuario_id, razao_social, documento | usuario_id único; papel de usuário EMPRESA ou BANCO; documento único |
| Veiculo | id, matricula, ano, marca, modelo, placa, diaria, proprietario_id, ativo, versao | matrícula e placa únicas; proprietário referencia Usuario; diária > 0 |
| Pedido | id, cliente_id, veiculo_id, inicio, fim, diaria, total, tipo_contrato, status, revisao, avaliacao_atual_id, versao, criado_em | fim > início; valor positivo; revisão incrementada em edição material |
| Avaliacao | id, pedido_id, agente_id, revisao_pedido, decisao, justificativa, dados_financeiros, criado_em | imutável; retrato financeiro JSONB; avaliação corrente referenciada por pedido.avaliacao_atual_id |
| OfertaCredito | id, pedido_id, banco_id, revisao_pedido, principal, taxa_mensal, parcelas, status, versao | banco agente; status ATIVA/INVALIDADA/CONTRATADA; índice parcial único de oferta ATIVA por pedido |
| Contrato | id, pedido_id, avaliacao_id, emissor_id, oferta_credito_id, proprietario_anterior_id, proprietario_final_id, termos, criado_em | pedido_id único; oferta única quando presente; termos JSONB imutáveis com período, valores e partes |
| EventoPedido | id, pedido_id, autor_id, acao, status_anterior, status_novo, revisao, criado_em | append-only; não aceita edição pelo usuário |

## Relações e integridade

- Usuario tem exatamente um perfil de Cliente ou Agente conforme papel, criado na mesma
  transação. Agente não é cliente nesta versão; pessoa que use os dois perfis precisa de
  contas distintas. Checagens de serviço validam as relações coerentes com o papel.
- Cliente possui 0..3 empregos e 0..N pedidos. Cada pedido tem exatamente um cliente e um carro.
- Propriedade do veículo referencia Usuario, permitindo os três tipos sem três FKs opcionais.
- Agente possui 0..N avaliações. Avaliação sempre aponta a revisão de um pedido.
- Pedido tem 0..N avaliações, 0..N ofertas históricas e 0..1 contrato.
- Contrato aponta a avaliação aprovada utilizada e, opcionalmente, uma oferta do banco.
- Avaliações, contratos e eventos preservam retratos e autoria; excluir conta não apaga histórico.
- Não usar cascade delete de cliente/veículo para pedidos, avaliações ou contratos.
- Empregos podem ser substituídos na edição do perfil; avaliações antigas mantêm o retrato financeiro.
- Indexar FKs, pedido(cliente_id, criado_em), pedido(status, criado_em),
  contrato(pedido_id) e campos necessários à busca de períodos por veículo via pedido.

## Validações

CPF: remover pontuação, validar 11 dígitos e dígitos verificadores; rejeitar sequências repetidas.
RG: texto obrigatório até 30 caracteres, preservando formatos estaduais.
Nome: 2..150; endereço: 5..300; profissão: 2..100; empregador: 2..150 caracteres.
Usuário: 3..50 caracteres, letras ASCII/dígitos/ponto/hífen/sublinhado, normalizado em minúsculas.
Senha: 10..72 bytes UTF-8, sem truncamento pelo hash, não remover espaços silenciosamente.
Placa: normalizar maiúsculas/sem hífen e aceitar padrões brasileiros antigo/Mercosul.
Matrícula: identificador interno único de 1..40 caracteres, distinto da placa.
Ano: 1900 até ano corrente + 1; diária e valores dentro da capacidade do numeric.
Limites são decisões de implementação, não exigências explícitas do PDF.

## Máquina de estados

| Operação | Estado de origem | Destino | Perfil |
| --- | --- | --- | --- |
| Criar | inexistente | PENDENTE | Cliente |
| Editar | PENDENTE/APROVADO/REPROVADO | PENDENTE | Cliente dono ou agente |
| Aprovar | PENDENTE/APROVADO/REPROVADO | APROVADO | Agente |
| Reprovar | PENDENTE/APROVADO/REPROVADO | REPROVADO | Agente |
| Cancelar | PENDENTE/APROVADO/REPROVADO | CANCELADO | Cliente dono |
| Contratar | APROVADO | CONTRATADO | Agente proprietário do veículo |

Reavaliação é permitida antes do contrato e somente para cliente ativo. CANCELADO e
CONTRATADO não possuem saídas. Após inativação do cliente, seus pedidos são somente leitura.
Contratação exige início >= data atual em America/Sao_Paulo e fim > início; transferência
exige também ausência de outros contratos do veículo com fim > data atual.
Oferta de crédito exige APROVADO, mas não altera o estado do pedido. Todos os comandos
de mutação exigem versão corrente; operações proibidas por estado retornam 409.
