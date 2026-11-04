export type Papel = 'CLIENTE' | 'EMPRESA' | 'BANCO';

export interface Usuario {
  id: string;
  usuario: string;
  papel: Papel;
  criadoEm?: string;
  ativo?: boolean;
}

export interface VinculoEmprego {
  id?: string;
  empregador: string;
  rendaMensal: string;
}

export interface Cliente {
  id: string;
  usuarioId: string;
  nome: string;
  cpf: string;
  rg: string;
  endereco: string;
  profissao: string;
  versao: number;
  empregos: VinculoEmprego[];
}

export interface Veiculo {
  id: string;
  matricula: string;
  ano: number;
  marca: string;
  modelo: string;
  placa: string;
  diaria: string;
  proprietarioId?: string;
  proprietarioNome?: string;
  proprietarioPapel?: Papel;
  ativo: boolean;
  versao: number;
}

export type StatusPedido = 'PENDENTE' | 'APROVADO' | 'REPROVADO' | 'CANCELADO' | 'CONTRATADO';
export type TipoContrato = 'LOCACAO_SIMPLES' | 'TRANSFERENCIA_AO_CLIENTE';
export type DecisaoAvaliacao = 'APROVADO' | 'REPROVADO';
export type StatusOferta = 'ATIVA' | 'CONTRATADA' | 'INVALIDADA';

export interface Avaliacao {
  id: string;
  revisaoPedido: number;
  decisao: DecisaoAvaliacao;
  justificativa: string;
  agenteId: string;
  avaliadorNome?: string;
  avaliadorPapel?: Papel;
  criadoEm: string;
}

export interface OfertaCredito {
  id: string;
  revisaoPedido: number;
  bancoId: string;
  bancoNome?: string;
  principal: string;
  taxaMensal: string;
  parcelas: number;
  status: StatusOferta;
  versao: number;
  criadoEm: string;
}

export interface EventoPedido {
  id: string;
  tipo: string;
  descricao: string;
  autorId?: string;
  autorNome?: string;
  criadoEm: string;
}

export interface Pedido {
  id: string;
  clienteId: string;
  clienteNome?: string;
  veiculoId: string;
  veiculoMarca?: string;
  veiculoModelo?: string;
  veiculoPlaca?: string;
  veiculoAno?: number;
  inicio: string;
  fim: string;
  diarias: number;
  valorDiaria: string;
  total: string;
  tipoContrato: TipoContrato;
  status: StatusPedido;
  versao: number;
  criadoEm: string;
  avaliacoes?: Avaliacao[];
  ofertas?: OfertaCredito[];
  eventos?: EventoPedido[];
  contratoId?: string;
  podeContratar?: boolean;
  agenteAtualId?: string;
}

export interface Contrato {
  id: string;
  pedidoId: string;
  veiculoId: string;
  veiculoMarca?: string;
  veiculoModelo?: string;
  veiculoPlaca?: string;
  clienteId: string;
  clienteNome?: string;
  proprietarioAnteriorId: string;
  proprietarioFinalId: string;
  tipoContrato: TipoContrato;
  inicio: string;
  fim: string;
  valorTotal: string;
  emitidoPorId: string;
  emitidoEm: string;
  ofertaCreditoId?: string;
  creditoPrincipal?: string;
  creditoTaxaMensal?: string;
  creditoParcelas?: number;
  termos?: {
    veiculo?: any;
    cliente?: any;
    pedido?: any;
    credito?: any;
    total?: string;
  };
}

export interface DadosFinanceirosCliente {
  nome: string;
  cpf: string;
  profissao: string;
  empregos: VinculoEmprego[];
  rendaTotal?: string;
}

export interface Pagina<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ErroApi {
  codigo: string;
  mensagem: string;
  campos?: Record<string, string>;
  correlacaoId?: string;
}
