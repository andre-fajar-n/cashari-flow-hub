
-- Create investment_asset_values table
CREATE TABLE investment_asset_values (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER NOT NULL,
  value NUMERIC NOT NULL,
  date DATE NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint to investment_assets table
ALTER TABLE investment_asset_values 
ADD CONSTRAINT fk_investment_asset_values_asset_id 
FOREIGN KEY (asset_id) REFERENCES investment_assets(id) ON DELETE CASCADE;

-- Add foreign key constraint to auth.users table
ALTER TABLE investment_asset_values 
ADD CONSTRAINT fk_investment_asset_values_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE investment_asset_values ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own asset values" ON investment_asset_values
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own asset values" ON investment_asset_values
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own asset values" ON investment_asset_values
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own asset values" ON investment_asset_values
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_investment_asset_values_asset_id ON investment_asset_values(asset_id);
CREATE INDEX idx_investment_asset_values_user_id ON investment_asset_values(user_id);
CREATE INDEX idx_investment_asset_values_date ON investment_asset_values(date);
