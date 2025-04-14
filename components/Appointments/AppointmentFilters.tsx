
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AppointmentFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  isMobile: boolean;
}

const AppointmentFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter,
  isMobile
}: AppointmentFiltersProps) => {
  if (isMobile) {
    return (
      <div className="flex flex-col space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un client, service ou véhicule"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="confirmé">Confirmé</SelectItem>
            <SelectItem value="terminé">Terminé</SelectItem>
            <SelectItem value="annulé">Annulé</SelectItem>
            <SelectItem value="reporté">Reporté</SelectItem>
            <SelectItem value="en attente">En attente</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }
  
  return (
    <div className="flex space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher un client, service ou véhicule"
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrer par statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="confirmé">Confirmé</SelectItem>
          <SelectItem value="terminé">Terminé</SelectItem>
          <SelectItem value="annulé">Annulé</SelectItem>
          <SelectItem value="reporté">Reporté</SelectItem>
          <SelectItem value="en attente">En attente</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AppointmentFilters;
