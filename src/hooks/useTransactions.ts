import { useState, useEffect, useCallback } from 'react';
import { Transaction, MonthlyStats, Classification, Insight, Tag } from '@/types/finance';
import { format, parseISO, subMonths } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(true);

  // Fetch all transactions from database
  const fetchTransactions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('data_pagamento', { ascending: false });

      if (error) throw error;

      const mappedData: Transaction[] = (data || []).map(row => ({
        id: row.id,
        nome: row.nome,
        valor: Number(row.valor),
        valor_estimado: row.valor_estimado ? Number(row.valor_estimado) : undefined,
        data_pagamento: row.data_pagamento,
        status_pagamento: row.status_pagamento as 'pago' | 'nao_pago',
        tipo_fluxo: row.tipo_fluxo as 'entrada' | 'saida',
        classificacao: row.classificacao as Classification,
        tags: row.tags || [],
        mes_referencia: row.mes_referencia,
      }));

      setTransactions(mappedData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado');
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          nome: transaction.nome,
          valor: transaction.valor,
          valor_estimado: transaction.valor_estimado,
          data_pagamento: transaction.data_pagamento,
          status_pagamento: transaction.status_pagamento,
          tipo_fluxo: transaction.tipo_fluxo,
          classificacao: transaction.classificacao,
          tags: transaction.tags,
          mes_referencia: transaction.mes_referencia,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newTransaction: Transaction = {
        id: data.id,
        nome: data.nome,
        valor: Number(data.valor),
        valor_estimado: data.valor_estimado ? Number(data.valor_estimado) : undefined,
        data_pagamento: data.data_pagamento,
        status_pagamento: data.status_pagamento as 'pago' | 'nao_pago',
        tipo_fluxo: data.tipo_fluxo as 'entrada' | 'saida',
        classificacao: data.classificacao as Classification,
        tags: data.tags || [],
        mes_referencia: data.mes_referencia,
      };

      setTransactions(prev => [newTransaction, ...prev]);
      toast.success('Transação adicionada!');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Erro ao adicionar transação');
    }
  }, []);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          nome: updates.nome,
          valor: updates.valor,
          valor_estimado: updates.valor_estimado,
          data_pagamento: updates.data_pagamento,
          status_pagamento: updates.status_pagamento,
          tipo_fluxo: updates.tipo_fluxo,
          classificacao: updates.classificacao,
          tags: updates.tags,
          mes_referencia: updates.mes_referencia,
        })
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.map(t => 
        t.id === id ? { ...t, ...updates } : t
      ));
      toast.success('Transação atualizada!');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Erro ao atualizar transação');
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transação excluída!');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Erro ao excluir transação');
    }
  }, []);

  const duplicateTransaction = useCallback(async (id: string, newMonth: string) => {
    const original = transactions.find(t => t.id === id);
    if (original) {
      await addTransaction({
        ...original,
        mes_referencia: newMonth,
        status_pagamento: 'nao_pago',
      });
    }
  }, [transactions, addTransaction]);

  // Filter by data_pagamento (transaction date), not mes_referencia or created_at
  const getMonthlyTransactions = useCallback((month: string) => {
    return transactions.filter(t => {
      // Extract YYYY-MM from data_pagamento
      const transactionMonth = t.data_pagamento.substring(0, 7);
      return transactionMonth === month;
    });
  }, [transactions]);

  const getMonthlyStats = useCallback((month: string): MonthlyStats => {
    const monthTransactions = getMonthlyTransactions(month);
    
    const totalEntradas = monthTransactions
      .filter(t => t.tipo_fluxo === 'entrada')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const totalSaidas = monthTransactions
      .filter(t => t.tipo_fluxo === 'saida')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const gastosPorClassificacao = monthTransactions
      .filter(t => t.tipo_fluxo === 'saida')
      .reduce((acc, t) => {
        acc[t.classificacao] = (acc[t.classificacao] || 0) + t.valor;
        return acc;
      }, {} as Record<Classification, number>);
    
    const gastosPorTag = monthTransactions
      .filter(t => t.tipo_fluxo === 'saida')
      .reduce((acc, t) => {
        t.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + t.valor;
        });
        return acc;
      }, {} as Record<string, number>);

    return {
      totalEntradas,
      totalSaidas,
      saldo: totalEntradas - totalSaidas,
      gastosPorClassificacao,
      gastosPorTag,
    };
  }, [getMonthlyTransactions]);

  const generateInsights = useCallback((month: string): Insight[] => {
    const currentStats = getMonthlyStats(month);
    const previousMonth = format(subMonths(parseISO(`${month}-01`), 1), 'yyyy-MM');
    const previousStats = getMonthlyStats(previousMonth);
    
    const insights: Insight[] = [];

    // Insight: Saldo positivo ou negativo
    if (currentStats.saldo >= 0) {
      insights.push({
        id: '1',
        type: 'positive',
        message: `Seu saldo foi positivo neste mês: R$ ${currentStats.saldo.toFixed(2)}`,
      });
    } else {
      insights.push({
        id: '1',
        type: 'negative',
        message: `Seu saldo foi negativo neste mês: R$ ${currentStats.saldo.toFixed(2)}`,
      });
    }

    // Insight: Comparação de dívidas
    const dividasAtual = currentStats.gastosPorClassificacao['divida'] || 0;
    const dividasAnterior = previousStats.gastosPorClassificacao['divida'] || 0;
    
    if (dividasAnterior > 0 && dividasAtual > dividasAnterior) {
      const aumento = ((dividasAtual - dividasAnterior) / dividasAnterior * 100).toFixed(1);
      insights.push({
        id: '2',
        type: 'negative',
        message: `Seu gasto com dívidas aumentou ${aumento}% em relação ao mês anterior`,
      });
    } else if (dividasAnterior > 0 && dividasAtual < dividasAnterior) {
      const reducao = ((dividasAnterior - dividasAtual) / dividasAnterior * 100).toFixed(1);
      insights.push({
        id: '2',
        type: 'positive',
        message: `Seu gasto com dívidas reduziu ${reducao}% em relação ao mês anterior`,
      });
    }

    // Insight: Tag com maior gasto
    const tags = Object.entries(currentStats.gastosPorTag);
    if (tags.length > 0) {
      const [topTag, topValue] = tags.sort((a, b) => b[1] - a[1])[0];
      const percentual = currentStats.totalSaidas > 0 
        ? (topValue / currentStats.totalSaidas * 100).toFixed(1) 
        : '0';
      insights.push({
        id: '3',
        type: 'neutral',
        message: `A tag ${topTag} representa ${percentual}% das suas saídas totais`,
      });
    }

    // Insight: Taxa de poupança
    if (currentStats.totalEntradas > 0) {
      const taxaPoupanca = ((currentStats.totalEntradas - currentStats.totalSaidas) / currentStats.totalEntradas * 100);
      if (taxaPoupanca > 20) {
        insights.push({
          id: '4',
          type: 'positive',
          message: `Excelente! Você poupou ${taxaPoupanca.toFixed(1)}% da sua renda este mês`,
        });
      } else if (taxaPoupanca > 0) {
        insights.push({
          id: '4',
          type: 'neutral',
          message: `Você poupou ${taxaPoupanca.toFixed(1)}% da sua renda este mês`,
        });
      }
    }

    // Insight: Investimentos
    const investimentos = currentStats.gastosPorClassificacao['investimento'] || 0;
    if (investimentos > 0 && currentStats.totalEntradas > 0) {
      const percentualInvestido = (investimentos / currentStats.totalEntradas * 100).toFixed(1);
      insights.push({
        id: '5',
        type: 'positive',
        message: `Você investiu ${percentualInvestido}% da sua renda este mês`,
      });
    }

    return insights.slice(0, 5);
  }, [getMonthlyStats]);

  return {
    transactions,
    selectedMonth,
    setSelectedMonth,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    duplicateTransaction,
    getMonthlyTransactions,
    getMonthlyStats,
    generateInsights,
    loading,
  };
}
