
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { ClientInfo } from '@/types/booking';
import { useTheme } from '@/hooks/use-theme';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ClientInfoFormProps {
  clientInfo: ClientInfo;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  prevStep: () => void;
  isLoading: boolean;
}

const ClientInfoForm: React.FC<ClientInfoFormProps> = ({
  clientInfo,
  handleInputChange,
  handleSubmit,
  prevStep,
  isLoading
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className={`font-bold text-lg mb-4 ${isDark ? 'text-slate-100' : ''}`}>Vos informations</h2>
      
      <div className="space-y-4">
        <div>
          <Label className={`block text-sm font-medium mb-1.5 ${
            isDark ? 'text-slate-300' : 'text-cardetail-gray'
          }`}>
            Nom complet
          </Label>
          <Input
            type="text"
            name="name"
            value={clientInfo.name}
            onChange={handleInputChange}
            className={`w-full ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500' 
                : 'border-cardetail-lightgray'
            }`}
            placeholder="Votre nom et prénom"
            required
          />
        </div>
        
        <div>
          <Label className={`block text-sm font-medium mb-1.5 ${
            isDark ? 'text-slate-300' : 'text-cardetail-gray'
          }`}>
            Email
          </Label>
          <Input
            type="email"
            name="email"
            value={clientInfo.email}
            onChange={handleInputChange}
            className={`w-full ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500' 
                : 'border-cardetail-lightgray'
            }`}
            placeholder="votre.email@exemple.com"
            required
          />
        </div>
        
        <div>
          <Label className={`block text-sm font-medium mb-1.5 ${
            isDark ? 'text-slate-300' : 'text-cardetail-gray'
          }`}>
            Téléphone
          </Label>
          <Input
            type="tel"
            name="phone"
            value={clientInfo.phone}
            onChange={handleInputChange}
            className={`w-full ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500' 
                : 'border-cardetail-lightgray'
            }`}
            placeholder="06 XX XX XX XX"
            required
          />
        </div>

        <div>
          <Label className={`block text-sm font-medium mb-1.5 ${
            isDark ? 'text-slate-300' : 'text-cardetail-gray'
          }`}>
            Véhicule (marque/modèle)
          </Label>
          <Input
            type="text"
            name="vehicle"
            value={clientInfo.vehicle}
            onChange={handleInputChange}
            className={`w-full ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500' 
                : 'border-cardetail-lightgray'
            }`}
            placeholder="Ex: Renault Clio, Peugeot 208..."
            required
          />
        </div>
        
        <div>
          <Label className={`block text-sm font-medium mb-1.5 ${
            isDark ? 'text-slate-300' : 'text-cardetail-gray'
          }`}>
            Notes (optionnel)
          </Label>
          <Textarea
            name="notes"
            value={clientInfo.notes}
            onChange={handleInputChange}
            className={`w-full min-h-[120px] ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500' 
                : 'border-cardetail-lightgray'
            }`}
            placeholder="Informations complémentaires ou demandes particulières"
            rows={3}
          />
        </div>
      </div>
      
      <div className="flex space-x-3 mt-6">
        <button
          type="button"
          onClick={prevStep}
          className={`btn-outline flex items-center justify-center ${
            isDark ? 'border border-slate-700 hover:bg-slate-800' : ''
          }`}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour
        </button>
        
        <button
          type="submit"
          className="btn-primary flex-1"
          disabled={isLoading}
        >
          {isLoading ? 'Envoi en cours...' : 'Confirmer la réservation'}
        </button>
      </div>
    </form>
  );
};

export default ClientInfoForm;
