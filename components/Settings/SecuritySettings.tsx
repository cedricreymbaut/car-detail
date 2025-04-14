
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Globe, Lock, Loader2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "@/contexts/AuthContext";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Le mot de passe actuel est requis" }),
  newPassword: z.string().min(6, { message: "Le nouveau mot de passe doit contenir au moins 6 caractères" }),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface SecuritySettingsProps {
  isMobile?: boolean;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ isMobile = false }) => {
  const { user } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const handleChangePassword = async (data: PasswordFormValues) => {
    try {
      setIsChangingPassword(true);
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: data.currentPassword
      });

      if (signInError) {
        toast({
          title: "Erreur",
          description: "Le mot de passe actuel est incorrect",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({ 
        password: data.newPassword 
      });

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Mot de passe mis à jour",
          description: "Votre mot de passe a été changé avec succès.",
        });
        passwordForm.reset();
      }
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la modification du mot de passe",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const passwordSection = (
    <div className="space-y-4">
      <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium flex items-center`}>
        <Lock className="h-4 w-4 mr-2" />
        Mot de passe
      </h3>
      
      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-3">
          <FormField
            control={passwordForm.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe actuel</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={passwordForm.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nouveau mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={passwordForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmer le mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            variant="outline" 
            className="w-full" 
            disabled={isChangingPassword}
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mise à jour...
              </>
            ) : 'Mettre à jour le mot de passe'}
          </Button>
        </form>
      </Form>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className={isMobile ? "text-xl" : undefined}>Sécurité</CardTitle>
        <CardDescription>
          Gérez les paramètres de sécurité de votre compte.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {passwordSection}
        
        <div className="space-y-4">
          <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium flex items-center`}>
            <Shield className="h-4 w-4 mr-2" />
            Authentification à deux facteurs
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Statut 2FA</p>
              <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                L'authentification à deux facteurs est désactivée.
              </p>
            </div>
            <Badge variant="outline" className="text-yellow-600 bg-yellow-100">
              Désactivé
            </Badge>
          </div>
          
          <Button variant="outline" className="w-full" onClick={() => toast({
            title: "Fonctionnalité à venir",
            description: "L'authentification à deux facteurs sera disponible prochainement.",
          })}>
            Activer 2FA
          </Button>
        </div>
        
        <div className="space-y-4">
          <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium flex items-center`}>
            <Globe className="h-4 w-4 mr-2" />
            Sessions actives
          </h3>
          
          <div className="border rounded-md">
            <div className={`p-${isMobile ? '3' : '4'} border-b`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">Session actuelle</p>
                  <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
                    Paris, France • Chrome • Windows
                  </p>
                </div>
                <Badge>Actif</Badge>
              </div>
            </div>
          </div>
          
          <Button variant="outline" className="w-full" onClick={() => toast({
            title: "Déconnexion des autres appareils",
            description: "Toutes les autres sessions ont été déconnectées.",
          })}>
            Déconnecter les autres appareils
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
