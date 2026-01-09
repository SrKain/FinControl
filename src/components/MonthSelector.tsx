import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parse, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  const currentDate = parse(selectedMonth, 'yyyy-MM', new Date());

  const handlePrevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    onMonthChange(format(newDate, 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    onMonthChange(format(newDate, 'yyyy-MM'));
  };

  const formattedMonth = format(currentDate, 'MMMM yyyy', { locale: ptBR });

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={handlePrevMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-[140px] text-center font-medium capitalize">
        {formattedMonth}
      </span>
      <Button variant="outline" size="icon" onClick={handleNextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
