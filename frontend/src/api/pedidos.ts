import { api } from './client';
import type { Pedido, Pagina, Veiculo, Contrato, Cliente, OfertaCredito, Avaliacao, EventoPedido, TipoContrato, StatusPedido } from '../types';

export interface ResumoPedidoApi {
  id: string; clienteId: string; veiculoId: string; inicio: string; fim: string;
  diaria: string; total: string; tipoContrato: TipoContrato; status: StatusPedido;
  revisao: number; versao: number; criadoEm: string;
}
export interface DetalhePedidoApi {
  pedido: ResumoPedidoApi; avaliacoes: Avaliacao[]; eventos: EventoPedidoApi[];
  ofertas: OfertaCredito[]; contratoId: string | null; podeContratar: boolean; agenteAtualId: string | null;
}
interface EventoPedidoApi { id: string; autorId: string; acao: string; statusAnterior: StatusPedido | null; statusNovo: StatusPedido; revisao: number; criadoEm: string; }
export interface ContratoApi {
  id: string; pedidoId: string; avaliacaoId: string; emissorId: string;
  ofertaCreditoId: string | null; proprietarioAnteriorId: string; proprietarioFinalId: string;
  criadoEm: string;
  termos: { cliente: Cliente; veiculo: Veiculo; inicio: string; fim: string; diaria: string; total: string;
    tipoContrato: TipoContrato; emissor: { id: string; razaoSocial: string; documento: string };
    credito?: OfertaCredito; banco?: { id: string; razaoSocial: string; documento: string } };
}

export function adaptarPedido(p: ResumoPedidoApi, v: Veiculo): Pedido {
  return { ...p, valorDiaria: p.diaria,
    diarias: Math.round((Date.parse(p.fim) - Date.parse(p.inicio)) / 86400000),
    veiculoMarca: v.marca, veiculoModelo: v.modelo, veiculoPlaca: v.placa, veiculoAno: v.ano };
}

export async function listarPedidos(path: string): Promise<Pagina<Pedido>> {
  const pagina = await api.get<Pagina<ResumoPedidoApi>>(path);
  const carros = new Map<string, Promise<Veiculo>>();
  const items = await Promise.all(pagina.items.map(async p => {
    if (!carros.has(p.veiculoId)) carros.set(p.veiculoId, api.get<Veiculo>(`/api/veiculos/${p.veiculoId}`));
    return adaptarPedido(p, await carros.get(p.veiculoId)!);
  }));
  return { ...pagina, items };
}

export async function consultarPedido(id: string): Promise<Pedido> {
  const detalhe = await api.get<DetalhePedidoApi>(`/api/pedidos/${id}`);
  const carro = await api.get<Veiculo>(`/api/veiculos/${detalhe.pedido.veiculoId}`);
  const eventos: EventoPedido[] = detalhe.eventos.map(e => ({ ...e, tipo: e.acao,
    descricao: `${e.acao}: ${e.statusNovo} (revisão ${e.revisao})` }));
  return { ...adaptarPedido(detalhe.pedido, carro), avaliacoes: detalhe.avaliacoes,
    ofertas: detalhe.ofertas, eventos, podeContratar: detalhe.podeContratar, agenteAtualId: detalhe.agenteAtualId || undefined, contratoId: detalhe.contratoId || undefined };
}

export function adaptarContrato(c: ContratoApi): Contrato {
  const t = c.termos;
  return { ...c, ofertaCreditoId: c.ofertaCreditoId || undefined, veiculoId: t.veiculo.id,
    veiculoMarca: t.veiculo.marca, veiculoModelo: t.veiculo.modelo, veiculoPlaca: t.veiculo.placa,
    clienteId: t.cliente.id, clienteNome: t.cliente.nome, tipoContrato: t.tipoContrato,
    inicio: t.inicio, fim: t.fim, valorTotal: t.total, emitidoPorId: c.emissorId,
    emitidoEm: c.criadoEm, creditoPrincipal: t.credito?.principal,
    creditoTaxaMensal: t.credito?.taxaMensal, creditoParcelas: t.credito?.parcelas };
}
export async function consultarContrato(id: string): Promise<Contrato> {
  return adaptarContrato(await api.get<ContratoApi>(`/api/contratos/${id}`));
}
