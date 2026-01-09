export type PaymentStatus = 'pago' | 'nao_pago';
export type FlowType = 'entrada' | 'saida';
export type Classification = 'gasto' | 'divida' | 'despesa' | 'investimento';

export const AVAILABLE_TAGS = ['C6', 'Rico', 'XP', 'PicPay', 'Nubank', 'Inter', 'Itaú', 'Bradesco', 'Santander', 'Caixa'] as const;
export type Tag = string;

export interface Transaction {
  id: string;
  nome: string;
  valor: number;
  data_pagamento: string;
  status_pagamento: PaymentStatus;
  tipo_fluxo: FlowType;
  classificacao: Classification;
  tags: Tag[];
  mes_referencia: string; // format: "YYYY-MM"
  valor_estimado?: number;
}

export interface MonthlyStats {
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  gastosPorClassificacao: Record<Classification, number>;
  gastosPorTag: Record<string, number>;
}

export interface ComparisonData {
  categoria: string;
  estimado: number;
  real: number;
  diferenca: number;
  percentualEntradas: number;
  percentualSaidas: number;
}

export interface Insight {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  message: string;
}
