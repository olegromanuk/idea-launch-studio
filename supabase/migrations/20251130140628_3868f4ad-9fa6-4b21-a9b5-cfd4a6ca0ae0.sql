-- Create connections table for board element relationships
CREATE TABLE public.board_connections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    from_element_id UUID NOT NULL REFERENCES public.dashboard_elements(id) ON DELETE CASCADE,
    to_element_id UUID NOT NULL REFERENCES public.dashboard_elements(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, from_element_id, to_element_id)
);

-- Enable Row Level Security
ALTER TABLE public.board_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (same pattern as dashboard_elements)
CREATE POLICY "Anyone can view connections with matching user_id" 
ON public.board_connections 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert connections" 
ON public.board_connections 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can delete connections with matching user_id" 
ON public.board_connections 
FOR DELETE 
USING (true);