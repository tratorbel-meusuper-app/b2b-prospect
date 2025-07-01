-- Drop existing tables if they exist
DROP TABLE IF EXISTS company_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS audiences CASCADE;
DROP TABLE IF EXISTS audience_companies CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS campaign_companies CASCADE;
DROP TABLE IF EXISTS saved_searches CASCADE;
DROP TABLE IF EXISTS enriched_companies CASCADE;

-- Create tags table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3B82F6',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create enriched_companies table (only for enriched data)
CREATE TABLE enriched_companies (
    id SERIAL PRIMARY KEY,
    cnpj VARCHAR(14) NOT NULL UNIQUE,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    situacao_cadastral VARCHAR(50),
    uf VARCHAR(2),
    municipio VARCHAR(100),
    bairro VARCHAR(100),
    logradouro VARCHAR(255),
    numero VARCHAR(20),
    cep VARCHAR(8),
    telefone VARCHAR(20),
    email VARCHAR(255),
    atividade_principal TEXT,
    cnae_principal VARCHAR(10),
    capital_social DECIMAL(15,2),
    porte VARCHAR(50),
    natureza_juridica VARCHAR(100),
    data_abertura DATE,
    
    -- Enrichment tracking
    enrichment_status VARCHAR(20) DEFAULT 'manual' CHECK (enrichment_status IN ('manual', 'bulk')),
    enriched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    enriched_data JSONB,
    
    -- CRM tracking
    in_crm BOOLEAN DEFAULT false,
    crm_stage VARCHAR(50) DEFAULT 'lead',
    
    -- Follow-up tracking
    followup_sent BOOLEAN DEFAULT false,
    followup_sent_at TIMESTAMP,
    
    -- AI scoring
    ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
    last_contact TIMESTAMP,
    contact_attempts INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create company_tags junction table
CREATE TABLE company_tags (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES enriched_companies(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, tag_id)
);

-- Create audiences table
CREATE TABLE audiences (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filters JSONB NOT NULL,
    company_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audience_companies junction table
CREATE TABLE audience_companies (
    id SERIAL PRIMARY KEY,
    audience_id INTEGER REFERENCES audiences(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES enriched_companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(audience_id, company_id)
);

-- Create campaigns table
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    sent_count INTEGER DEFAULT 0,
    open_rate DECIMAL(5,2) DEFAULT 0,
    click_rate DECIMAL(5,2) DEFAULT 0,
    reply_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create campaign_companies junction table
CREATE TABLE campaign_companies (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES enriched_companies(id) ON DELETE CASCADE,
    sent_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    replied_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'opened', 'clicked', 'replied', 'bounced')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, company_id)
);

-- Create saved_searches table
CREATE TABLE saved_searches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filters JSONB NOT NULL,
    last_used TIMESTAMP,
    use_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_enriched_companies_cnpj ON enriched_companies(cnpj);
CREATE INDEX idx_enriched_companies_uf ON enriched_companies(uf);
CREATE INDEX idx_enriched_companies_municipio ON enriched_companies(municipio);
CREATE INDEX idx_enriched_companies_cnae ON enriched_companies(cnae_principal);
CREATE INDEX idx_enriched_companies_enriched_at ON enriched_companies(enriched_at);
CREATE INDEX idx_enriched_companies_crm_stage ON enriched_companies(crm_stage);
CREATE INDEX idx_company_tags_company_id ON company_tags(company_id);
CREATE INDEX idx_company_tags_tag_id ON company_tags(tag_id);
CREATE INDEX idx_audience_companies_audience_id ON audience_companies(audience_id);
CREATE INDEX idx_audience_companies_company_id ON audience_companies(company_id);
CREATE INDEX idx_campaign_companies_campaign_id ON campaign_companies(campaign_id);
CREATE INDEX idx_campaign_companies_company_id ON campaign_companies(company_id);

-- Insert some default tags
INSERT INTO tags (name, color, description) VALUES
('Prospect Quente', '#EF4444', 'Lead com alto potencial de conversão'),
('Prospect Frio', '#3B82F6', 'Lead que precisa de mais nurturing'),
('Cliente Potencial', '#10B981', 'Empresa com perfil ideal para nossos serviços'),
('Concorrente', '#F59E0B', 'Empresa concorrente identificada'),
('Parceiro', '#8B5CF6', 'Potencial parceiro de negócios');

-- Insert some default audiences
INSERT INTO audiences (name, description, filters) VALUES
('Empresas de Tecnologia SP', 'Empresas de tecnologia localizadas em São Paulo', '{"uf": ["SP"], "codigo_atividade_principal": ["6201-5/00", "6202-3/00"]}'),
('Startups Rio de Janeiro', 'Startups e empresas inovadoras do Rio de Janeiro', '{"uf": ["RJ"], "capital_social": {"minimo": 10000, "maximo": 1000000}}');

-- Insert some default campaigns
INSERT INTO campaigns (name, description, template, status) VALUES
('Apresentação de Serviços', 'Campanha inicial de apresentação da empresa', 'Olá {razao_social}, somos especialistas em soluções B2B...', 'draft'),
('Follow-up Prospects', 'Campanha de follow-up para prospects interessados', 'Olá {nome_fantasia}, gostaria de dar continuidade...', 'draft');

COMMIT;
