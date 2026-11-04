import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Car, FileText, User, LogOut, Menu, X, LayoutDashboard, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { usuario, logout } = useAuth();
  const [aberto, setAberto] = useState(false);
  const navigate = useNavigate();
  const sair = async () => { await logout(); setAberto(false); navigate('/login'); };
  const papel = usuario?.papel === 'CLIENTE' ? 'Cliente' : usuario?.papel === 'BANCO' ? 'Banco' : 'Empresa';
  const links = usuario ? [
    { to: '/inicio', label: 'Visão geral', icon: LayoutDashboard },
    { to: '/veiculos', label: 'Veículos', icon: Car },
    { to: '/pedidos', label: usuario.papel === 'CLIENTE' ? 'Meus pedidos' : 'Pedidos', icon: FileText },
    usuario.papel === 'CLIENTE' ? { to: '/perfil', label: 'Meu perfil', icon: User } : { to: '/frota', label: 'Minha frota', icon: KeyRound },
  ] : [];
  const marca = <Link to={usuario ? '/inicio' : '/login'} className="brand-link" aria-label="ViaCar, início"><img src="/logo.svg" alt="ViaCar" className="brand-logo" /></Link>;
  if (!usuario) return <header className="guest-header">{marca}<nav aria-label="Acesso"><NavLink to="/login">Entrar</NavLink><NavLink to="/cadastro">Criar conta</NavLink></nav></header>;
  return <>
    <header className="workspace-bar"><span>Aluguel de carros</span><span>{usuario.usuario} · {papel}</span><button type="button" className="mobile-toggle" aria-label="Alternar menu de navegação" aria-expanded={aberto} aria-controls="workspace-nav" onClick={() => setAberto(!aberto)}>{aberto ? <X /> : <Menu />}</button></header>
    <aside className={`workspace-nav ${aberto ? 'is-open' : ''}`} id="workspace-nav">
      {marca}<p className="nav-caption">Sua conta</p>
      <nav aria-label="Navegação principal">{links.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} onClick={() => setAberto(false)} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} strokeWidth={1.6} />{label}</NavLink>)}</nav>
      <div className="nav-account"><div><strong>{usuario.usuario}</strong><span>{papel}</span></div><button type="button" className="btn-logout" aria-label="Sair da conta" onClick={sair}><LogOut size={16} /> Sair</button></div>
    </aside>
  </>;
};
