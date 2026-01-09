import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/finance';
import { format, parseISO, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo } from 'react';

interface MonthlyTrendChartProps {
  transactions: Transaction[];
  currentMonth: string;
}

export function MonthlyTrendChart({ transactions, currentMonth }: MonthlyTrendChartProps) {
  const chartData = useMemo(() => {
    const months: string[] = [];
    const currentDate = parseISO(`${currentMonth}-01`);
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(currentDate, i);
      months.push(format(monthDate, 'yyyy-MM'));
    }

    return months.map((month) => {
      const monthTransactions = transactions.filter(t => t.mes_referencia === month);
      const entradas = monthTransactions
        .filter(t => t.tipo_fluxo === 'entrada')
        .reduce((sum, t) => sum + t.valor, 0);
      const saidas = monthTransactions
        .filter(t => t.tipo_fluxo === 'saida')
        .reduce((sum, t) => sum + t.valor, 0);

      return {
        month: format(parseISO(`${month}-01`), 'MMM', { locale: ptBR }),
        entradas,
        saidas,
        saldo: entradas - saidas,
      };
    });
  }, [transactions, currentMonth]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Evolução Mensal (últimos 6 meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="entradas"
              stroke="hsl(142, 70%, 45%)"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Entradas"
            />
            <Line
              type="monotone"
              dataKey="saidas"
              stroke="hsl(0, 72%, 51%)"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Saídas"
            />
            <Line
              type="monotone"
              dataKey="saldo"
              stroke="hsl(199, 89%, 48%)"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Saldo"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
