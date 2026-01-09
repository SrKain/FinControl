import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MonthlyStats } from '@/types/finance';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  stats: MonthlyStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const cards = [
    {
      title: 'Entradas',
      value: stats.totalEntradas,
      icon: TrendingUp,
      className: 'text-income',
      bgClassName: 'bg-income/10',
    },
    {
      title: 'Saídas',
      value: stats.totalSaidas,
      icon: TrendingDown,
      className: 'text-expense',
      bgClassName: 'bg-expense/10',
    },
    {
      title: 'Saldo',
      value: stats.saldo,
      icon: Wallet,
      className: stats.saldo >= 0 ? 'text-income' : 'text-expense',
      bgClassName: stats.saldo >= 0 ? 'bg-income/10' : 'bg-expense/10',
    },
    {
      title: 'Investimentos',
      value: stats.gastosPorClassificacao['investimento'] || 0,
      icon: PiggyBank,
      className: 'text-primary',
      bgClassName: 'bg-primary/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className={cn('text-2xl font-bold', card.className)}>
                  {formatCurrency(card.value)}
                </p>
              </div>
              <div className={cn('rounded-full p-3', card.bgClassName)}>
                <card.icon className={cn('h-5 w-5', card.className)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
