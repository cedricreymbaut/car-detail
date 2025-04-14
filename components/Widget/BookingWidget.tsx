
import React, { useState, useEffect } from 'react';
import ServiceSelection from './ServiceSelection';
import DateTimeSelection from './DateTimeSelection';
import ClientInfoForm from './ClientInfoForm';
import BookingConfirmation from './BookingConfirmation';
import BookingSteps from './BookingSteps';
import { useWidgetServices } from '@/hooks/use-widget-services';
import { useWidgetBusinessHours } from '@/hooks/use-widget-business-hours';
import { useWidgetSettings } from '@/hooks/use-widget-settings';
import { useTimeSlots } from '@/hooks/use-time-slots';
import { submitBooking } from '@/services/booking-service';
import { ClientInfo } from '@/types/booking';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/hooks/use-theme';

interface BookingWidgetProps {
  businessId: string | null;
}

const BookingWidget: React.FC<BookingWidgetProps> = ({ businessId }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: '',
    email: '',
    phone: '',
    notes: '',
    vehicle: ''
  });

  // Custom hooks
  const { services, vehicleCategories } = useWidgetServices(businessId);
  const { businessHours, specialDays, availableDates } = useWidgetBusinessHours(businessId);
  const { widgetSettings } = useWidgetSettings(businessId);
  const { availableTimes, loading: timeSlotsLoading, error: timeSlotsError } = useTimeSlots(
    selectedDate, 
    businessHours, 
    specialDays,
    businessId,
    selectedService,
    services
  );
  
  // Fetch business name when the component mounts
  useEffect(() => {
    const fetchBusinessName = async () => {
      if (!businessId) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('business_name')
          .eq('id', businessId)
          .single();
          
        if (error) {
          console.error('Error fetching business name:', error);
          return;
        }
        
        if (data && data.business_name) {
          setBusinessName(data.business_name);
        }
      } catch (err) {
        console.error('Error fetching business information:', err);
      }
    };
    
    fetchBusinessName();
  }, [businessId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClientInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const nextStep = () => {
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await submitBooking(
        businessId,
        selectedService,
        selectedVehicle,
        clientInfo.vehicle, // Utilisation du champ vehicle de clientInfo
        selectedDate,
        selectedTime,
        clientInfo,
        services,
        vehicleCategories
      );
      nextStep();
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Une erreur est survenue lors de la réservation');
    } finally {
      setLoading(false);
    }
  };
  
  // Create a dynamic title with the business name if available
  const displayTitle = businessName 
    ? `Réservation ${businessName}` 
    : widgetSettings.displayTitle;
  
  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="text-center mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>{displayTitle}</h1>
        <p className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{widgetSettings.displaySubtitle}</p>
      </div>
      
      <BookingSteps currentStep={step} themeColor={widgetSettings.themeColor} />
      
      <div className={`rounded-lg shadow border p-4 md:p-6 ${
        isDark 
          ? 'bg-slate-800 border-slate-700 text-slate-100' 
          : 'bg-white border-gray-200 text-gray-800'
      }`}>
        {error && (
          <div className={`${
            isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-500'
          } p-3 rounded-md mb-4`}>
            {error}
          </div>
        )}
        
        {step === 1 && (
          <ServiceSelection 
            services={services}
            vehicleCategories={vehicleCategories}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
            nextStep={nextStep}
          />
        )}
        
        {step === 2 && (
          <DateTimeSelection 
            availableDates={availableDates}
            availableTimes={availableTimes}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            prevStep={prevStep}
            nextStep={nextStep}
            timeSlotsLoading={timeSlotsLoading}
            timeSlotsError={timeSlotsError}
          />
        )}
        
        {step === 3 && (
          <ClientInfoForm 
            clientInfo={clientInfo}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            prevStep={prevStep}
            isLoading={loading}
          />
        )}
        
        {step === 4 && (
          <BookingConfirmation 
            selectedService={services.find(s => s.id === selectedService)?.name || ''}
            selectedVehicle={vehicleCategories.find(v => v.id === selectedVehicle)?.name || ''}
            vehicleModel={clientInfo.vehicle}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            clientEmail={clientInfo.email}
            clientNotes={clientInfo.notes}
          />
        )}
      </div>
    </div>
  );
};

export default BookingWidget;
