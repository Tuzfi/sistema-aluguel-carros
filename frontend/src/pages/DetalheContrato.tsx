import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { consultarContrato } from '../api/pedidos';
import { ArrowLeft, Printer, Landmark, ShieldCheck } from 'lucide-react';
import type { Contrato } from '../types';

export const DetalheContrato: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const carregar = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await consultarContrato(id);
        setContrato(data);
        setErro(null);
      } catch (err: any) {
        setErro(err.message || 'Erro ao carregar contrato.');
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container" style={{ maxWidth: '800px' }}>
        <div className="skeleton" style={{ height: '400px' }} />
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="page-container" style={{ maxWidth: '800px' }}>
        <div className="alert alert-danger">
          <div>{erro || 'Contrato não encontrado.'}</div>
        </div>
        <Link to="/pedidos" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Voltar aos Pedidos
        </Link>
      </div>
    );
  }

  const mudouPropriedade = contrato.tipoContrato === 'TRANSFERENCIA_AO_CLIENTE';

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <Link to={`/pedidos/${contrato.pedidoId}`} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Pedido
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="btn-secondary"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
        >
          <Printer className="w-3.5 h-3.5" /> Imprimir Documento
        </button>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid var(--text-main)', paddingBottom: '1.5rem', marginBottom: '1.75rem' }}>
          <img src="/logo.svg" alt="ViaCar" style={{ height: '48px', margin: '0 auto 0.75rem auto' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, textTransform: 'none', letterSpacing: '0.05em' }}>
            Contrato de Locação de Automóvel
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Instrumento Particular de Locação e Compromissos Veiculares | ViaCar
          </p>
          <div style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Identificador do Instrumento: {contrato.id}
          </div>
        </div>

        <div style={{ backgroundColor: '#f3f5f3', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div style={{ fontSize: '0.875rem', color: '#1e3a8a' }}>
            Contrato emitido e registrado no sistema em <strong>{new Date(contrato.emitidoEm).toLocaleString('pt-BR')}</strong>. Os dados abaixo correspondem ao momento da contratação.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
              1. Partes Envolvidas
            </h3>
            <div className="grid-2" style={{ fontSize: '0.875rem', rowGap: '0.5rem' }}>
              <div><strong>Locatário (Cliente):</strong> {contrato.clienteNome || contrato.clienteId}</div>
              <div><strong>Emitente / Agente:</strong> {contrato.emitidoPorId}</div>
              <div><strong>Proprietário de Origem:</strong> {contrato.proprietarioAnteriorId}</div>
              <div>
                <strong>Proprietário Final:</strong>{' '}
                <span style={{ fontWeight: 700, color: mudouPropriedade ? '#246144' : 'inherit' }}>
                  {contrato.proprietarioFinalId} {mudouPropriedade && '(Transferido ao Cliente)'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
              2. Objeto da Locação
            </h3>
            <div className="grid-2" style={{ fontSize: '0.875rem', rowGap: '0.5rem' }}>
              <div><strong>Veículo:</strong> {contrato.veiculoMarca} {contrato.veiculoModelo}</div>
              <div><strong>Placa:</strong> {contrato.veiculoPlaca}</div>
              <div><strong>Modalidade:</strong> {mudouPropriedade ? 'Locação com Transferência de Titularidade' : 'Locação Simples'}</div>
              <div><strong>Período:</strong> {contrato.inicio} a {contrato.fim}</div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
              3. Valores e Pagamento
            </h3>
            <div style={{ fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f7f5', padding: '1rem', borderRadius: '0.5rem' }}>
              <div>
                <div>Valor Total do Instrumento</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Base contratada pelo período integral</div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#246144' }}>
                R$ {contrato.valorTotal}
              </div>
            </div>
          </div>

          {contrato.ofertaCreditoId && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                4. Financiamento Concedido por Banco Agente
              </h3>
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '1rem', fontSize: '0.875rem', color: '#166534' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Landmark className="w-5 h-5" />
                  <strong>Crédito associado ao aluguel</strong>
                </div>
                <div className="grid-3">
                  <div>Principal: <strong>R$ {contrato.creditoPrincipal}</strong></div>
                  <div>Taxa Mensal: <strong>{contrato.creditoTaxaMensal}% a.m.</strong></div>
                  <div>Parcelamento: <strong>{contrato.creditoParcelas} parcelas</strong></div>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem', borderTop: '1px dashed #cbd5e1', paddingTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Este registro reúne as condições do aluguel. Não substitui a assinatura das partes.
          </div>
        </div>
      </div>
    </div>
  );
};
