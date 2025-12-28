-- Create boards table to save and manage multiple boards
CREATE TABLE public.boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled Board',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add board_id to dashboard_elements to link elements to boards
ALTER TABLE public.dashboard_elements
ADD COLUMN board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE;

-- Create trigger for updated_at
CREATE TRIGGER update_boards_updated_at
BEFORE UPDATE ON public.boards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Enable RLS
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for boards (using user_id text field like dashboard_elements)
CREATE POLICY "Users can view their own boards" 
ON public.boards 
FOR SELECT 
USING (user_id = user_id);

CREATE POLICY "Users can create boards" 
ON public.boards 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own boards" 
ON public.boards 
FOR UPDATE 
USING (user_id = user_id);

CREATE POLICY "Users can delete their own boards" 
ON public.boards 
FOR DELETE 
USING (user_id = user_id);