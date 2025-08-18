-- Enable RLS on tables that don't have it
ALTER TABLE public.fund_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.money_movements ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for fund_summary
CREATE POLICY "Users can view their own fund summary" 
ON public.fund_summary 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add RLS policies for transaction_associations
CREATE POLICY "Users can view their own transaction associations" 
ON public.transaction_associations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transaction associations" 
ON public.transaction_associations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transaction associations" 
ON public.transaction_associations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transaction associations" 
ON public.transaction_associations 
FOR DELETE 
USING (auth.uid() = user_id);

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