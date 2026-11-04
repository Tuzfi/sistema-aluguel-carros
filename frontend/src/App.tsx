import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { Inicio } from './pages/Inicio';
import { Perfil } from './pages/Perfil';
import { Veiculos } from './pages/Veiculos';
import { Frota } from './pages/Frota';
import { Pedidos } from './pages/Pedidos';
import { NovoPedido } from './pages/NovoPedido';
import { DetalhePedido } from './pages/DetalhePedido';
import { DetalheContrato } from './pages/DetalheContrato';

const RotaProtegida: React.FC<{ children: React.ReactNode; papéisPermitidos?: string[] }> = ({
  children,
  papéisPermitidos,
}) => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="skeleton" style={{ height: '200px', maxWidth: '600px', margin: '0 auto' }} />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (papéisPermitidos && !papéisPermitidos.includes(usuario.papel)) {
    return <Navigate to="/inicio" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Rotas Autenticadas Comuns */}
          <Route
            path="/"
            element={
              <RotaProtegida>
                <Navigate to="/inicio" replace />
              </RotaProtegida>
            }
          />
          <Route
            path="/inicio"
            element={
              <RotaProtegida>
                <Inicio />
              </RotaProtegida>
            }
          />
          <Route
            path="/veiculos"
            element={
              <RotaProtegida>
                <Veiculos />
              </RotaProtegida>
            }
          />
          <Route
            path="/pedidos"
            element={
              <RotaProtegida>
                <Pedidos />
              </RotaProtegida>
            }
          />
          <Route
            path="/pedidos/novo"
            element={
              <RotaProtegida papéisPermitidos={['CLIENTE']}>
                <NovoPedido />
              </RotaProtegida>
            }
          />
          <Route
            path="/pedidos/:id"
            element={
              <RotaProtegida>
                <DetalhePedido />
              </RotaProtegida>
            }
          />
          <Route
            path="/contratos/:id"
            element={
              <RotaProtegida>
                <DetalheContrato />
              </RotaProtegida>
            }
          />

          {/* Rotas por Papel Específico */}
          <Route
            path="/perfil"
            element={
              <RotaProtegida papéisPermitidos={['CLIENTE']}>
                <Perfil />
              </RotaProtegida>
            }
          />
          <Route
            path="/frota"
            element={
              <RotaProtegida papéisPermitidos={['EMPRESA', 'BANCO']}>
                <Frota />
              </RotaProtegida>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <div>ViaCar &copy; 2026 - Sistema de Aluguel de Carros | Laboratório 02 DIAW</div>
      </footer>
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
