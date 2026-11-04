import React from 'react';
import { Clock, CheckCircle2, XCircle, Ban, FileCheck2 } from 'lucide-react';
import type { StatusPedido } from '../types';

interface Props {
  status: StatusPedido;
  className?: string;
}

export const StatusBadge: React.FC<Props> = ({ status, className = '' }) => {
  switch (status) {
    case 'PENDENTE':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 ${className}`}>
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Pendente</span>
        </span>
      );
    case 'APROVADO':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Aprovado</span>
        </span>
      );
    case 'REPROVADO':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 ${className}`}>
          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Reprovado</span>
        </span>
      );
    case 'CANCELADO':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 ${className}`}>
          <Ban className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Cancelado</span>
        </span>
      );
    case 'CONTRATADO':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 ${className}`}>
          <FileCheck2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Contratado</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 ${className}`}>
          {status}
        </span>
      );
  }
};
