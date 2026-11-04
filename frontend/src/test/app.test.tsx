import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';
import { Login } from '../pages/Login';
import { Cadastro } from '../pages/Cadastro';
import { AuthProvider } from '../context/AuthContext';

describe('Frontend Component Tests', () => {
  describe('StatusBadge', () => {
    it('renderiza corretamente cada um dos status do pedido', () => {
      const { rerender } = render(<StatusBadge status="PENDENTE" />);
      expect(screen.getByText('Pendente')).toBeInTheDocument();

      rerender(<StatusBadge status="APROVADO" />);
      expect(screen.getByText('Aprovado')).toBeInTheDocument();

      rerender(<StatusBadge status="REPROVADO" />);
      expect(screen.getByText('Reprovado')).toBeInTheDocument();

      rerender(<StatusBadge status="CANCELADO" />);
      expect(screen.getByText('Cancelado')).toBeInTheDocument();

      rerender(<StatusBadge status="CONTRATADO" />);
      expect(screen.getByText('Contratado')).toBeInTheDocument();
    });
  });

  describe('ConfirmModal', () => {
    it('exibe título, mensagem e dispara callbacks de confirmação e cancelamento', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ConfirmModal
          isOpen={true}
          title="Confirmar Exclusão"
          message="Esta ação é definitiva e irreversível."
          confirmLabel="Sim, excluir"
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
      expect(screen.getByText('Esta ação é definitiva e irreversível.')).toBeInTheDocument();

      const btnCancelar = screen.getByText('Cancelar');
      fireEvent.click(btnCancelar);
      expect(onCancel).toHaveBeenCalledTimes(1);

      const btnConfirmar = screen.getByText('Sim, excluir');
      fireEvent.click(btnConfirmar);
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('não renderiza nada quando isOpen for falso', () => {
      const { container } = render(
        <ConfirmModal
          isOpen={false}
          title="Modal Fechado"
          message="Mensagem"
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Login Form', () => {
    it('renderiza os campos de usuário e senha e botão de login', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/(Nome de )?Usuário/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Entrar no Sistema/i })).toBeInTheDocument();
    });
  });

  describe('Cadastro Form', () => {
    it('permite adicionar até 3 vínculos de emprego e remove quando solicitado', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <Cadastro />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByText(/(Criar sua conta|Cadastro de Cliente)/i)).toBeInTheDocument();
      expect(screen.getByText(/(Você pode preencher a renda|Nenhum vínculo informado no momento)/i)).toBeInTheDocument();

      const btnAdd = screen.getByRole('button', { name: /Adicionar Renda/i });

      // Adiciona 1º
      fireEvent.click(btnAdd);
      expect(screen.getAllByPlaceholderText(/Empresa \/ Empregador/i)).toHaveLength(1);

      // Adiciona 2º
      fireEvent.click(btnAdd);
      expect(screen.getAllByPlaceholderText(/Empresa \/ Empregador/i)).toHaveLength(2);

      // Adiciona 3º (máximo)
      fireEvent.click(btnAdd);
      expect(screen.getAllByPlaceholderText(/Empresa \/ Empregador/i)).toHaveLength(3);

      // Botão de adicionar deve sumir após atingir 3
      expect(screen.queryByRole('button', { name: /Adicionar Renda/i })).toBeNull();

      // Remove um
      const btnRemover = screen.getAllByLabelText(/Remover fonte de renda/i)[0];
      fireEvent.click(btnRemover);
      expect(screen.getAllByPlaceholderText(/Empresa \/ Empregador/i)).toHaveLength(2);

      // Botão de adicionar reaparece
      expect(screen.getByRole('button', { name: /Adicionar Renda/i })).toBeInTheDocument();
    });
  });
});
