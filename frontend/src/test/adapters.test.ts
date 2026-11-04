import { describe, it, expect } from 'vitest';
import { adaptarPedido, adaptarContrato } from '../api/pedidos';
import type { ContratoApi, ResumoPedidoApi } from '../api/pedidos';
import type { Veiculo } from '../types';
const v: Veiculo = { id: 'v1', matricula: 'V1', ano: 2026, marca: 'Fiat', modelo: 'Argo', placa: 'ABC1234', diaria: '150.00', ativo: true, versao: 0 };
describe('Respostas reais da API', () => {
  it('apresenta diária e veículo sem exigir campos inventados do resumo', () => {
    const p: ResumoPedidoApi = { id: 'p1', clienteId: 'c1', veiculoId: 'v1', inicio: '2026-12-10', fim: '2026-12-13', diaria: '150.00', total: '450.00', tipoContrato: 'LOCACAO_SIMPLES', status: 'PENDENTE', revisao: 1, versao: 0, criadoEm: '2026-12-01T12:00:00Z' };
    expect(adaptarPedido(p,v)).toMatchObject({ id: 'p1', valorDiaria: '150.00', diarias: 3, veiculoModelo: 'Argo' });
  });
  it('lê contrato do retrato imutável, incluindo crédito opcional', () => {
    const c: ContratoApi = { id: 'ct1', pedidoId: 'p1', avaliacaoId: 'a1', emissorId: 'e1', ofertaCreditoId: null, proprietarioAnteriorId: 'e1', proprietarioFinalId: 'e1', criadoEm: '2026-12-01T12:00:00Z', termos: { cliente: { id: 'c1', usuarioId: 'u1', nome: 'Ana', cpf: '11144477735', rg: 'MG1', endereco: 'Rua A', profissao: 'Dev', versao: 0, empregos: [] }, veiculo: v, inicio: '2026-12-10', fim: '2026-12-13', diaria: '150.00', total: '450.00', tipoContrato: 'LOCACAO_SIMPLES', emissor: { id: 'e1', razaoSocial: 'Locadora', documento: '12345678' } } };
    expect(adaptarContrato(c)).toMatchObject({ valorTotal: '450.00', clienteNome: 'Ana', emitidoEm: c.criadoEm, veiculoPlaca: 'ABC1234' });
  });
});
