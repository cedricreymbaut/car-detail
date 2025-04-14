import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Clock, AlertTriangle, PauseCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type BusinessHours = {
  id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
  business_id?: string;
  created_at?: string;
  updated_at?: string;
  has_break: boolean;
  break_start: string;
  break_end: string;
};

type SpecialDay = {
  id: string;
  date: string;
  name: string;
  is_closed: boolean;
  open_time?: string | null;
  close_time?: string | null;
  created_at?: string;
  note?: string;
  has_break: boolean;
  break_start: string | null;
  break_end: string | null;
  business_id?: string;
};

type OpenStatus = {
  isOpen: boolean;
  message: string;
  closingIn?: string;
  opensIn?: string;
};

const dayNames = [
  "Dimanche",
  "Lundi", 
  "Mardi", 
  "Mercredi", 
  "Jeudi", 
  "Vendredi", 
  "Samedi"
];

const formatTime = (time: string) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

const BusinessHoursDisplay = () => {
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [openStatus, setOpenStatus] = useState<OpenStatus>({
    isOpen: false,
    message: "Chargement..."
  });
  const [todayHours, setTodayHours] = useState<BusinessHours | null>(null);
  const [isSpecialDay, setIsSpecialDay] = useState<SpecialDay | null>(null);
  const { user } = useAuth();
  
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
  
  const formatDateForComparison = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const todayFormatted = formatDateForComparison(today);

  useEffect(() => {
    const fetchBusinessHours = async () => {
      try {
        setLoading(true);
        
        if (!user?.id) {
          console.log("No user ID available for fetching business hours");
          return;
        }
        
        const { data, error } = await supabase
          .from('business_hours')
          .select('*')
          .eq('business_id', user.id)
          .order('day_of_week', { ascending: true });

        if (error) throw error;
        
        const formattedData = data.map(hour => ({
          ...hour,
          has_break: hour.has_break || false,
          break_start: hour.break_start || '12:00',
          break_end: hour.break_end || '13:00',
        } as BusinessHours));
        
        setBusinessHours(formattedData);
        
        // Find today's hours
        const currentDayHours = formattedData.find(
          hour => hour.day_of_week === dayOfWeek
        ) || null;
        
        setTodayHours(currentDayHours);
        
        try {
          const { data: specialData, error: specialError } = await supabase
            .from('special_days')
            .select('*')
            .eq('business_id', user.id);
            
          if (!specialError) {
            const formattedSpecialData = specialData.map(day => ({
              ...day,
              has_break: day.has_break || false,
              break_start: day.break_start || '12:00',
              break_end: day.break_end || '13:00',
            } as SpecialDay));
            
            setSpecialDays(formattedSpecialData || []);
            
            // Check if today is a special day
            const specialDay = formattedSpecialData.find(
              day => day.date === todayFormatted
            ) || null;
            
            setIsSpecialDay(specialDay);
          }
        } catch (e) {
          console.log("Pas de table special_days ou erreur:", e);
        }
      } catch (error) {
        console.error('Error fetching business hours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessHours();
  }, [dayOfWeek, todayFormatted, user]);

  useEffect(() => {
    // Update open status whenever relevant data changes
    setOpenStatus(determineOpenStatus());
  }, [todayHours, isSpecialDay]);

  const determineOpenStatus = (): OpenStatus => {
    if (isSpecialDay) {
      if (isSpecialDay.is_closed) return { isOpen: false, message: "Fermé (jour spécial)" };
      
      return checkIfOpenNow(
        isSpecialDay.open_time || '', 
        isSpecialDay.close_time || '', 
        isSpecialDay.has_break || false,
        isSpecialDay.break_start || '',
        isSpecialDay.break_end || ''
      );
    }
    
    if (!todayHours) return { isOpen: false, message: "Statut inconnu" };
    if (todayHours.is_closed) return { isOpen: false, message: "Fermé aujourd'hui" };
    
    return checkIfOpenNow(
      todayHours.open_time, 
      todayHours.close_time, 
      todayHours.has_break || false,
      todayHours.break_start || '',
      todayHours.break_end || ''
    );
  };

  const checkIfOpenNow = (
    openTime: string, 
    closeTime: string, 
    hasBreak: boolean,
    breakStart: string,
    breakEnd: string
  ): OpenStatus => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const openTotalMinutes = openHour * 60 + openMinute;
    const closeTotalMinutes = closeHour * 60 + closeMinute;
    
    if (hasBreak && breakStart && breakEnd) {
      const [breakStartHour, breakStartMinute] = breakStart.split(':').map(Number);
      const [breakEndHour, breakEndMinute] = breakEnd.split(':').map(Number);
      
      const breakStartTotalMinutes = breakStartHour * 60 + breakStartMinute;
      const breakEndTotalMinutes = breakEndHour * 60 + breakEndMinute;
      
      if (currentTotalMinutes >= breakStartTotalMinutes && currentTotalMinutes < breakEndTotalMinutes) {
        return { 
          isOpen: false, 
          message: "En pause déjeuner",
          opensIn: `Réouvre dans ${Math.floor((breakEndTotalMinutes - currentTotalMinutes) / 60)}h${(breakEndTotalMinutes - currentTotalMinutes) % 60 || '00'}`
        };
      }
    }
    
    if (currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes) {
      if (hasBreak && breakStart) {
        const [breakStartHour, breakStartMinute] = breakStart.split(':').map(Number);
        const breakStartTotalMinutes = breakStartHour * 60 + breakStartMinute;
        
        if (currentTotalMinutes < breakStartTotalMinutes) {
          return { 
            isOpen: true, 
            message: "Ouvert maintenant",
            closingIn: `Pause à ${formatTime(breakStart)}, ferme à ${formatTime(closeTime)}`
          };
        }
      }
      
      return { 
        isOpen: true, 
        message: "Ouvert maintenant",
        closingIn: `Ferme dans ${Math.floor((closeTotalMinutes - currentTotalMinutes) / 60)}h${(closeTotalMinutes - currentTotalMinutes) % 60 || '00'}`
      };
    }
    
    if (currentTotalMinutes < openTotalMinutes) {
      return { 
        isOpen: false, 
        message: "Fermé actuellement",
        opensIn: `Ouvre dans ${Math.floor((openTotalMinutes - currentTotalMinutes) / 60)}h${(openTotalMinutes - currentTotalMinutes) % 60 || '00'}`
      };
    }
    
    return { isOpen: false, message: "Fermé pour aujourd'hui" };
  };

  const findNextOpenDay = () => {
    if (openStatus.isOpen) return null;
    
    let checkDate = new Date(today);
    let daysChecked = 0;
    
    while (daysChecked < 7) {
      checkDate.setDate(checkDate.getDate() + 1);
      daysChecked++;
      
      const checkDayOfWeek = checkDate.getDay();
      const formattedCheckDate = formatDateForComparison(checkDate);
      
      const checkSpecialDay = specialDays.find(d => d.date === formattedCheckDate);
      if (checkSpecialDay) {
        if (!checkSpecialDay.is_closed) {
          return {
            date: checkDate,
            isSpecial: true,
            name: checkSpecialDay.name,
            openTime: checkSpecialDay.open_time,
            closeTime: checkSpecialDay.close_time,
            hasBreak: checkSpecialDay.has_break,
            breakStart: checkSpecialDay.break_start,
            breakEnd: checkSpecialDay.break_end
          };
        }
        continue;
      }
      
      const dayHours = businessHours.find(h => h.day_of_week === checkDayOfWeek);
      if (dayHours && !dayHours.is_closed) {
        return {
          date: checkDate,
          isSpecial: false,
          openTime: dayHours.open_time,
          closeTime: dayHours.close_time,
          hasBreak: dayHours.has_break,
          breakStart: dayHours.break_start,
          breakEnd: dayHours.break_end
        };
      }
    }
    
    return null;
  };

  const nextOpenDay = findNextOpenDay();

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Heures d'ouverture</span>
          <span 
            className={cn(
              "text-sm px-2 py-1 rounded-full",
              openStatus.isOpen 
                ? "bg-green-100 text-green-800" 
                : openStatus.message === "En pause déjeuner"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-800"
            )}
          >
            {openStatus.isOpen ? "Ouvert" : openStatus.message === "En pause déjeuner" ? "En pause" : "Fermé"}
          </span>
        </CardTitle>
        <CardDescription>
          {openStatus.isOpen && openStatus.closingIn && (
            <span className="text-green-700">{openStatus.closingIn}</span>
          )}
          {!openStatus.isOpen && openStatus.opensIn && (
            <span className="text-amber-700">{openStatus.opensIn}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {isSpecialDay ? (
            <div className="flex items-center justify-between font-medium mb-2 p-2 bg-amber-50 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                Jour spécial: {isSpecialDay.name}
              </div>
              <div>
                {isSpecialDay.is_closed ? (
                  <span className="text-red-500">Fermé</span>
                ) : (
                  <span className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {formatTime(isSpecialDay.open_time || '')} - {formatTime(isSpecialDay.close_time || '')}
                    {isSpecialDay.has_break && (
                      <span className="ml-2 flex items-center text-sm text-muted-foreground">
                        <PauseCircle className="mr-1 h-3 w-3" />
                        Pause {formatTime(isSpecialDay.break_start || '')} - {formatTime(isSpecialDay.break_end || '')}
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          ) : (
            todayHours && (
              <div className="flex items-center justify-between font-medium mb-2">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Aujourd'hui ({dayNames[dayOfWeek]})
                </div>
                <div>
                  {todayHours.is_closed ? (
                    <span className="text-red-500">Fermé</span>
                  ) : (
                    <span className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {formatTime(todayHours.open_time)} - {formatTime(todayHours.close_time)}
                      {todayHours.has_break && (
                        <span className="ml-2 flex items-center text-sm text-muted-foreground">
                          <PauseCircle className="mr-1 h-3 w-3" />
                          Pause {formatTime(todayHours.break_start || '')} - {formatTime(todayHours.break_end || '')}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            )
          )}
          
          {!openStatus.isOpen && nextOpenDay && (
            <div className="flex items-center justify-between text-sm py-1 p-2 bg-blue-50 rounded-md mb-3">
              <div>Prochaine ouverture:</div>
              <div className="font-medium">
                {nextOpenDay.isSpecial ? `${dayNames[nextOpenDay.date.getDay()]} (${nextOpenDay.name})` : dayNames[nextOpenDay.date.getDay()]} {nextOpenDay.date.toLocaleDateString('fr-FR')} - {formatTime(nextOpenDay.openTime || '')}
              </div>
            </div>
          )}
          
          <div className="border-t pt-2 mt-2">
            <p className="text-xs text-muted-foreground mb-2">Horaires hebdomadaires:</p>
            {businessHours.map((hour) => (
              <div 
                key={hour.id} 
                className={cn(
                  "flex justify-between text-sm py-1",
                  dayOfWeek === hour.day_of_week ? "font-medium" : ""
                )}
              >
                <div>{dayNames[hour.day_of_week]}</div>
                <div>
                  {hour.is_closed ? (
                    <span className="text-red-500">Fermé</span>
                  ) : (
                    <span className="flex items-center">
                      {formatTime(hour.open_time)} - {formatTime(hour.close_time)}
                      {hour.has_break && (
                        <span className="ml-2 flex items-center text-xs text-muted-foreground">
                          <PauseCircle className="ml-1 mr-1 h-3 w-3" />
                          {formatTime(hour.break_start || '')} - {formatTime(hour.break_end || '')}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {specialDays.length > 0 && (
            <div className="border-t pt-2 mt-2">
              <p className="text-xs text-muted-foreground mb-2">Prochains jours spéciaux:</p>
              {specialDays
                .filter(day => new Date(day.date) >= today)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 3)
                .map((day) => (
                  <div key={day.id} className="flex justify-between text-sm py-1">
                    <div className="flex items-center">
                      <span className="mr-2">{new Date(day.date).toLocaleDateString('fr-FR')}</span>
                      <span className="text-amber-700">{day.name}</span>
                    </div>
                    <div>
                      {day.is_closed ? (
                        <span className="text-red-500">Fermé</span>
                      ) : (
                        <span className="flex items-center">
                          {formatTime(day.open_time || '')} - {formatTime(day.close_time || '')}
                          {day.has_break && (
                            <span className="ml-1 flex items-center text-xs text-muted-foreground">
                              <PauseCircle className="mx-1 h-3 w-3" />
                              {formatTime(day.break_start || '')} - {formatTime(day.break_end || '')}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessHoursDisplay;
