"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Building2, Phone, Mail, ExternalLink, Users, Calendar, DollarSign } from "lucide-react"

interface Lead {
  cnpj: string
  razao_social: string
  nome_fantasia?: string
  situacao: string
  uf: string
  municipio: string
  bairro?: string
  logradouro?: string
  numero?: string
  cep?: string
  telefone?: string
  email?: string
  atividade_principal?: string
  cnae_principal?: string
  capital_social?: number
  porte?: string
  natureza_juridica?: string
  data_abertura?: string
  enrichment_status?: "none" | "manual" | "bulk" | "failed"
  enriched_at?: string
  in_crm?: boolean
  crm_stage?: string
  followup_sent?: boolean
  followup_sent_at?: string
  enrichedData?: any
  latitude?: number
  longitude?: number
}

interface MapViewProps {
  leads: Lead[]
}

export function MapView({ leads = [] }: MapViewProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [enrichedLeads, setEnrichedLeads] = useState<Lead[]>([])

  // Filter to show only enriched leads with location data
  useEffect(() => {
    const filtered = leads.filter(
      (lead) =>
        lead.enrichment_status &&
        lead.enrichment_status !== "none" &&
        lead.enrichment_status !== "failed" &&
        (lead.latitude || lead.municipio), // Has coordinates or at least city
    )
    setEnrichedLeads(filtered)
  }, [leads])

  // Mock coordinates for demonstration (in real app, you'd geocode addresses)
  const getLeadCoordinates = (lead: Lead) => {
    if (lead.latitude && lead.longitude) {
      return { lat: lead.latitude, lng: lead.longitude }
    }

    // Mock coordinates based on city/state for demo
    const mockCoords: { [key: string]: { lat: number; lng: number } } = {
      "São Paulo-SP": { lat: -23.5505, lng: -46.6333 },
      "Rio de Janeiro-RJ": { lat: -22.9068, lng: -43.1729 },
      "Belo Horizonte-MG": { lat: -19.9191, lng: -43.9378 },
      "Brasília-DF": { lat: -15.8267, lng: -47.9218 },
      "Salvador-BA": { lat: -12.9714, lng: -38.5014 },
      "Fortaleza-CE": { lat: -3.7319, lng: -38.5267 },
      "Curitiba-PR": { lat: -25.4284, lng: -49.2733 },
      "Recife-PE": { lat: -8.0476, lng: -34.877 },
      "Porto Alegre-RS": { lat: -30.0346, lng: -51.2177 },
      "Manaus-AM": { lat: -3.119, lng: -60.0217 },
    }

    const key = `${lead.municipio}-${lead.uf}`
    return mockCoords[key] || { lat: -15.7942, lng: -47.8822 } // Default to center of Brazil
  }

  const getEnrichmentBadge = (lead: Lead) => {
    const badges = {
      manual: <Badge className="bg-blue-100 text-blue-800">Manual</Badge>,
      bulk: <Badge className="bg-purple-100 text-purple-800">Massa</Badge>,
    }
    return lead.enrichment_status ? badges[lead.enrichment_status as keyof typeof badges] : null
  }

  const formatCurrency = (value?: number) => {
    if (!value) return "N/A"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Map Area */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Mapa de Leads Enriquecidos
              <Badge variant="secondary" className="ml-2">
                {enrichedLeads.length} leads
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full p-0">
            <div className="relative w-full h-full bg-slate-100 rounded-lg overflow-hidden">
              {/* Simplified map representation */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
                <div className="absolute inset-4 bg-white/20 rounded-lg border-2 border-dashed border-white/40 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Visualização do Mapa</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {enrichedLeads.length} leads enriquecidos com localização
                    </p>

                    {/* Mock map points */}
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                      {enrichedLeads.slice(0, 9).map((lead, index) => (
                        <button
                          key={lead.cnpj}
                          onClick={() => setSelectedLead(lead)}
                          className={`p-2 rounded-lg border-2 transition-all ${
                            selectedLead?.cnpj === lead.cnpj
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 bg-white hover:border-blue-300"
                          }`}
                        >
                          <Building2 className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                          <div className="text-xs font-medium truncate">{lead.razao_social.split(" ")[0]}</div>
                          <div className="text-xs text-gray-500">{lead.municipio}</div>
                        </button>
                      ))}
                    </div>

                    {enrichedLeads.length > 9 && (
                      <p className="text-xs text-gray-500 mt-2">+{enrichedLeads.length - 9} mais leads</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Details Panel */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">{selectedLead ? "Detalhes do Lead" : "Selecione um Lead"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedLead ? (
              <div className="space-y-4">
                {/* Company Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Empresa</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="font-medium">{selectedLead.razao_social}</div>
                      {selectedLead.nome_fantasia && (
                        <div className="text-sm text-gray-600">{selectedLead.nome_fantasia}</div>
                      )}
                      <div className="text-xs text-gray-500 font-mono">{selectedLead.cnpj}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          selectedLead.situacao === "ATIVA" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }
                      >
                        {selectedLead.situacao}
                      </Badge>
                      {getEnrichmentBadge(selectedLead)}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contato</h4>
                  <div className="space-y-2">
                    {selectedLead.telefone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{selectedLead.telefone}</span>
                      </div>
                    )}
                    {selectedLead.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{selectedLead.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Endereço</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {selectedLead.logradouro && (
                      <div>
                        {selectedLead.logradouro}, {selectedLead.numero}
                      </div>
                    )}
                    {selectedLead.bairro && <div>{selectedLead.bairro}</div>}
                    <div>
                      {selectedLead.municipio}, {selectedLead.uf}
                    </div>
                    {selectedLead.cep && <div>CEP: {selectedLead.cep}</div>}
                  </div>
                </div>

                {/* Business Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Atividade</h4>
                  <div className="text-sm text-gray-600">{selectedLead.atividade_principal || "Não informado"}</div>
                  {selectedLead.cnae_principal && (
                    <div className="text-xs text-gray-500 mt-1">CNAE: {selectedLead.cnae_principal}</div>
                  )}
                </div>

                {/* Enriched Data */}
                {selectedLead.enrichedData && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Dados Enriquecidos</h4>
                    <div className="space-y-2 text-sm">
                      {selectedLead.capital_social && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span>Capital: {formatCurrency(selectedLead.capital_social)}</span>
                        </div>
                      )}

                      {selectedLead.porte && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span>Porte: {selectedLead.porte}</span>
                        </div>
                      )}

                      {selectedLead.data_abertura && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Abertura: {formatDate(selectedLead.data_abertura)}</span>
                        </div>
                      )}

                      {selectedLead.enrichedData.company?.partners && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>Sócios: {selectedLead.enrichedData.company.partners.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Enrichment Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Enriquecimento</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Tipo: {selectedLead.enrichment_status === "manual" ? "Manual" : "Em Massa"}</div>
                    {selectedLead.enriched_at && <div>Data: {formatDate(selectedLead.enriched_at)}</div>}
                  </div>
                </div>

                {/* CRM Status */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Status CRM</h4>
                  <div className="space-y-2">
                    {selectedLead.in_crm ? (
                      <Badge className="bg-green-100 text-green-800">No CRM - {selectedLead.crm_stage}</Badge>
                    ) : (
                      <Badge variant="outline">Não enviado para CRM</Badge>
                    )}

                    {selectedLead.followup_sent && (
                      <Badge className="bg-blue-100 text-blue-800">Follow-up enviado</Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    {!selectedLead.in_crm && (
                      <Button size="sm" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Enviar para CRM
                      </Button>
                    )}

                    {selectedLead.email && !selectedLead.followup_sent && (
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        <Mail className="w-4 h-4 mr-2" />
                        Enviar Follow-up
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um Lead</h3>
                <p className="text-gray-600 text-sm">
                  Clique em um ponto no mapa para ver os detalhes do lead enriquecido
                </p>

                {enrichedLeads.length === 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Nenhum lead enriquecido com localização encontrado. Enriqueça alguns leads primeiro para vê-los no
                      mapa.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
