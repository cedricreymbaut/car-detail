
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Globe } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";

interface GeneralSettingsProps {
  isMobile?: boolean;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ isMobile = false }) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState('fr');
  const [saving, setSaving] = useState(false);
  
  const isDarkMode = theme === 'dark';
  
  const generateEmbedCode = () => {
    const hostUrl = window.location.origin;
    const businessId = user?.id || '';
    return `<iframe src="${hostUrl}/embed?businessId=${businessId}" width="100%" height="600px" frameborder="0" title="Réservation CarDetail Pro"></iframe>`;
  };

  const handleSaveGeneralSettings = () => {
    setSaving(true);
    
    setTimeout(() => {
      setSaving(false);
      
      toast({
        title: "Paramètres enregistrés",
        description: "Vos préférences ont été mises à jour avec succès.",
      });
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className={isMobile ? "text-xl" : undefined}>Paramètres généraux</CardTitle>
        <CardDescription>
          Gérez les paramètres généraux de votre compte et de l'application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium`}>Préférences de l'interface</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="darkMode">Mode sombre</Label>
              <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                Activer le mode sombre pour l'interface.
              </p>
            </div>
            <Switch
              id="darkMode"
              checked={isDarkMode}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="theme">Thème</Label>
              <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                Choisissez votre thème préféré.
              </p>
            </div>
            <select 
              id="theme" 
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
              <option value="system">Système</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language">Langue</Label>
            <select 
              id="language" 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium`}>Widget de réservation</h3>
          
          <div className={`p-${isMobile ? '3' : '4'} border rounded-md bg-muted/50`}>
            <div className={`flex flex-col ${!isMobile && 'md:flex-row md:items-center'} justify-between gap-${isMobile ? '3' : '4'}`}>
              <div>
                <p className="font-medium text-sm">Code d'intégration</p>
                <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                  Copiez ce code pour intégrer le widget sur votre site web.
                </p>
              </div>
              <div className={`${!isMobile && 'flex-1'}`}>
                <div className="relative">
                  <Input 
                    value={generateEmbedCode()}
                    readOnly
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className={isMobile ? "pr-16 text-xs" : undefined}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="absolute right-1 top-1"
                    onClick={() => {
                      navigator.clipboard.writeText(generateEmbedCode());
                      toast({
                        title: "Code copié",
                        description: "Le code d'intégration a été copié dans le presse-papier.",
                      });
                    }}
                  >
                    Copier
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <Label>Personnalisation</Label>
              <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                Personnalisez l'apparence du widget.
              </p>
            </div>
            <Button variant="outline" onClick={() => toast({
              title: "Fonctionnalité à venir",
              description: "La personnalisation du widget sera disponible prochainement.",
            })}>
              <Palette className={`h-${isMobile ? '3' : '4'} w-${isMobile ? '3' : '4'} ${isMobile ? 'mr-1' : 'mr-2'}`} />
              Personnaliser
            </Button>
          </div>
        </div>
        
        <Button 
          onClick={handleSaveGeneralSettings}
          disabled={saving}
          className={isMobile ? "w-full" : undefined}
        >
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GeneralSettings;
