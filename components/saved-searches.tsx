"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BookOpen, Plus, Search, Trash2, Clock, BarChart3 } from "lucide-react"

interface SavedSearch {
  id: number
  name: string
  filters: any
  results_count: number
  last_used: string | null
  created_at: string
}

interface SavedSearchesProps {
  onLoadSearch: (filters: any) => void
  currentFilters?: any
  currentResultsCount?: number
}

export function SavedSearches({ onLoadSearch, currentFilters, currentResultsCount }: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchName, setSearchName] = useState("")
  // const [currentFilters, setCurrentFilters] = useState({}) // Removed because it's passed as a prop

  useEffect(() => {
    fetchSavedSearches()
  }, [])

  const fetchSavedSearches = async () => {
    try {
      const response = await fetch("/api/saved-searches")
      if (response.ok) {
        const data = await response.json()
        setSavedSearches(data.searches)
      }
    } catch (error) {
      console.error("Error fetching saved searches:", error)
    }
  }

  const saveCurrentSearch = async () => {
    if (!searchName.trim()) return

    const filtersToSave = currentFilters || {}

    try {
      const response = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: searchName,
          filters: filtersToSave,
          results_count: currentResultsCount || 0,
        }),
      })

      if (response.ok) {
        await fetchSavedSearches()
        setIsCreateModalOpen(false)
        setSearchName("")
      }
    } catch (error) {
      console.error("Error saving search:", error)
    }
  }

  const loadSearch = async (search: SavedSearch) => {
    // Update last used
    try {
      await fetch(`/api/saved-searches/${search.id}/use`, {
        method: "POST",
      })
      await fetchSavedSearches()
    } catch (error) {
      console.error("Error updating last used:", error)
    }

    // Load the search
    onLoadSearch(search.filters)
  }

  const deleteSearch = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta pesquisa salva?")) return

    try {
      const response = await fetch(`/api/saved-searches/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchSavedSearches()
      }
    } catch (error) {
      console.error("Error deleting search:", error)
    }
  }

  const getFilterSummary = (filters: any) => {
    const summary = []

    if (filters.uf?.length > 0) {
      summary.push(`UF: ${filters.uf.join(", ")}`)
    }
    if (filters.situacao_cadastral?.length > 0) {
      summary.push(`Situação: ${filters.situacao_cadastral.join(", ")}`)
    }
    if (filters.codigo_atividade_principal?.length > 0) {
      summary.push(`${filters.codigo_atividade_principal.length} CNAEs`)
    }
    if (filters.capital_social?.minimo > 0 || filters.capital_social?.maximo > 0) {
      summary.push(`Capital: R$ ${filters.capital_social.minimo} - R$ ${filters.capital_social.maximo}`)
    }

    return summary.length > 0 ? summary.join(" • ") : "Filtros básicos"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pesquisas Salvas</h2>
          <p className="text-slate-600">Reutilize filtros de busca frequentemente utilizados</p>
        </div>
        <div className="flex gap-2">
          {currentFilters && Object.keys(currentFilters).length > 0 && (
            <Button onClick={() => setIsCreateModalOpen(true)} variant="outline" className="bg-white/70">
              <Plus className="w-4 h-4 mr-2" />
              Salvar Pesquisa Atual
            </Button>
          )}
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Pesquisa
          </Button>
        </div>
      </div>

      {/* Searches Grid */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogTrigger asChild>
          {/* This trigger is now just a placeholder, the button is rendered directly */}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Pesquisa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome da Pesquisa</label>
              <Input
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Ex: Empresas de TI em SP"
              />
            </div>
            {currentFilters && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Esta pesquisa salvará os filtros da busca atual.</p>
                {currentResultsCount && (
                  <p className="text-sm font-medium text-blue-600">{currentResultsCount} resultados encontrados</p>
                )}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveCurrentSearch}>Salvar Pesquisa</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedSearches.map((search) => (
          <Card
            key={search.id}
            className="bg-white/70 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{search.name}</CardTitle>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{getFilterSummary(search.filters)}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteSearch(search.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Resultados</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    {search.results_count.toLocaleString()}
                  </Badge>
                </div>

                {search.last_used && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Último uso</span>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Clock className="w-3 h-3" />
                      {new Date(search.last_used).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Criada em</span>
                  <span className="text-sm text-slate-500">
                    {new Date(search.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <div className="pt-2 border-t">
                  <Button size="sm" className="w-full" onClick={() => loadSearch(search)}>
                    <Search className="w-3 h-3 mr-2" />
                    Executar Pesquisa
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {savedSearches.length === 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border border-white/20">
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma pesquisa salva</h3>
            <p className="text-slate-600 mb-4">
              Execute uma busca avançada e salve os filtros para reutilizar posteriormente.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Salvar Primeira Pesquisa
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
