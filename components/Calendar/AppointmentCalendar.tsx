
import React, { useState, useEffect } from 'react';
import { Calendar, Views, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { AppointmentForm } from '../Forms/AppointmentForm';
import { AppointmentDetails } from '../Appointments/AppointmentDetails';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';

// Set the locale to French
moment.locale('fr');
const localizer = momentLocalizer(moment);

interface AppointmentEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  client: string;
  client_id: string;
  service: string;
  service_id: string | null;
  vehicle: string;
  status: 'confirmé' | 'annulé' | 'reporté' | 'terminé' | 'en attente';
  notes: string | null;
  resource?: any;
}

const getEventStyle = (event: AppointmentEvent) => {
  switch (event.status) {
    case 'confirmé':
      return {
        backgroundColor: '#10B981',
        borderColor: '#059669',
        color: '#fff'
      };
    case 'annulé':
      return {
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        color: '#fff'
      };
    case 'reporté':
      return {
        backgroundColor: '#F59E0B',
        borderColor: '#D97706',
        color: '#fff'
      };
    case 'terminé':
      return {
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        color: '#fff'
      };
    case 'en attente':
      return {
        backgroundColor: '#A3A3A3',
        borderColor: '#737373',
        color: '#fff'
      };
  }
};

const AppointmentCalendar = () => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [view, setView] = useState<View>(isMobile ? 'day' : 'week');
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AppointmentEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  
  const { user } = useAuth();

  useEffect(() => {
    if (isMobile) {
      setView('day');
    } else if (view === 'day') {
      setView('week');
    }
  }, [isMobile]);

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  // Custom CSS for the calendar
  useEffect(() => {
    const isDark = theme === 'dark';
    
    const calendarStyles = `
      .rbc-toolbar {
        padding: 0.75rem;
        background-color: ${isDark ? '#1E293B' : '#F9FAFB'};
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        color: ${isDark ? '#E2E8F0' : 'inherit'};
      }
      
      .rbc-toolbar button {
        border-radius: 0.375rem;
        transition: all 0.2s;
        color: ${isDark ? '#E2E8F0' : 'inherit'};
        border-color: ${isDark ? '#475569' : '#D1D5DB'};
      }
      
      .rbc-toolbar button:hover {
        background-color: ${isDark ? '#475569' : '#F3F4F6'};
      }
      
      .rbc-toolbar button.rbc-active {
        background-color: #3B82F6;
        color: white;
        border-color: #3B82F6;
      }
      
      .rbc-header {
        padding: 0.75rem 0;
        background-color: ${isDark ? '#1E293B' : '#F9FAFB'};
        font-weight: 600;
        color: ${isDark ? '#E2E8F0' : 'inherit'};
        border-color: ${isDark ? '#334155' : '#E5E7EB'};
      }
      
      .rbc-event {
        border-radius: 0.375rem;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        transition: transform 0.1s ease-in-out;
      }
      
      .rbc-event:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .rbc-today {
        background-color: ${isDark ? '#1E40AF22' : '#EEF2FF'};
      }
      
      .rbc-day-slot .rbc-event {
        border-radius: 0.25rem;
      }
      
      .rbc-time-view, .rbc-month-view {
        border-radius: 0.5rem;
        border: 1px solid ${isDark ? '#334155' : '#E5E7EB'};
        overflow: hidden;
        background-color: ${isDark ? '#0F172A' : '#fff'};
      }
      
      .rbc-time-content, 
      .rbc-month-view .rbc-month-row,
      .rbc-time-header-content {
        border-color: ${isDark ? '#334155' : '#E5E7EB'};
      }
      
      .rbc-timeslot-group {
        border-color: ${isDark ? '#334155' : '#E5E7EB'};
      }
      
      .rbc-time-content > * + * > * {
        border-color: ${isDark ? '#334155' : '#E5E7EB'};
      }
      
      .rbc-time-header-content, .rbc-month-header {
        font-weight: 600;
        color: ${isDark ? '#E2E8F0' : 'inherit'};
      }
      
      .rbc-month-row + .rbc-month-row {
        border-top: 1px solid ${isDark ? '#334155' : '#E5E7EB'};
      }
      
      .rbc-date-cell {
        padding: 0.25rem;
        text-align: center;
        color: ${isDark ? '#E2E8F0' : 'inherit'};
      }
      
      .rbc-off-range-bg {
        background-color: ${isDark ? '#1E293B' : '#F9FAFB'};
      }
      
      .rbc-off-range {
        color: ${isDark ? '#64748B' : '#9CA3AF'};
      }
      
      .rbc-time-gutter {
        color: ${isDark ? '#94A3B8' : 'inherit'};
      }
      
      .rbc-day-bg + .rbc-day-bg {
        border-color: ${isDark ? '#334155' : '#E5E7EB'};
      }
      
      .rbc-time-view .rbc-row, 
      .rbc-agenda-table {
        color: ${isDark ? '#E2E8F0' : 'inherit'};
      }
      
      .rbc-current-time-indicator {
        background-color: #3B82F6;
      }
      
      .rbc-agenda-view table.rbc-agenda-table {
        border-color: ${isDark ? '#334155' : '#E5E7EB'};
        color: ${isDark ? '#E2E8F0' : 'inherit'};
      }
      
      .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
        border-color: ${isDark ? '#334155' : '#E5E7EB'};
        color: ${isDark ? '#E2E8F0' : 'inherit'};
        background-color: ${isDark ? '#1E293B' : '#F9FAFB'};
      }
      
      .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
        border-color: ${isDark ? '#334155' : '#E5E7EB'};
        color: ${isDark ? '#E2E8F0' : 'inherit'};
      }
      
      .rbc-agenda-view table.rbc-agenda-table tbody > tr > td + td {
        border-color: ${isDark ? '#334155' : '#E5E7EB'};
      }
      
      .rbc-agenda-time-cell {
        border-color: ${isDark ? '#334155' : '#E5E7EB'};
        color: ${isDark ? '#E2E8F0' : 'inherit'};
      }
    `;
    
    let styleElement = document.getElementById('calendar-styles');
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.setAttribute('type', 'text/css');
      styleElement.setAttribute('id', 'calendar-styles');
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = calendarStyles;
    
    return () => {
      if (styleElement && document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [theme]);

  const fetchAppointments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, full_name, business_id')
        .eq('business_id', user.id);
        
      if (clientsError) throw clientsError;
      
      if (!clients || clients.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }
      
      const clientIds = clients.map(client => client.id);
      const clientMap = new Map(clients.map(client => [client.id, client.full_name]));
      
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, name, business_id')
        .eq('business_id', user.id);
        
      if (servicesError) throw servicesError;
      
      const serviceMap = new Map(services ? services.map(service => [service.id, service.name]) : []);
      
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .in('client_id', clientIds);
        
      if (appointmentsError) throw appointmentsError;
      
      if (!appointments || appointments.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }
      
      const calendarEvents = appointments.map(appointment => {
        const startTime = new Date(appointment.appointment_date);
        const endTime = new Date(new Date(startTime).getTime() + appointment.duration * 60000);
        const clientName = clientMap.get(appointment.client_id) || 'Client inconnu';
        const serviceName = appointment.service_id ? serviceMap.get(appointment.service_id) || 'Service inconnu' : 'Aucun service';
        const vehicle = appointment.vehicle_model ? `${appointment.vehicle_model} (${appointment.vehicle_type || 'Non spécifié'})` : 'Véhicule non spécifié';
        
        return {
          id: appointment.id,
          title: `${serviceName} - ${clientName}`,
          start: startTime,
          end: endTime,
          client: clientName,
          client_id: appointment.client_id,
          service: serviceName,
          service_id: appointment.service_id,
          vehicle: vehicle,
          status: appointment.status as any,
          notes: appointment.notes
        };
      });
      
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les rendez-vous.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleSelectEvent = (event: AppointmentEvent) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date; }) => {
    setSelectedSlot({ start, end });
    setIsNewAppointmentOpen(true);
  };

  const handleAppointmentCreated = () => {
    setIsNewAppointmentOpen(false);
    fetchAppointments();
    toast({
      title: "Rendez-vous créé",
      description: "Le rendez-vous a été créé avec succès."
    });
  };

  const handleAppointmentUpdated = () => {
    setIsDetailsOpen(false);
    fetchAppointments();
    toast({
      title: "Rendez-vous mis à jour",
      description: "Le rendez-vous a été mis à jour avec succès."
    });
  };

  const handleAppointmentDeleted = () => {
    setIsDetailsOpen(false);
    fetchAppointments();
    toast({
      title: "Rendez-vous supprimé",
      description: "Le rendez-vous a été supprimé avec succès."
    });
  };

  const CustomToolbar = ({ date, onView, onNavigate }: any) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    return (
      <div className={`flex flex-col gap-3 p-2 md:p-4 mb-2 md:mb-4 rounded-lg border ${
        isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-cardetail-blue/5 border-cardetail-lightgray'
      }`}>
        <div className="flex items-center">
          <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 mr-2 text-cardetail-blue" />
          <h2 className={`text-base md:text-xl font-bold truncate max-w-[220px] md:max-w-full ${
            isDark ? 'text-slate-200' : 'text-cardetail-black'
          }`}>
            {view === 'month' 
              ? moment(date).format('MMMM YYYY') 
              : view === 'week' 
                ? `Semaine du ${moment(date).startOf('week').format('D MMMM')} au ${moment(date).endOf('week').format('D MMMM YYYY')}` 
                : moment(date).format('D MMMM YYYY')}
          </h2>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4">
          <div className={`flex items-center rounded-md overflow-hidden border ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <button 
              className={`p-3 md:p-2 transition-colors ${
                isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
              }`}
              onClick={() => onNavigate('PREV')} 
              aria-label="Précédent"
            >
              <ChevronLeft className={`w-5 h-5 md:w-5 md:h-5 ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`} />
            </button>
            <button 
              onClick={() => onNavigate('TODAY')} 
              className={`px-3 py-2 md:px-3 md:py-2 text-sm md:text-sm font-medium transition-colors border-x ${
                isDark ? 'hover:bg-slate-700 border-slate-700' : 'hover:bg-gray-100 border-gray-200'
              }`}
            >
              Aujourd'hui
            </button>
            <button 
              className={`p-3 md:p-2 transition-colors ${
                isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
              }`} 
              onClick={() => onNavigate('NEXT')} 
              aria-label="Suivant"
            >
              <ChevronRight className={`w-5 h-5 md:w-5 md:h-5 ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`} />
            </button>
          </div>
          
          <div className={`flex rounded-md overflow-hidden h-12 md:h-10 border ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <button 
              className={`flex-1 px-3 py-2 md:px-3 md:py-2 text-sm md:text-sm font-medium transition-colors ${
                view === 'month' 
                  ? 'bg-cardetail-blue text-white' 
                  : isDark 
                    ? 'hover:bg-slate-700' 
                    : 'hover:bg-gray-100'
              }`} 
              onClick={() => onView('month')}
            >
              Mois
            </button>
            <button 
              className={`flex-1 px-3 py-2 md:px-3 md:py-2 text-sm md:text-sm font-medium transition-colors border-x ${
                view === 'week' 
                  ? 'bg-cardetail-blue text-white' 
                  : isDark 
                    ? 'hover:bg-slate-700 border-slate-700' 
                    : 'hover:bg-gray-100 border-gray-200'
              }`} 
              onClick={() => onView('week')}
            >
              Semaine
            </button>
            <button 
              className={`flex-1 px-3 py-2 md:px-3 md:py-2 text-sm md:text-sm font-medium transition-colors ${
                view === 'day' 
                  ? 'bg-cardetail-blue text-white' 
                  : isDark 
                    ? 'hover:bg-slate-700' 
                    : 'hover:bg-gray-100'
              }`} 
              onClick={() => onView('day')}
            >
              Jour
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EventComponent = ({ event }: { event: AppointmentEvent }) => {
    return (
      <div className="p-1 overflow-hidden h-full">
        <div className="text-xs font-medium truncate">{event.title}</div>
        {event.vehicle && view !== 'month' && (
          <div className="text-xs truncate">{event.vehicle}</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={() => {
            setSelectedSlot({
              start: new Date(),
              end: new Date(new Date().getTime() + 60 * 60000)
            });
            setIsNewAppointmentOpen(true);
          }} 
          className="flex items-center gap-1 bg-cardetail-blue hover:bg-cardetail-blue/90 text-xs md:text-base py-1 px-2 md:px-4 md:py-2"
        >
          <Plus size={isMobile ? 14 : 16} />
          {isMobile ? "Nouveau" : "Nouveau rendez-vous"}
        </Button>
      </div>
      
      <div className={`rounded-lg border p-0 md:p-1 h-[500px] md:h-[700px] ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="animate-pulse text-sm md:text-base">Chargement des rendez-vous...</span>
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: isMobile ? 500 : 700 }}
            views={['day', 'week', 'month']}
            view={view}
            date={date}
            onView={handleViewChange}
            onNavigate={handleNavigate}
            components={{
              toolbar: CustomToolbar,
              event: EventComponent
            }}
            eventPropGetter={(event: any) => ({
              style: getEventStyle(event)
            })}
            selectable
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            popup
            dayPropGetter={date => {
              const today = new Date();
              if (
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear()
              ) {
                return {
                  style: {
                    backgroundColor: theme === 'dark' ? '#1E40AF22' : '#EEF2FF'
                  }
                };
              }
              return {};
            }}
            culture="fr"
            formats={{
              dayFormat: 'ddd', // 'ddd' will show abbreviated day names (lun, mar, etc.)
              timeGutterFormat: 'HH:mm', // 24-hour format
              eventTimeRangeFormat: ({ start, end }: { start: Date, end: Date }) => {
                return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
              },
              agendaDateFormat: 'dddd D MMMM', // Full day name + day number + month
              dayRangeHeaderFormat: ({ start, end }: { start: Date, end: Date }) => {
                return `${moment(start).format('D MMMM')} - ${moment(end).format('D MMMM YYYY')}`;
              },
            }}
            messages={{
              today: "Aujourd'hui",
              previous: "Précédent",
              next: "Suivant",
              month: "Mois",
              week: "Semaine",
              day: "Jour",
              agenda: "Agenda",
              date: "Date",
              time: "Heure",
              event: "Événement",
              showMore: total => `+ ${total} autres`
            }}
          />
        )}
      </div>
      
      <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau rendez-vous</DialogTitle>
            <DialogDescription>
              Créez un nouveau rendez-vous en remplissant le formulaire ci-dessous.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSlot && (
            <AppointmentForm 
              initialDate={selectedSlot.start} 
              initialEndTime={selectedSlot.end} 
              onSuccess={handleAppointmentCreated} 
              onCancel={() => setIsNewAppointmentOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du rendez-vous</DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <AppointmentDetails 
              appointment={selectedEvent} 
              onUpdate={handleAppointmentUpdated} 
              onDelete={handleAppointmentDeleted} 
            />
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentCalendar;
