-- Create saved_searches table
CREATE TABLE IF NOT EXISTS saved_searches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filters JSONB NOT NULL,
    total_results INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_saved_searches_name ON saved_searches(name);
CREATE INDEX IF NOT EXISTS idx_saved_searches_created_at ON saved_searches(created_at);

-- Add columns to companies table for lead tracking
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS moved_to_kanban BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kanban_stage VARCHAR(50),
ADD COLUMN IF NOT EXISTS kanban_value INTEGER,
ADD COLUMN IF NOT EXISTS kanban_notes TEXT,
ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS contact_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS followup_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS followup_sent_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS ai_score INTEGER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_saved_searches_updated_at 
    BEFORE UPDATE ON saved_searches 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
