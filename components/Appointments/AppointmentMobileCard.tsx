
import React from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, User, CarFront } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';
import { Appointment } from '@/hooks/use-appointments';
import { useTheme } from '@/hooks/use-theme';

interface AppointmentMobileCardProps {
  appointment: Appointment;
  onViewDetails: (appointment: Appointment) => void;
}

const AppointmentMobileCard = ({ appointment, onViewDetails }: AppointmentMobileCardProps) => {
  const appointmentDate = parseISO(appointment.appointment_date);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  return (
    <div className={`${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white'} p-4 rounded-lg border shadow-sm`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-medium">{appointment.client_name}</div>
          <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{appointment.service_name}</div>
        </div>
        <div><StatusBadge status={appointment.status as any} /></div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className={`flex items-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          <Calendar className={`h-4 w-4 mr-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
          {format(appointmentDate, 'd MMM yyyy', { locale: fr })}
        </div>
        <div className={`flex items-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          <Clock className={`h-4 w-4 mr-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
          {format(appointmentDate, 'HH:mm')}
        </div>
        <div className={`flex items-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          <User className={`h-4 w-4 mr-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
          {appointment.client_name}
        </div>
        <div className={`flex items-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          <CarFront className={`h-4 w-4 mr-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
          {appointment.vehicle_model || 'Non précisé'}
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className={`w-full ${isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700' : ''}`}
        onClick={() => onViewDetails(appointment)}
      >
        Voir détails
      </Button>
    </div>
  );
};

export default AppointmentMobileCard;
