
import React from 'react';
import { format, parse, addMinutes } from 'date-fns';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface TimeSlotSelectorProps {
  selectedTime: string;
  onChange: (time: string) => void;
  startHour?: number;
  endHour?: number;
  intervalMinutes?: number;
  className?: string;
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedTime,
  onChange,
  startHour = 8,
  endHour = 20,
  intervalMinutes = 15,
  className
}) => {
  // Générer toutes les tranches horaires possibles
  const timeSlots = React.useMemo(() => {
    const slots: string[] = [];
    let current = new Date();
    current.setHours(startHour, 0, 0, 0);
    
    const end = new Date();
    end.setHours(endHour, 0, 0, 0);
    
    while (current <= end) {
      slots.push(format(current, 'HH:mm'));
      current = addMinutes(current, intervalMinutes);
    }
    
    return slots;
  }, [startHour, endHour, intervalMinutes]);
  
  // Si aucune heure n'est sélectionnée et qu'une heure par défaut est nécessaire
  React.useEffect(() => {
    if (!selectedTime && timeSlots.length > 0) {
      onChange(timeSlots[0]);
    }
  }, [selectedTime, timeSlots, onChange]);
  
  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center mb-2">
        <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
        <span className="text-sm font-medium">Sélectionnez une heure</span>
      </div>
      
      <ScrollArea className="h-[220px] rounded-md border p-2 bg-background">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {timeSlots.map((time) => (
            <button
              key={time}
              type="button"
              className={cn(
                "flex justify-center items-center py-2 px-2 text-sm rounded-md transition-colors",
                selectedTime === time
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "bg-card border border-input hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => onChange(time)}
            >
              {time}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
