"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { SearchForm } from "@/components/search-form"
import { LeadsTable } from "@/components/leads-table"
import { KanbanBoard } from "@/components/kanban-board"
import { MapView } from "@/components/map-view"
import { AIInsights } from "@/components/ai-insights"
import { FollowUpCampaigns } from "@/components/follow-up-campaigns"
import { AudienceManager } from "@/components/audience-manager"
import { TagsManager } from "@/components/tags-manager"
import { Search, Users, BarChart3, Map, Brain, Send, Target, Tag } from "lucide-react"

interface Lead {
  cnpj: string
  razao_social: string
  nome_fantasia?: string
  situacao_cadastral?: string
  uf?: string
  municipio?: string
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
  enrichment_status?: "none" | "manual" | "bulk"
  enriched_at?: string
  in_crm?: boolean
  crm_stage?: string
  followup_sent?: boolean
  followup_sent_at?: string
  tags?: string[]
  ai_score?: number
  last_contact?: string
  contact_attempts?: number
  enrichedData?: any
}

interface SearchResult {
  success: boolean
  leads: Lead[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
  filters?: any
  searchFunction?: (page: number) => Promise<void>
  error?: string
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("search")
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [kanbanLeads, setKanbanLeads] = useState<Lead[]>([])

  // Load kanban leads from localStorage on mount
  useEffect(() => {
    const savedKanbanLeads = localStorage.getItem("kanbanLeads")
    if (savedKanbanLeads) {
      setKanbanLeads(JSON.parse(savedKanbanLeads))
    }
  }, [])

  // Save kanban leads to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("kanbanLeads", JSON.stringify(kanbanLeads))
  }, [kanbanLeads])

  const handleSearchResults = (result: SearchResult) => {
    console.log("📊 Search results received:", result)
    setSearchResult(result)
    if (result.success && result.leads.length > 0) {
      setActiveTab("leads") // Switch to leads tab automatically
    }
  }

  const handlePageChange = async (page: number) => {
    if (!searchResult?.searchFunction) return

    setLoading(true)
    try {
      await searchResult.searchFunction(page)
    } finally {
      setLoading(false)
    }
  }

  const handleMoveToKanban = (leads: Lead[]) => {
    // Add leads to Kanban
    setKanbanLeads((prev) => {
      const existingCnpjs = new Set(prev.map((lead) => lead.cnpj))
      const newLeads = leads.filter((lead) => !existingCnpjs.has(lead.cnpj))
      return [...prev, ...newLeads.map((lead) => ({ ...lead, crm_stage: lead.crm_stage || "lead" }))]
    })

    // Remove from search results
    if (searchResult) {
      const leadCnpjs = leads.map((lead) => lead.cnpj)
      const filteredLeads = searchResult.leads.filter((lead) => !leadCnpjs.includes(lead.cnpj))
      setSearchResult({
        ...searchResult,
        leads: filteredLeads,
      })
    }
  }

  const handleRestoreFromKanban = (leads: Lead[]) => {
    const leadCnpjs = leads.map((lead) => lead.cnpj)

    // Remove from Kanban
    setKanbanLeads((prev) => prev.filter((lead) => !leadCnpjs.includes(lead.cnpj)))

    // Add back to search results if there's an active search
    if (searchResult) {
      setSearchResult({
        ...searchResult,
        leads: [...searchResult.leads, ...leads],
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">B2B Prospecting Platform</h1>
          <p className="text-gray-600">Encontre, enriqueça e gerencie seus leads B2B</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Busca
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Leads
              {searchResult?.total && (
                <Badge variant="secondary" className="ml-1">
                  {searchResult.total.toLocaleString()}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Kanban
              {kanbanLeads.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {kanbanLeads.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Mapa
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              IA Insights
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Campanhas
            </TabsTrigger>
            <TabsTrigger value="audiences" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Audiências
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-6">
            <SearchForm onSearchResults={handleSearchResults} loading={loading} setLoading={setLoading} />
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <LeadsTable
              searchResult={searchResult}
              loading={loading}
              onPageChange={handlePageChange}
              onMoveToKanban={handleMoveToKanban}
            />
          </TabsContent>

          <TabsContent value="kanban" className="mt-6">
            <KanbanBoard
              leads={kanbanLeads}
              onLeadsUpdate={setKanbanLeads}
              onRestoreToLeads={handleRestoreFromKanban}
            />
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <MapView leads={searchResult?.leads || []} />
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <AIInsights leads={searchResult?.leads || []} />
          </TabsContent>

          <TabsContent value="campaigns" className="mt-6">
            <FollowUpCampaigns />
          </TabsContent>

          <TabsContent value="audiences" className="mt-6">
            <AudienceManager />
          </TabsContent>

          <TabsContent value="tags" className="mt-6">
            <TagsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
