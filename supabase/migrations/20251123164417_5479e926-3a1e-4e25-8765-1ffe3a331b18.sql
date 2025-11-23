-- Create a table for dashboard elements
CREATE TABLE public.dashboard_elements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  section_key TEXT NOT NULL,
  section_title TEXT NOT NULL,
  content TEXT NOT NULL,
  position_x FLOAT NOT NULL DEFAULT 100,
  position_y FLOAT NOT NULL DEFAULT 100,
  width FLOAT NOT NULL DEFAULT 300,
  height FLOAT NOT NULL DEFAULT 200,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_dashboard_elements_user_id ON public.dashboard_elements(user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_dashboard_elements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_dashboard_elements_updated_at
BEFORE UPDATE ON public.dashboard_elements
FOR EACH ROW
EXECUTE FUNCTION public.update_dashboard_elements_updated_at();