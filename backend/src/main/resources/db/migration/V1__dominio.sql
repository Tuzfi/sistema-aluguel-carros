CREATE TABLE usuario (
 id uuid PRIMARY KEY, usuario varchar(50) NOT NULL UNIQUE, senha_hash varchar(255) NOT NULL,
 papel varchar(20) NOT NULL CHECK (papel IN ('CLIENTE','EMPRESA','BANCO')),
 ativo boolean NOT NULL, criado_em timestamptz NOT NULL
);
CREATE TABLE cliente (
 id uuid PRIMARY KEY, usuario_id uuid NOT NULL UNIQUE REFERENCES usuario(id),
 rg varchar(30) NOT NULL, cpf varchar(11) NOT NULL UNIQUE, nome varchar(150) NOT NULL,
 endereco varchar(300) NOT NULL, profissao varchar(100) NOT NULL, versao bigint NOT NULL
);
CREATE TABLE vinculo_emprego (
 id uuid PRIMARY KEY, cliente_id uuid NOT NULL REFERENCES cliente(id), posicao integer NOT NULL CHECK (posicao BETWEEN 1 AND 3),
 empregador varchar(150) NOT NULL, renda_mensal numeric(12,2) NOT NULL CHECK (renda_mensal > 0), UNIQUE(cliente_id,posicao)
);
CREATE TABLE agente (
 id uuid PRIMARY KEY, usuario_id uuid NOT NULL UNIQUE REFERENCES usuario(id),
 razao_social varchar(150) NOT NULL, documento varchar(30) NOT NULL UNIQUE
);
CREATE TABLE veiculo (
 id uuid PRIMARY KEY, matricula varchar(40) NOT NULL UNIQUE, ano integer NOT NULL CHECK (ano >= 1900),
 marca varchar(80) NOT NULL, modelo varchar(100) NOT NULL, placa varchar(7) NOT NULL UNIQUE,
 diaria numeric(12,2) NOT NULL CHECK (diaria > 0), proprietario_id uuid NOT NULL REFERENCES usuario(id),
 ativo boolean NOT NULL, versao bigint NOT NULL
);
CREATE INDEX veiculo_proprietario_idx ON veiculo(proprietario_id);
CREATE TABLE pedido (
 id uuid PRIMARY KEY, cliente_id uuid NOT NULL REFERENCES cliente(id), veiculo_id uuid NOT NULL REFERENCES veiculo(id),
 inicio date NOT NULL, fim date NOT NULL CHECK(fim > inicio), diaria numeric(12,2) NOT NULL CHECK(diaria > 0),
 total numeric(12,2) NOT NULL CHECK(total > 0), tipo_contrato varchar(40) NOT NULL CHECK(tipo_contrato IN ('LOCACAO_SIMPLES','TRANSFERENCIA_AO_CLIENTE')),
 status varchar(20) NOT NULL CHECK(status IN ('PENDENTE','APROVADO','REPROVADO','CANCELADO','CONTRATADO')),
 revisao integer NOT NULL CHECK(revisao > 0), versao bigint NOT NULL, criado_em timestamptz NOT NULL
);
CREATE INDEX pedido_cliente_idx ON pedido(cliente_id,criado_em);
CREATE INDEX pedido_status_idx ON pedido(status,criado_em);
CREATE INDEX pedido_veiculo_periodo_idx ON pedido(veiculo_id,inicio,fim) WHERE status='CONTRATADO';
CREATE TABLE avaliacao (
 id uuid PRIMARY KEY, pedido_id uuid NOT NULL REFERENCES pedido(id), agente_id uuid NOT NULL REFERENCES agente(id),
 revisao_pedido integer NOT NULL, decisao varchar(20) NOT NULL CHECK(decisao IN ('APROVADO','REPROVADO')),
 justificativa varchar(2000) NOT NULL, dados_financeiros jsonb NOT NULL, criado_em timestamptz NOT NULL
);
CREATE INDEX avaliacao_pedido_idx ON avaliacao(pedido_id,criado_em);
CREATE INDEX avaliacao_agente_idx ON avaliacao(agente_id);
CREATE TABLE oferta_credito (
 id uuid PRIMARY KEY, pedido_id uuid NOT NULL REFERENCES pedido(id), banco_id uuid NOT NULL REFERENCES agente(id),
 revisao_pedido integer NOT NULL, principal numeric(12,2) NOT NULL CHECK(principal > 0),
 taxa_mensal numeric(7,4) NOT NULL CHECK(taxa_mensal BETWEEN 0 AND 100), parcelas integer NOT NULL CHECK(parcelas > 0),
 status varchar(20) NOT NULL CHECK(status IN ('ATIVA','INVALIDADA','CONTRATADA')), versao bigint NOT NULL
);
CREATE UNIQUE INDEX oferta_ativa_idx ON oferta_credito(pedido_id) WHERE status='ATIVA';
CREATE INDEX oferta_pedido_idx ON oferta_credito(pedido_id);
CREATE INDEX oferta_banco_idx ON oferta_credito(banco_id);
CREATE TABLE contrato (
 id uuid PRIMARY KEY, pedido_id uuid NOT NULL UNIQUE REFERENCES pedido(id), avaliacao_id uuid NOT NULL REFERENCES avaliacao(id),
 emissor_id uuid NOT NULL REFERENCES agente(id), oferta_credito_id uuid UNIQUE REFERENCES oferta_credito(id),
 proprietario_anterior_id uuid NOT NULL REFERENCES usuario(id), proprietario_final_id uuid NOT NULL REFERENCES usuario(id),
 termos jsonb NOT NULL, criado_em timestamptz NOT NULL
);
CREATE INDEX contrato_avaliacao_idx ON contrato(avaliacao_id);
CREATE INDEX contrato_emissor_idx ON contrato(emissor_id);
CREATE INDEX contrato_proprietario_anterior_idx ON contrato(proprietario_anterior_id);
CREATE INDEX contrato_proprietario_final_idx ON contrato(proprietario_final_id);
CREATE TABLE evento_pedido (
 id uuid PRIMARY KEY, pedido_id uuid NOT NULL REFERENCES pedido(id), autor_id uuid NOT NULL REFERENCES usuario(id),
 acao varchar(40) NOT NULL, status_anterior varchar(20), status_novo varchar(20) NOT NULL,
 revisao integer NOT NULL, criado_em timestamptz NOT NULL
);
CREATE INDEX evento_pedido_idx ON evento_pedido(pedido_id,criado_em);
CREATE INDEX evento_autor_idx ON evento_pedido(autor_id);
