ALTER TABLE pedido ADD COLUMN avaliacao_atual_id uuid REFERENCES avaliacao(id);
CREATE INDEX pedido_avaliacao_atual_idx ON pedido(avaliacao_atual_id);
