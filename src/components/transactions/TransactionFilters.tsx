import { Classification, Tag } from '@/types/finance';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Filter } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useTags } from '@/hooks/useTags';

interface TransactionFiltersProps {
  selectedClassification: Classification | 'all';
  selectedTag: Tag | 'all';
  onClassificationChange: (value: Classification | 'all') => void;
  onTagChange: (value: Tag | 'all') => void;
}

export function TransactionFilters({
  selectedClassification,
  selectedTag,
  onClassificationChange,
  onTagChange,
}: TransactionFiltersProps) {
  const { categories } = useCategories();
  const { tags } = useTags();

  // Combine categories and tags for filtering
  const allItems = [
    ...categories.map(c => ({ name: c.name, color: c.color, type: 'category' as const })),
    ...tags.map(t => ({ name: t.name, color: t.color, type: 'tag' as const })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filtros:</span>
      </div>
      
      <Select
        value={selectedClassification}
        onValueChange={(v) => onClassificationChange(v as Classification | 'all')}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Classificação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas classificações</SelectItem>
          <SelectItem value="gasto">Gasto</SelectItem>
          <SelectItem value="divida">Dívida</SelectItem>
          <SelectItem value="despesa">Despesa</SelectItem>
          <SelectItem value="investimento">Investimento</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedTag === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => onTagChange('all')}
        >
          Todos
        </Badge>
        {allItems.map((item) => (
          <Badge
            key={`${item.type}-${item.name}`}
            variant={selectedTag === item.name ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer transition-colors'
            )}
            style={{
              backgroundColor: selectedTag === item.name ? item.color : undefined,
              borderColor: item.color,
              color: selectedTag === item.name ? 'white' : item.color,
            }}
            onClick={() => onTagChange(item.name)}
          >
            {item.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
