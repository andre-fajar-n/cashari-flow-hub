-- Enable RLS only on money_movements (which is a table, not a view)
ALTER TABLE public.money_movements ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for money_movements
CREATE POLICY "Users can view their own money movements" 
ON public.money_movements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own money movements" 
ON public.money_movements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own money movements" 
ON public.money_movements 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own money movements" 
ON public.money_movements 
FOR DELETE 
USING (auth.uid() = user_id);