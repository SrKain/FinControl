import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, Classification } from '@/types/finance';

interface ComparisonByCategoryProps {
  transactions: Transaction[];
}

const LABELS: Record<Classification, string> = {
  gasto: 'Gastos',
  divida: 'Dívidas',
  despesa: 'Despesas',
  investimento: 'Investimentos',
};

export function ComparisonByCategory({ transactions }: ComparisonByCategoryProps) {
  const chartData = useMemo(() => {
    const saidas = transactions.filter(t => t.tipo_fluxo === 'saida');
    
    const byCategory = saidas.reduce((acc, t) => {
      if (!acc[t.classificacao]) {
        acc[t.classificacao] = { estimado: 0, real: 0 };
      }
      acc[t.classificacao].estimado += t.valor_estimado || t.valor;
      acc[t.classificacao].real += t.valor;
      return acc;
    }, {} as Record<Classification, { estimado: number; real: number }>);

    return Object.entries(byCategory).map(([key, value]) => ({
      categoria: LABELS[key as Classification],
      estimado: value.estimado,
      real: value.real,
    }));
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparativo por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Sem dados para exibir</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Comparativo por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoria" />
            <YAxis 
              tickFormatter={formatCurrency}
              width={100}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), '']}
              labelFormatter={(label) => `Categoria: ${label}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            <Legend />
            <Bar dataKey="estimado" name="Estimado" fill="hsl(210, 15%, 70%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="real" name="Real" fill="hsl(162, 63%, 41%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
