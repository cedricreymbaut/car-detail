
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useWidgetBookings, useProcessWidgetBooking } from '@/hooks/use-widget-bookings';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, CheckCheck, Clock, Eye, Info, Mail, MessageSquare, Phone, User } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WidgetBookingDetailsDialog } from './WidgetBookingDetailsDialog';
import type { WidgetBooking } from '@/hooks/use-widget-bookings';

export function WidgetBookingsList() {
  const { data: bookings, isLoading, error, refetch } = useWidgetBookings();
  const { processBooking, isProcessing } = useProcessWidgetBooking();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [selectedBooking, setSelectedBooking] = useState<WidgetBooking | null>(null);
  
  const handleProcessBooking = async (bookingId: string) => {
    const result = await processBooking(bookingId);
    if (result) {
      // Refetch both widget bookings and appointments
      queryClient.invalidateQueries({ queryKey: ['widget-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  };
  
  const renderStatus = (status: string) => {
    switch (status) {
      case 'confirmé':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmé</Badge>;
      case 'annulé':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Annulé</Badge>;
      case 'reporté':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Reporté</Badge>;
      case 'terminé':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Terminé</Badge>;
      case 'en attente':
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">En attente</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Erreur lors du chargement des réservations widget.
      </div>
    );
  }
  
  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-700">Aucune réservation en ligne</h3>
        <p className="text-gray-500 max-w-sm mx-auto mt-1">
          Toutes les demandes de réservation via le widget s'afficheront ici.
        </p>
      </div>
    );
  }
  
  // Only show unprocessed bookings
  const pendingBookings = bookings.filter(booking => !booking.processed);
  
  if (pendingBookings.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <CheckCheck className="h-12 w-12 text-green-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-700">Toutes les réservations ont été traitées</h3>
        <p className="text-gray-500 max-w-sm mx-auto mt-1">
          Aucune réservation en attente de traitement.
        </p>
      </div>
    );
  }
  
  // Mobile view: card-based layout with simplified information
  if (isMobile) {
    return (
      <div className="space-y-4">
        {pendingBookings.map((booking) => {
          const appointmentDate = parseISO(booking.appointment_date);
          
          return (
            <div key={booking.id} className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium text-base">{booking.client_name}</div>
                  <div className="text-sm">{booking.service_name}</div>
                </div>
                <div>{renderStatus(booking.status)}</div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-xs">
                  <Calendar className="h-3 w-3 mr-1 text-gray-500 flex-shrink-0" />
                  {format(appointmentDate, 'd MMMM yyyy', { locale: fr })}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                  {format(appointmentDate, 'HH:mm')}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Détails
                </Button>
                <Button
                  onClick={() => handleProcessBooking(booking.id)}
                  size="sm"
                  disabled={isProcessing}
                  className="flex-1 bg-cardetail-blue hover:bg-cardetail-blue/90"
                >
                  {isProcessing ? (
                    <>
                      <span className="h-3 w-3 mr-1 animate-spin inline-block border-2 border-current border-t-transparent rounded-full" />
                      Traitement...
                    </>
                  ) : (
                    'Confirmer'
                  )}
                </Button>
              </div>
            </div>
          );
        })}
        
        {selectedBooking && (
          <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
            <DialogContent className="max-w-md w-full p-0">
              <WidgetBookingDetailsDialog 
                booking={selectedBooking} 
                onClose={() => setSelectedBooking(null)} 
                onConfirm={() => {
                  handleProcessBooking(selectedBooking.id);
                  setSelectedBooking(null);
                }}
                isProcessing={isProcessing}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }
  
  // Desktop view: simplified table layout with modal for details
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingBookings.map((booking) => {
            const appointmentDate = parseISO(booking.appointment_date);
            
            return (
              <TableRow key={booking.id}>
                <TableCell>
                  <div className="font-medium">{booking.client_name}</div>
                  <div className="text-xs text-gray-500">{booking.client_email}</div>
                </TableCell>
                <TableCell>{booking.service_name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                    {format(appointmentDate, 'd MMM yyyy', { locale: fr })}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {format(appointmentDate, 'HH:mm')}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Détails
                    </Button>
                    <Button
                      onClick={() => handleProcessBooking(booking.id)}
                      size="sm"
                      disabled={isProcessing}
                      className="bg-cardetail-blue hover:bg-cardetail-blue/90"
                    >
                      {isProcessing ? (
                        <>
                          <span className="h-3 w-3 mr-1 animate-spin inline-block border-2 border-current border-t-transparent rounded-full" />
                          Traitement...
                        </>
                      ) : (
                        'Confirmer'
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-lg w-full">
            <WidgetBookingDetailsDialog 
              booking={selectedBooking} 
              onClose={() => setSelectedBooking(null)} 
              onConfirm={() => {
                handleProcessBooking(selectedBooking.id);
                setSelectedBooking(null);
              }}
              isProcessing={isProcessing}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
