"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Plus, Filter, Target, Trash2, Edit } from "lucide-react"

interface Audience {
  id: number
  name: string
  description: string
  filters: any
  company_count: number
  created_at: string
}

interface AudienceManagerProps {
  companies?: any[]
}

export function AudienceManager({ companies = [] }: AudienceManagerProps) {
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [selectedAudience, setSelectedAudience] = useState<Audience | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form states
  const [audienceName, setAudienceName] = useState("")
  const [audienceDescription, setAudienceDescription] = useState("")
  const [filters, setFilters] = useState({
    situacao: "Todas",
    minScore: 0,
    maxScore: 100,
    tags: [] as string[],
    hasFantasia: false,
    keywords: "",
  })

  useEffect(() => {
    fetchAudiences()
  }, [])

  const fetchAudiences = async () => {
    try {
      const response = await fetch("/api/audiences")
      if (response.ok) {
        const data = await response.json()
        setAudiences(Array.isArray(data.audiences) ? data.audiences : [])
      }
    } catch (error) {
      console.error("Error fetching audiences:", error)
      setAudiences([])
    }
  }

  const createAudience = async () => {
    if (!audienceName.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/audiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: audienceName,
          description: audienceDescription,
          filters: filters,
        }),
      })

      if (response.ok) {
        await fetchAudiences()
        setIsCreateModalOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error creating audience:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteAudience = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta audiência?")) return

    try {
      const response = await fetch(`/api/audiences/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchAudiences()
      }
    } catch (error) {
      console.error("Error deleting audience:", error)
    }
  }

  const resetForm = () => {
    setAudienceName("")
    setAudienceDescription("")
    setFilters({
      situacao: "Todas",
      minScore: 0,
      maxScore: 100,
      tags: [],
      hasFantasia: false,
      keywords: "",
    })
  }

  const openEditModal = (audience: Audience) => {
    setSelectedAudience(audience)
    setAudienceName(audience.name)
    setAudienceDescription(audience.description)
    setFilters(
      audience.filters || {
        situacao: "Todas",
        minScore: 0,
        maxScore: 100,
        tags: [],
        hasFantasia: false,
        keywords: "",
      },
    )
  }

  const getFilteredCount = () => {
    // Ensure companies is an array and has a filter method
    if (!Array.isArray(companies) || companies.length === 0) {
      return 0
    }

    return companies.filter((company) => {
      // Ensure company exists and has required properties
      if (!company) return false

      // Check situacao filter
      if (filters.situacao !== "Todas") {
        const situacaoAtual = company.situacao_cadastral?.situacao_atual || company.situacao || ""
        if (situacaoAtual !== filters.situacao) {
          return false
        }
      }

      // Check hasFantasia filter
      if (filters.hasFantasia && !company.nome_fantasia) {
        return false
      }

      // Check keywords filter
      if (filters.keywords && filters.keywords.trim()) {
        const keywords = filters.keywords.toLowerCase()
        const searchText = `${company.razao_social || ""} ${company.nome_fantasia || ""}`.toLowerCase()
        if (!searchText.includes(keywords)) {
          return false
        }
      }

      // Check score range
      const aiScore = company.ai_score || 0
      if (aiScore < filters.minScore || aiScore > filters.maxScore) {
        return false
      }

      return true
    }).length
  }

  const predefinedColors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#6366F1",
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gerenciamento de Audiências</h2>
          <p className="text-slate-600">Crie e gerencie segmentos de empresas para campanhas direcionadas</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Audiência
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Audiência</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                <TabsTrigger value="filters">Filtros Avançados</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Audiência</Label>
                  <Input
                    id="name"
                    value={audienceName}
                    onChange={(e) => setAudienceName(e.target.value)}
                    placeholder="Ex: Empresas de Tecnologia Ativas"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={audienceDescription}
                    onChange={(e) => setAudienceDescription(e.target.value)}
                    placeholder="Descreva o objetivo desta audiência..."
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="filters" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Situação Cadastral</Label>
                    <Select
                      value={filters.situacao}
                      onValueChange={(value) => setFilters({ ...filters, situacao: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todas">Todas</SelectItem>
                        <SelectItem value="ATIVA">Ativa</SelectItem>
                        <SelectItem value="INAPTA">Inapta</SelectItem>
                        <SelectItem value="BAIXADA">Baixada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Score IA (Mínimo)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.minScore}
                      onChange={(e) => setFilters({ ...filters, minScore: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Score IA (Máximo)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.maxScore}
                    onChange={(e) => setFilters({ ...filters, maxScore: Number.parseInt(e.target.value) || 100 })}
                  />
                </div>

                <div>
                  <Label>Palavras-chave</Label>
                  <Input
                    value={filters.keywords}
                    onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
                    placeholder="Ex: tecnologia, serviços, comércio"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasFantasia"
                    checked={filters.hasFantasia}
                    onChange={(e) => setFilters({ ...filters, hasFantasia: e.target.checked })}
                  />
                  <Label htmlFor="hasFantasia">Apenas empresas com nome fantasia</Label>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Target className="w-4 h-4" />
                    <span className="font-medium">Prévia: {getFilteredCount()} empresas</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={createAudience} disabled={loading}>
                {loading ? "Criando..." : "Criar Audiência"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Audiences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(audiences) &&
          audiences.map((audience) => (
            <Card
              key={audience.id}
              className="bg-white/70 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{audience.name}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{audience.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEditModal(audience)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteAudience(audience.id)}>
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Empresas</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      <Users className="w-3 h-3 mr-1" />
                      {audience.company_count || 0}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Criada em</span>
                    <span className="text-sm">{new Date(audience.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>

                  <div className="pt-2 border-t">
                    <Button size="sm" className="w-full bg-transparent" variant="outline">
                      <Filter className="w-3 h-3 mr-2" />
                      Ver Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {(!Array.isArray(audiences) || audiences.length === 0) && (
        <Card className="bg-white/70 backdrop-blur-sm border border-white/20">
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma audiência criada</h3>
            <p className="text-slate-600 mb-4">
              Crie sua primeira audiência para segmentar empresas e executar campanhas direcionadas.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Audiência
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      <Dialog open={!!selectedAudience} onOpenChange={() => setSelectedAudience(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Audiência</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="filters">Filtros Avançados</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div>
                <Label htmlFor="editName">Nome da Audiência</Label>
                <Input
                  id="editName"
                  value={audienceName}
                  onChange={(e) => setAudienceName(e.target.value)}
                  placeholder="Ex: Empresas de Tecnologia Ativas"
                />
              </div>
              <div>
                <Label htmlFor="editDescription">Descrição</Label>
                <Textarea
                  id="editDescription"
                  value={audienceDescription}
                  onChange={(e) => setAudienceDescription(e.target.value)}
                  placeholder="Descreva o objetivo desta audiência..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Situação Cadastral</Label>
                  <Select
                    value={filters.situacao}
                    onValueChange={(value) => setFilters({ ...filters, situacao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todas">Todas</SelectItem>
                      <SelectItem value="ATIVA">Ativa</SelectItem>
                      <SelectItem value="INAPTA">Inapta</SelectItem>
                      <SelectItem value="BAIXADA">Baixada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Score IA (Mínimo)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.minScore}
                    onChange={(e) => setFilters({ ...filters, minScore: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label>Score IA (Máximo)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.maxScore}
                  onChange={(e) => setFilters({ ...filters, maxScore: Number.parseInt(e.target.value) || 100 })}
                />
              </div>

              <div>
                <Label>Palavras-chave</Label>
                <Input
                  value={filters.keywords}
                  onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
                  placeholder="Ex: tecnologia, serviços, comércio"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editHasFantasia"
                  checked={filters.hasFantasia}
                  onChange={(e) => setFilters({ ...filters, hasFantasia: e.target.checked })}
                />
                <Label htmlFor="editHasFantasia">Apenas empresas com nome fantasia</Label>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <Target className="w-4 h-4" />
                  <span className="font-medium">Prévia: {getFilteredCount()} empresas</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setSelectedAudience(null)}>
              Cancelar
            </Button>
            <Button onClick={createAudience} disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
