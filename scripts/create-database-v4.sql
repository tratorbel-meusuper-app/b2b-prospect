-- Create database schema for B2B prospecting app (Clean version)

-- Drop existing tables if they exist to recreate with correct structure
DROP TABLE IF EXISTS ai_predictions CASCADE;
DROP TABLE IF EXISTS contact_history CASCADE;
DROP TABLE IF EXISTS kanban_leads CASCADE;
DROP TABLE IF EXISTS campaign_recipients CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS saved_searches CASCADE;
DROP TABLE IF EXISTS audience_companies CASCADE;
DROP TABLE IF EXISTS audiences CASCADE;
DROP TABLE IF EXISTS company_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Companies table (leads) - Fixed structure
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    situacao_cadastral JSONB,
    enriched_data JSONB,
    ai_score SMALLINT DEFAULT 50 CHECK (ai_score >= 0 AND ai_score <= 100),
    ai_insights JSONB,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company tags relationship
CREATE TABLE company_tags (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, tag_id)
);

-- Audiences table
CREATE TABLE audiences (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filters JSONB NOT NULL,
    company_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audience companies relationship
CREATE TABLE audience_companies (
    id SERIAL PRIMARY KEY,
    audience_id INTEGER REFERENCES audiences(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(audience_id, company_id)
);

-- Saved searches table
CREATE TABLE saved_searches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    filters JSONB NOT NULL,
    results_count INTEGER DEFAULT 0,
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Follow-up campaigns table
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    message_template TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    scheduled_at TIMESTAMP,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign recipients table
CREATE TABLE campaign_recipients (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kanban leads table
CREATE TABLE kanban_leads (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    stage VARCHAR(50) DEFAULT 'prospecting',
    contact_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    value DECIMAL(12, 2) DEFAULT 0,
    notes TEXT,
    last_contact TIMESTAMP,
    next_followup TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact history table
CREATE TABLE contact_history (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    contact_type VARCHAR(50) NOT NULL,
    contact_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    outcome VARCHAR(100),
    next_action VARCHAR(255),
    created_by VARCHAR(255)
);

-- AI predictions table
CREATE TABLE ai_predictions (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    prediction_type VARCHAR(50) NOT NULL,
    prediction_value DECIMAL(8,4),
    confidence_score DECIMAL(3,2),
    factors JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    UNIQUE(company_id, prediction_type)
);

-- Create indexes for better performance
CREATE INDEX idx_companies_cnpj ON companies(cnpj);
CREATE INDEX idx_companies_ai_score ON companies(ai_score);
CREATE INDEX idx_companies_location ON companies(latitude, longitude);
CREATE INDEX idx_company_tags_company_id ON company_tags(company_id);
CREATE INDEX idx_company_tags_tag_id ON company_tags(tag_id);
CREATE INDEX idx_kanban_leads_stage ON kanban_leads(stage);
CREATE INDEX idx_kanban_leads_company ON kanban_leads(company_id);
CREATE INDEX idx_contact_history_company_id ON contact_history(company_id);
CREATE INDEX idx_ai_predictions_company_id ON ai_predictions(company_id);
CREATE INDEX idx_ai_predictions_type ON ai_predictions(prediction_type);

-- Insert default tags
INSERT INTO tags (name, color, description) VALUES 
('Prospect Quente', '#EF4444', 'Empresas com alto potencial de conversão'),
('Cliente Potencial', '#F59E0B', 'Empresas que demonstraram interesse'),
('Não Qualificado', '#6B7280', 'Empresas que não atendem aos critérios'),
('Follow-up Necessário', '#8B5CF6', 'Empresas que precisam de acompanhamento'),
('Concorrente', '#DC2626', 'Empresas concorrentes identificadas'),
('Alta Prioridade', '#EF4444', 'Leads com alta prioridade de contato'),
('Tecnologia', '#3B82F6', 'Empresas do setor de tecnologia'),
('Saúde', '#10B981', 'Empresas do setor de saúde'),
('Educação', '#F59E0B', 'Empresas do setor educacional'),
('Varejo', '#8B5CF6', 'Empresas do setor varejista'),
('Serviços', '#06B6D4', 'Empresas prestadoras de serviços'),
('Indústria', '#84CC16', 'Empresas industriais'),
('Potencial Alto', '#F97316', 'Alto potencial de conversão'),
('Contactado', '#6B7280', 'Já foi feito contato'),
('Interessado', '#22C55E', 'Demonstrou interesse')
ON CONFLICT (name) DO NOTHING;
