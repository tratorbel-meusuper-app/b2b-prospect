"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { SaveSearchModal } from "./save-search-modal"
import { ImportSearchModal } from "./import-search-modal"
import { toast } from "sonner"
import { Search, Save, Upload, X, Plus } from "lucide-react"

interface SearchFormProps {
  onSearchResults: (result: any) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

export function SearchForm({ onSearchResults, loading, setLoading }: SearchFormProps) {
  const [filters, setFilters] = useState({
    cnpj: [] as string[],
    cnpj_raiz: [] as string[],
    situacao_cadastral: [] as string[],
    codigo_atividade_principal: [] as string[],
    codigo_natureza_juridica: [] as string[],
    incluir_atividade_secundaria: false,
    uf: [] as string[],
    municipio: [] as string[],
    bairro: [] as string[],
    cep: [] as string[],
    ddd: [] as string[],
    telefone: [] as string[],
    data_abertura: {},
    capital_social: { minimo: 0, maximo: 0 },
    mei: { optante: false, excluir_optante: false },
    simples: { optante: false, excluir_optante: false },
    mais_filtros: {
      somente_matriz: false,
      somente_filial: false,
      com_email: false,
      com_telefone: false,
      somente_fixo: false,
      somente_celular: false,
      excluir_empresas_visualizadas: false,
      excluir_email_contab: false,
    },
    limite: 100,
    pagina: 1,
  })

  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [tempInputs, setTempInputs] = useState({
    cnpj: "",
    uf: "",
    municipio: "",
    atividade: "",
  })

  const searchCompanies = async (page = 1) => {
    setLoading(true)
    console.log("🔍 Making search request with filters:", { ...filters, pagina: page })

    try {
      const searchFilters = { ...filters, pagina: page }
      
      // Fazer requisição direta para a API externa
      const response = await fetch("https://webhook.meusuper.app/webhook/379f44b4-30cf-4f30-9a25-8f097509a413", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchFilters),
      })

      console.log("🔍 API response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("🔍 API response:", data)

      // Processar a resposta da API
      let companies = []
      let total = 0

      if (Array.isArray(data) && data.length > 0) {
        const responseData = data[0] // Pegar o primeiro item do array
        total = responseData.total || 0
        
        if (responseData.cnpjs && Array.isArray(responseData.cnpjs)) {
          companies = responseData.cnpjs.map((company: any) => ({
            cnpj: company.cnpj,
            razao_social: company.razao_social,
            nome_fantasia: company.nome_fantasia || "",
            situacao_cadastral: company.situacao_cadastral?.situacao_atual || "N/A",
            motivo_situacao: company.situacao_cadastral?.motivo || "",
            data_situacao: company.situacao_cadastral?.data || "",
            uf: company.uf || "",
            municipio: company.municipio || "",
            bairro: company.bairro || "",
            logradouro: company.logradouro || "",
            numero: company.numero || "",
            cep: company.cep || "",
            telefone: company.telefone || "",
            email: company.email || "",
            atividade_principal: company.atividade_principal || "",
            cnae_principal: company.cnae_principal || "",
            capital_social: company.capital_social || 0,
            porte: company.porte || "",
            natureza_juridica: company.natureza_juridica || "",
            data_abertura: company.data_abertura || "",
            enrichment_status: "none",
          }))
        }
      }

      const totalPages = Math.ceil(total / filters.limite)
      const hasMore = page < totalPages

      const result = {
        success: true,
        leads: companies,
        total: total,
        page: page,
        limit: filters.limite,
        totalPages: totalPages,
        hasMore: hasMore,
        filters: searchFilters,
        searchFunction: searchCompanies,
      }

      console.log("🔍 Processed result:", {
        success: result.success,
        leadsCount: result.leads.length,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      })

      onSearchResults(result)
    } catch (error) {
      console.error("🔍 Search error:", error)
      onSearchResults({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido na busca",
        leads: [],
        total: 0,
        page: 1,
        limit: filters.limite,
        totalPages: 1,
        hasMore: false,
      })
      toast.error("Erro ao buscar empresas")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    searchCompanies(1)
  }

  const addToFilter = (filterName: string, value: string) => {
    if (!value.trim()) return

    setFilters((prev) => ({
      ...prev,
      [filterName]: [...(prev[filterName as keyof typeof prev] as string[]), value.trim()],
    }))

    setTempInputs((prev) => ({
      ...prev,
      [filterName]: "",
    }))
  }

  const removeFromFilter = (filterName: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: (prev[filterName as keyof typeof prev] as string[]).filter((item) => item !== value),
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      cnpj: [],
      cnpj_raiz: [],
      situacao_cadastral: [],
      codigo_atividade_principal: [],
      codigo_natureza_juridica: [],
      incluir_atividade_secundaria: false,
      uf: [],
      municipio: [],
      bairro: [],
      cep: [],
      ddd: [],
      telefone: [],
      data_abertura: {},
      capital_social: { minimo: 0, maximo: 0 },
      mei: { optante: false, excluir_optante: false },
      simples: { optante: false, excluir_optante: false },
      mais_filtros: {
        somente_matriz: false,
        somente_filial: false,
        com_email: false,
        com_telefone: false,
        somente_fixo: false,
        somente_celular: false,
        excluir_empresas_visualizadas: false,
        excluir_email_contab: false,
      },
      limite: 100,
      pagina: 1,
    })
    setTempInputs({
      cnpj: "",
      uf: "",
      municipio: "",
      atividade: "",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Busca Avançada de Empresas
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
                <Upload className="w-4 h-4 mr-1" />
                Importar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSaveModal(true)}>
                <Save className="w-4 h-4 mr-1" />
                Salvar
              </Button>
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* CNPJ Filter */}
          <div className="space-y-2">
            <Label>CNPJ</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Digite um CNPJ (apenas números)"
                value={tempInputs.cnpj}
                onChange={(e) => setTempInputs((prev) => ({ ...prev, cnpj: e.target.value }))}
                onKeyPress={(e) => e.key === "Enter" && addToFilter("cnpj", tempInputs.cnpj)}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => addToFilter("cnpj", tempInputs.cnpj)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {filters.cnpj.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.cnpj.map((cnpj) => (
                  <Badge key={cnpj} variant="secondary" className="cursor-pointer">
                    {cnpj}
                    <X className="w-3 h-3 ml-1" onClick={() => removeFromFilter("cnpj", cnpj)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* UF Filter */}
          <div className="space-y-2">
            <Label>Estado (UF)</Label>
            <div className="flex gap-2">
              <Select
                value={tempInputs.uf}
                onValueChange={(value) => setTempInputs((prev) => ({ ...prev, uf: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AC">Acre</SelectItem>
                  <SelectItem value="AL">Alagoas</SelectItem>
                  <SelectItem value="AP">Amapá</SelectItem>
                  <SelectItem value="AM">Amazonas</SelectItem>
                  <SelectItem value="BA">Bahia</SelectItem>
                  <SelectItem value="CE">Ceará</SelectItem>
                  <SelectItem value="DF">Distrito Federal</SelectItem>
                  <SelectItem value="ES">Espírito Santo</SelectItem>
                  <SelectItem value="GO">Goiás</SelectItem>
                  <SelectItem value="MA">Maranhão</SelectItem>
                  <SelectItem value="MT">Mato Grosso</SelectItem>
                  <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                  <SelectItem value="MG">Minas Gerais</SelectItem>
                  <SelectItem value="PA">Pará</SelectItem>
                  <SelectItem value="PB">Paraíba</SelectItem>
                  <SelectItem value="PR">Paraná</SelectItem>
                  <SelectItem value="PE">Pernambuco</SelectItem>
                  <SelectItem value="PI">Piauí</SelectItem>
                  <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                  <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                  <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                  <SelectItem value="RO">Rondônia</SelectItem>
                  <SelectItem value="RR">Roraima</SelectItem>
                  <SelectItem value="SC">Santa Catarina</SelectItem>
                  <SelectItem value="SP">São Paulo</SelectItem>
                  <SelectItem value="SE">Sergipe</SelectItem>
                  <SelectItem value="TO">Tocantins</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addToFilter("uf", tempInputs.uf)}
                disabled={!tempInputs.uf}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {filters.uf.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.uf.map((uf) => (
                  <Badge key={uf} variant="secondary" className="cursor-pointer">
                    {uf}
                    <X className="w-3 h-3 ml-1" onClick={() => removeFromFilter("uf", uf)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Município Filter */}
          <div className="space-y-2">
            <Label>Município</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Digite o nome do município"
                value={tempInputs.municipio}
                onChange={(e) => setTempInputs((prev) => ({ ...prev, municipio: e.target.value }))}
                onKeyPress={(e) => e.key === "Enter" && addToFilter("municipio", tempInputs.municipio)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addToFilter("municipio", tempInputs.municipio)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {filters.municipio.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.municipio.map((municipio) => (
                  <Badge key={municipio} variant="secondary" className="cursor-pointer">
                    {municipio}
                    <X className="w-3 h-3 ml-1" onClick={() => removeFromFilter("municipio", municipio)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Situação Cadastral */}
          <div className="space-y-2">
            <Label>Situação Cadastral</Label>
            <div className="flex gap-2">
              <Select onValueChange={(value) => addToFilter("situacao_cadastral", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma situação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ATIVA">Ativa</SelectItem>
                  <SelectItem value="BAIXADA">Baixada</SelectItem>
                  <SelectItem value="INAPTA">Inapta</SelectItem>
                  <SelectItem value="SUSPENSA">Suspensa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {filters.situacao_cadastral.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.situacao_cadastral.map((situacao) => (
                  <Badge key={situacao} variant="secondary" className="cursor-pointer">
                    {situacao}
                    <X className="w-3 h-3 ml-1" onClick={() => removeFromFilter("situacao_cadastral", situacao)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Capital Social */}
          <div className="space-y-2">
            <Label>Capital Social</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm">Mínimo</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.capital_social.minimo || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      capital_social: { ...prev.capital_social, minimo: Number(e.target.value) },
                    }))
                  }
                />
              </div>
              <div>
                <Label className="text-sm">Máximo</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.capital_social.maximo || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      capital_social: { ...prev.capital_social, maximo: Number(e.target.value) },
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Filtros Adicionais */}
          <div className="space-y-4">
            <Label>Filtros Adicionais</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="com_email"
                    checked={filters.mais_filtros.com_email}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({
                        ...prev,
                        mais_filtros: { ...prev.mais_filtros, com_email: !!checked },
                      }))
                    }
                  />
                  <Label htmlFor="com_email">Com email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="com_telefone"
                    checked={filters.mais_filtros.com_telefone}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({
                        ...prev,
                        mais_filtros: { ...prev.mais_filtros, com_telefone: !!checked },
                      }))
                    }
                  />
                  <Label htmlFor="com_telefone">Com telefone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="somente_matriz"
                    checked={filters.mais_filtros.somente_matriz}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({
                        ...prev,
                        mais_filtros: { ...prev.mais_filtros, somente_matriz: !!checked },
                      }))
                    }
                  />
                  <Label htmlFor="somente_matriz">Somente matriz</Label>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="somente_filial"
                    checked={filters.mais_filtros.somente_filial}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({
                        ...prev,
                        mais_filtros: { ...prev.mais_filtros, somente_filial: !!checked },
                      }))
                    }
                  />
                  <Label htmlFor="somente_filial">Somente filial</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mei_optante"
                    checked={filters.mei.optante}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({
                        ...prev,
                        mei: { ...prev.mei, optante: !!checked },
                      }))
                    }
                  />
                  <Label htmlFor="mei_optante">MEI optante</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="simples_optante"
                    checked={filters.simples.optante}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({
                        ...prev,
                        simples: { ...prev.simples, optante: !!checked },
                      }))
                    }
                  />
                  <Label htmlFor="simples_optante">Simples optante</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Limite de resultados */}
          <div className="space-y-2">
            <Label>Limite de resultados por página</Label>
            <Select
              value={filters.limite.toString()}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, limite: Number(value) }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
                <SelectItem value="500">500</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <Button onClick={handleSearch} disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Buscar Empresas
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Modals */}
      <SaveSearchModal 
        open={showSaveModal} 
        onOpenChange={setShowSaveModal} 
        filters={filters} 
        activeFiltersCount={Object.keys(filters).filter(key => {
          const value = filters[key as keyof typeof filters]
          if (Array.isArray(value)) return value.length > 0
          if (typeof value === 'object' && value !== null) {
            return Object.values(value).some(v => v !== 0 && v !== false && v !== "")
          }
          return false
        }).length}
      />

      <ImportSearchModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onImportSearch={(importedFilters) => {
          setFilters(importedFilters)
          toast.success("Busca importada com sucesso!")
        }}
      />
    </div>
  )
}