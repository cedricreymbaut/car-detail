import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Loader2, AlertTriangle, Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';

interface DateTimeSelectionProps {
  availableDates: string[];
  availableTimes: string[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  prevStep: () => void;
  nextStep: () => void;
  timeSlotsLoading?: boolean;
  timeSlotsError?: string | null;
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  availableDates,
  availableTimes,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  prevStep,
  nextStep,
  timeSlotsLoading = false,
  timeSlotsError = null
}) => {
  const isMobile = useIsMobile();
  const [inputError, setInputError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
    setInputError(null); // Clear any previous input errors
  };
  
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setInputError(null); // Clear any previous input errors
  };
  
  const handleContinue = () => {
    if (!selectedDate) {
      setInputError('Veuillez sélectionner une date');
      return;
    }
    
    if (!selectedTime) {
      setInputError('Veuillez sélectionner une heure');
      return;
    }
    
    setInputError(null);
    nextStep();
  };
  
  const showNoAvailabilityMessage = availableDates.length === 0;
  
  return (
    <div>
      <h2 className={`font-bold text-base md:text-lg mb-3 md:mb-4 ${isDark ? 'text-slate-100' : ''}`}>Sélectionnez une date et une heure</h2>
      
      {inputError && (
        <div className={`${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-500'} p-2 md:p-3 rounded-md mb-3 md:mb-4 text-xs md:text-sm flex items-center`}>
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
          {inputError}
        </div>
      )}
      
      {timeSlotsError && (
        <div className={`${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-500'} p-2 md:p-3 rounded-md mb-3 md:mb-4 text-xs md:text-sm flex items-center`}>
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
          {timeSlotsError}
        </div>
      )}
      
      {showNoAvailabilityMessage && (
        <div className={`${isDark ? 'bg-amber-900/20 text-amber-300' : 'bg-amber-50 text-amber-800'} p-3 md:p-4 rounded-md mb-4 flex items-start gap-2 text-xs md:text-sm`}>
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Aucune disponibilité</p>
            <p>L'entreprise n'a pas configuré ses horaires d'ouverture ou n'a aucune disponibilité dans les prochains jours.</p>
          </div>
        </div>
      )}
      
      <div className="mb-3 md:mb-4">
        <Label className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
          isDark ? 'text-slate-300' : 'text-gray-700'
        }`}>
          Date <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-2">
          {availableDates.length > 0 ? (
            availableDates.map((date) => (
              <div
                key={date}
                className={`p-2 md:p-3 border rounded-md cursor-pointer text-center transition-colors ${
                  selectedDate === date 
                    ? isDark 
                      ? 'border-blue-500 bg-blue-900/30 shadow-sm' 
                      : 'border-blue-500 bg-blue-50 shadow-sm' 
                    : isDark 
                      ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/70' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleDateSelect(date)}
              >
                <span className={`text-xs md:text-sm ${isDark ? 'text-slate-300' : ''}`}>{date}</span>
              </div>
            ))
          ) : (
            <div className={`col-span-3 md:col-span-4 p-3 md:p-4 ${
              isDark ? 'bg-amber-900/20 text-amber-300' : 'bg-amber-50 text-amber-800'
            } rounded-md text-xs md:text-sm`}>
              Aucune date disponible
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-3 md:mb-4">
        <Label className={`flex items-center text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
          isDark ? 'text-slate-300' : 'text-gray-700'
        }`}>
          <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 text-gray-500" />
          Heure <span className="text-red-500 ml-1">*</span>
        </Label>
        
        {selectedDate ? (
          timeSlotsLoading ? (
            <div className={`col-span-4 md:col-span-6 p-3 md:p-4 ${
              isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-50 text-gray-500'
            } rounded-md text-xs md:text-sm flex items-center justify-center`}>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Chargement des horaires disponibles...
            </div>
          ) : availableTimes.length > 0 ? (
            <ScrollArea className={`h-[180px] rounded-md border ${
              isDark ? 'border-slate-700 bg-slate-900' : ''
            }`}>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 p-2">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    type="button"
                    className={cn(
                      "flex justify-center items-center py-2 px-2 text-xs md:text-sm rounded-md transition-colors",
                      selectedTime === time
                        ? isDark 
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-blue-500 text-white shadow-sm"
                        : isDark
                          ? "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    )}
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className={`p-3 md:p-4 ${
              isDark ? 'bg-amber-900/20 text-amber-300' : 'bg-amber-50 text-amber-800'
            } rounded-md text-xs md:text-sm`}>
              Aucun horaire disponible pour cette date
            </div>
          )
        ) : (
          <div className={`p-3 md:p-4 ${
            isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-50 text-gray-500'
          } rounded-md text-xs md:text-sm`}>
            Veuillez d'abord sélectionner une date
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-4 md:mt-6">
        <button 
          className={`btn-outline flex items-center text-sm md:text-base ${
            isDark ? 'border border-slate-700 hover:bg-slate-800' : ''
          }`}
          onClick={prevStep}
        >
          <ChevronLeft className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
          Retour
        </button>
        
        <button 
          className="btn-primary flex items-center text-sm md:text-base"
          onClick={handleContinue}
          disabled={timeSlotsLoading}
        >
          {timeSlotsLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 animate-spin" />
              Chargement...
            </>
          ) : (
            <>
              Continuer
              <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DateTimeSelection;
