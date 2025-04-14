import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { 
  PlusCircle, 
  Trash2, 
  Car, 
  Bike, 
  Truck, 
  Bus, 
  Tractor, 
  CableCar, 
  UtensilsCrossed, 
  Sailboat
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ClientFormProps {
  initialData?: any;
  clientId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Vehicle {
  id?: string;
  model: string;
  vehicle_type: string;
  year?: number;
}

const vehicleTypes = [
  "Citadine",
  "Berline",
  "SUV",
  "Monospace",
  "Break",
  "Coupé",
  "Cabriolet",
  "Pick-up",
  "4x4",
  "Utilitaire",
  "Camion",
  "Moto",
  "Autre"
];

export const ClientForm = ({ 
  initialData, 
  clientId,
  onSuccess, 
  onCancel 
}: ClientFormProps) => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: initialData || {
      full_name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    }
  });

  useEffect(() => {
    if (initialData?.vehicles) {
      setVehicles(initialData.vehicles);
    } else {
      setVehicles([]);
    }
  }, [initialData]);

  const addVehicle = () => {
    setVehicles([...vehicles, { model: '', vehicle_type: '', year: undefined }]);
  };

  const updateVehicle = (index: number, field: keyof Vehicle, value: string | number) => {
    const updatedVehicles = [...vehicles];
    updatedVehicles[index] = { ...updatedVehicles[index], [field]: value };
    setVehicles(updatedVehicles);
  };

  const removeVehicle = (index: number) => {
    const updatedVehicles = [...vehicles];
    updatedVehicles.splice(index, 1);
    setVehicles(updatedVehicles);
  };

  const onSubmit = async (data: any) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const clientData = {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
        business_id: user.id,
      };
      
      let clientResult;
      let newClientId = clientId;
      
      if (clientId) {
        clientResult = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', clientId);
      } else {
        clientResult = await supabase
          .from('clients')
          .insert([clientData])
          .select();
          
        if (clientResult.data && clientResult.data.length > 0) {
          newClientId = clientResult.data[0].id;
        }
      }
      
      if (clientResult.error) throw clientResult.error;
      
      if (newClientId && vehicles.length > 0) {
        let existingVehicleIds: string[] = [];
        
        if (clientId) {
          const { data: existingVehicles } = await supabase
            .from('vehicles')
            .select('id')
            .eq('client_id', clientId);
            
          existingVehicleIds = existingVehicles?.map(v => v.id) || [];
        }
        
        for (let i = 0; i < vehicles.length; i++) {
          const vehicle = vehicles[i];
          
          if (!vehicle.model || !vehicle.vehicle_type) continue;
          
          const vehicleData = {
            client_id: newClientId,
            model: vehicle.model,
            vehicle_type: vehicle.vehicle_type,
            year: vehicle.year && !isNaN(Number(vehicle.year)) ? Number(vehicle.year) : null,
          };
          
          if (vehicle.id) {
            await supabase
              .from('vehicles')
              .update(vehicleData)
              .eq('id', vehicle.id);
          } else if (i < existingVehicleIds.length) {
            await supabase
              .from('vehicles')
              .update(vehicleData)
              .eq('id', existingVehicleIds[i]);
          } else {
            await supabase
              .from('vehicles')
              .insert([vehicleData]);
          }
        }
        
        if (clientId && existingVehicleIds.length > vehicles.length) {
          const vehiclesToDelete = existingVehicleIds.slice(vehicles.length);
          
          if (vehiclesToDelete.length > 0) {
            await supabase
              .from('vehicles')
              .delete()
              .in('id', vehiclesToDelete);
          }
        }
      }
      
      toast({
        title: clientId ? "Client mis à jour" : "Client créé",
        description: clientId 
          ? "Les informations du client ont été mises à jour avec succès." 
          : "Le nouveau client a été créé avec succès.",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le client.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getVehicleIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    
    switch (lowerType) {
      case 'moto':
        return <Bike className="h-4 w-4 mr-2 text-muted-foreground" />;
      case 'camion':
        return <Truck className="h-4 w-4 mr-2 text-muted-foreground" />;
      case 'utilitaire':
        return <Truck className="h-4 w-4 mr-2 text-muted-foreground" />;
      case 'monospace':
        return <Bus className="h-4 w-4 mr-2 text-muted-foreground" />;
      case 'pick-up':
        return <Truck className="h-4 w-4 mr-2 text-muted-foreground" />;
      case '4x4':
        return <Car className="h-4 w-4 mr-2 text-muted-foreground" />;
      case 'suv':
        return <Car className="h-4 w-4 mr-2 text-muted-foreground" />;
      case 'cabriolet':
        return <Sailboat className="h-4 w-4 mr-2 text-muted-foreground" />;
      case 'break':
        return <CableCar className="h-4 w-4 mr-2 text-muted-foreground" />;
      case 'autre':
        return <UtensilsCrossed className="h-4 w-4 mr-2 text-muted-foreground" />;
      default:
        return <Car className="h-4 w-4 mr-2 text-muted-foreground" />;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nom complet</Label>
          <Input
            id="full_name"
            {...register('full_name', { required: true })}
          />
          {errors.full_name && (
            <p className="text-sm text-red-500">Le nom est requis</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            {...register('phone')}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            {...register('address')}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Notes additionnelles..."
          {...register('notes')}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Véhicules</Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={addVehicle}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Ajouter un véhicule
          </Button>
        </div>
        
        {vehicles.map((vehicle, index) => (
          <div key={index} className="border p-3 rounded-md space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor={`vehicle-model-${index}`}>Modèle</Label>
                <Input
                  id={`vehicle-model-${index}`}
                  value={vehicle.model}
                  onChange={(e) => updateVehicle(index, 'model', e.target.value)}
                  placeholder="ex: Peugeot 208"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor={`vehicle-type-${index}`}>Type</Label>
                <Select
                  value={vehicle.vehicle_type}
                  onValueChange={(value) => updateVehicle(index, 'vehicle_type', value)}
                >
                  <SelectTrigger id={`vehicle-type-${index}`} className="w-full">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        <span className="flex items-center">
                          {getVehicleIcon(type)}
                          {type}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor={`vehicle-year-${index}`}>Année</Label>
                <Input
                  id={`vehicle-year-${index}`}
                  type="number"
                  value={vehicle.year || ''}
                  onChange={(e) => updateVehicle(index, 'year', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="ex: 2022"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => removeVehicle(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : clientId ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};
