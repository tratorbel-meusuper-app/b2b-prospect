-- Update companies table schema to match expected structure
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS situacao VARCHAR(20) DEFAULT 'ATIVA';

-- Update existing records
UPDATE companies SET situacao = 'ATIVA' WHERE situacao IS NULL;

-- Add missing columns if they don't exist
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS nome_fantasia VARCHAR(255),
ADD COLUMN IF NOT EXISTS bairro VARCHAR(100),
ADD COLUMN IF NOT EXISTS logradouro VARCHAR(255),
ADD COLUMN IF NOT EXISTS numero VARCHAR(20),
ADD COLUMN IF NOT EXISTS telefone VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS atividade_principal TEXT,
ADD COLUMN IF NOT EXISTS cnae_principal VARCHAR(20),
ADD COLUMN IF NOT EXISTS capital_social DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS porte VARCHAR(20),
ADD COLUMN IF NOT EXISTS natureza_juridica VARCHAR(100),
ADD COLUMN IF NOT EXISTS data_abertura DATE,
ADD COLUMN IF NOT EXISTS enrichment_status VARCHAR(20) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS in_crm BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS crm_stage VARCHAR(50),
ADD COLUMN IF NOT EXISTS followup_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS followup_sent_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS ai_score INTEGER,
ADD COLUMN IF NOT EXISTS last_contact TIMESTAMP,
ADD COLUMN IF NOT EXISTS contact_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS enriched_data JSONB;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_situacao ON companies(situacao);
CREATE INDEX IF NOT EXISTS idx_companies_uf ON companies(uf);
CREATE INDEX IF NOT EXISTS idx_companies_municipio ON companies(municipio);
CREATE INDEX IF NOT EXISTS idx_companies_porte ON companies(porte);
CREATE INDEX IF NOT EXISTS idx_companies_enrichment_status ON companies(enrichment_status);
CREATE INDEX IF NOT EXISTS idx_companies_in_crm ON companies(in_crm);
CREATE INDEX IF NOT EXISTS idx_companies_ai_score ON companies(ai_score);

COMMIT;
