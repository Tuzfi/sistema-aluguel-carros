import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { consultarPedido } from '../api/pedidos';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Landmark,
  ArrowLeft,
  Edit2,
  Ban,
  X,
} from 'lucide-react';
import type { Pedido, DadosFinanceirosCliente, TipoContrato, DecisaoAvaliacao, Contrato } from '../types';

export const DetalhePedido: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  // Modal Cancelar
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  // Modal Editar Pedido (Cliente)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editInicio, setEditInicio] = useState('');
  const [editFim, setEditFim] = useState('');
  const [editTipo, setEditTipo] = useState<TipoContrato>('LOCACAO_SIMPLES');
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  // Modal Avaliar Pedido (Agente Empresa / Banco)
  const [showAvaliarModal, setShowAvaliarModal] = useState(false);
  const [dadosFinanceiros, setDadosFinanceiros] = useState<DadosFinanceirosCliente | null>(null);
  const [decisao, setDecisao] = useState<DecisaoAvaliacao>('APROVADO');
  const [justificativa, setJustificativa] = useState('');
  const [avaliando, setAvaliando] = useState(false);

  // Modal Oferecer Crédito (Banco)
  const [showCreditoModal, setShowCreditoModal] = useState(false);
  const [creditoPrincipal, setCreditoPrincipal] = useState('');
  const [creditoTaxa, setCreditoTaxa] = useState('1.5');
  const [creditoParcelas, setCreditoParcelas] = useState(12);
  const [oferecendoCredito, setOferecendoCredito] = useState(false);

  // Modal Emitir Contrato (Agente Proprietário)
  const [showContratoModal, setShowContratoModal] = useState(false);
  const [incluirCredito, setIncluirCredito] = useState(true);
  const [emitindoContrato, setEmitindoContrato] = useState(false);

  const carregar = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await consultarPedido(id);
      setPedido(data);
      setEditInicio(data.inicio);
      setEditFim(data.fim);
      setEditTipo(data.tipoContrato);
      setErro(null);
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar detalhes do pedido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton" style={{ height: '380px' }} />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">
          <div>{erro || 'Pedido não encontrado.'}</div>
        </div>
        <Link to="/pedidos" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Voltar aos Pedidos
        </Link>
      </div>
    );
  }

  const isCliente = usuario?.papel === 'CLIENTE';
  const isBanco = usuario?.papel === 'BANCO';
  const isAgente = usuario?.papel === 'EMPRESA' || usuario?.papel === 'BANCO';
  const podeModificar = ['PENDENTE', 'APROVADO', 'REPROVADO'].includes(pedido.status);

  // Cancelar pedido
  const handleCancelar = async () => {
    setCancelando(true);
    try {
      await api.post(`/api/pedidos/${pedido.id}/cancelamento`, { versao: pedido.versao });
      setSucesso('Pedido cancelado com sucesso.');
      setShowCancelModal(false);
      await carregar();
    } catch (err: any) {
      setErro(err.message || 'Falha ao cancelar pedido.');
      setShowCancelModal(false);
    } finally {
      setCancelando(false);
    }
  };

  // Salvar edição
  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvandoEdicao(true);
    setErro(null);
    try {
      await api.put(`/api/pedidos/${pedido.id}`, {
        veiculoId: pedido.veiculoId,
        inicio: editInicio,
        fim: editFim,
        tipoContrato: editTipo,
        versao: pedido.versao,
      });
      setSucesso('Pedido alterado com sucesso! O status retornou para Pendente.');
      setShowEditModal(false);
      await carregar();
    } catch (err: any) {
      setErro(err.message || 'Falha ao editar pedido.');
    } finally {
      setSalvandoEdicao(false);
    }
  };

  // Abrir modal avaliação
  const abrirModalAvaliar = async () => {
    setShowAvaliarModal(true);
    setJustificativa('');
    setDecisao('APROVADO');
    try {
      const fin = await api.get<DadosFinanceirosCliente>(`/api/pedidos/${pedido.id}/dados-financeiros`);
      const centavos = fin.empregos.reduce((s, e) => s + Math.round(Number(e.rendaMensal) * 100), 0);
      setDadosFinanceiros({ ...fin, rendaTotal: (centavos / 100).toFixed(2) });
    } catch (err) {
      console.warn('Erro ao carregar dados financeiros do cliente:', err);
    }
  };

  // Enviar avaliação financeira
  const handleEnviarAvaliacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justificativa.trim()) {
      setErro('A justificativa da avaliação é obrigatória.');
      return;
    }
    setAvaliando(true);
    try {
      await api.post(`/api/pedidos/${pedido.id}/avaliacoes`, {
        versao: pedido.versao,
        decisao,
        justificativa: justificativa.trim(),
      });
      setSucesso(`Parecer registrado com sucesso (${decisao}).`);
      setShowAvaliarModal(false);
      await carregar();
    } catch (err: any) {
      setErro(err.message || 'Erro ao registrar avaliação.');
    } finally {
      setAvaliando(false);
    }
  };

  // Oferecer crédito
  const handleOferecerCredito = async (e: React.FormEvent) => {
    e.preventDefault();
    setOferecendoCredito(true);
    try {
      const oferta = (pedido.ofertas || []).find(o => o.status === 'ATIVA');
      const salvar = oferta
        ? (body: object) => api.put(`/api/ofertas-credito/${oferta.id}`, { ...body, versao: oferta.versao })
        : (body: object) => api.post(`/api/pedidos/${pedido.id}/ofertas-credito`, body);
      await salvar({
        versaoPedido: pedido.versao,
        principal: creditoPrincipal || pedido.total,
        taxaMensal: creditoTaxa,
        parcelas: creditoParcelas,
      });
      setSucesso('Proposta de crédito cadastrada com sucesso!');
      setShowCreditoModal(false);
      await carregar();
    } catch (err: any) {
      setErro(err.message || 'Falha ao propor oferta de crédito.');
    } finally {
      setOferecendoCredito(false);
    }
  };

  // Emitir contrato
  const handleEmitirContrato = async () => {
    setEmitindoContrato(true);
    try {
      const ofertaAtiva = (pedido.ofertas || []).find(o => o.status === 'ATIVA');
      const body: any = { versaoPedido: pedido.versao };
      if (ofertaAtiva && incluirCredito) {
        body.ofertaCreditoId = ofertaAtiva.id;
      }
      const res = await api.post<Contrato>(`/api/pedidos/${pedido.id}/contrato`, body);
      setSucesso('Contrato emitido e formalizado com sucesso!');
      setShowContratoModal(false);
      await carregar();
      if (res?.id) {
        navigate(`/contratos/${res.id}`);
      }
    } catch (err: any) {
      setErro(err.message || 'Erro ao emitir contrato.');
      setShowContratoModal(false);
    } finally {
      setEmitindoContrato(false);
    }
  };

  const ofertaAtiva = (pedido.ofertas || []).find(o => o.status === 'ATIVA');

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/pedidos" className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar aos Pedidos
        </Link>
      </div>

      {sucesso && (
        <div className="alert alert-success" role="alert">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div>{sucesso}</div>
        </div>
      )}

      {erro && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>{erro}</div>
        </div>
      )}

      {/* Header Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 className="page-title" style={{ fontSize: '1.5rem' }}>
                Pedido #{pedido.id.substring(0, 8)}
              </h1>
              <StatusBadge status={pedido.status} />
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
              Criado em: {new Date(pedido.criadoEm).toLocaleString('pt-BR')} | Versão: {pedido.versao}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {podeModificar && (
              <>
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="btn-secondary"
                  style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
                >
                  <Edit2 className="w-4 h-4" /> Editar Pedido
                </button>
                {isCliente && <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="btn-danger"
                  style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
                >
                  <Ban className="w-4 h-4" /> Cancelar Pedido
                </button>}
              </>
            )}

            {isAgente && podeModificar && (
              <button
                type="button"
                onClick={abrirModalAvaliar}
                className="btn-primary"
                style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
              >
                <FileCheck2 className="w-4 h-4" /> Avaliar Pedido
              </button>
            )}

            {isBanco && pedido.status === 'APROVADO' && (!ofertaAtiva || ofertaAtiva.bancoId === pedido.agenteAtualId) && (
              <button
                type="button"
                onClick={() => {
                  setCreditoPrincipal(ofertaAtiva?.principal || pedido.total);
                  setCreditoTaxa(ofertaAtiva?.taxaMensal || '1.5');
                  setCreditoParcelas(ofertaAtiva?.parcelas || 12);
                  setShowCreditoModal(true);
                }}
                className="btn-secondary"
                style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem', borderColor: '#059669', color: '#059669' }}
              >
                <Landmark className="w-4 h-4" /> {ofertaAtiva ? 'Editar Crédito' : 'Oferecer Crédito'}
              </button>
            )}

            {isAgente && pedido.podeContratar && pedido.status === 'APROVADO' && (
              <button
                type="button"
                onClick={() => setShowContratoModal(true)}
                className="btn-primary"
                style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
              >
                <FileText className="w-4 h-4" /> Emitir Contrato
              </button>
            )}

            {pedido.status === 'CONTRATADO' && pedido.contratoId && (
              <Link
                to={`/contratos/${pedido.contratoId}`}
                className="btn-primary"
                style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
              >
                <FileText className="w-4 h-4" /> Visualizar Contrato
              </Link>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid-3" style={{ rowGap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Automóvel
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
              {pedido.veiculoMarca} {pedido.veiculoModelo}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
              Placa: {pedido.veiculoPlaca}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Período de Locação
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1e293b' }}>
              {pedido.inicio} até {pedido.fim}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
              {pedido.diarias} diárias calculadas
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Valores
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>
              R$ {pedido.total}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              {pedido.diarias}x de R$ {pedido.valorDiaria}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Modalidade
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              {pedido.tipoContrato === 'LOCACAO_SIMPLES'
                ? 'Locação Simples'
                : 'Transferência de Propriedade'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Solicitante
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              {pedido.clienteNome || 'Cliente'}
            </div>
          </div>
        </div>
      </div>

      {/* Oferta de Crédito Ativa */}
      {ofertaAtiva && (
        <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Landmark className="w-5 h-5 text-emerald-700" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#14532d' }}>
              Proposta de Financiamento / Crédito Bancário Disponível
            </h3>
          </div>
          <div className="grid-3" style={{ fontSize: '0.875rem', color: '#166534', marginTop: '0.75rem' }}>
            <div>Banco: <strong>{ofertaAtiva.bancoNome || 'Banco Parceiro'}</strong></div>
            <div>Principal Financiado: <strong>R$ {ofertaAtiva.principal}</strong></div>
            <div>Termos: <strong>{ofertaAtiva.parcelas}x</strong> a taxa de <strong>{ofertaAtiva.taxaMensal}% a.m.</strong></div>
          </div>
        </div>
      )}

      {/* Linha do Tempo de Pareceres e Eventos */}
      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>
          Histórico de Eventos e Pareceres Financeiros
        </h2>

        {(pedido.eventos || []).length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Nenhum evento registrado.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(pedido.eventos || []).map((ev) => (
              <div
                key={ev.id}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  borderLeft: '2px solid #e2e8f0',
                  paddingLeft: '1rem',
                  marginLeft: '0.5rem',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.875rem', color: '#1e293b' }}>{ev.descricao}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {new Date(ev.criadoEm).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  {ev.autorNome && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Autor: {ev.autorNome}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(pedido.avaliacoes || []).map(a => (
        <div className="card" key={a.id}>
          <strong>Parecer: {a.decisao}</strong>
          <p>{a.justificativa}</p>
          <small>{new Date(a.criadoEm).toLocaleString('pt-BR')}</small>
        </div>
      ))}

      {/* Modal Cancelar Pedido */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancelar este pedido de locação?"
        message="O pedido passará para o estado terminal CANCELADO. Esta operação não poderá ser revertida."
        confirmLabel="Sim, cancelar pedido"
        cancelLabel="Voltar"
        variant="danger"
        loading={cancelando}
        onConfirm={handleCancelar}
        onCancel={() => setShowCancelModal(false)}
      />

      {/* Modal Editar Pedido (Cliente) */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Editar Datas ou Modalidade</h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="icon-btn" aria-label="Fechar">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSalvarEdicao}>
              <div className="modal-body">
                <div className="alert alert-warning" style={{ fontSize: '0.8125rem' }}>
                  Atenção: Ao alterar as datas ou a modalidade, o pedido retornará para o status <strong>PENDENTE</strong> e qualquer parecer ou proposta de crédito anterior será invalidado.
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-inicio">Data Início</label>
                    <input
                      id="edit-inicio"
                      type="date"
                      className="form-input"
                      value={editInicio}
                      onChange={(e) => setEditInicio(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-fim">Data Devolução</label>
                    <input
                      id="edit-fim"
                      type="date"
                      className="form-input"
                      value={editFim}
                      onChange={(e) => setEditFim(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-tipo">Tipo Contratual</label>
                  <select
                    id="edit-tipo"
                    className="form-select"
                    value={editTipo}
                    onChange={(e) => setEditTipo(e.target.value as TipoContrato)}
                    required
                  >
                    <option value="LOCACAO_SIMPLES">Locação Simples</option>
                    <option value="TRANSFERENCIA_AO_CLIENTE">Transferência de Propriedade</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)} disabled={salvandoEdicao}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={salvandoEdicao}>
                  {salvandoEdicao ? 'Salvando...' : 'Salvar e Reavaliar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Avaliação Financeira (Agentes) */}
      {showAvaliarModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Avaliação Financeira do Pedido</h3>
              <button type="button" onClick={() => setShowAvaliarModal(false)} className="icon-btn" aria-label="Fechar">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEnviarAvaliacao}>
              <div className="modal-body">
                {dadosFinanceiros && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Comprovação Financeira do Cliente
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{dadosFinanceiros.nome} (Profissão: {dadosFinanceiros.profissao})</div>
                    <div style={{ fontSize: '0.8125rem', color: '#16a34a', fontWeight: 700, marginTop: '0.25rem' }}>
                      Renda Total Declarada: R$ {dadosFinanceiros.rendaTotal}
                    </div>
                    {dadosFinanceiros.empregos.length > 0 && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: '#475569' }}>
                        Fontes: {dadosFinanceiros.empregos.map(e => `${e.empregador} (R$ ${e.rendaMensal})`).join(' | ')}
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Decisão do Parecer *</label>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#16a34a' }}>
                      <input
                        type="radio"
                        name="decisao"
                        value="APROVADO"
                        checked={decisao === 'APROVADO'}
                        onChange={() => setDecisao('APROVADO')}
                      />
                      Aprovar Pedido
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#dc2626' }}>
                      <input
                        type="radio"
                        name="decisao"
                        value="REPROVADO"
                        checked={decisao === 'REPROVADO'}
                        onChange={() => setDecisao('REPROVADO')}
                      />
                      Reprovar Pedido
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="justificativa">Justificativa do Parecer *</label>
                  <textarea
                    id="justificativa"
                    className="form-textarea"
                    rows={3}
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    placeholder="Descreva a fundamentação da aprovação ou reprovação financeira..."
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAvaliarModal(false)} disabled={avaliando}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={avaliando}>
                  {avaliando ? 'Enviando Parecer...' : 'Registrar Parecer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Oferta de Crédito (Banco) */}
      {showCreditoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Formular Proposta de Crédito</h3>
              <button type="button" onClick={() => setShowCreditoModal(false)} className="icon-btn" aria-label="Fechar">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleOferecerCredito}>
              <div className="modal-body">
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                  Conceda financiamento opcional para a locação deste pedido aprovado.
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="principal">Valor Financiado (R$) *</label>
                  <input
                    id="principal"
                    type="text"
                    className="form-input"
                    value={creditoPrincipal}
                    onChange={(e) => setCreditoPrincipal(e.target.value)}
                    placeholder={pedido.total}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Máximo permitido: R$ {pedido.total}
                  </span>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="taxa">Taxa Mensal (% a.m.) *</label>
                    <input
                      id="taxa"
                      type="text"
                      className="form-input"
                      value={creditoTaxa}
                      onChange={(e) => setCreditoTaxa(e.target.value)}
                      placeholder="1.5"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="parcelas">Número de Parcelas *</label>
                    <input
                      id="parcelas"
                      type="number"
                      className="form-input"
                      value={creditoParcelas}
                      min={1}
                      max={60}
                      onChange={(e) => setCreditoParcelas(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowCreditoModal(false)} disabled={oferecendoCredito}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={oferecendoCredito}>
                  {oferecendoCredito ? 'Salvando...' : 'Registrar Oferta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Emitir Contrato */}
      {showContratoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Emitir e Formalizar Contrato</h3>
              <button type="button" onClick={() => setShowContratoModal(false)} className="icon-btn" aria-label="Fechar">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: '#334155', marginBottom: '1rem' }}>
                A emissão do contrato é atômica e definitiva: o pedido passará ao status <strong>CONTRATADO</strong>, bloqueando quaisquer sobreposições de reserva no automóvel.
              </p>

              {ofertaAtiva && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#166534' }}>
                    <input
                      type="checkbox"
                      checked={incluirCredito}
                      onChange={(e) => setIncluirCredito(e.target.checked)}
                    />
                    Vincular oferta de crédito do banco ({ofertaAtiva.bancoNome} - R$ {ofertaAtiva.principal})
                  </label>
                </div>
              )}

              {pedido.tipoContrato === 'TRANSFERENCIA_AO_CLIENTE' && (
                <div className="alert alert-warning" style={{ fontSize: '0.8125rem' }}>
                  Este pedido foi solicitado com <strong>Transferência de Propriedade</strong>. A formalização mudará a propriedade do veículo para o cliente e exige ausência de contratos futuros.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowContratoModal(false)} disabled={emitindoContrato}>
                Cancelar
              </button>
              <button type="button" className="btn-primary" onClick={handleEmitirContrato} disabled={emitindoContrato}>
                {emitindoContrato ? 'Emitindo...' : 'Confirmar e Emitir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
