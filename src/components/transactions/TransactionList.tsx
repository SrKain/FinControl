import { Transaction } from '@/types/finance';
import { TransactionCard } from './TransactionCard';
import { FileText } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string, newMonth: string) => void;
}

export function TransactionList({
  transactions,
  onUpdate,
  onDelete,
  onDuplicate,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Nenhuma transação</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Adicione sua primeira transação para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
}
