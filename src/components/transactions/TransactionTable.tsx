import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Copy, Trash2, Edit2, Check, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Transaction, PaymentStatus, FlowType, Classification, AVAILABLE_TAGS, Tag } from '@/types/finance';
import { cn } from '@/lib/utils';
import { MonthSelector } from '../MonthSelector';

interface TransactionTableProps {
  transactions: Transaction[];
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string, newMonth: string) => void;
}

export function TransactionTable({
  transactions,
  onUpdate,
  onDelete,
  onDuplicate,
}: TransactionTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Transaction>>({});
  const [duplicateMonth, setDuplicateMonth] = useState<string>('');
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditValues(transaction);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdate(editingId, editValues);
      cancelEdit();
    }
  };

  const handleDuplicate = () => {
    if (duplicatingId && duplicateMonth) {
      onDuplicate(duplicatingId, duplicateMonth);
      setDuplicatingId(null);
      setDuplicateMonth('');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium">Nenhuma transação</h3>
        <p className="text-muted-foreground">
          Adicione sua primeira transação para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Nome</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Estimado</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Classificação</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className="group">
              {editingId === transaction.id ? (
                <>
                  <TableCell>
                    <Input
                      value={editValues.nome || ''}
                      onChange={(e) => setEditValues({ ...editValues, nome: e.target.value })}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={editValues.valor || ''}
                      onChange={(e) => setEditValues({ ...editValues, valor: parseFloat(e.target.value) })}
                      className="h-8 w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={editValues.valor_estimado || ''}
                      onChange={(e) => setEditValues({ ...editValues, valor_estimado: parseFloat(e.target.value) || undefined })}
                      className="h-8 w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={editValues.data_pagamento || ''}
                      onChange={(e) => setEditValues({ ...editValues, data_pagamento: e.target.value })}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={editValues.tipo_fluxo}
                      onValueChange={(v: FlowType) => setEditValues({ ...editValues, tipo_fluxo: v })}
                    >
                      <SelectTrigger className="h-8 w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="saida">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={editValues.classificacao}
                      onValueChange={(v: Classification) => setEditValues({ ...editValues, classificacao: v })}
                    >
                      <SelectTrigger className="h-8 w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gasto">Gasto</SelectItem>
                        <SelectItem value="divida">Dívida</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                        <SelectItem value="investimento">Investimento</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={editValues.status_pagamento}
                      onValueChange={(v: PaymentStatus) => setEditValues({ ...editValues, status_pagamento: v })}
                    >
                      <SelectTrigger className="h-8 w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="nao_pago">Não Pago</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={saveEdit}>
                        <Check className="h-4 w-4 text-success" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={cancelEdit}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="font-medium">{transaction.nome}</TableCell>
                  <TableCell className={cn(
                    'font-medium',
                    transaction.tipo_fluxo === 'entrada' ? 'text-income' : 'text-expense'
                  )}>
                    {formatCurrency(transaction.valor)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {transaction.valor_estimado ? formatCurrency(transaction.valor_estimado) : '-'}
                  </TableCell>
                  <TableCell>
                    {format(parseISO(transaction.data_pagamento), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={transaction.tipo_fluxo === 'entrada' ? 'default' : 'secondary'}>
                      {transaction.tipo_fluxo === 'entrada' ? 'Entrada' : 'Saída'}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{transaction.classificacao}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.status_pagamento === 'pago' ? 'default' : 'outline'}>
                      {transaction.status_pagamento === 'pago' ? 'Pago' : 'Pendente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {transaction.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => startEdit(transaction)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDuplicatingId(transaction.id)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
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
                            <Button variant="outline" onClick={() => setDuplicatingId(null)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleDuplicate}>
                              Duplicar
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                    </div>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
