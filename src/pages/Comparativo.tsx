import { Layout } from '@/components/layout/Layout';
import { MonthSelector } from '@/components/MonthSelector';
import { StatsCards } from '@/components/StatsCards';
import { ComparisonTable } from '@/components/comparison/ComparisonTable';
import { ComparisonByCategory } from '@/components/comparison/ComparisonByCategory';
import { useTransactions } from '@/hooks/useTransactions';

const Comparativo = () => {
  const {
    selectedMonth,
    setSelectedMonth,
    getMonthlyTransactions,
    getMonthlyStats,
  } = useTransactions();

  const monthlyTransactions = getMonthlyTransactions(selectedMonth);
  const monthlyStats = getMonthlyStats(selectedMonth);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Comparativo</h1>
            <p className="text-muted-foreground">Analise seus gastos estimados vs realizados</p>
          </div>
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>

        <StatsCards stats={monthlyStats} />

        <div className="grid lg:grid-cols-2 gap-6">
          <ComparisonByCategory transactions={monthlyTransactions} />
          <div className="lg:col-span-1" />
        </div>

        <ComparisonTable transactions={monthlyTransactions} stats={monthlyStats} />
      </div>
    </Layout>
  );
};

export default Comparativo;
