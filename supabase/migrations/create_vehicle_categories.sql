
-- Create vehicle categories table
CREATE TABLE IF NOT EXISTS public.vehicle_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add vehicle_category_id to services table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'services'
      AND column_name = 'vehicle_category_id'
  ) THEN
    ALTER TABLE public.services ADD COLUMN vehicle_category_id UUID REFERENCES public.vehicle_categories(id);
  END IF;
END
$$;

-- Add default vehicle categories for testing
INSERT INTO public.vehicle_categories (business_id, name, description)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Citadine', 'Petite voiture urbaine'),
  ('00000000-0000-0000-0000-000000000000', 'SUV', 'Véhicule utilitaire sport'),
  ('00000000-0000-0000-0000-000000000000', 'Moto', 'Deux-roues motorisé');
