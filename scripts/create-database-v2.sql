-- Update database schema to ensure all columns exist

-- Add missing columns to companies table if they don't exist
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS city VARCHAR(255),
ADD COLUMN IF NOT EXISTS state VARCHAR(2),
ADD COLUMN IF NOT EXISTS address_full TEXT,
ADD COLUMN IF NOT EXISTS last_enriched_at TIMESTAMP;

-- Ensure all indexes exist
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON companies(cnpj);
CREATE INDEX IF NOT EXISTS idx_companies_city_state ON companies(city, state);
CREATE INDEX IF NOT EXISTS idx_companies_ai_score ON companies(ai_score);
CREATE INDEX IF NOT EXISTS idx_companies_location ON companies(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_company_tags_company_id ON company_tags(company_id);
CREATE INDEX IF NOT EXISTS idx_company_tags_tag_id ON company_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_kanban_leads_stage ON kanban_leads(stage);
CREATE INDEX IF NOT EXISTS idx_kanban_leads_company ON kanban_leads(company_id);
CREATE INDEX IF NOT EXISTS idx_contact_history_company_id ON contact_history(company_id);

-- Update existing companies with default AI scores if null
UPDATE companies SET ai_score = 50 WHERE ai_score IS NULL;
