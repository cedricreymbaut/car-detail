
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface BillingSettingsProps {
  isMobile?: boolean;
}

const BillingSettings: React.FC<BillingSettingsProps> = ({ isMobile = false }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={isMobile ? "text-xl" : undefined}>Abonnement</CardTitle>
        <CardDescription>
          Gérez votre abonnement et vos méthodes de paiement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className={`p-${isMobile ? '3' : '4'} border rounded-md bg-muted/30`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-sm">Plan actuel</p>
              <p className={`${isMobile ? "text-base" : "text-lg"} font-bold text-primary`}>CarDetail Pro Gratuit</p>
            </div>
            <Badge>Actif</Badge>
          </div>
          
          <div className="mt-3">
            <ul className={`${isMobile ? "text-xs" : "text-sm"} space-y-${isMobile ? '1.5' : '2'}`}>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Gestion des rendez-vous
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Gestion des clients
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Jusqu'à 50 rendez-vous par mois
              </li>
            </ul>
          </div>
        </div>
        
        <Button className="w-full" onClick={() => toast({
          title: "Passage au plan premium",
          description: "Fonctionnalité à venir. Restez à l'écoute pour les options d'abonnement premium!",
        })}>
          <CreditCard className="h-4 w-4 mr-2" />
          Passer au plan premium
        </Button>
        
        <div className={`p-${isMobile ? '3' : '4'} border rounded-md bg-muted/30`}>
          <h3 className="font-medium text-sm mb-2">Historique de facturation</h3>
          <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground text-center py-${isMobile ? '3' : '4'}`}>
            Aucune facture à afficher.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillingSettings;
