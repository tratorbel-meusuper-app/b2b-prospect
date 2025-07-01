"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Upload, Search, Calendar, Filter, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface ImportSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportSearch: (filters: any) => void
}

interface SavedSearch {
  id: string
  name: string
  description: string
  filters: any
  activeFiltersCount: number
  createdAt: string
}

export function ImportSearchModal({ open, onOpenChange, onImportSearch }: ImportSearchModalProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadSavedSearches()
    }
  }, [open])

  const loadSavedSearches = async () => {
    setIsLoading(true)
    try {
      // Simulate API call to load saved searches
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock data
      const mockSearches: SavedSearch[] = [
        {
          id: "1",
          name: "Empresas de TI em SP",
          description: "Empresas de tecnologia ativas em São Paulo",
          filters: {
            uf: ["SP"],
            situacao_cadastral: ["ATIVA"],
            codigo_atividade_principal: ["6201501", "6202300"],
          },
          activeFiltersCount: 3,
          createdAt: "2024-01-15T10:30:00Z",
        },
        {
          id: "2",
          name: "Comércio RJ - Pequeno Porte",
          description: "Empresas comerciais de pequeno porte no Rio de Janeiro",
          filters: {
            uf: ["RJ"],
            situacao_cadastral: ["ATIVA"],
            codigo_atividade_principal: ["4781400"],
            capital_social: { minimo: 10000, maximo: 100000 },
          },
          activeFiltersCount: 4,
          createdAt: "2024-01-10T14:20:00Z",
        },
        {
          id: "3",
          name: "Indústrias MG",
          description: "Indústrias ativas em Minas Gerais",
          filters: {
            uf: ["MG"],
            situacao_cadastral: ["ATIVA"],
            codigo_atividade_principal: ["2511000", "2512800"],
          },
          activeFiltersCount: 3,
          createdAt: "2024-01-05T09:15:00Z",
        },
      ]

      setSavedSearches(mockSearches)
    } catch (error) {
      toast.error("Erro ao carregar buscas salvas")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = (search: SavedSearch) => {
    onImportSearch(search.filters)
    onOpenChange(false)
    toast.success(`Busca "${search.name}" importada com sucesso!`)
  }

  const handleDelete = async (searchId: string) => {
    try {
      // Simulate API call to delete search
      await new Promise((resolve) => setTimeout(resolve, 500))

      setSavedSearches((prev) => prev.filter((s) => s.id !== searchId))
      toast.success("Busca removida com sucesso!")
    } catch (error) {
      toast.error("Erro ao remover busca")
    }
  }

  const filteredSearches = savedSearches.filter(
    (search) =>
      search.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      search.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importar Busca Salva
          </DialogTitle>
          <DialogDescription>Selecione uma busca salva para importar suas configurações</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por nome ou descrição..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Saved Searches List */}
          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando buscas salvas...</span>
              </div>
            ) : filteredSearches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Search className="w-8 h-8 mb-2" />
                <p>Nenhuma busca salva encontrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSearches.map((search) => (
                  <div key={search.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{search.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            <Filter className="w-3 h-3 mr-1" />
                            {search.activeFiltersCount} filtros
                          </Badge>
                        </div>

                        {search.description && <p className="text-sm text-gray-600 mb-2">{search.description}</p>}

                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          Criada em {formatDate(search.createdAt)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(search.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        <Button size="sm" onClick={() => handleImport(search)}>
                          Importar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <Separator />

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <div className="text-sm text-gray-500">{filteredSearches.length} busca(s) disponível(is)</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
