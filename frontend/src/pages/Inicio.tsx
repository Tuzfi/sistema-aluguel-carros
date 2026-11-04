import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listarPedidos } from '../api/pedidos';
import { StatusBadge } from '../components/StatusBadge';
import { Car, ArrowRight, Clock, Plus } from 'lucide-react';
import type { Pedido } from '../types';

export const Inicio: React.FC = () => {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const data = await listarPedidos('/api/pedidos?size=5');
        setPedidos(data.items || []);
      } catch (err) {
        console.warn('Erro ao carregar pedidos recentes:', err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  if (!usuario) return null;

  const isCliente = usuario.papel === 'CLIENTE';

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Visão geral</h1>
          <p className="page-subtitle">
            {isCliente ? 'Seus aluguéis, do pedido à entrega das chaves.' : 'Pedidos de aluguel e veículos da sua conta.'}
          </p>
        </div>
        {isCliente && (
          <Link to="/veiculos" className="btn-primary">
            <Car className="w-4 h-4" /> Escolher um Veículo
          </Link>
        )}
        {!isCliente && (
          <Link to="/frota" className="btn-primary">
            <Plus className="w-4 h-4" /> Cadastrar Veículo na Frota
          </Link>
        )}
      </div>

      <div className="home-shortcuts">
        <Link to="/veiculos"><div><strong>Escolher um carro</strong><p>Consulte modelos e valores das diárias.</p></div><ArrowRight size={18} /></Link>
        <Link to="/pedidos"><div><strong>{isCliente ? 'Acompanhar pedidos' : 'Analisar pedidos'}</strong><p>{isCliente ? 'Veja o andamento dos seus aluguéis.' : 'Consulte os pedidos e registre seu parecer.'}</p></div><ArrowRight size={18} /></Link>
        <Link to={isCliente ? '/perfil' : '/frota'}><div><strong>{isCliente ? 'Atualizar meu perfil' : 'Cuidar da frota'}</strong><p>{isCliente ? 'Seus dados e fontes de renda.' : 'Cadastre carros e atualize as diárias.'}</p></div><ArrowRight size={18} /></Link>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {isCliente ? 'Meus Pedidos Recentes' : 'Últimos Pedidos na Fila'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Confira o andamento dos últimos pedidos.
            </p>
          </div>
          <Link to="/pedidos" style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 600 }}>
            Ver todos
          </Link>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: '140px', width: '100%' }} />
        ) : pedidos.length === 0 ? (
          <div className="empty-state">
            <Clock className="w-10 h-10 text-slate-400" />
            <div className="empty-state-title">Nenhum pedido registrado no momento</div>
            <p className="empty-state-text">
              {isCliente
                ? 'Você ainda não fez nenhum pedido de aluguel. Visite o catálogo para escolher um carro.'
                : 'Nenhum pedido aguardando ação na fila.'}
            </p>
            {isCliente && (
              <Link to="/veiculos" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                Explorar Catálogo
              </Link>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Veículo</th>
                  <th>Período</th>
                  <th>Diárias / Total</th>
                  <th>Tipo</th>
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
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.veiculoMarca} {p.veiculoModelo}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Placa: {p.veiculoPlaca}</div>
                    </td>
                    <td>
                      <div>{p.inicio} até {p.fim}</div>
                    </td>
                    <td>
                      <div>{p.diarias}x R$ {p.valorDiaria}</div>
                      <div style={{ fontWeight: 700, color: '#246144' }}>R$ {p.total}</div>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {p.tipoContrato === 'LOCACAO_SIMPLES' ? 'Locação Simples' : 'Transferência ao Cliente'}
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      <Link to={`/pedidos/${p.id}`} className="btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}>
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
