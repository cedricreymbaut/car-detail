
import React from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Appointment } from '@/hooks/use-appointments';

interface AppointmentDesktopTableProps {
  appointments: Appointment[];
  onViewDetails: (appointment: Appointment) => void;
}

const AppointmentDesktopTable = ({ appointments, onViewDetails }: AppointmentDesktopTableProps) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Heure</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Véhicule</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => {
            const appointmentDate = parseISO(appointment.appointment_date);
            return (
              <TableRow key={appointment.id}>
                <TableCell>{format(appointmentDate, 'd MMM yyyy', { locale: fr })}</TableCell>
                <TableCell>{format(appointmentDate, 'HH:mm')}</TableCell>
                <TableCell>{appointment.client_name}</TableCell>
                <TableCell>{appointment.service_name}</TableCell>
                <TableCell>{appointment.vehicle_model || 'Non précisé'}</TableCell>
                <TableCell><StatusBadge status={appointment.status as any} /></TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(appointment)}
                  >
                    Voir détails
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppointmentDesktopTable;
