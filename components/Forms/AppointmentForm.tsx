import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format, addHours, setHours, setMinutes, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';
import { CalendarIcon, Clock, PlusCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientForm } from './ClientForm';
import { TimeSlotSelector } from './TimeSlotSelector';

interface AppointmentFormProps {
  initialDate?: Date;
  initialEndTime?: Date;
  appointmentId?: string;
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Client {
  id: string;
  full_name: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  vehicle_category_id?: string | null;
}

interface Vehicle {
  id: string;
  model: string;
  vehicle_type: string;
}

export const AppointmentForm = ({ 
  initialDate, 
  initialEndTime,
  appointmentId,
  initialData,
  onSuccess,
  onCancel 
}: AppointmentFormProps) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleCategories, setVehicleCategories] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialData?.client_id || null);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedVehicleCategoryId, setSelectedVehicleCategoryId] = useState<string | null>(null);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: initialData || {
      status: 'confirmé',
      notes: '',
    }
  });

  const parseTimeString = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  };

  useEffect(() => {
    if (user) {
      fetchClients();
      fetchServices();
      fetchVehicleCategories();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClientId) {
      fetchVehicles(selectedClientId);
    } else {
      setVehicles([]);
    }
  }, [selectedClientId]);

  useEffect(() => {
    if (initialData) {
      setSelectedDate(new Date(initialData.appointment_date));
      setSelectedClientId(initialData.client_id);
      
      if (initialData.service_id) {
        const initService = services.find(s => s.id === initialData.service_id);
        if (initService) {
          setSelectedService(initService);
          if (initService.vehicle_category_id) {
            setSelectedVehicleCategoryId(initService.vehicle_category_id);
          }
        }
      }
    }
  }, [initialData, services]);

  useEffect(() => {
    if (selectedVehicleCategoryId) {
      const filtered = services.filter(service => 
        !service.vehicle_category_id || service.vehicle_category_id === selectedVehicleCategoryId
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(services);
    }
  }, [selectedVehicleCategoryId, services]);

  useEffect(() => {
    if (initialData && initialData.appointment_date) {
      const appointmentTime = format(new Date(initialData.appointment_date), 'HH:mm');
      setValue('time', appointmentTime);
    }
  }, [initialData, setValue]);

  const fetchClients = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, full_name')
        .eq('business_id', user.id);
        
      if (error) throw error;
      
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des clients.",
        variant: "destructive"
      });
    }
  };

  const fetchServices = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, duration, price, vehicle_category_id')
        .eq('business_id', user.id)
        .eq('is_active', true);
        
      if (error) throw error;
      
      setServices(data || []);
      setFilteredServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des services.",
        variant: "destructive"
      });
    }
  };

  const fetchVehicleCategories = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('vehicle_categories')
        .select('id, name')
        .eq('business_id', user.id);
        
      if (error) throw error;
      
      setVehicleCategories(data || []);
    } catch (error) {
      console.error('Error fetching vehicle categories:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les catégories de véhicules.",
        variant: "destructive"
      });
    }
  };

  const fetchVehicles = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, model, vehicle_type')
        .eq('client_id', clientId);
        
      if (error) throw error;
      
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les véhicules du client.",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: any) => {
    if (!user || !selectedClientId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const appointmentDateTime = new Date(selectedDate);
      const { hours, minutes } = parseTimeString(data.time);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      
      const appointmentData = {
        client_id: selectedClientId,
        service_id: data.service_id || null,
        appointment_date: appointmentDateTime.toISOString(),
        status: data.status,
        notes: data.notes,
        duration: selectedService?.duration || 60,
        vehicle_model: data.vehicle_model || null,
        vehicle_type: data.vehicle_type || null,
      };
      
      let result;
      
      if (appointmentId) {
        result = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', appointmentId);
      } else {
        result = await supabase
          .from('appointments')
          .insert([appointmentData]);
      }
      
      if (result.error) throw result.error;
      
      onSuccess();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le rendez-vous.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (serviceId: string) => {
    setValue('service_id', serviceId);
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service);
    }
  };

  const handleVehicleCategoryChange = (categoryId: string) => {
    setSelectedVehicleCategoryId(categoryId === "all_categories" ? null : categoryId);
    if (selectedService && selectedService.vehicle_category_id && selectedService.vehicle_category_id !== categoryId && categoryId !== "all_categories") {
      setSelectedService(null);
      setValue('service_id', '');
    }
  };

  const handleNewClientSuccess = () => {
    setIsClientFormOpen(false);
    fetchClients();
  };

  const formatTimeForInput = (timeString: string) => {
    return timeString; // Déjà au bon format HH:mm
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  value={selectedClientId || undefined}
                  onValueChange={(value) => setSelectedClientId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => setIsClientFormOpen(true)}
                title="Ajouter un nouveau client"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            {!selectedClientId && (
              <p className="text-sm text-red-500">Veuillez sélectionner un client</p>
            )}
          </div>
          
          {vehicleCategories.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="vehicleCategory">Type de véhicule</Label>
              <Select
                value={selectedVehicleCategoryId || "all_categories"}
                onValueChange={handleVehicleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type de véhicule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_categories">Tous les types</SelectItem>
                  {vehicleCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="service">Service</Label>
            <Select
              value={watch('service_id') || undefined}
              onValueChange={handleServiceChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un service" />
              </SelectTrigger>
              <SelectContent>
                {filteredServices.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} ({service.duration} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP', { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <input
              type="hidden"
              {...register('time', { required: true })}
            />
            
            <TimeSlotSelector
              selectedTime={watch('time') || ''}
              onChange={(time) => setValue('time', time, { shouldValidate: true })}
              startHour={8}
              endHour={20}
              intervalMinutes={15}
            />
            
            {errors.time && (
              <p className="text-sm text-red-500">Veuillez sélectionner une heure</p>
            )}
          </div>
          
          {vehicles.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="vehicle">Véhicule</Label>
              <Select
                defaultValue={initialData?.vehicle_id || undefined}
                onValueChange={(vehicleId) => {
                  const vehicle = vehicles.find(v => v.id === vehicleId);
                  if (vehicle) {
                    setValue('vehicle_model', vehicle.model);
                    setValue('vehicle_type', vehicle.vehicle_type);
                    
                    const matchingCategory = vehicleCategories.find(
                      cat => cat.name.toLowerCase() === vehicle.vehicle_type.toLowerCase()
                    );
                    if (matchingCategory) {
                      handleVehicleCategoryChange(matchingCategory.id);
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un véhicule" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.model} ({vehicle.vehicle_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              defaultValue={initialData?.status || "confirmé"}
              onValueChange={(value) => setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Statut du rendez-vous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmé">Confirmé</SelectItem>
                <SelectItem value="en attente">En attente</SelectItem>
                <SelectItem value="annulé">Annulé</SelectItem>
                <SelectItem value="reporté">Reporté</SelectItem>
                <SelectItem value="terminé">Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Notes supplémentaires..."
            {...register('notes')}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : appointmentId ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>

      <Dialog open={isClientFormOpen} onOpenChange={setIsClientFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau client</DialogTitle>
            <DialogDescription>
              Créez un nouveau client en remplissant le formulaire.
            </DialogDescription>
          </DialogHeader>
          
          <ClientForm 
            onSuccess={handleNewClientSuccess}
            onCancel={() => setIsClientFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
