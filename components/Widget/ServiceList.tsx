
import React from 'react';
import { Check, Clock } from 'lucide-react';
import { Service } from '@/types/booking';
import { useTheme } from '@/hooks/use-theme';

interface ServiceListProps {
  filteredServices: Service[];
  selectedService: string;
  setSelectedService: (id: string) => void;
  selectedVehicle: string;
}

const ServiceList: React.FC<ServiceListProps> = ({
  filteredServices,
  selectedService,
  setSelectedService,
  selectedVehicle,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  return (
    <div>
      <label className={`block text-xs md:text-sm font-medium mb-1.5 md:mb-2 ${
        isDark ? 'text-slate-300' : 'text-cardetail-gray'
      }`}>
        Service
      </label>
      <div className="space-y-1.5 md:space-y-2">
        {selectedVehicle ? (
          filteredServices.length > 0 ? (
            filteredServices.map(service => (
              <div 
                key={service.id}
                className={`p-2 md:p-3 border rounded-md cursor-pointer ${
                  selectedService === service.id 
                    ? isDark 
                      ? 'border-cardetail-blue bg-blue-900/30' 
                      : 'border-cardetail-blue bg-blue-50'
                    : isDark 
                      ? 'border-slate-700 bg-slate-800/50' 
                      : 'border-cardetail-lightgray'
                }`}
                onClick={() => setSelectedService(service.id)}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium text-xs md:text-sm uppercase truncate mr-2 ${
                    isDark ? 'text-slate-200' : 'text-black'
                  }`}>{service.name}</span>
                  
                  {selectedService === service.id && (
                    <div className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-cardetail-blue flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 md:h-4 md:w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="mt-1 md:mt-2 flex items-center justify-between">
                  <div className={`text-[10px] md:text-xs flex items-center ${
                    isDark ? 'text-slate-400' : 'text-cardetail-gray'
                  }`}>
                    <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
                    {service.duration} min
                  </div>
                  <div className={`text-[10px] md:text-xs ${
                    isDark ? 'text-slate-400' : 'text-cardetail-gray'
                  }`}>
                    <span>{service.price} €</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={`p-3 md:p-4 ${isDark ? 'bg-amber-900/20 text-amber-300' : 'bg-amber-50 text-amber-800'} rounded-md text-xs md:text-sm`}>
              Aucun service disponible pour ce type de véhicule
            </div>
          )
        ) : (
          <div className={`p-3 md:p-4 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-50 text-gray-500'} rounded-md text-xs md:text-sm`}>
            Veuillez d'abord sélectionner un type de véhicule
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceList;
