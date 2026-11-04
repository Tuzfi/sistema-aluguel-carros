import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listarPedidos } from '../api/pedidos';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Plus, ArrowRight, Clock } from 'lucide-react';
import type { Pedido } from '../types';

export const Pedidos: React.FC = () => {
  const { usuario } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFiltro = searchParams.get('status') || '';

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFiltro) params.append('status', statusFiltro);
      params.append('size', '50');

      const res = await listarPedidos(`/api/pedidos?${params.toString()}`);
      setPedidos(res.items || []);
      setErro(null);
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar lista de pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, [statusFiltro]);

  const handleMudarFiltro = (s: string) => {
    if (s) {
      setSearchParams({ status: s });
    } else {
      setSearchParams({});
    }
  };

  const isCliente = usuario?.papel === 'CLIENTE';

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isCliente ? 'Meus Pedidos de Locação' : 'Fila de Análise e Pedidos'}
          </h1>
          <p className="page-subtitle">
            {isCliente
              ? 'Acompanhe o andamento dos seus pedidos, pareceres financeiros e contratos'
              : 'Analise solicitações de clientes, conceda pareceres financeiros e emita contratos'}
          </p>
        </div>
        {isCliente && (
          <Link to="/pedidos/novo" className="btn-primary">
            <Plus className="w-4 h-4" /> Novo Pedido
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {[
          { label: 'Todos', value: '' },
          { label: 'Pendentes', value: 'PENDENTE' },
          { label: 'Aprovados', value: 'APROVADO' },
          { label: 'Contratados', value: 'CONTRATADO' },
          { label: 'Reprovados', value: 'REPROVADO' },
          { label: 'Cancelados', value: 'CANCELADO' },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleMudarFiltro(tab.value)}
            className={`btn-secondary ${statusFiltro === tab.value ? 'btn-primary' : ''}`}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.8125rem',
              backgroundColor: statusFiltro === tab.value ? '#1e293b' : undefined,
              color: statusFiltro === tab.value ? '#ffffff' : undefined,
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {erro && (
        <div className="alert alert-danger" role="alert">
          <div>{erro}</div>
        </div>
      )}

      {loading ? (
        <div className="skeleton" style={{ height: '300px' }} />
      ) : pedidos.length === 0 ? (
        <div className="empty-state">
          <Clock className="w-12 h-12 text-slate-400" />
          <div className="empty-state-title">Nenhum pedido encontrado</div>
          <p className="empty-state-text">
            {statusFiltro
              ? `Não há pedidos com o status ${statusFiltro}.`
              : 'Nenhum pedido registrado no sistema.'}
          </p>
          {isCliente && (
            <Link to="/veiculos" className="btn-primary" style={{ marginTop: '0.5rem' }}>
              Explorar Catálogo
            </Link>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID Pedido</th>
                  {!isCliente && <th>Cliente</th>}
                  <th>Automóvel</th>
                  <th>Período</th>
                  <th>Total</th>
                  <th>Tipo Contratual</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8125rem' }}>
                      #{p.id.substring(0, 8)}
                    </td>
                    {!isCliente && (
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.clienteNome || 'Cliente'}</div>
                      </td>
                    )}
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.veiculoMarca} {p.veiculoModelo}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Placa: {p.veiculoPlaca}</div>
                    </td>
                    <td>
                      <div>{p.inicio} até {p.fim}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.diarias} diárias</div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#16a34a' }}>
                      R$ {p.total}
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {p.tipoContrato === 'LOCACAO_SIMPLES' ? 'Locação Simples' : 'Transferência'}
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      <Link
                        to={`/pedidos/${p.id}`}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
                      >
                        Abrir <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
