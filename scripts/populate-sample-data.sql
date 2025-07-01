-- Insert sample companies data for testing
INSERT INTO companies (
  cnpj, razao_social, nome_fantasia, situacao, uf, municipio, bairro, 
  logradouro, numero, cep, telefone, email, atividade_principal, 
  cnae_principal, capital_social, porte, natureza_juridica, data_abertura,
  enrichment_status, in_crm, followup_sent, contact_attempts, ai_score, tags
) VALUES 
-- Tech Companies
('11222333000181', 'TECH SOLUTIONS BRASIL LTDA', 'TechSol', 'ATIVA', 'SP', 'São Paulo', 'Vila Olímpia', 'Rua Funchal', '375', '04551-060', '(11) 3456-7890', 'contato@techsol.com.br', 'Desenvolvimento de software sob encomenda', '62.01-5/00', 500000.00, 'EPP', 'Sociedade Empresária Limitada', '2018-03-15', 'manual', true, true, 3, 85, ARRAY['Tecnologia', 'B2B', 'Software']),

('22333444000172', 'INOVACAO DIGITAL LTDA', 'InovaDigital', 'ATIVA', 'RJ', 'Rio de Janeiro', 'Copacabana', 'Av. Atlântica', '1702', '22021-001', '(21) 2345-6789', 'info@inovadigital.com.br', 'Consultoria em tecnologia da informação', '62.04-0/00', 300000.00, 'ME', 'Sociedade Empresária Limitada', '2019-07-22', 'bulk', false, false, 1, 78, ARRAY['Consultoria', 'TI', 'Digital']),

('33444555000163', 'STARTUP ACCELERATOR SA', 'StartupAcc', 'ATIVA', 'SP', 'São Paulo', 'Itaim Bibi', 'Av. Brigadeiro Faria Lima', '2232', '01451-000', '(11) 4567-8901', 'hello@startupaccel.com.br', 'Atividades de consultoria em gestão empresarial', '70.20-4/00', 1000000.00, 'GRANDE', 'Sociedade Anônima', '2017-01-10', 'manual', true, true, 5, 92, ARRAY['Startup', 'Aceleradora', 'Investimento']),

-- E-commerce Companies
('44555666000154', 'COMERCIO ONLINE BRASIL LTDA', 'ComOnline', 'ATIVA', 'SP', 'Campinas', 'Cambuí', 'Rua Barão de Jaguara', '1420', '13025-001', '(19) 3234-5678', 'vendas@comonline.com.br', 'Comércio varejista via internet', '47.91-1/01', 250000.00, 'EPP', 'Sociedade Empresária Limitada', '2020-05-18', 'none', false, false, 0, 65, ARRAY['E-commerce', 'Varejo', 'Online']),

('55666777000145', 'MARKETPLACE SOLUTIONS LTDA', 'MarketSol', 'ATIVA', 'MG', 'Belo Horizonte', 'Savassi', 'Av. do Contorno', '6061', '30110-110', '(31) 3345-6789', 'contato@marketsol.com.br', 'Intermediação e agenciamento de serviços e negócios em geral', '74.90-1/04', 400000.00, 'ME', 'Sociedade Empresária Limitada', '2019-11-03', 'bulk', true, false, 2, 71, ARRAY['Marketplace', 'Intermediação', 'Serviços']),

-- Manufacturing Companies
('66777888000136', 'INDUSTRIA METALURGICA ABC LTDA', 'MetalABC', 'ATIVA', 'RS', 'Porto Alegre', 'Zona Industrial', 'Rua da Indústria', '500', '91787-000', '(51) 3456-7890', 'comercial@metalabc.com.br', 'Fabricação de estruturas metálicas', '25.11-0/00', 800000.00, 'MEDIO', 'Sociedade Empresária Limitada', '2015-09-12', 'none', false, true, 1, 58, ARRAY['Metalurgia', 'Indústria', 'Estruturas']),

('77888999000127', 'FABRICA DE MOVEIS DESIGN LTDA', 'MóveisDesign', 'ATIVA', 'PR', 'Curitiba', 'CIC', 'Av. das Indústrias', '2500', '81460-000', '(41) 3567-8901', 'pedidos@moveisdesign.com.br', 'Fabricação de móveis com predominância de madeira', '31.01-5/00', 350000.00, 'EPP', 'Sociedade Empresária Limitada', '2016-12-08', 'manual', true, false, 4, 73, ARRAY['Móveis', 'Design', 'Madeira']),

-- Service Companies
('88999000000118', 'CONSULTORIA EMPRESARIAL PREMIUM LTDA', 'ConsultPremium', 'ATIVA', 'SP', 'São Paulo', 'Faria Lima', 'Av. Brigadeiro Faria Lima', '3064', '01451-000', '(11) 2678-9012', 'contato@consultpremium.com.br', 'Consultoria em gestão empresarial', '70.20-4/00', 200000.00, 'ME', 'Sociedade Empresária Limitada', '2021-02-14', 'bulk', false, true, 2, 80, ARRAY['Consultoria', 'Gestão', 'Premium']),

('99000111000109', 'AGENCIA DE MARKETING DIGITAL LTDA', 'MarketingPro', 'ATIVA', 'RJ', 'Rio de Janeiro', 'Barra da Tijuca', 'Av. das Américas', '3434', '22640-102', '(21) 3789-0123', 'hello@marketingpro.com.br', 'Agências de publicidade', '73.11-4/00', 150000.00, 'ME', 'Sociedade Empresária Limitada', '2020-08-25', 'none', true, false, 1, 67, ARRAY['Marketing', 'Digital', 'Publicidade']),

-- Healthcare Companies
('10111222000190', 'CLINICA MEDICA SAUDE TOTAL LTDA', 'SaúdeTotal', 'ATIVA', 'SP', 'São Paulo', 'Jardins', 'Rua Augusta', '2690', '01412-100', '(11) 3890-1234', 'atendimento@saudetotal.com.br', 'Atividades de atendimento hospitalar', '86.10-1/01', 600000.00, 'MEDIO', 'Sociedade Empresária Limitada', '2014-06-30', 'manual', true, true, 6, 88, ARRAY['Saúde', 'Clínica', 'Medicina']),

-- Inactive/Special Cases
('11222333000299', 'EMPRESA INATIVA EXEMPLO LTDA', 'InativaEx', 'BAIXADA', 'SP', 'São Paulo', 'Centro', 'Rua XV de Novembro', '200', '01013-000', NULL, NULL, 'Comércio varejista não especificado', '47.89-0/99', 50000.00, 'ME', 'Sociedade Empresária Limitada', '2010-01-15', 'none', false, false, 0, NULL, ARRAY[]::text[]),

('12345678000195', 'MICROEMPREENDEDOR INDIVIDUAL', NULL, 'ATIVA', 'MG', 'Belo Horizonte', 'Centro', 'Rua da Bahia', '1148', '30160-011', '(31) 9876-5432', 'mei@exemplo.com.br', 'Desenvolvimento de programas de computador sob encomenda', '62.01-5/00', 5000.00, 'MEI', 'Microempreendedor Individual', '2022-03-10', 'none', false, false, 0, 45, ARRAY['MEI', 'Programação']),

-- Large Companies
('20304050000176', 'GRANDE CORPORACAO NACIONAL SA', 'GrandeCorp', 'ATIVA', 'SP', 'São Paulo', 'Vila Olímpia', 'Av. Juscelino Kubitschek', '1830', '04543-900', '(11) 4000-5000', 'corporativo@grandecorp.com.br', 'Holdings de instituições não-financeiras', '64.20-0/00', 50000000.00, 'GRANDE', 'Sociedade Anônima', '2005-11-20', 'manual', true, true, 8, 95, ARRAY['Holding', 'Corporação', 'Nacional']),

-- Companies with enriched data
('30405060000167', 'FINTECH INOVADORA LTDA', 'FintechIno', 'ATIVA', 'SP', 'São Paulo', 'Faria Lima', 'Av. Brigadeiro Faria Lima', '4440', '04538-132', '(11) 5000-6000', 'contato@fintechino.com.br', 'Outras atividades de serviços financeiros', '66.19-3/99', 2000000.00, 'GRANDE', 'Sociedade Empresária Limitada', '2019-04-08', 'manual', true, false, 3, 90, ARRAY['Fintech', 'Financeiro', 'Inovação']),

('40506070000158', 'LOGISTICA EXPRESSA BRASIL LTDA', 'LogExpressa', 'ATIVA', 'RJ', 'Rio de Janeiro', 'Porto', 'Av. Brasil', '15000', '21040-020', '(21) 6000-7000', 'operacoes@logexpressa.com.br', 'Transporte rodoviário de carga', '49.30-2/02', 1500000.00, 'GRANDE', 'Sociedade Empresária Limitada', '2016-08-15', 'bulk', false, true, 4, 82, ARRAY['Logística', 'Transporte', 'Carga']);

-- Insert enriched data for some companies
UPDATE companies SET enriched_data = '{
  "website": "https://www.techsol.com.br",
  "linkedin": "https://linkedin.com/company/techsol-brasil",
  "employees_count": 45,
  "annual_revenue": 2500000,
  "industry_segment": "Tecnologia",
  "business_model": "B2B",
  "technologies": ["React", "Node.js", "AWS", "Docker"],
  "certifications": ["ISO 9001", "ISO 27001"]
}'::jsonb WHERE cnpj = '11222333000181';

UPDATE companies SET enriched_data = '{
  "website": "https://www.startupaccel.com.br",
  "linkedin": "https://linkedin.com/company/startup-accelerator",
  "employees_count": 120,
  "annual_revenue": 15000000,
  "industry_segment": "Investimento",
  "business_model": "B2B",
  "technologies": ["CRM", "Analytics", "AI"],
  "certifications": ["CVM"]
}'::jsonb WHERE cnpj = '33444555000163';

UPDATE companies SET enriched_data = '{
  "website": "https://www.saudetotal.com.br",
  "linkedin": "https://linkedin.com/company/saude-total",
  "employees_count": 200,
  "annual_revenue": 8000000,
  "industry_segment": "Saúde",
  "business_model": "B2C",
  "technologies": ["Prontuário Eletrônico", "Telemedicina"],
  "certifications": ["ANVISA", "ISO 9001"]
}'::jsonb WHERE cnpj = '10111222000190';

UPDATE companies SET enriched_data = '{
  "website": "https://www.fintechino.com.br",
  "linkedin": "https://linkedin.com/company/fintech-inovadora",
  "employees_count": 80,
  "annual_revenue": 12000000,
  "industry_segment": "Fintech",
  "business_model": "B2B",
  "technologies": ["Blockchain", "API", "Machine Learning", "Python"],
  "certifications": ["PCI DSS", "ISO 27001"]
}'::jsonb WHERE cnpj = '30405060000167';

-- Update some CRM stages
UPDATE companies SET crm_stage = 'qualified' WHERE cnpj IN ('11222333000181', '33444555000163');
UPDATE companies SET crm_stage = 'proposal' WHERE cnpj = '10111222000190';
UPDATE companies SET crm_stage = 'negotiation' WHERE cnpj = '30405060000167';
UPDATE companies SET crm_stage = 'lead' WHERE cnpj IN ('77888999000127', '99000111000109');

-- Update some last contact dates
UPDATE companies SET last_contact = CURRENT_DATE - INTERVAL '5 days' WHERE followup_sent = true;

-- Add some follow-up sent dates
UPDATE companies SET followup_sent_at = CURRENT_TIMESTAMP - INTERVAL '3 days' WHERE followup_sent = true;

-- Update enriched_at for enriched companies
UPDATE companies SET enriched_at = CURRENT_TIMESTAMP - INTERVAL '2 days' WHERE enrichment_status != 'none';

COMMIT;
