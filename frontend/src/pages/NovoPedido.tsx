import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import type { Veiculo, Pedido, Pagina, TipoContrato } from '../types';

export const NovoPedido: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const veiculoIdParam = searchParams.get('veiculoId') || '';

  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [veiculoId, setVeiculoId] = useState(veiculoIdParam);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null);

  // Default dates: tomorrow to tomorrow + 3 days
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);
  const fimPadrao = new Date(amanha);
  fimPadrao.setDate(amanha.getDate() + 3);

  const formatData = (d: Date) => d.toISOString().split('T')[0];

  const [inicio, setInicio] = useState(formatData(amanha));
  const [fim, setFim] = useState(formatData(fimPadrao));
  const [tipoContrato, setTipoContrato] = useState<TipoContrato>('LOCACAO_SIMPLES');

  const [loading, setLoading] = useState(false);
  const [loadingVeiculos, setLoadingVeiculos] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoadingVeiculos(true);
        const res = await api.get<Pagina<Veiculo>>('/api/veiculos');
        const disponiveis = (res.items || []).filter(v => v.ativo);
        setVeiculos(disponiveis);
        if (veiculoIdParam) {
          const v = disponiveis.find(item => item.id === veiculoIdParam);
          if (v) setVeiculoSelecionado(v);
        } else if (disponiveis.length > 0) {
          setVeiculoId(disponiveis[0].id);
          setVeiculoSelecionado(disponiveis[0]);
        }
      } catch (err: any) {
        setErro(err.message || 'Erro ao carregar veículos disponíveis.');
      } finally {
        setLoadingVeiculos(false);
      }
    };
    carregar();
  }, [veiculoIdParam]);

  const handleMudarVeiculo = (id: string) => {
    setVeiculoId(id);
    const v = veiculos.find(item => item.id === id);
    setVeiculoSelecionado(v || null);
  };

  // Cálculo de diárias e total estimado
  let diarias = 0;
  let totalEstimado = '0.00';
  if (inicio && fim && veiculoSelecionado) {
    const dInicio = new Date(inicio);
    const dFim = new Date(fim);
    const diffTime = dFim.getTime() - dInicio.getTime();
    diarias = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
    if (diarias > 0) {
      const vDiaria = parseFloat(veiculoSelecionado.diaria) || 0;
      totalEstimado = (diarias * vDiaria).toFixed(2);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!veiculoId || !inicio || !fim) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }
    if (diarias <= 0) {
      setErro('A data de devolução deve ser posterior à data de retirada.');
      return;
    }

    setLoading(true);
    setErro(null);

    const body = {
      veiculoId,
      inicio,
      fim,
      tipoContrato,
    };

    try {
      const novo = await api.post<Pedido>('/api/pedidos', body);
      navigate(`/pedidos/${novo.id}`);
    } catch (err: any) {
      setErro(err.message || 'Falha ao registrar pedido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/veiculos" className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Catálogo
        </Link>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 className="page-title" style={{ fontSize: '1.5rem' }}>Novo Pedido de Locação</h1>
          <p className="page-subtitle">Escolha o automóvel, as datas e o formato contratual desejado</p>
        </div>

        {erro && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>{erro}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Veículo Selector */}
          <div className="form-group">
            <label className="form-label" htmlFor="veiculoId">Selecione o Automóvel *</label>
            {loadingVeiculos ? (
              <div className="skeleton" style={{ height: '42px' }} />
            ) : (
              <select
                id="veiculoId"
                className="form-select"
                value={veiculoId}
                onChange={(e) => handleMudarVeiculo(e.target.value)}
                required
                disabled={loading}
              >
                {veiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.marca} {v.modelo} ({v.ano}) - Placa {v.placa} - R$ {v.diaria}/dia
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Dates */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="inicio">Data de Retirada (inclusiva) *</label>
              <input
                id="inicio"
                type="date"
                className="form-input"
                value={inicio}
                min={formatData(hoje)}
                onChange={(e) => setInicio(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="fim">Data de Devolução (exclusiva) *</label>
              <input
                id="fim"
                type="date"
                className="form-input"
                value={fim}
                min={inicio || formatData(hoje)}
                onChange={(e) => setFim(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Tipo de Contrato */}
          <div className="form-group">
            <label className="form-label" htmlFor="tipoContrato">Modalidade Contratual *</label>
            <select
              id="tipoContrato"
              className="form-select"
              value={tipoContrato}
              onChange={(e) => setTipoContrato(e.target.value as TipoContrato)}
              required
              disabled={loading}
            >
              <option value="LOCACAO_SIMPLES">
                Locação Simples (o veículo permanece sob propriedade do agente)
              </option>
              <option value="TRANSFERENCIA_AO_CLIENTE">
                Locação com Transferência de Propriedade ao Cliente (aquisição final)
              </option>
            </select>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Na opção com transferência, a propriedade do automóvel é transferida formalmente ao seu nome no registro do contrato.
            </p>
          </div>

          {/* Resumo Financeiro Dinâmico */}
          {veiculoSelecionado && (
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                padding: '1.25rem',
                marginTop: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
                Resumo da Solicitação
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Veículo:</span>
                <strong>{veiculoSelecionado.marca} {veiculoSelecionado.modelo}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Diárias calculadas:</span>
                <strong>{diarias} {diarias === 1 ? 'diária' : 'diárias'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Valor unitário por diária:</span>
                <span>R$ {veiculoSelecionado.diaria}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.125rem',
                  fontWeight: 800,
                  borderTop: '1px solid #cbd5e1',
                  paddingTop: '0.75rem',
                  marginTop: '0.75rem',
                  color: '#16a34a',
                }}
              >
                <span>Total Estimado:</span>
                <span>R$ {totalEstimado}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%' }}
            disabled={loading || diarias <= 0}
          >
            {loading ? 'Registrando Pedido...' : 'Enviar Solicitação de Pedido'}
          </button>
        </form>
      </div>
    </div>
  );
};
