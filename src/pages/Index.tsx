import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { MonthSelector } from '@/components/MonthSelector';
import { StatsCards } from '@/components/StatsCards';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { useTransactions } from '@/hooks/useTransactions';
import { Classification, Tag } from '@/types/finance';

const Index = () => {
  const {
    selectedMonth,
    setSelectedMonth,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    duplicateTransaction,
    getMonthlyTransactions,
    getMonthlyStats,
  } = useTransactions();

  const [selectedClassification, setSelectedClassification] = useState<Classification | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<Tag | 'all'>('all');

  const monthlyTransactions = getMonthlyTransactions(selectedMonth);
  const monthlyStats = getMonthlyStats(selectedMonth);

  const filteredTransactions = useMemo(() => {
    return monthlyTransactions.filter(t => {
      if (selectedClassification !== 'all' && t.classificacao !== selectedClassification) {
        return false;
      }
      if (selectedTag !== 'all' && !t.tags.includes(selectedTag)) {
        return false;
      }
      return true;
    });
  }, [monthlyTransactions, selectedClassification, selectedTag]);

  return (
    <Layout>
      <div className="space-y-6 pb-safe">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Transações</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Gerencie suas entradas e saídas</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <MonthSelector
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
            <TransactionForm
              selectedMonth={selectedMonth}
              onSubmit={addTransaction}
            />
          </div>
        </div>

        <StatsCards stats={monthlyStats} />

        <TransactionFilters
          selectedClassification={selectedClassification}
          selectedTag={selectedTag}
          onClassificationChange={setSelectedClassification}
          onTagChange={setSelectedTag}
        />

        <TransactionList
          transactions={filteredTransactions}
          onUpdate={updateTransaction}
          onDelete={deleteTransaction}
          onDuplicate={duplicateTransaction}
        />
      </div>
    </Layout>
  );
};

export default Index;
