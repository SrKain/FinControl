import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Copy, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  ArrowUpCircle, 
  ArrowDownCircle,
  CircleDollarSign,
  CreditCard,
  Receipt,
  TrendingUp,
  CheckCircle2,
  Clock,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Transaction, PaymentStatus, FlowType, Classification } from '@/types/finance';
import { cn } from '@/lib/utils';
import { MonthSelector } from '../MonthSelector';

interface TransactionCardProps {
  transaction: Transaction;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string, newMonth: string) => void;
}

const classificationConfig: Record<Classification, { icon: typeof CircleDollarSign; className: string; label: string }> = {
  gasto: { icon: CircleDollarSign, className: 'text-orange-500 dark:text-orange-400', label: 'Gasto' },
  divida: { icon: CreditCard, className: 'text-red-500 dark:text-red-400', label: 'Dívida' },
  despesa: { icon: Receipt, className: 'text-blue-500 dark:text-blue-400', label: 'Despesa' },
  investimento: { icon: TrendingUp, className: 'text-emerald-500 dark:text-emerald-400', label: 'Investimento' },
};

export function TransactionCard({
  transaction,
  onUpdate,
  onDelete,
  onDuplicate,
}: TransactionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Partial<Transaction>>({});
  const [duplicateMonth, setDuplicateMonth] = useState<string>('');
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

  const startEdit = () => {
    setIsEditing(true);
    setEditValues(transaction);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditValues({});
  };

  const saveEdit = () => {
    onUpdate(transaction.id, editValues);
    setIsEditing(false);
    setEditValues({});
  };

  const handleDuplicate = () => {
    if (duplicateMonth) {
      onDuplicate(transaction.id, duplicateMonth);
      setShowDuplicateDialog(false);
      setDuplicateMonth('');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const FlowIcon = transaction.tipo_fluxo === 'entrada' ? ArrowUpCircle : ArrowDownCircle;
  const StatusIcon = transaction.status_pagamento === 'pago' ? CheckCircle2 : Clock;
  const classification = classificationConfig[transaction.classificacao];
  const ClassificationIcon = classification.icon;

  if (isEditing) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="space-y-3">
          <Input
            placeholder="Nome"
            value={editValues.nome || ''}
            onChange={(e) => setEditValues({ ...editValues, nome: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              step="0.01"
              placeholder="Valor"
              value={editValues.valor || ''}
              onChange={(e) => setEditValues({ ...editValues, valor: parseFloat(e.target.value) })}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Estimado"
              value={editValues.valor_estimado || ''}
              onChange={(e) => setEditValues({ ...editValues, valor_estimado: parseFloat(e.target.value) || undefined })}
            />
          </div>
          <Input
            type="date"
            value={editValues.data_pagamento || ''}
            onChange={(e) => setEditValues({ ...editValues, data_pagamento: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              value={editValues.tipo_fluxo}
              onValueChange={(v: FlowType) => setEditValues({ ...editValues, tipo_fluxo: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={editValues.status_pagamento}
              onValueChange={(v: PaymentStatus) => setEditValues({ ...editValues, status_pagamento: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="nao_pago">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select
            value={editValues.classificacao}
            onValueChange={(v: Classification) => setEditValues({ ...editValues, classificacao: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Classificação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gasto">Gasto</SelectItem>
              <SelectItem value="divida">Dívida</SelectItem>
              <SelectItem value="despesa">Despesa</SelectItem>
              <SelectItem value="investimento">Investimento</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={saveEdit} className="flex-1">
            <Check className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          <Button variant="outline" onClick={cancelEdit} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 active:scale-[0.98] transition-transform touch-manipulation">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            transaction.tipo_fluxo === 'entrada' 
              ? 'bg-income/10' 
              : 'bg-expense/10'
          )}>
            <FlowIcon className={cn(
              'h-5 w-5',
              transaction.tipo_fluxo === 'entrada' ? 'text-income' : 'text-expense'
            )} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{transaction.nome}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <ClassificationIcon className={cn('h-3.5 w-3.5', classification.className)} />
              <span>{classification.label}</span>
              <span>•</span>
              <span>{format(parseISO(transaction.data_pagamento), 'dd MMM', { locale: ptBR })}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className={cn(
              'font-semibold tabular-nums',
              transaction.tipo_fluxo === 'entrada' ? 'text-income' : 'text-expense'
            )}>
              {transaction.tipo_fluxo === 'entrada' ? '+' : '-'} {formatCurrency(transaction.valor)}
            </p>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              <StatusIcon className={cn(
                'h-3.5 w-3.5',
                transaction.status_pagamento === 'pago' 
                  ? 'text-income' 
                  : 'text-muted-foreground'
              )} />
              <span className={cn(
                'text-xs',
                transaction.status_pagamento === 'pago' 
                  ? 'text-income' 
                  : 'text-muted-foreground'
              )}>
                {transaction.status_pagamento === 'pago' ? 'Pago' : 'Pendente'}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={startEdit}>
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDuplicateDialog(true)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir transação</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir "{transaction.nome}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(transaction.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {transaction.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
          {transaction.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicar para outro mês</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <MonthSelector
              selectedMonth={duplicateMonth || transaction.mes_referencia}
              onMonthChange={setDuplicateMonth}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDuplicate}>
              Duplicar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
