import { useState } from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Transaction, PaymentStatus, FlowType, Classification } from '@/types/finance';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { useTags } from '@/hooks/useTags';

interface TransactionFormProps {
  selectedMonth: string;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
}

export function TransactionForm({ selectedMonth, onSubmit }: TransactionFormProps) {
  const { categories } = useCategories();
  const { tags } = useTags();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [valorEstimado, setValorEstimado] = useState('');
  const [dataPagamento, setDataPagamento] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [statusPagamento, setStatusPagamento] = useState<PaymentStatus>('nao_pago');
  const [tipoFluxo, setTipoFluxo] = useState<FlowType>('saida');
  const [classificacao, setClassificacao] = useState<Classification>('gasto');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine categories and tags into the tags field
    const allTags = [...selectedCategories, ...selectedTagNames];
    
    onSubmit({
      nome,
      valor: parseFloat(valor),
      valor_estimado: valorEstimado ? parseFloat(valorEstimado) : undefined,
      data_pagamento: dataPagamento,
      status_pagamento: statusPagamento,
      tipo_fluxo: tipoFluxo,
      classificacao,
      tags: allTags,
      mes_referencia: selectedMonth,
    });

    // Reset form
    setNome('');
    setValor('');
    setValorEstimado('');
    setDataPagamento(format(new Date(), 'yyyy-MM-dd'));
    setStatusPagamento('nao_pago');
    setTipoFluxo('saida');
    setClassificacao('gasto');
    setSelectedCategories([]);
    setSelectedTagNames([]);
    setOpen(false);
  };

  const toggleCategory = (name: string) => {
    setSelectedCategories(prev =>
      prev.includes(name)
        ? prev.filter(c => c !== name)
        : [...prev, name]
    );
  };

  const toggleTag = (name: string) => {
    setSelectedTagNames(prev =>
      prev.includes(name)
        ? prev.filter(t => t !== name)
        : [...prev, name]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Aluguel, Salário..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor Real (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valorEstimado">Valor Estimado (R$)</Label>
                <Input
                  id="valorEstimado"
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorEstimado}
                  onChange={(e) => setValorEstimado(e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoFluxo">Tipo</Label>
                <Select value={tipoFluxo} onValueChange={(v: FlowType) => setTipoFluxo(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="classificacao">Classificação</Label>
                <Select value={classificacao} onValueChange={(v: Classification) => setClassificacao(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasto">Gasto</SelectItem>
                    <SelectItem value="divida">Dívida</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                    <SelectItem value="investimento">Investimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataPagamento">Data</Label>
                <Input
                  id="dataPagamento"
                  type="date"
                  value={dataPagamento}
                  onChange={(e) => setDataPagamento(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statusPagamento">Status</Label>
                <Select value={statusPagamento} onValueChange={(v: PaymentStatus) => setStatusPagamento(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="nao_pago">Não Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categorias (para metas orçamentárias)</Label>
              <div className="flex flex-wrap gap-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma categoria criada.
                  </p>
                ) : (
                  categories.map(cat => (
                    <Badge
                      key={cat.id}
                      variant={selectedCategories.includes(cat.name) ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-colors',
                        selectedCategories.includes(cat.name) && 'hover:opacity-90'
                      )}
                      style={{
                        backgroundColor: selectedCategories.includes(cat.name) ? cat.color : undefined,
                        borderColor: cat.color,
                        color: selectedCategories.includes(cat.name) ? 'white' : cat.color,
                      }}
                      onClick={() => toggleCategory(cat.name)}
                    >
                      {cat.name}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags (bancos/contas)</Label>
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma tag criada.
                  </p>
                ) : (
                  tags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant={selectedTagNames.includes(tag.name) ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-colors',
                        selectedTagNames.includes(tag.name) && 'hover:opacity-90'
                      )}
                      style={{
                        backgroundColor: selectedTagNames.includes(tag.name) ? tag.color : undefined,
                        borderColor: tag.color,
                        color: selectedTagNames.includes(tag.name) ? 'white' : tag.color,
                      }}
                      onClick={() => toggleTag(tag.name)}
                    >
                      {tag.name}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
