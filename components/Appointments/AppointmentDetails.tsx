
import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
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
} from "@/components/ui/alert-dialog";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Car,
  AlertCircle,
  Edit,
  Trash,
  ClipboardList
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AppointmentForm } from '../Forms/AppointmentForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppointmentDetailsProps {
  appointment: {
    id: string;
    client: string;
    client_id: string;
    service: string;
    service_id: string | null;
    start: Date;
    end: Date;
    vehicle: string;
    status: 'confirmé' | 'annulé' | 'reporté' | 'terminé' | 'en attente';
    notes: string | null;
  };
  onUpdate: () => void;
  onDelete: () => void;
}

export const AppointmentDetails = ({ appointment, onUpdate, onDelete }: AppointmentDetailsProps) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMobile = useIsMobile();

  const getStatusBadgeVariant = () => {
    switch (appointment.status) {
      case 'confirmé': return "success";
      case 'annulé': return "destructive";
      case 'reporté': return "warning";
      case 'terminé': return "default";
      case 'en attente': return "secondary";
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointment.id);
        
      if (error) throw error;
      
      onDelete();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le rendez-vous.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (showEditForm) {
    return (
      <AppointmentForm
        appointmentId={appointment.id}
        initialDate={appointment.start}
        initialEndTime={appointment.end}
        initialData={{
          client_id: appointment.client_id,
          service_id: appointment.service_id,
          status: appointment.status,
          notes: appointment.notes,
          appointment_date: appointment.start.toISOString(),
        }}
        onSuccess={onUpdate}
        onCancel={() => setShowEditForm(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <h3 className="text-base md:text-lg font-semibold">{appointment.service}</h3>
          <Badge variant={getStatusBadgeVariant() as any}>{appointment.status}</Badge>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            onClick={() => setShowEditForm(true)}
            className="text-xs md:text-sm"
          >
            <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            Modifier
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size={isMobile ? "sm" : "default"}
                className="text-xs md:text-sm"
              >
                <Trash className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action ne peut pas être annulée. Le rendez-vous sera définitivement supprimé.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Suppression...' : 'Supprimer'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm md:text-base">{appointment.client}</span>
          </div>
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm md:text-base">{format(appointment.start, 'PPP', { locale: fr })}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm md:text-base">
              {format(appointment.start, 'HH:mm')} - {format(appointment.end, 'HH:mm')} 
              ({Math.round((appointment.end.getTime() - appointment.start.getTime()) / 60000)} minutes)
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <Car className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm md:text-base">{appointment.vehicle}</span>
          </div>
          {appointment.notes && (
            <div className="flex items-start">
              <ClipboardList className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
              <span className="text-xs md:text-sm">{appointment.notes}</span>
            </div>
          )}
        </div>
      </div>

      {appointment.status === 'annulé' && (
        <div className="bg-destructive/10 p-2 md:p-3 rounded-md flex items-start">
          <AlertCircle className="h-4 w-4 md:h-5 md:w-5 mr-2 text-destructive" />
          <p className="text-xs md:text-sm">Ce rendez-vous a été annulé.</p>
        </div>
      )}
    </div>
  );
};
