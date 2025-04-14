
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Service, VehicleCategory } from '@/types/booking';
import { useIsMobile } from '@/hooks/use-mobile';
import { useServiceFilter } from '@/hooks/use-service-filter';
import VehicleSelector from './VehicleSelector';
import ServiceList from './ServiceList';
import ServiceDetails from './ServiceDetails';

interface ServiceSelectionProps {
  services: Service[];
  vehicleCategories: VehicleCategory[];
  selectedService: string;
  setSelectedService: (id: string) => void;
  selectedVehicle: string;
  setSelectedVehicle: (id: string) => void;
  nextStep: () => void;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  services,
  vehicleCategories,
  selectedService,
  setSelectedService,
  selectedVehicle,
  setSelectedVehicle,
  nextStep
}) => {
  const isMobile = useIsMobile();
  
  // Pass vehicle categories to our custom hook for service filtering logic
  const { filteredServices, selectedServiceDetails } = useServiceFilter(
    services,
    vehicleCategories,
    selectedVehicle,
    selectedService,
    setSelectedService
  );
  
  console.log("ServiceSelection rendered with vehicle categories:", vehicleCategories);
  console.log("Current services:", services);

  return (
    <div>
      <h2 className="font-bold text-base md:text-lg mb-3 md:mb-4">Sélectionnez un type de véhicule et un service</h2>
      
      <VehicleSelector 
        availableVehicleCategories={vehicleCategories}
        selectedVehicle={selectedVehicle}
        setSelectedVehicle={setSelectedVehicle}
      />
      
      <ServiceList 
        filteredServices={filteredServices}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        selectedVehicle={selectedVehicle}
      />

      {/* Service description section */}
      {selectedServiceDetails && (
        <ServiceDetails selectedService={selectedServiceDetails} />
      )}
      
      <div className="mt-4 md:mt-6">
        <button 
          className="btn-primary w-full flex items-center justify-center text-sm md:text-base"
          disabled={!selectedService || !selectedVehicle}
          onClick={nextStep}
        >
          Continuer
          <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default ServiceSelection;
