import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Car, Search, ArrowRight } from 'lucide-react';
import { obterFotoVeiculo } from '../utils/carImages';
import type { Veiculo, Pagina } from '../types';

export const Veiculos: React.FC = () => {
  const { usuario } = useAuth();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const carregarVeiculos = async (filtros = { marca, modelo }) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtros.marca) params.append('marca', filtros.marca.trim());
      if (filtros.modelo) params.append('modelo', filtros.modelo.trim());

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
          <h1 className="page-title">Veículos para alugar</h1>
          <p className="page-subtitle">Escolha o carro e confira o valor da diária.</p>
        </div>
        {isCliente && (
          <Link to="/pedidos/novo" className="btn-primary">
            Solicitar Aluguel
          </Link>
        )}
      </div>

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
                  carregarVeiculos({ marca: '', modelo: '' });
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
        <div className="vehicle-list">
          {veiculos.map((v) => (
            <article key={v.id} className="vehicle-row">
              <img
                src={obterFotoVeiculo(v.modelo, v.marca, v.fotoUrl)}
                alt={`${v.marca} ${v.modelo}`}
                className="vehicle-thumbnail"
                loading="eager"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="vehicle-identity"><p>{v.marca} · {v.ano}</p><h2>{v.modelo}</h2></div>
              <div className="vehicle-identifiers"><div className="vehicle-plate">{v.placa}</div><p>Matrícula {v.matricula}</p></div>
              <div><p>Por dia</p><div className="vehicle-rate">{Number(v.diaria).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</div></div>
              {isCliente ? <Link to={`/pedidos/novo?veiculoId=${v.id}`} className="btn-secondary">Alugar <ArrowRight size={16} /></Link> : <span />}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
