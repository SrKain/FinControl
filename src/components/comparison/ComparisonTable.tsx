import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Transaction, MonthlyStats } from '@/types/finance';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ComparisonTableProps {
  transactions: Transaction[];
  stats: MonthlyStats;
}

export function ComparisonTable({ transactions, stats }: ComparisonTableProps) {
  const comparisonData = useMemo(() => {
    const saidas = transactions.filter(t => t.tipo_fluxo === 'saida');
    
    return saidas.map(t => {
      const estimado = t.valor_estimado || t.valor;
      const real = t.valor;
      const diferenca = real - estimado;
      const percentualEntradas = stats.totalEntradas > 0 
        ? (real / stats.totalEntradas * 100) 
        : 0;
      const percentualSaidas = stats.totalSaidas > 0 
        ? (real / stats.totalSaidas * 100) 
        : 0;

      return {
        id: t.id,
        nome: t.nome,
        classificacao: t.classificacao,
        tags: t.tags,
        estimado,
        real,
        diferenca,
        percentualEntradas,
        percentualSaidas,
      };
    });
  }, [transactions, stats]);

  const totals = useMemo(() => {
    return comparisonData.reduce(
      (acc, item) => ({
        estimado: acc.estimado + item.estimado,
        real: acc.real + item.real,
        diferenca: acc.diferenca + item.diferenca,
      }),
      { estimado: 0, real: 0, diferenca: 0 }
    );
  }, [comparisonData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getDifferenceIcon = (diferenca: number) => {
    if (diferenca > 0) return <TrendingUp className="h-4 w-4 text-expense" />;
    if (diferenca < 0) return <TrendingDown className="h-4 w-4 text-income" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  if (comparisonData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparativo Estimado vs Real</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Nenhuma saída registrada neste mês</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Comparativo Estimado vs Real</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Classificação</TableHead>
                <TableHead className="text-right">Estimado</TableHead>
                <TableHead className="text-right">Real</TableHead>
                <TableHead className="text-right">Diferença</TableHead>
                <TableHead className="text-right">% Entradas</TableHead>
                <TableHead className="text-right">% Saídas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell className="capitalize">{item.classificacao}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(item.estimado)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.real)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {getDifferenceIcon(item.diferenca)}
                      <span className={cn(
                        item.diferenca > 0 ? 'text-expense' : 
                        item.diferenca < 0 ? 'text-income' : 'text-muted-foreground'
                      )}>
                        {formatCurrency(Math.abs(item.diferenca))}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatPercent(item.percentualEntradas)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatPercent(item.percentualSaidas)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.estimado)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.real)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {getDifferenceIcon(totals.diferenca)}
                    <span className={cn(
                      totals.diferenca > 0 ? 'text-expense' : 
                      totals.diferenca < 0 ? 'text-income' : 'text-muted-foreground'
                    )}>
                      {formatCurrency(Math.abs(totals.diferenca))}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">100%</TableCell>
                <TableCell className="text-right">100%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
