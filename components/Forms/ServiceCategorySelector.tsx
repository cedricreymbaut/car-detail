
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ServiceCategory = 'all' | 'interieur' | 'exterieur' | 'complet' | 'by-vehicle' | 'inactive';

interface ServiceCategorySelectorProps {
  activeTab: ServiceCategory;
  setActiveTab: (tab: ServiceCategory) => void;
}

const getCategoryLabel = (category: ServiceCategory): string => {
  switch (category) {
    case 'all':
      return 'Tous';
    case 'interieur':
      return 'Intérieur';
    case 'exterieur':
      return 'Extérieur';
    case 'complet':
      return 'Complet';
    case 'by-vehicle':
      return 'Par véhicule';
    case 'inactive':
      return 'Inactifs';
    default:
      return 'Tous';
  }
};

export const ServiceCategorySelector: React.FC<ServiceCategorySelectorProps> = ({ 
  activeTab, 
  setActiveTab 
}) => {
  const isMobile = useIsMobile();
  
  // List of all available tabs
  const availableTabs: ServiceCategory[] = [
    'all', 'interieur', 'exterieur', 'complet', 'by-vehicle', 'inactive'
  ];

  if (isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center justify-between w-full px-4 py-2 text-sm border rounded-md bg-background">
          <span>{getCategoryLabel(activeTab)}</span>
          <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[200px]">
          {availableTabs.map((tab) => (
            <DropdownMenuItem 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? "bg-accent text-accent-foreground" : ""}
            >
              {getCategoryLabel(tab)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ServiceCategory)} className="w-full">
      <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
        <TabsTrigger value="all" className="text-xs sm:text-sm">Tous</TabsTrigger>
        <TabsTrigger value="interieur" className="text-xs sm:text-sm">Intérieur</TabsTrigger>
        <TabsTrigger value="exterieur" className="text-xs sm:text-sm">Extérieur</TabsTrigger>
        <TabsTrigger value="complet" className="text-xs sm:text-sm">Complet</TabsTrigger>
        <TabsTrigger value="by-vehicle" className="text-xs sm:text-sm">Par véhicule</TabsTrigger>
        <TabsTrigger value="inactive" className="text-xs sm:text-sm">Inactifs</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
