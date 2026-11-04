import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { Plus, Edit2, Ban, Car, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { obterFotoVeiculo } from '../utils/carImages';
import type { Veiculo, Pagina } from '../types';

export const Frota: React.FC = () => {
  const { usuario } = useAuth();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Veiculo | null>(null);
  const [matricula, setMatricula] = useState('');
  const [ano, setAno] = useState(() => new Date().getFullYear());
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [diaria, setDiaria] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [veiculoInativar, setVeiculoInativar] = useState<Veiculo | null>(null);
  const [inativando, setInativando] = useState(false);

  const carregarFrota = async () => {
    try {
      setLoading(true);
      const res = await api.get<Pagina<Veiculo>>('/api/veiculos?meus=true&size=100');
      setVeiculos(res.items);
      setErro(null);
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar frota.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuario && usuario.papel !== 'CLIENTE') {
      carregarFrota();
    }
  }, [usuario]);

  const abrirNovo = () => {
    setEditando(null);
    setMatricula('');
    setAno(new Date().getFullYear());
    setMarca('');
    setModelo('');
    setPlaca('');
    setDiaria('150.00');
    setFotoUrl('');
    setShowModal(true);
  };

  const abrirEditar = (v: Veiculo) => {
    setEditando(v);
    setMatricula(v.matricula);
    setAno(v.ano);
    setMarca(v.marca);
    setModelo(v.modelo);
    setPlaca(v.placa);
    setDiaria(v.diaria);
    setFotoUrl(v.fotoUrl || '');
    setShowModal(true);
  };

  const salvarVeiculo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    setSucesso(null);

    const body: any = {
      matricula: matricula.trim(),
      ano: Number(ano),
      marca: marca.trim(),
      modelo: modelo.trim(),
      placa: placa.trim().toUpperCase(),
      diaria: diaria.trim(),
      fotoUrl: fotoUrl.trim() || undefined,
    };

    try {
      if (editando) {
        body.versao = editando.versao;
        await api.put(`/api/veiculos/${editando.id}`, body);
        setSucesso(`Veículo ${modelo} atualizado com sucesso!`);
      } else {
        await api.post('/api/veiculos?meus=true&size=100', body);
        setSucesso(`Veículo ${modelo} cadastrado na frota com sucesso!`);
      }
      setShowModal(false);
      await carregarFrota();
    } catch (err: any) {
      setErro(err.message || 'Erro ao salvar veículo');
    } finally {
      setSalvando(false);
    }
  };

  const handleInativar = async () => {
    if (!veiculoInativar) return;
    setInativando(true);
    try {
      await api.post(`/api/veiculos/${veiculoInativar.id}/inativacao`, {
        versao: veiculoInativar.versao,
      });
      setSucesso(`Veículo ${veiculoInativar.modelo} inativado com sucesso.`);
      setVeiculoInativar(null);
      await carregarFrota();
    } catch (err: any) {
      setErro(err.message || 'Falha ao inativar veículo.');
      setVeiculoInativar(null);
    } finally {
      setInativando(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestão de Frota</h1>
          <p className="page-subtitle">Veículos pertencentes à sua organização</p>
        </div>
        <button type="button" onClick={abrirNovo} className="btn-primary">
          <Plus className="w-4 h-4" /> Cadastrar Novo Veículo
        </button>
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

      {loading ? (
        <div className="skeleton" style={{ height: '240px' }} />
      ) : veiculos.length === 0 ? (
        <div className="empty-state">
          <Car className="w-12 h-12 text-slate-400" />
          <div className="empty-state-title">Nenhum veículo na sua frota</div>
          <p className="empty-state-text">
            Comece cadastrando automóveis para disponibilizá-los aos clientes no catálogo.
          </p>
          <button type="button" onClick={abrirNovo} className="btn-primary" style={{ marginTop: '0.75rem' }}>
            Cadastrar Veículo
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Marca / Modelo</th>
                <th>Ano</th>
                <th>Placa</th>
                <th>Diária</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {veiculos.map((v) => (
                <tr key={v.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v.matricula}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={obterFotoVeiculo(v.modelo, v.marca, v.fotoUrl)}
                        alt={v.modelo}
                        style={{ width: '48px', height: '34px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border-color)', background: '#e2e8f0' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div style={{ fontWeight: 600 }}>{v.marca} {v.modelo}</div>
                    </div>
                  </td>
                  <td>{v.ano}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{v.placa}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#246144' }}>R$ {v.diaria}</td>
                  <td>
                    {v.ativo ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300">
                        Inativo
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => abrirEditar(v)}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Editar
                      </button>
                      {v.ativo && (
                        <button
                          type="button"
                          onClick={() => setVeiculoInativar(v)}
                          className="btn-danger"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
                        >
                          <Ban className="w-3.5 h-3.5" /> Inativar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editando ? 'Editar Veículo da Frota' : 'Cadastrar Novo Veículo'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="icon-btn"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={salvarVeiculo}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="matricula">Matrícula *</label>
                    <input
                      id="matricula"
                      type="text"
                      className="form-input"
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      placeholder="ex: V101"
                      required
                      disabled={salvando}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="placa">Placa *</label>
                    <input
                      id="placa"
                      type="text"
                      className="form-input"
                      value={placa}
                      onChange={(e) => setPlaca(e.target.value)}
                      placeholder="ex: ABC1D23"
                      required
                      disabled={salvando}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="marca">Marca *</label>
                    <input
                      id="marca"
                      type="text"
                      className="form-input"
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      placeholder="ex: Fiat"
                      required
                      disabled={salvando}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="modelo">Modelo *</label>
                    <input
                      id="modelo"
                      type="text"
                      className="form-input"
                      value={modelo}
                      onChange={(e) => setModelo(e.target.value)}
                      placeholder="ex: Argo 1.0"
                      required
                      disabled={salvando}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="ano">Ano Fabricação *</label>
                    <input
                      id="ano"
                      type="number"
                      className="form-input"
                      value={ano}
                      onChange={(e) => setAno(Number(e.target.value))}
                      required
                      disabled={salvando}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="diaria">Valor da Diária (R$) *</label>
                    <input
                      id="diaria"
                      type="text"
                      className="form-input"
                      value={diaria}
                      onChange={(e) => setDiaria(e.target.value)}
                      placeholder="150.00"
                      required
                      disabled={salvando}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label" htmlFor="fotoUrl">Foto do Veículo (URL ou arquivo)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      id="fotoUrl"
                      type="text"
                      className="form-input"
                      value={fotoUrl}
                      onChange={(e) => setFotoUrl(e.target.value)}
                      placeholder="https://exemplo.com/foto.jpg ou escolha um arquivo"
                      disabled={salvando}
                    />
                    <label className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      <span>Arquivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={salvando}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setFotoUrl(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {fotoUrl && (
                    <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#f8fafc' }}>
                      <img
                        src={fotoUrl}
                        alt="Prévia do veículo"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFotoUrl('')}
                        style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 0, borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        aria-label="Remover foto"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={salvando}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar Veículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(veiculoInativar)}
        title="Deseja inativar este veículo?"
        message={`O veículo ${veiculoInativar?.modelo} (${veiculoInativar?.placa}) deixará de aparecer para novas solicitações no catálogo. Contratos vigentes ou futuros impedirão esta ação.`}
        confirmLabel="Sim, inativar veículo"
        cancelLabel="Cancelar"
        variant="danger"
        loading={inativando}
        onConfirm={handleInativar}
        onCancel={() => setVeiculoInativar(null)}
      />
    </div>
  );
};
