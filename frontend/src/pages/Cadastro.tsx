import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Plus, Trash2, AlertCircle } from 'lucide-react';
import type { VinculoEmprego } from '../types';

export const Cadastro: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [endereco, setEndereco] = useState('');
  const [profissao, setProfissao] = useState('');
  const [empregos, setEmpregos] = useState<VinculoEmprego[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [camposErro, setCamposErro] = useState<Record<string, string>>({});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    setCamposErro({});

    const body = {
      usuario: usuario.trim(),
      senha,
      nome: nome.trim(),
      cpf: cpf.trim(),
      rg: rg.trim(),
      endereco: endereco.trim(),
      profissao: profissao.trim(),
      empregos: empregos.filter(emp => emp.empregador.trim() && emp.rendaMensal.trim()),
    };

    try {
      await api.post('/api/auth/cadastro', body);

      await login(usuario, senha);
      navigate('/inicio');
    } catch (err: any) {
      setErro(err.message || 'Falha ao realizar cadastro.');
      if (err.campos) {
        setCamposErro(err.campos);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container registration-page">
      <div className="registration-sheet">
        <header className="form-intro"><h1 className="page-title">Criar sua conta</h1><p className="page-subtitle">Seus dados para escolher um carro e acompanhar o aluguel.</p><p className="form-hint">Campos com * são obrigatórios.</p></header>

        {erro && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>{erro}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <section className="form-section"><div className="section-copy"><h2>Acesso</h2><p>Escolha como você vai entrar na sua conta.</p></div><div className="section-fields">
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="usuario">Nome de Usuário *</label>
              <input
                id="usuario"
                type="text"
                className={`form-input ${camposErro.usuario ? 'has-error' : ''}`}
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="ex: joaocarlos"
                required
                disabled={loading}
              />
              {camposErro.usuario && <span className="error-text">{camposErro.usuario}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="senha">Senha *</label>
              <input
                id="senha"
                aria-describedby="senha-ajuda"
                autoComplete="new-password"
                minLength={10}
                type="password"
                className={`form-input ${camposErro.senha ? 'has-error' : ''}`}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <span className="form-hint" id="senha-ajuda">Use pelo menos 10 caracteres.</span>
              {camposErro.senha && <span className="error-text">{camposErro.senha}</span>}
            </div>
          </div>

          </div></section>
          <section className="form-section"><div className="section-copy"><h2>Dados pessoais</h2><p>Essas informações serão usadas no seu pedido de aluguel.</p></div><div className="section-fields">
          <div className="form-group">
            <label className="form-label" htmlFor="nome">Nome Completo *</label>
            <input
              id="nome"
              type="text"
              className={`form-input ${camposErro.nome ? 'has-error' : ''}`}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="ex: João Carlos Silva"
              required
              disabled={loading}
            />
            {camposErro.nome && <span className="error-text">{camposErro.nome}</span>}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="cpf">CPF *</label>
              <input
                id="cpf"
                type="text"
                className={`form-input ${camposErro.cpf ? 'has-error' : ''}`}
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                required
                disabled={loading}
              />
              {camposErro.cpf && <span className="error-text">{camposErro.cpf}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rg">RG *</label>
              <input
                id="rg"
                type="text"
                className={`form-input ${camposErro.rg ? 'has-error' : ''}`}
                value={rg}
                onChange={(e) => setRg(e.target.value)}
                placeholder="ex: MG-12.345.678"
                required
                disabled={loading}
              />
              {camposErro.rg && <span className="error-text">{camposErro.rg}</span>}
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="profissao">Profissão *</label>
              <input
                id="profissao"
                type="text"
                className={`form-input ${camposErro.profissao ? 'has-error' : ''}`}
                value={profissao}
                onChange={(e) => setProfissao(e.target.value)}
                placeholder="ex: Engenheiro de Software"
                required
                disabled={loading}
              />
              {camposErro.profissao && <span className="error-text">{camposErro.profissao}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="endereco">Endereço Completo *</label>
              <input
                id="endereco"
                type="text"
                className={`form-input ${camposErro.endereco ? 'has-error' : ''}`}
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, número, bairro, cidade"
                required
                disabled={loading}
              />
              {camposErro.endereco && <span className="error-text">{camposErro.endereco}</span>}
            </div>
          </div>

          </div></section>
          <section className="form-section"><div className="section-copy"><h2>Renda</h2><p>Opcional. Você pode informar até três fontes de renda para a análise do pedido.</p></div><div className="section-fields">
            <div className="income-heading"><h3>Fontes de renda</h3>{empregos.length < 3 && <button type="button" onClick={handleAddEmprego} className="btn-secondary"><Plus size={16} /> Adicionar Renda</button>}</div>
            {empregos.length === 0 && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Você pode preencher a renda agora ou depois, no seu perfil.
              </p>
            )}

            {empregos.map((emp, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
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
                    aria-label={`Empregador ${idx + 1}`}
                    placeholder="Empresa / Empregador"
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    className="form-input"
                    value={emp.rendaMensal}
                    onChange={(e) => handleEmpregoChange(idx, 'rendaMensal', e.target.value)}
                    aria-label={`Renda mensal ${idx + 1}`}
                    placeholder="Renda (ex: 3500.00)"
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
            ))}
          </div>

          </section>
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Já possui conta?{' '}
          <Link to="/login" style={{ color: 'var(--text-main)', fontWeight: 600 }}>
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
};
