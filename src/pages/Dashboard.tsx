import { useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { MonthSelector } from '@/components/MonthSelector';
import { StatsCards } from '@/components/StatsCards';
import { InsightsPanel } from '@/components/insights/InsightsPanel';
import { ExpenseByClassificationChart } from '@/components/charts/ExpenseByClassificationChart';
import { ExpenseByTagChart } from '@/components/charts/ExpenseByTagChart';
import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart';
import { BudgetComparisonCard } from '@/components/dashboard/BudgetComparisonCard';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';

const Dashboard = () => {
  const {
    transactions,
    selectedMonth,
    setSelectedMonth,
    getMonthlyStats,
    generateInsights,
  } = useTransactions();

  const { categories } = useCategories();

  const monthlyStats = getMonthlyStats(selectedMonth);
  const insights = generateInsights(selectedMonth);

  // Calculate budget comparison data for categories
  const budgetComparisonData = useMemo(() => {
    const totalExpenses = monthlyStats.totalSaidas;

    return categories.map((category) => {
      const actualAmount = monthlyStats.gastosPorTag[category.name] || 0;
      const actualPercentage = totalExpenses > 0 
        ? (actualAmount / totalExpenses) * 100 
        : 0;
      const deviation = actualPercentage - category.target_percentage;

      return {
        category,
        actualAmount,
        actualPercentage,
        deviation,
      };
    }).filter(d => d.category.target_percentage > 0 || d.actualAmount > 0);
  }, [categories, monthlyStats]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Visualize seus dados e insights financeiros</p>
          </div>
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>

        <StatsCards stats={monthlyStats} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MonthlyTrendChart transactions={transactions} currentMonth={selectedMonth} />
          </div>
          <div>
            <InsightsPanel insights={insights} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BudgetComparisonCard 
              data={budgetComparisonData} 
              totalExpenses={monthlyStats.totalSaidas}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <ExpenseByClassificationChart data={monthlyStats.gastosPorClassificacao} />
          <ExpenseByTagChart data={monthlyStats.gastosPorTag} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
