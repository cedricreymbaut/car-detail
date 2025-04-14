
import React from 'react';
import { FileText, CircleDot } from 'lucide-react';
import { Service } from '@/types/booking';
import { useTheme } from '@/hooks/use-theme';

interface ServiceDetailsProps {
  selectedService: Service | null;
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({ selectedService }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // Parse description into bullet points
  const getBulletPoints = (description: string | undefined): string[] => {
    if (!description) return [];
    
    // Split by period, newline, or bullet character and filter out empty strings
    return description
      .split(/\.|•|\n/)
      .map(item => item.trim())
      .filter(Boolean);
  };

  if (!selectedService) return null;

  return (
    <div className={`border rounded-md p-3 md:p-4 mt-3 md:mt-4 ${
      isDark ? 'border-slate-700 bg-slate-800/50' : 'border-cardetail-lightgray'
    }`}>
      <div className="flex items-center text-cardetail-blue mb-2 md:mb-3">
        <FileText className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2" />
        <h3 className="font-semibold text-sm md:text-base">Détails du service</h3>
      </div>
      
      <h4 className={`font-medium text-sm md:text-lg uppercase mb-2 md:mb-3 ${
        isDark ? 'text-slate-200' : ''
      }`}>{selectedService.name}</h4>
      
      {/* Enhanced list of service items with more attractive bullet points */}
      <div className="space-y-2 md:space-y-2.5 mb-3 md:mb-4">
        {selectedService.description ? 
          getBulletPoints(selectedService.description).map((item, index) => (
            <div key={index} className="flex items-start">
              <CircleDot className="h-4 w-4 md:h-4 md:w-4 mr-2 md:mr-2.5 mt-0.5 text-cardetail-bullet flex-shrink-0" />
              <span className={`text-xs md:text-sm leading-tight ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}>{item}</span>
            </div>
          ))
        : 
          <p className={`text-xs md:text-sm italic ${
            isDark ? 'text-slate-500' : 'text-gray-400'
          }`}>Aucune description disponible</p>
        }
      </div>
      
      <div className={`flex justify-between mt-3 md:mt-4 pt-2 border-t ${
        isDark ? 'border-slate-700' : 'border-gray-100'
      }`}>
        <div>
          <span className={`block text-[10px] md:text-xs ${
            isDark ? 'text-slate-400' : 'text-gray-500'
          }`}>Durée</span>
          <span className={`font-medium text-xs md:text-sm ${
            isDark ? 'text-slate-200' : 'text-cardetail-black'
          }`}>{selectedService.duration} min</span>
        </div>
        <div>
          <span className={`block text-[10px] md:text-xs ${
            isDark ? 'text-slate-400' : 'text-gray-500'
          }`}>Prix</span>
          <span className={`font-medium text-xs md:text-sm ${
            isDark ? 'text-slate-200' : 'text-cardetail-black'
          }`}>{selectedService.price} €</span>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
