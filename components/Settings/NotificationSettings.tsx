
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, Mail, Megaphone, Smartphone } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface NotificationSettingsProps {
  isMobile?: boolean;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isMobile = false }) => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className={isMobile ? "text-xl" : undefined}>Préférences de notification</CardTitle>
        <CardDescription>
          Configurez comment et quand vous souhaitez être notifié.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              <div>
                <Label htmlFor="emailNotifications">Notifications par email</Label>
                <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                  Recevoir des notifications par email pour les nouveaux rendez-vous.
                </p>
              </div>
            </div>
            <Switch
              id="emailNotifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center">
              <Smartphone className="h-4 w-4 mr-2" />
              <div>
                <Label htmlFor="smsNotifications">Notifications par SMS</Label>
                <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                  Recevoir des notifications par SMS pour les nouveaux rendez-vous.
                </p>
              </div>
            </div>
            <Switch
              id="smsNotifications"
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center">
              <Megaphone className="h-4 w-4 mr-2" />
              <div>
                <Label htmlFor="marketingEmails">Emails marketing</Label>
                <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                  Recevoir des emails concernant les nouvelles fonctionnalités et offres.
                </p>
              </div>
            </div>
            <Switch
              id="marketingEmails"
              checked={marketingEmails}
              onCheckedChange={setMarketingEmails}
            />
          </div>
        </div>
        
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertTitle>Rappels automatiques</AlertTitle>
          <AlertDescription>
            Les rappels automatiques sont envoyés 24h avant chaque rendez-vous.
          </AlertDescription>
        </Alert>
        
        <Button className={isMobile ? "w-full" : undefined} onClick={() => toast({
          title: "Paramètres enregistrés",
          description: "Vos préférences de notification ont été mises à jour.",
        })}>
          Enregistrer les préférences
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
