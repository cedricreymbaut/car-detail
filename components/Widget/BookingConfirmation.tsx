
import React from 'react';
import { CheckCircle2, Calendar, Clock, Car, MessageSquare } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

interface BookingConfirmationProps {
  selectedService: string;
  selectedVehicle: string;
  vehicleModel: string;
  selectedDate: string;
  selectedTime: string;
  clientEmail: string;
  clientNotes?: string;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  selectedService,
  selectedVehicle,
  vehicleModel,
  selectedDate,
  selectedTime,
  clientEmail,
  clientNotes
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
      </div>
      
      <h2 className="font-bold text-xl mb-2">Réservation confirmée !</h2>
      <p className="text-cardetail-gray mb-6">
        Un email de confirmation a été envoyé à {clientEmail}
      </p>
      
      <div className={`${isDark ? 'bg-slate-700/50' : 'bg-gray-50'} rounded-lg p-5 text-left mb-6`}>
        <h3 className="font-semibold mb-3">Détails de la réservation :</h3>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <div className={`${isDark ? 'bg-slate-600' : 'bg-white'} rounded-full p-1.5 mr-3`}>
              <Calendar className="h-5 w-5 text-cardetail-blue" />
            </div>
            <div>
              <p className="font-medium">Date et heure</p>
              <p className="text-cardetail-gray">{selectedDate} à {selectedTime}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className={`${isDark ? 'bg-slate-600' : 'bg-white'} rounded-full p-1.5 mr-3`}>
              <Clock className="h-5 w-5 text-cardetail-blue" />
            </div>
            <div>
              <p className="font-medium">Service</p>
              <p className="text-cardetail-gray">{selectedService}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className={`${isDark ? 'bg-slate-600' : 'bg-white'} rounded-full p-1.5 mr-3`}>
              <Car className="h-5 w-5 text-cardetail-blue" />
            </div>
            <div>
              <p className="font-medium">Véhicule</p>
              <p className="text-cardetail-gray">{selectedVehicle}</p>
              {vehicleModel && (
                <p className="text-cardetail-gray">Modèle: {vehicleModel}</p>
              )}
            </div>
          </div>
          
          {clientNotes && (
            <div className="flex items-start">
              <div className={`${isDark ? 'bg-slate-600' : 'bg-white'} rounded-full p-1.5 mr-3`}>
                <MessageSquare className="h-5 w-5 text-cardetail-blue" />
              </div>
              <div>
                <p className="font-medium">Message supplémentaire</p>
                <p className="text-cardetail-gray">{clientNotes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-sm text-cardetail-gray">
        Vous recevrez un rappel 24h avant votre rendez-vous.
        <br />Si vous avez des questions, n'hésitez pas à nous contacter.
      </p>
    </div>
  );
};

export default BookingConfirmation;
