import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Cliente, VinculoEmprego } from '../types';

export const Perfil: React.FC = () => {
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [rg, setRg] = useState('');
  const [endereco, setEndereco] = useState('');
  const [profissao, setProfissao] = useState('');
  const [empregos, setEmpregos] = useState<VinculoEmprego[]>([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const carregarPerfil = async () => {
    try {
      setLoading(true);
      const data = await api.get<Cliente>('/api/clientes/me');
      setCliente(data);
      setNome(data.nome);
      setRg(data.rg);
      setEndereco(data.endereco);
      setProfissao(data.profissao);
      setEmpregos(data.empregos || []);
      setErro(null);
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPerfil();
  }, []);

  const handleAddEmprego = () => {
    if (empregos.length < 3) {
      setEmpregos([...empregos, { empregador: '', rendaMensal: '' }]);
    }
  };

  const handleRemoveEmprego = (index: number) => {
    setEmpregos(empregos.filter((_, i) => i !== index));
  };

  const handleEmpregoChange = (index: number, field: keyof VinculoEmprego, val: string) => {
    const novos = [...empregos];
    novos[index] = { ...novos[index], [field]: val };
    setEmpregos(novos);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente) return;

    setSaving(true);
    setMensagemSucesso(null);
    setErro(null);

    const body = {
      nome: nome.trim(),
      cpf: cliente.cpf,
      rg: rg.trim(),
      endereco: endereco.trim(),
      profissao: profissao.trim(),
      versao: cliente.versao,
      empregos: empregos.filter(emp => emp.empregador.trim() && emp.rendaMensal.trim()),
    };

    try {
      const atualizado = await api.put<Cliente>('/api/clientes/me', body);
      setCliente(atualizado);
      setMensagemSucesso('Perfil e informações de renda atualizados com sucesso!');
    } catch (err: any) {
      if (err.status === 409) {
        setErro('Houve uma alteração concorrente no seu perfil. Os dados foram recarregados.');
        await carregarPerfil();
      } else {
        setErro(err.message || 'Falha ao atualizar perfil.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEncerrarConta = async () => {
    if (!cliente) return;
    setDeleting(true);
    try {
      await api.del(`/api/clientes/me?versao=${cliente.versao}`);
      setShowDeleteModal(false);
      await logout().catch(() => undefined);
      navigate('/login');
    } catch (err: any) {
      setErro(err.message || 'Não foi possível encerrar a conta.');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ maxWidth: '640px' }}>
        <div className="skeleton" style={{ height: '350px' }} />
      </div>
    );
  }

  if (!cliente) return null;

  return (
    <div className="page-container" style={{ maxWidth: '680px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Meu Perfil de Cliente</h1>
          <p className="page-subtitle">Gerencie suas informações cadastrais e comprovações de renda</p>
        </div>
      </div>

      {mensagemSucesso && (
        <div className="alert alert-success" role="alert">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div>{mensagemSucesso}</div>
        </div>
      )}

      {erro && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>{erro}</div>
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSalvar}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Usuário de Acesso</label>
              <input type="text" className="form-input" value={usuario?.usuario || ''} disabled style={{ backgroundColor: '#f1f5f9' }} />
            </div>

            <div className="form-group">
              <label className="form-label">CPF</label>
              <input type="text" className="form-input" value={cliente.cpf} disabled style={{ backgroundColor: '#f1f5f9' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="nome">Nome Completo *</label>
            <input
              id="nome"
              type="text"
              className="form-input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              disabled={saving}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="rg">RG *</label>
              <input
                id="rg"
                type="text"
                className="form-input"
                value={rg}
                onChange={(e) => setRg(e.target.value)}
                required
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profissao">Profissão *</label>
              <input
                id="profissao"
                type="text"
                className="form-input"
                value={profissao}
                onChange={(e) => setProfissao(e.target.value)}
                required
                disabled={saving}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="endereco">Endereço Completo *</label>
            <input
              id="endereco"
              type="text"
              className="form-input"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              required
              disabled={saving}
            />
          </div>

          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Fontes de Renda / Empregos (Máximo 3)</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Esses dados são usados pelos agentes bancários e empresas na avaliação financeira.
                </p>
              </div>
              {empregos.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddEmprego}
                  className="btn-secondary"
                  style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Renda
                </button>
              )}
            </div>

            {empregos.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Nenhuma fonte de renda cadastrada.
              </p>
            ) : (
              empregos.map((emp, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                    backgroundColor: '#f5f7f5',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ flex: 2 }}>
                    <input
                      type="text"
                      className="form-input"
                      value={emp.empregador}
                      onChange={(e) => handleEmpregoChange(idx, 'empregador', e.target.value)}
                      placeholder="Empresa Empregadora"
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      className="form-input"
                      value={emp.rendaMensal}
                      onChange={(e) => handleEmpregoChange(idx, 'rendaMensal', e.target.value)}
                      placeholder="Renda Mensal (R$)"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEmprego(idx)}
                    className="icon-btn"
                    style={{ color: '#ef4444', padding: '0.5rem' }}
                    title="Remover fonte"
                    aria-label="Remover fonte de renda"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ border: '1px solid #fee2e2', backgroundColor: '#fff5f5' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.375rem' }}>
          Zona de Perigo
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#7f1d1d', marginBottom: '1rem' }}>
          O encerramento de conta realiza a inativação lógica do seu cadastro. Para ser elegível,
          você não pode possuir pedidos em andamento (Pendente ou Aprovado) nem contratos com vigência futura.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="btn-danger"
          style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
        >
          Encerrar Minha Conta
        </button>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Deseja encerrar sua conta?"
        message="Esta ação inativará o seu acesso ao sistema. Pedidos pendentes ou contratos futuros impedirão a exclusão. Tem certeza de que deseja continuar?"
        confirmLabel="Sim, encerrar conta"
        cancelLabel="Cancelar"
        variant="danger"
        loading={deleting}
        onConfirm={handleEncerrarConta}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
