import { Lightbulb, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Insight } from '@/types/finance';
import { cn } from '@/lib/utils';

interface InsightsPanelProps {
  insights: Insight[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return TrendingUp;
      case 'negative':
        return TrendingDown;
      default:
        return Info;
    }
  };

  const getStyles = (type: Insight['type']) => {
    switch (type) {
      case 'positive':
        return {
          bg: 'bg-income/10',
          text: 'text-income',
          border: 'border-income/20',
        };
      case 'negative':
        return {
          bg: 'bg-expense/10',
          text: 'text-expense',
          border: 'border-expense/20',
        };
      default:
        return {
          bg: 'bg-primary/10',
          text: 'text-primary',
          border: 'border-primary/20',
        };
    }
  };

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-warning" />
          Insights Financeiros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => {
          const Icon = getIcon(insight.type);
          const styles = getStyles(insight.type);

          return (
            <div
              key={insight.id}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3 transition-colors',
                styles.border,
                styles.bg
              )}
            >
              <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', styles.text)} />
              <p className="text-sm">{insight.message}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
