import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Calendar, Save, Plus, Trash2, Info, AlertTriangle, Check, X, PauseCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Toggle } from '@/components/ui/toggle';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type BusinessHours = {
  id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
  has_break: boolean;
  break_start: string;
  break_end: string;
  business_id?: string;
  created_at?: string;
  updated_at?: string;
};

type SpecialDay = {
  id: string;
  date: string;
  name: string;
  is_closed: boolean;
  open_time?: string | null;
  close_time?: string | null;
  has_break: boolean;
  break_start: string | null;
  break_end: string | null;
  note?: string;
  created_at?: string;
  business_id?: string;
};

const dayNames = [
  "Dimanche",
  "Lundi", 
  "Mardi", 
  "Mercredi", 
  "Jeudi", 
  "Vendredi", 
  "Samedi"
];

const BusinessHoursManager = () => {
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([]);
  const [isAddingSpecialDay, setIsAddingSpecialDay] = useState(false);
  const [newSpecialDay, setNewSpecialDay] = useState<Omit<SpecialDay, 'id'>>({
    date: '',
    name: '',
    is_closed: true,
    open_time: '09:00',
    close_time: '18:00',
    has_break: false,
    break_start: '12:00',
    break_end: '13:00'
  });
  const [view, setView] = useState<'weekly' | 'special'>('weekly');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      fetchBusinessHours();
      fetchSpecialDays();
    }
  }, [user]);

  const fetchBusinessHours = async () => {
    try {
      setLoading(true);
      
      console.log("Fetching business hours for business ID:", user?.id);
      
      const { data, error } = await supabase
        .from('business_hours')
        .select('*')
        .eq('business_id', user?.id)
        .order('day_of_week', { ascending: true });

      if (error) {
        throw error;
      }

      const formattedData = data.map(hour => ({
        ...hour,
        has_break: hour.has_break || false,
        break_start: hour.break_start || '12:00',
        break_end: hour.break_end || '13:00',
      } as BusinessHours));

      if (formattedData.length === 0) {
        const defaultHours = Array.from({ length: 7 }, (_, i) => ({
          day_of_week: i,
          open_time: '09:00',
          close_time: '18:00',
          is_closed: i === 0 || i === 6,
          has_break: false,
          break_start: '12:00',
          break_end: '13:00',
          business_id: user?.id
        }));

        console.log("Creating default business hours for business ID:", user?.id);

        const { data: newData, error: insertError } = await supabase
          .from('business_hours')
          .insert(defaultHours)
          .select();

        if (insertError) {
          throw insertError;
        }

        setBusinessHours(newData as BusinessHours[]);
      } else {
        console.log("Found existing business hours:", formattedData.length);
        setBusinessHours(formattedData);
      }
    } catch (error) {
      console.error('Error fetching business hours:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les heures d'ouverture",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialDays = async () => {
    try {
      const { data, error } = await supabase
        .from('special_days')
        .select('*')
        .eq('business_id', user?.id)
        .order('date', { ascending: true });

      if (error) {
        console.log("Erreur lors du chargement des jours spéciaux:", error);
        setSpecialDays([]);
        return;
      }

      const formattedData = data.map(day => ({
        ...day,
        has_break: day.has_break || false,
        break_start: day.break_start || '12:00',
        break_end: day.break_end || '13:00',
        business_id: day.business_id || user?.id
      } as SpecialDay));

      setSpecialDays(formattedData || []);
    } catch (error) {
      console.error('Error fetching special days:', error);
      setSpecialDays([]);
    }
  };

  const handleTimeChange = (id: string, field: 'open_time' | 'close_time' | 'break_start' | 'break_end', value: string) => {
    setBusinessHours(prev => 
      prev.map(hour => 
        hour.id === id ? { ...hour, [field]: value } : hour
      )
    );
  };

  const handleClosedToggle = (id: string, checked: boolean) => {
    setBusinessHours(prev => 
      prev.map(hour => 
        hour.id === id ? { ...hour, is_closed: !checked } : hour
      )
    );
  };

  const handleBreakToggle = (id: string, checked: boolean) => {
    setBusinessHours(prev => 
      prev.map(hour => 
        hour.id === id ? { ...hour, has_break: checked } : hour
      )
    );
  };

  const saveBusinessHours = async () => {
    try {
      setIsSaving(true);
      
      console.log("Saving business hours:", businessHours);
      
      const hoursWithBusinessId = businessHours.map(hour => {
        return { 
          ...hour, 
          business_id: user?.id 
        };
      });
      
      const filteredHours = hoursWithBusinessId.map(hour => {
        return hour;
      });
      
      const { error: hoursError } = await supabase
        .from('business_hours')
        .upsert(filteredHours);

      if (hoursError) {
        throw hoursError;
      }

      const specialDaysWithBusinessId = specialDays.map(day => {
        return {
          ...day,
          business_id: user?.id
        };
      });

      const { error: specialDaysError } = await supabase
        .from('special_days')
        .upsert(specialDaysWithBusinessId);

      if (specialDaysError) {
        throw specialDaysError;
      }

      toast({
        title: "Succès",
        description: "Les heures d'ouverture ont été mises à jour",
      });
    } catch (error) {
      console.error('Error saving business hours:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les heures d'ouverture",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addSpecialDay = () => {
    if (!newSpecialDay.date || !newSpecialDay.name) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const id = crypto.randomUUID();
    setSpecialDays(prev => [...prev, { 
      ...newSpecialDay, 
      id,
      business_id: user?.id
    }]);
    setNewSpecialDay({
      date: '',
      name: '',
      is_closed: true,
      open_time: '09:00',
      close_time: '18:00',
      has_break: false,
      break_start: '12:00',
      break_end: '13:00'
    });
    setIsAddingSpecialDay(false);
  };

  const removeSpecialDay = (id: string) => {
    setSpecialDays(prev => prev.filter(day => day.id !== id));
  };

  const handleSpecialDayChange = (field: string, value: any) => {
    setNewSpecialDay(prev => ({ ...prev, [field]: value }));
  };

  const toggleView = (newView: 'weekly' | 'special') => {
    setView(newView);
  };

  const renderWeeklyHours = () => {
    if (isMobile) {
      return (
        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            {businessHours.map((hour) => (
              <AccordionItem key={hour.id} value={hour.id} className={hour.is_closed ? "bg-muted/20" : ""}>
                <AccordionTrigger className="px-2 py-3">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{dayNames[hour.day_of_week]}</span>
                    <span className="text-sm text-muted-foreground">
                      {hour.is_closed ? 'Fermé' : `${hour.open_time} - ${hour.close_time}`}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 py-2 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id={`closed-${hour.id}`}
                      checked={!hour.is_closed}
                      onCheckedChange={(checked) => handleClosedToggle(hour.id, checked)}
                    />
                    <Label htmlFor={`closed-${hour.id}`} className="flex items-center gap-2">
                      {!hour.is_closed ? (
                        <><Check className="h-4 w-4 text-green-600" /> Ouvert</>
                      ) : (
                        <><X className="h-4 w-4 text-red-500" /> Fermé</>
                      )}
                    </Label>
                  </div>
                  
                  {!hour.is_closed && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor={`open-${hour.id}`} className="text-xs">Ouverture</Label>
                          <Input
                            id={`open-${hour.id}`}
                            type="time"
                            value={hour.open_time}
                            onChange={(e) => handleTimeChange(hour.id, 'open_time', e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`close-${hour.id}`} className="text-xs">Fermeture</Label>
                          <Input
                            id={`close-${hour.id}`}
                            type="time"
                            value={hour.close_time}
                            onChange={(e) => handleTimeChange(hour.id, 'close_time', e.target.value)}
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id={`break-${hour.id}`}
                            checked={hour.has_break}
                            onCheckedChange={(checked) => handleBreakToggle(hour.id, checked)}
                          />
                          <Label htmlFor={`break-${hour.id}`} className="flex items-center gap-2">
                            <PauseCircle className="h-4 w-4" /> Pause déjeuner
                          </Label>
                        </div>
                        
                        {hour.has_break && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="space-y-1">
                              <Label htmlFor={`break-start-${hour.id}`} className="text-xs">Début</Label>
                              <Input
                                id={`break-start-${hour.id}`}
                                type="time"
                                value={hour.break_start}
                                onChange={(e) => handleTimeChange(hour.id, 'break_start', e.target.value)}
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`break-end-${hour.id}`} className="text-xs">Fin</Label>
                              <Input
                                id={`break-end-${hour.id}`}
                                type="time"
                                value={hour.break_end}
                                onChange={(e) => handleTimeChange(hour.id, 'break_end', e.target.value)}
                                className="w-full"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Jour</TableHead>
            <TableHead>État</TableHead>
            <TableHead>Ouverture</TableHead>
            <TableHead>Fermeture</TableHead>
            <TableHead>Pause déjeuner</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {businessHours.map((hour) => (
            <TableRow key={hour.id} className={hour.is_closed ? "bg-muted/20" : ""}>
              <TableCell className="font-medium">{dayNames[hour.day_of_week]}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div className="relative flex items-center space-x-2">
                    <Switch 
                      id={`closed-${hour.id}`}
                      checked={!hour.is_closed}
                      onCheckedChange={(checked) => handleClosedToggle(hour.id, checked)}
                    />
                    <Label htmlFor={`closed-${hour.id}`} className="flex items-center gap-2">
                      {!hour.is_closed ? (
                        <><Check className="h-4 w-4 text-green-600" /> Ouvert</>
                      ) : (
                        <><X className="h-4 w-4 text-red-500" /> Fermé</>
                      )}
                    </Label>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Input
                  type="time"
                  value={hour.open_time}
                  onChange={(e) => handleTimeChange(hour.id, 'open_time', e.target.value)}
                  disabled={hour.is_closed}
                  className="w-32"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="time"
                  value={hour.close_time}
                  onChange={(e) => handleTimeChange(hour.id, 'close_time', e.target.value)}
                  disabled={hour.is_closed}
                  className="w-32"
                />
              </TableCell>
              <TableCell>
                {!hour.is_closed && (
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id={`break-${hour.id}`}
                        checked={hour.has_break}
                        onCheckedChange={(checked) => handleBreakToggle(hour.id, checked)}
                        disabled={hour.is_closed}
                      />
                      <Label htmlFor={`break-${hour.id}`} className="flex items-center gap-2">
                        <PauseCircle className="h-4 w-4" /> Pause déjeuner
                      </Label>
                    </div>
                    {hour.has_break && (
                      <div className="flex space-x-2 items-center">
                        <Input
                          type="time"
                          value={hour.break_start}
                          onChange={(e) => handleTimeChange(hour.id, 'break_start', e.target.value)}
                          className="w-24"
                        />
                        <span>à</span>
                        <Input
                          type="time"
                          value={hour.break_end}
                          onChange={(e) => handleTimeChange(hour.id, 'break_end', e.target.value)}
                          className="w-24"
                        />
                      </div>
                    )}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderSpecialDayForm = () => {
    return (
      <Card className="mb-6 border-dashed border-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Nouveau jour spécial</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="special-date">Date</Label>
              <Input
                id="special-date"
                type="date"
                value={newSpecialDay.date}
                onChange={(e) => handleSpecialDayChange('date', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="special-name">Nom (ex: Noël, Vacances...)</Label>
              <Input
                id="special-name"
                type="text"
                value={newSpecialDay.name}
                onChange={(e) => handleSpecialDayChange('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 flex items-center">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="special-closed"
                  checked={!newSpecialDay.is_closed}
                  onCheckedChange={(checked) => handleSpecialDayChange('is_closed', !checked)}
                  className="data-[state=checked]:bg-green-600"
                />
                <Label htmlFor="special-closed" className="flex items-center gap-2">
                  {!newSpecialDay.is_closed ? (
                    <><Check className="h-4 w-4 text-green-600" /> Ouvert</>
                  ) : (
                    <><X className="h-4 w-4 text-red-500" /> Fermé</>
                  )}
                </Label>
              </div>
            </div>
            {!newSpecialDay.is_closed && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="special-open">Ouverture</Label>
                  <Input
                    id="special-open"
                    type="time"
                    value={newSpecialDay.open_time}
                    onChange={(e) => handleSpecialDayChange('open_time', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="special-close">Fermeture</Label>
                  <Input
                    id="special-close"
                    type="time"
                    value={newSpecialDay.close_time}
                    onChange={(e) => handleSpecialDayChange('close_time', e.target.value)}
                  />
                </div>
              </>
            )}
            <div className={isMobile ? "col-span-1" : "md:col-span-2"}>
              <div className="flex items-center space-x-2 mb-2">
                <Switch 
                  id="special-break"
                  checked={newSpecialDay.has_break}
                  onCheckedChange={(checked) => handleSpecialDayChange('has_break', checked)}
                  disabled={newSpecialDay.is_closed}
                />
                <Label htmlFor="special-break" className="flex items-center gap-2">
                  <PauseCircle className="h-4 w-4" /> Ajouter une pause déjeuner
                </Label>
              </div>
              {newSpecialDay.has_break && !newSpecialDay.is_closed && (
                <div className={`flex ${isMobile ? "flex-col" : "flex-row"} space-y-2 sm:space-y-0 sm:space-x-2 items-center mt-2`}>
                  <div className="w-full sm:w-auto">
                    <Label htmlFor="break-start" className="text-xs mb-1 block">Début</Label>
                    <Input
                      id="break-start"
                      type="time"
                      value={newSpecialDay.break_start}
                      onChange={(e) => handleSpecialDayChange('break_start', e.target.value)}
                      className="w-full sm:w-24"
                    />
                  </div>
                  <span className="hidden sm:block">à</span>
                  <div className="w-full sm:w-auto">
                    <Label htmlFor="break-end" className="text-xs mb-1 block">Fin</Label>
                    <Input
                      id="break-end"
                      type="time"
                      value={newSpecialDay.break_end}
                      onChange={(e) => handleSpecialDayChange('break_end', e.target.value)}
                      className="w-full sm:w-24"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsAddingSpecialDay(false)}
              size={isMobile ? "sm" : "default"}
            >
              Annuler
            </Button>
            <Button onClick={addSpecialDay} size={isMobile ? "sm" : "default"}>
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSpecialDaysTable = () => {
    if (isMobile) {
      return (
        <div className="space-y-4">
          {specialDays.map((day) => (
            <Card key={day.id} className="overflow-hidden">
              <CardHeader className="p-3 pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{day.name}</div>
                    <div className="text-xs text-muted-foreground">{new Date(day.date).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeSpecialDay(day.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex items-center gap-2 text-sm">
                  {!day.is_closed ? (
                    <><Check className="h-4 w-4 text-green-600 flex-shrink-0" /> 
                      <span className="flex-grow">
                        Ouvert: {day.open_time} - {day.close_time} 
                        {day.has_break ? <span className="block text-xs text-muted-foreground">Pause: {day.break_start} - {day.break_end}</span> : ''}
                      </span>
                    </>
                  ) : (
                    <><X className="h-4 w-4 text-red-500 flex-shrink-0" /> <span>Fermé toute la journée</span></>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>État</TableHead>
            <TableHead>Horaires</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {specialDays.map((day) => (
            <TableRow key={day.id}>
              <TableCell>{new Date(day.date).toLocaleDateString('fr-FR')}</TableCell>
              <TableCell className="font-medium">{day.name}</TableCell>
              <TableCell className="flex items-center gap-2">
                {!day.is_closed ? (
                  <><Check className="h-4 w-4 text-green-600" /> Ouvert</>
                ) : (
                  <><X className="h-4 w-4 text-red-500" /> Fermé</>
                )}
              </TableCell>
              <TableCell>
                {day.is_closed 
                  ? "Fermé toute la journée" 
                  : `${day.open_time} - ${day.close_time} ${day.has_break ? `(Pause: ${day.break_start} - ${day.break_end})` : ''}`}
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeSpecialDay(day.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des heures d'ouverture...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold">Heures d'ouverture</h2>
        <Button onClick={saveBusinessHours} disabled={isSaving} className="w-full sm:w-auto">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Toggle 
          pressed={view === 'weekly'} 
          onPressedChange={() => toggleView('weekly')}
          variant="outline"
          className="flex-1 sm:flex-none justify-center"
        >
          <Calendar className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Horaires hebdomadaires</span>
          <span className="sm:hidden">Horaires</span>
        </Toggle>
        <Toggle 
          pressed={view === 'special'} 
          onPressedChange={() => toggleView('special')}
          variant="outline"
          className="flex-1 sm:flex-none justify-center"
        >
          <Info className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Jours spéciaux</span>
          <span className="sm:hidden">Spéciaux</span>
        </Toggle>
      </div>

      {view === 'weekly' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Horaires hebdomadaires</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Définissez vos heures d'ouverture régulières pour chaque jour de la semaine</CardDescription>
            </CardHeader>
            <CardContent>
              {renderWeeklyHours()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-md flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                Rappel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Pour les jours fériés ou fermetures exceptionnelles, utilisez l'onglet "Jours spéciaux".
                Les jours spéciaux ont priorité sur les heures régulières d'ouverture.
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {view === 'special' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Jours spéciaux</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Gérez les jours fériés, vacances et fermetures exceptionnelles</CardDescription>
            </CardHeader>
            <CardContent>
              {specialDays.length === 0 && !isAddingSpecialDay ? (
                <div className="text-center p-4 sm:p-6 bg-muted/20 rounded-md">
                  <p className="text-muted-foreground mb-4 text-sm">Aucun jour spécial n'est défini</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingSpecialDay(true)}
                    size={isMobile ? "sm" : "default"}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un jour spécial
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingSpecialDay(true)}
                      disabled={isAddingSpecialDay}
                      size={isMobile ? "sm" : "default"}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un jour spécial
                    </Button>
                  </div>

                  {isAddingSpecialDay && renderSpecialDayForm()}

                  {specialDays.length > 0 && renderSpecialDaysTable()}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BusinessHoursManager;
