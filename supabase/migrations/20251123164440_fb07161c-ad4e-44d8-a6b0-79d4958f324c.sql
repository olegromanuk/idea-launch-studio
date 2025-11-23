-- Enable Row Level Security
ALTER TABLE public.dashboard_elements ENABLE ROW LEVEL SECURITY;

-- Create policies for dashboard elements
CREATE POLICY "Users can view their own dashboard elements" 
ON public.dashboard_elements 
FOR SELECT 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can create their own dashboard elements" 
ON public.dashboard_elements 
FOR INSERT 
WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own dashboard elements" 
ON public.dashboard_elements 
FOR UPDATE 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own dashboard elements" 
ON public.dashboard_elements 
FOR DELETE 
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');