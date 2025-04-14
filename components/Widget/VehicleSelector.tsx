
import React from 'react';
import { Car, Bike, Truck, Check } from 'lucide-react';
import { VehicleCategory } from '@/types/booking';
import { useTheme } from '@/hooks/use-theme';

interface VehicleSelectorProps {
  availableVehicleCategories: VehicleCategory[];
  selectedVehicle: string;
  setSelectedVehicle: (id: string) => void;
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  availableVehicleCategories,
  selectedVehicle,
  setSelectedVehicle,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // Get the icon based on vehicle type
  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType.toLowerCase()) {
      case 'moto':
      case 'motorcycle':
        return <Bike className="h-4 w-4 mr-1.5 text-cardetail-gray" />;
      case 'suv':
      case 'suv/4x4':
      case 'truck':
        return <Truck className="h-4 w-4 mr-1.5 text-cardetail-gray" />;
      default:
        return <Car className="h-4 w-4 mr-1.5 text-cardetail-gray" />;
    }
  };

  return (
    <div className="mb-3 md:mb-4">
      <label className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
        isDark ? 'text-slate-300' : 'text-cardetail-gray'
      }`}>
        Type de véhicule
      </label>
      <div className="grid grid-cols-2 gap-1.5 md:gap-2 mb-3 md:mb-4">
        {availableVehicleCategories && availableVehicleCategories.length > 0 ? (
          availableVehicleCategories.map((category) => (
            <div 
              key={category.id}
              className={`p-2 md:p-3 border rounded-md cursor-pointer flex items-center ${
                selectedVehicle === category.id 
                  ? isDark 
                    ? 'border-cardetail-blue bg-blue-900/30' 
                    : 'border-cardetail-blue bg-blue-50'
                  : isDark 
                    ? 'border-slate-700 bg-slate-800/50' 
                    : 'border-cardetail-lightgray'
              }`}
              onClick={() => setSelectedVehicle(category.id)}
            >
              {getVehicleIcon(category.name)}
              <span className={`text-xs md:text-sm truncate ${isDark ? 'text-slate-300' : ''}`}>{category.name}</span>
              {selectedVehicle === category.id && (
                <div className="h-4 w-4 md:h-5 md:w-5 rounded-full bg-cardetail-blue flex items-center justify-center ml-auto flex-shrink-0">
                  <Check className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={`col-span-2 p-3 md:p-4 ${isDark ? 'bg-amber-900/20 text-amber-300' : 'bg-amber-50 text-amber-800'} rounded-md text-xs md:text-sm`}>
            Aucune catégorie de véhicule disponible
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleSelector;
