
import React, { useState } from 'react';
import { useAppointments } from '@/hooks/use-appointments';
import { parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { AppointmentDetails } from '@/components/Appointments/AppointmentDetails';
import AppointmentMobileCard from './AppointmentMobileCard';
import AppointmentDesktopTable from './AppointmentDesktopTable';
import AppointmentFilters from './AppointmentFilters';
import EmptyAppointmentsMessage from './EmptyAppointmentsMessage';
import { filterAppointments, sortAppointmentsByDate } from '@/utils/appointment-utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/hooks/use-theme';

const AppointmentHistory = () => {
  const { data: appointments, isLoading, error, refetch } = useAppointments();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [showAll, setShowAll] = useState(false);
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Log for debugging
  console.log("AppointmentHistory - Appointments retrieved:", appointments?.length);
  console.log("AppointmentHistory - Appointment statuses:", appointments?.map(a => a.status));
  
  // Filter and sort appointments
  const filteredAppointments = filterAppointments(appointments, searchTerm, statusFilter, showAll);
  const sortedAppointments = sortAppointmentsByDate(filteredAppointments);
  
  console.log("AppointmentHistory - Filtered appointments:", filteredAppointments.length);
  console.log("AppointmentHistory - Filtered appointment statuses:", filteredAppointments.map(a => a.status));
  console.log("AppointmentHistory - Show all appointments:", showAll);
  
  const handleViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
  };
  
  const handleCloseDialog = () => {
    setSelectedAppointment(null);
    refetch();
  };
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`p-4 rounded-lg ${
        isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-600'
      }`}>
        Erreur lors du chargement de l'historique des rendez-vous.
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <AppointmentFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          isMobile={isMobile}
        />
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="show-all" 
            checked={showAll} 
            onCheckedChange={setShowAll}
          />
          <Label htmlFor="show-all" className={isDark ? 'text-slate-300' : ''}>
            {showAll ? "Afficher tous les rendez-vous" : "Afficher uniquement les rendez-vous passés"}
          </Label>
        </div>
      </div>
      
      {sortedAppointments.length === 0 ? (
        <EmptyAppointmentsMessage showAll={showAll} />
      ) : isMobile ? (
        <div className="space-y-3">
          {sortedAppointments.map((appointment) => (
            <AppointmentMobileCard 
              key={appointment.id}
              appointment={appointment} 
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <AppointmentDesktopTable 
          appointments={sortedAppointments} 
          onViewDetails={handleViewDetails}
        />
      )}
      
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={handleCloseDialog}>
          <DialogContent className={`${isMobile ? 'max-w-md' : 'max-w-lg'}`}>
            <DialogHeader>
              <DialogTitle>Détails du rendez-vous</DialogTitle>
              <DialogDescription>Consultez les informations de ce rendez-vous</DialogDescription>
            </DialogHeader>
            <AppointmentDetails 
              appointment={{
                id: selectedAppointment.id,
                client: selectedAppointment.client_name,
                client_id: selectedAppointment.client_id,
                service: selectedAppointment.service_name,
                service_id: selectedAppointment.service_id,
                start: parseISO(selectedAppointment.appointment_date),
                end: new Date(parseISO(selectedAppointment.appointment_date).getTime() + selectedAppointment.duration * 60000),
                vehicle: selectedAppointment.vehicle_model || 'Non précisé',
                status: selectedAppointment.status,
                notes: selectedAppointment.notes
              }}
              onUpdate={handleCloseDialog}
              onDelete={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AppointmentHistory;
