import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

interface VehicleCategory {
  id: string;
  name: string;
  description: string | null;
}

interface ServiceFormProps {
  initialData?: any;
  serviceId?: string;
  onSuccess: () => void;
  onCancel: () => void;
  vehicleCategories?: VehicleCategory[];
}

export const ServiceForm = ({ 
  initialData, 
  serviceId,
  onSuccess, 
  onCancel,
  vehicleCategories = []
}: ServiceFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.is_active !== false);
  const [category, setCategory] = useState(initialData?.category || 'exterieur');
  const [vehicleCategoryId, setVehicleCategoryId] = useState(initialData?.vehicle_category_id || 'no_category');
  const [availableVehicleCategories, setAvailableVehicleCategories] = useState<VehicleCategory[]>([]);
  const isMobile = useIsMobile();

  console.log('ServiceForm initialData:', initialData);
  console.log('Provided vehicle categories:', vehicleCategories);

  // S'assurer que les catégories de véhicules sont correctement chargées
  useEffect(() => {
    // Si des catégories sont fournies via les props, les utiliser
    if (vehicleCategories && vehicleCategories.length > 0) {
      console.log('Using provided vehicle categories:', vehicleCategories);
      setAvailableVehicleCategories(vehicleCategories);
      
      // Vérifier si la catégorie initiale existe dans les catégories disponibles
      if (initialData?.vehicle_category_id) {
        const categoryExists = vehicleCategories.some(cat => cat.id === initialData.vehicle_category_id);
        if (!categoryExists) {
          console.log('Initial vehicle category not found in provided categories, setting to no_category');
          setVehicleCategoryId('no_category');
        } else {
          console.log('Initial vehicle category found in provided categories:', initialData.vehicle_category_id);
          setVehicleCategoryId(initialData.vehicle_category_id);
        }
      }
    } else {
      // Sinon, récupérer les catégories depuis Supabase
      fetchVehicleCategories();
    }
  }, [vehicleCategories, initialData]);

  const fetchVehicleCategories = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching vehicle categories from database for business_id:', user.id);
      const { data, error } = await supabase
        .from('vehicle_categories')
        .select('*')
        .eq('business_id', user.id)
        .order('name');

      if (error) {
        console.error('Error fetching vehicle categories:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les catégories de véhicules.",
          variant: "destructive"
        });
        return;
      }

      console.log('Fetched vehicle categories successfully:', data);
      if (data && data.length > 0) {
        setAvailableVehicleCategories(data);
        
        // Vérifier si la catégorie initiale existe dans les catégories récupérées
        if (initialData?.vehicle_category_id) {
          const categoryExists = data.some(cat => cat.id === initialData.vehicle_category_id);
          if (!categoryExists) {
            console.log('Initial vehicle category not found in fetched categories, setting to no_category');
            setVehicleCategoryId('no_category');
          } else {
            console.log('Initial vehicle category found in fetched categories:', initialData.vehicle_category_id);
            setVehicleCategoryId(initialData.vehicle_category_id);
          }
        }
      } else {
        console.log('No vehicle categories found in database for this business');
      }
    } catch (error) {
      console.error('Error in fetchVehicleCategories:', error);
    }
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData ? {
      name: initialData.name || '',
      description: initialData.description || '',
      price: initialData.price || '',
      duration: initialData.duration || 60,
    } : {
      name: '',
      description: '',
      price: '',
      duration: 60,
    }
  });

  const onSubmit = async (data: any) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Prepare service data, removing any properties that shouldn't be sent to the database
      const serviceData = {
        name: data.name,
        description: data.description,
        business_id: user.id,
        is_active: isActive,
        category: category,
        vehicle_category_id: vehicleCategoryId === 'no_category' ? null : vehicleCategoryId,
        price: parseFloat(data.price),
        duration: parseInt(data.duration),
      };
      
      // Debug
      console.log('Saving service data:', serviceData);
      
      let result;
      
      if (serviceId) {
        // Update existing service
        result = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', serviceId);
      } else {
        // Create new service
        result = await supabase
          .from('services')
          .insert([serviceData]);
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: serviceId ? "Service mis à jour" : "Service créé",
        description: serviceId 
          ? "Les informations du service ont été mises à jour avec succès." 
          : "Le nouveau service a été créé avec succès.",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le service.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Vérifions si nous avons bien des catégories de véhicules disponibles
  useEffect(() => {
    console.log('Current available vehicle categories:', availableVehicleCategories);
    console.log('Current selected vehicle category ID:', vehicleCategoryId);
  }, [availableVehicleCategories, vehicleCategoryId]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du service</Label>
          <Input
            id="name"
            {...register('name', { required: true })}
            className="w-full"
          />
          {errors.name && (
            <p className="text-sm text-red-500">Le nom du service est requis</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Prix (€)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register('price', { required: true, min: 0 })}
              className="w-full"
            />
            {errors.price && (
              <p className="text-sm text-red-500">Le prix est requis et doit être positif</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Durée (minutes)</Label>
            <Input
              id="duration"
              type="number"
              {...register('duration', { required: true, min: 15 })}
              className="w-full"
            />
            {errors.duration && (
              <p className="text-sm text-red-500">La durée est requise et doit être d'au moins 15 minutes</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Catégorie</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="Sélectionnez une catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="interieur">Intérieur</SelectItem>
            <SelectItem value="exterieur">Extérieur</SelectItem>
            <SelectItem value="complet">Complet</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="vehicleCategory">Type de véhicule</Label>
        <Select 
          value={vehicleCategoryId} 
          onValueChange={setVehicleCategoryId}
        >
          <SelectTrigger id="vehicleCategory" className="w-full">
            <SelectValue placeholder="Sélectionnez un type de véhicule (optionnel)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no_category">Tous les types de véhicules</SelectItem>
            {availableVehicleCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Si sélectionné, ce service ne sera disponible que pour ce type de véhicule
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Description du service..."
          {...register('description')}
          rows={3}
          className="w-full resize-none"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="is_active" 
          checked={isActive} 
          onCheckedChange={setIsActive}
        />
        <Label htmlFor="is_active">Service actif</Label>
      </div>
      
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Annuler
        </Button>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? 'Enregistrement...' : serviceId ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};
