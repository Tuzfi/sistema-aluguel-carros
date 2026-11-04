import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  FileText,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Layers,
  Menu,
  X,
  Building2,
  Landmark,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/inicio' && location.pathname === '/') return true;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const getRoleBadge = (papel: string) => {
    switch (papel) {
      case 'CLIENTE':
        return (
          <span className="role-tag role-cliente">
            <User className="w-3 h-3" /> Cliente
          </span>
        );
      case 'EMPRESA':
        return (
          <span className="role-tag role-empresa">
            <Building2 className="w-3 h-3" /> Empresa
          </span>
        );
      case 'BANCO':
        return (
          <span className="role-tag role-banco">
            <Landmark className="w-3 h-3" /> Banco
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <Link to={usuario ? '/inicio' : '/login'} className="brand-link">
            <img src="/logo.svg" alt="ViaCar" className="brand-logo" />
            <span className="brand-text">ViaCar</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="desktop-nav" aria-label="Navegação principal">
          {usuario ? (
            <>
              <Link
                to="/inicio"
                className={`nav-link ${isActive('/inicio') ? 'active' : ''}`}
              >
                Início
              </Link>
              <Link
                to="/veiculos"
                className={`nav-link ${isActive('/veiculos') ? 'active' : ''}`}
              >
                <Car className="w-4 h-4" /> Catálogo
              </Link>
              <Link
                to="/pedidos"
                className={`nav-link ${isActive('/pedidos') ? 'active' : ''}`}
              >
                <FileText className="w-4 h-4" />
                {usuario.papel === 'CLIENTE' ? 'Meus Pedidos' : 'Fila de Pedidos'}
              </Link>
              {usuario.papel !== 'CLIENTE' && (
                <Link
                  to="/frota"
                  className={`nav-link ${isActive('/frota') ? 'active' : ''}`}
                >
                  <Layers className="w-4 h-4" /> Frota
                </Link>
              )}
              {usuario.papel === 'CLIENTE' && (
                <Link
                  to="/perfil"
                  className={`nav-link ${isActive('/perfil') ? 'active' : ''}`}
                >
                  <User className="w-4 h-4" /> Perfil
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
              >
                <LogIn className="w-4 h-4" /> Entrar
              </Link>
              <Link
                to="/cadastro"
                className={`nav-link ${isActive('/cadastro') ? 'active' : ''}`}
              >
                <UserPlus className="w-4 h-4" /> Cadastrar
              </Link>
            </>
          )}
        </nav>

        {/* User badge & Actions */}
        <div className="navbar-actions">
          {usuario ? (
            <div className="user-profile-widget">
              <div className="user-info">
                <span className="user-name">{usuario.usuario}</span>
                {getRoleBadge(usuario.papel)}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-logout"
                title="Sair do sistema"
                aria-label="Sair da conta"
              >
                <LogOut className="w-4 h-4" />
                <span className="logout-text">Sair</span>
              </button>
            </div>
          ) : (
            <div className="guest-actions">
              <Link to="/cadastro" className="btn-primary-sm">
                Criar Conta
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Alternar menu de navegação"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav">
          {usuario ? (
            <div className="mobile-nav-links">
              <div className="mobile-user-header">
                <div className="user-name">{usuario.usuario}</div>
                {getRoleBadge(usuario.papel)}
              </div>
              <Link
                to="/inicio"
                onClick={() => setMobileMenuOpen(false)}
                className={`mobile-link ${isActive('/inicio') ? 'active' : ''}`}
              >
                Início
              </Link>
              <Link
                to="/veiculos"
                onClick={() => setMobileMenuOpen(false)}
                className={`mobile-link ${isActive('/veiculos') ? 'active' : ''}`}
              >
                <Car className="w-4 h-4" /> Catálogo
              </Link>
              <Link
                to="/pedidos"
                onClick={() => setMobileMenuOpen(false)}
                className={`mobile-link ${isActive('/pedidos') ? 'active' : ''}`}
              >
                <FileText className="w-4 h-4" />
                {usuario.papel === 'CLIENTE' ? 'Meus Pedidos' : 'Fila de Pedidos'}
              </Link>
              {usuario.papel !== 'CLIENTE' && (
                <Link
                  to="/frota"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`mobile-link ${isActive('/frota') ? 'active' : ''}`}
                >
                  <Layers className="w-4 h-4" /> Frota
                </Link>
              )}
              {usuario.papel === 'CLIENTE' && (
                <Link
                  to="/perfil"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`mobile-link ${isActive('/perfil') ? 'active' : ''}`}
                >
                  <User className="w-4 h-4" /> Perfil
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="mobile-logout-btn"
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          ) : (
            <div className="mobile-nav-links">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-link"
              >
                <LogIn className="w-4 h-4" /> Entrar
              </Link>
              <Link
                to="/cadastro"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-link"
              >
                <UserPlus className="w-4 h-4" /> Cadastre-se
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
