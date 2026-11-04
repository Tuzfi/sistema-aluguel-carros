import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario || !senha) {
      setErro('Preencha o nome de usuário e a senha.');
      return;
    }
    setLoading(true);
    setErro(null);

    try {
      await login(usuario, senha);
      navigate('/inicio');
    } catch (err: any) {
      setErro(err.message || 'Falha ao entrar. Confira seu usuário e sua senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container login-page">
      <div className="login-sheet">
        <header className="form-intro"><h1 className="page-title">Entrar na sua conta</h1><p className="page-subtitle">Acompanhe seus pedidos e os próximos aluguéis.</p></header>

        {erro && (
          <div className="alert alert-danger" role="alert">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>{erro}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="usuario">Usuário</label>
            <input
              id="usuario"
              type="text"
              className="form-input"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="ex: joaosilva"
              autoComplete="username"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              className="form-input"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Não tem uma conta de cliente?{' '}
          <Link to="/cadastro" style={{ color: 'var(--text-main)', fontWeight: 600 }}>
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
};
