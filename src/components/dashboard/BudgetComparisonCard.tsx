import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Category } from '@/hooks/useCategories';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryBudgetData {
  category: Category;
  actualAmount: number;
  actualPercentage: number;
  deviation: number; // positive = over budget
}

interface BudgetComparisonCardProps {
  data: CategoryBudgetData[];
  totalExpenses: number;
}

export function BudgetComparisonCard({ data, totalExpenses }: BudgetComparisonCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const sortedData = [...data].sort((a, b) => b.deviation - a.deviation);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparativo de Metas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Crie categorias com metas para ver o comparativo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Comparativo de Metas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedData.map(({ category, actualAmount, actualPercentage, deviation }) => {
          const isOverBudget = deviation > 0;
          const isUnderBudget = deviation < -5; // Significant savings
          const isOnTrack = Math.abs(deviation) <= 5;

          return (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-sm">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isOverBudget && (
                    <Badge variant="destructive" className="gap-1 text-xs">
                      <TrendingUp className="h-3 w-3" />
                      +{deviation.toFixed(1)}%
                    </Badge>
                  )}
                  {isUnderBudget && (
                    <Badge variant="secondary" className="gap-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      <TrendingDown className="h-3 w-3" />
                      {deviation.toFixed(1)}%
                    </Badge>
                  )}
                  {isOnTrack && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Minus className="h-3 w-3" />
                      No alvo
                    </Badge>
                  )}
                </div>
              </div>

              <div className="relative">
                <Progress
                  value={Math.min(actualPercentage, 100)}
                  className={cn(
                    'h-2',
                    isOverBudget && '[&>div]:bg-destructive'
                  )}
                />
                {/* Target marker */}
                {category.target_percentage > 0 && category.target_percentage <= 100 && (
                  <div
                    className="absolute top-0 h-full w-0.5 bg-foreground/50"
                    style={{ left: `${category.target_percentage}%` }}
                  />
                )}
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Real: {actualPercentage.toFixed(1)}% ({formatCurrency(actualAmount)})
                </span>
                <span>
                  Meta: {category.target_percentage}%
                </span>
              </div>

              {isOverBudget && deviation > 10 && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Gasto significativamente acima do ideal</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total de Saídas</span>
            <span className="font-medium">{formatCurrency(totalExpenses)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
