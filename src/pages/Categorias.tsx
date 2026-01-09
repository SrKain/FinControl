import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useCategories, Category } from '@/hooks/useCategories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Plus, Pencil, Trash2, Tags, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
];

const Categorias = () => {
  const { categories, loading, addCategory, updateCategory, deleteCategory, getTotalTargetPercentage } = useCategories();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [targetPercentage, setTargetPercentage] = useState('');

  const totalTarget = getTotalTargetPercentage();
  const remainingTarget = 100 - totalTarget;

  const resetForm = () => {
    setName('');
    setColor(PRESET_COLORS[0]);
    setTargetPercentage('');
    setEditingCategory(null);
  };

  const handleAdd = async () => {
    if (!name.trim()) return;

    const result = await addCategory({
      name: name.trim(),
      color,
      target_percentage: parseFloat(targetPercentage) || 0,
    });

    if (result) {
      resetForm();
      setIsAddOpen(false);
    }
  };

  const handleEdit = async () => {
    if (!editingCategory || !name.trim()) return;

    const success = await updateCategory(editingCategory.id, {
      name: name.trim(),
      color,
      target_percentage: parseFloat(targetPercentage) || 0,
    });

    if (success) {
      resetForm();
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setColor(category.color);
    setTargetPercentage(category.target_percentage.toString());
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Categorias</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gerencie suas categorias e metas orçamentárias
            </p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Categoria</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Transporte, Alimentação..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cor</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={cn(
                          'w-8 h-8 rounded-full transition-all',
                          color === c && 'ring-2 ring-offset-2 ring-primary'
                        )}
                        style={{ backgroundColor: c }}
                        onClick={() => setColor(c)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">Meta Ideal (%)</Label>
                  <Input
                    id="target"
                    type="number"
                    min="0"
                    max={remainingTarget}
                    step="0.1"
                    value={targetPercentage}
                    onChange={(e) => setTargetPercentage(e.target.value)}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Disponível: {remainingTarget.toFixed(1)}% de 100%
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    resetForm();
                    setIsAddOpen(false);
                  }}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAdd} disabled={!name.trim()}>
                    Criar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Total Budget Indicator */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Meta Total Alocada</span>
                <span className={cn(
                  'font-medium',
                  totalTarget > 100 && 'text-destructive'
                )}>
                  {totalTarget.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={Math.min(totalTarget, 100)}
                className={cn(
                  'h-2',
                  totalTarget > 100 && '[&>div]:bg-destructive'
                )}
              />
              {totalTarget > 100 && (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  <span>A soma das metas excede 100%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Categories List */}
        {categories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Tags className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Nenhuma categoria criada ainda.
                <br />
                Crie sua primeira categoria para definir metas orçamentárias.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.id} className="group relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 w-full h-1"
                  style={{ backgroundColor: category.color }}
                />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. As transações que usam esta categoria não serão afetadas.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteCategory(category.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Meta ideal</span>
                      <Badge variant="secondary">
                        {category.target_percentage}%
                      </Badge>
                    </div>
                    <Progress value={category.target_percentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={(open) => {
          if (!open) resetForm();
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Categoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Transporte, Alimentação..."
                />
              </div>

              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={cn(
                        'w-8 h-8 rounded-full transition-all',
                        color === c && 'ring-2 ring-offset-2 ring-primary'
                      )}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-target">Meta Ideal (%)</Label>
                <Input
                  id="edit-target"
                  type="number"
                  min="0"
                  max={remainingTarget + (editingCategory?.target_percentage || 0)}
                  step="0.1"
                  value={targetPercentage}
                  onChange={(e) => setTargetPercentage(e.target.value)}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Disponível: {(remainingTarget + (editingCategory?.target_percentage || 0)).toFixed(1)}% de 100%
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleEdit} disabled={!name.trim()}>
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Categorias;
