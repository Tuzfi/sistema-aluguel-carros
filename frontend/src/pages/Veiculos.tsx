import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Car, Search, ArrowRight } from 'lucide-react';
import type { Veiculo, Pagina } from '../types';

export const Veiculos: React.FC = () => {
  const { usuario } = useAuth();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const carregarVeiculos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (marca) params.append('marca', marca.trim());
      if (modelo) params.append('modelo', modelo.trim());

      const res = await api.get<Pagina<Veiculo>>(`/api/veiculos?${params.toString()}`);
      setVeiculos(res.items || []);
      setErro(null);
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar catálogo de veículos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarVeiculos();
  }, []);

  const handleFiltrar = (e: React.FormEvent) => {
    e.preventDefault();
    carregarVeiculos();
  };

  const isCliente = usuario?.papel === 'CLIENTE';

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Catálogo de Automóveis</h1>
          <p className="page-subtitle">Veículos disponíveis para locação e propostas de aquisição</p>
        </div>
        {isCliente && (
          <Link to="/pedidos/novo" className="btn-primary">
            Solicitar Aluguel
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <form onSubmit={handleFiltrar} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="form-label" htmlFor="filtro-marca">Marca</label>
            <input
              id="filtro-marca"
              type="text"
              className="form-input"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="ex: Fiat, Toyota..."
            />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label className="form-label" htmlFor="filtro-modelo">Modelo</label>
            <input
              id="filtro-modelo"
              type="text"
              className="form-input"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              placeholder="ex: Argo, Corolla..."
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn-primary">
              <Search className="w-4 h-4" /> Filtrar
            </button>
            {(marca || modelo) && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setMarca('');
                  setModelo('');
                  setTimeout(carregarVeiculos, 0);
                }}
              >
                Limpar
              </button>
            )}
          </div>
        </form>
      </div>

      {erro && (
        <div className="alert alert-danger" role="alert">
          <div>{erro}</div>
        </div>
      )}

      {loading ? (
        <div className="grid-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton" style={{ height: '220px' }} />
          ))}
        </div>
      ) : veiculos.length === 0 ? (
        <div className="empty-state">
          <Car className="w-12 h-12 text-slate-400" />
          <div className="empty-state-title">Nenhum automóvel encontrado</div>
          <p className="empty-state-text">
            Tente ajustar os filtros ou consulte novamente mais tarde.
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {veiculos.map((v) => (
            <div key={v.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      {v.marca}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      {v.modelo}
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569', backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>
                    {v.ano}
                  </span>
                </div>

                <div style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div>Placa: <strong style={{ color: '#334155' }}>{v.placa}</strong></div>
                  <div>Matrícula: {v.matricula}</div>
                  <div>Propriedade: {v.proprietarioNome || 'Agente Registrado'}</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Valor da diária</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>
                    R$ {v.diaria}
                  </div>
                </div>

                {isCliente && (
                  <Link to={`/pedidos/novo?veiculoId=${v.id}`} className="btn-primary-sm">
                    Alugar <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
