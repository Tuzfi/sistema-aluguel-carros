import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listarPedidos } from '../api/pedidos';
import { StatusBadge } from '../components/StatusBadge';
import { Car, FileText, User, ArrowRight, Clock, ShieldCheck, Plus } from 'lucide-react';
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
          <h1 className="page-title">Bem-vindo, {usuario.usuario}!</h1>
          <p className="page-subtitle">
            Painel principal do sistema ViaCar | Sistema de Aluguel de Carros
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

      {/* Action shortcuts */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ backgroundColor: '#eff6ff', padding: '0.625rem', borderRadius: '0.5rem', color: '#2563eb' }}>
                <Car className="w-6 h-6" />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Catálogo de Veículos</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Explore todos os automóveis disponíveis no sistema, marcas, modelos e diárias.
            </p>
          </div>
          <Link to="/veiculos" className="btn-secondary" style={{ marginTop: '1.25rem', width: '100%' }}>
            Acessar Catálogo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ backgroundColor: '#ecfdf5', padding: '0.625rem', borderRadius: '0.5rem', color: '#16a34a' }}>
                <FileText className="w-6 h-6" />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                {isCliente ? 'Meus Pedidos' : 'Fila de Análise'}
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              {isCliente
                ? 'Consulte o andamento, emita ou cancele seus pedidos de locação.'
                : 'Analise pedidos de clientes, emita pareceres e formalize contratos.'}
            </p>
          </div>
          <Link to="/pedidos" className="btn-secondary" style={{ marginTop: '1.25rem', width: '100%' }}>
            Ver Pedidos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ backgroundColor: '#f5f3ff', padding: '0.625rem', borderRadius: '0.5rem', color: '#7c3aed' }}>
                {isCliente ? <User className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                {isCliente ? 'Perfil & Renda' : 'Gestão de Frota'}
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              {isCliente
                ? 'Mantenha seus dados e até 3 fontes de rendimento atualizados para as avaliações.'
                : 'Gerencie os veículos cadastrados sob propriedade da sua organização.'}
            </p>
          </div>
          <Link to={isCliente ? '/perfil' : '/frota'} className="btn-secondary" style={{ marginTop: '1.25rem', width: '100%' }}>
            {isCliente ? 'Gerenciar Perfil' : 'Gerenciar Frota'} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recent orders */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {isCliente ? 'Meus Pedidos Recentes' : 'Últimos Pedidos na Fila'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Acompanhamento de status e transições
            </p>
          </div>
          <Link to="/pedidos" style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: 600 }}>
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
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Placa: {p.veiculoPlaca}</div>
                    </td>
                    <td>
                      <div>{p.inicio} até {p.fim}</div>
                    </td>
                    <td>
                      <div>{p.diarias}x R$ {p.valorDiaria}</div>
                      <div style={{ fontWeight: 700, color: '#16a34a' }}>R$ {p.total}</div>
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
