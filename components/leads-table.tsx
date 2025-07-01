"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  Search,
  MoreHorizontal,
  Download,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Users,
  Sparkles,
  ArrowRight,
} from "lucide-react"

interface LeadsTableProps {
  searchResult: any
  loading: boolean
  onPageChange: (page: number) => void
  onMoveToKanban?: (leads: any[]) => void
}

export function LeadsTable({ searchResult, loading, onPageChange, onMoveToKanban }: LeadsTableProps) {
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  console.log("🔍 LeadsTable received searchResult:", searchResult)

  if (!searchResult) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Search className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma busca realizada</h3>
          <p className="text-gray-500 text-center">
            Use o formulário de busca para encontrar empresas e visualizar os resultados aqui.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!searchResult.success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro na busca</h3>
          <p className="text-gray-500 text-center">{searchResult.error || "Ocorreu um erro ao buscar empresas."}</p>
        </CardContent>
      </Card>
    )
  }

  const leads = searchResult.leads || []
  console.log("🔍 Processing leads in table:", { count: leads.length, leads: leads.slice(0, 2) })

  const filteredLeads = leads.filter((lead: any) => {
    const matchesSearch =
      searchTerm === "" ||
      lead.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.cnpj?.includes(searchTerm)

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "ativa" && lead.situacao_cadastral === "ATIVA") ||
      (statusFilter === "baixada" && lead.situacao_cadastral === "BAIXADA") ||
      (statusFilter === "inapta" && lead.situacao_cadastral === "INAPTA")

    return matchesSearch && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(filteredLeads.map((lead: any) => lead.cnpj)))
    } else {
      setSelectedLeads(new Set())
    }
  }

  const handleSelectLead = (cnpj: string, checked: boolean) => {
    const newSelected = new Set(selectedLeads)
    if (checked) {
      newSelected.add(cnpj)
    } else {
      newSelected.delete(cnpj)
    }
    setSelectedLeads(newSelected)
  }

  const handleMoveToKanban = () => {
    if (selectedLeads.size === 0) {
      toast.error("Selecione pelo menos uma empresa para mover")
      return
    }

    const leadsToMove = filteredLeads.filter((lead: any) => selectedLeads.has(lead.cnpj))
    onMoveToKanban?.(leadsToMove)
    setSelectedLeads(new Set())
    toast.success(`${leadsToMove.length} empresas movidas para o Kanban`)
  }

  const handleExportLeads = () => {
    const dataStr = JSON.stringify(filteredLeads, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = 'leads.json'
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast.success("Leads exportados com sucesso!")
  }

  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return "N/A"
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  }

  const formatCurrency = (value: number | undefined) => {
    if (!value) return "N/A"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("pt-BR")
    } catch {
      return dateString
    }
  }

  // Show message if we have total but no leads data
  if (leads.length === 0 && searchResult.total > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Empresas Encontradas
            <Badge variant="secondary">{searchResult.total.toLocaleString()}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Dados não disponíveis</h3>
            <div className="text-gray-500 text-center space-y-2">
              <p>
                A API encontrou {searchResult.total.toLocaleString()} empresas, mas não retornou os dados detalhados.
              </p>
              <p className="text-sm">Verifique o console do navegador (F12) para logs detalhados da resposta da API.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Empresas Encontradas
              <Badge variant="secondary">{searchResult.total.toLocaleString()}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              {selectedLeads.size > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={handleMoveToKanban}>
                    <ArrowRight className="w-4 h-4 mr-1" />
                    Mover para Kanban ({selectedLeads.size})
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={handleExportLeads}>
                <Download className="w-4 h-4 mr-1" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Debug Info */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
              <strong>Debug:</strong> Total: {searchResult.total}, Leads Array: {leads.length}, Filtered:{" "}
              {filteredLeads.length}
              {searchResult.error && <div className="text-red-600">Error: {searchResult.error}</div>}
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as empresas</SelectItem>
                <SelectItem value="ativa">Apenas ativas</SelectItem>
                <SelectItem value="baixada">Apenas baixadas</SelectItem>
                <SelectItem value="inapta">Apenas inaptas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Atividade</TableHead>
                  <TableHead>Capital Social</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Carregando...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <Search className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-gray-500">
                          {leads.length === 0
                            ? "Nenhuma empresa encontrada"
                            : "Nenhuma empresa corresponde aos filtros"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead: any) => (
                    <TableRow key={lead.cnpj}>
                      <TableCell>
                        <Checkbox
                          checked={selectedLeads.has(lead.cnpj)}
                          onCheckedChange={(checked) => handleSelectLead(lead.cnpj, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{lead.razao_social || "N/A"}</div>
                          {lead.nome_fantasia && <div className="text-sm text-gray-500">{lead.nome_fantasia}</div>}
                          <div className="flex items-center gap-2">
                            {lead.telefone && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Phone className="w-3 h-3" />
                                {lead.telefone}
                              </div>
                            )}
                            {lead.email && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm">{formatCNPJ(lead.cnpj)}</code>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge
                            variant={lead.situacao_cadastral === "ATIVA" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {lead.situacao_cadastral || "N/A"}
                          </Badge>
                          {lead.motivo_situacao && (
                            <div className="text-xs text-gray-500 mt-1" title={lead.motivo_situacao}>
                              {lead.motivo_situacao.length > 20
                                ? `${lead.motivo_situacao.substring(0, 20)}...`
                                : lead.motivo_situacao}
                            </div>
                          )}
                          {lead.data_situacao && (
                            <div className="text-xs text-gray-500">
                              {formatDate(lead.data_situacao)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3 h-3" />
                            {lead.municipio || "N/A"}, {lead.uf || "N/A"}
                          </div>
                          {lead.bairro && <div className="text-xs text-gray-500">{lead.bairro}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{lead.atividade_principal || "N/A"}</div>
                          {lead.cnae_principal && (
                            <div className="text-xs text-gray-500">CNAE: {lead.cnae_principal}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{formatCurrency(lead.capital_social)}</div>
                          {lead.porte && (
                            <Badge variant="outline" className="text-xs">
                              {lead.porte}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onMoveToKanban?.([lead])}>
                              <ArrowRight className="w-4 h-4 mr-2" />
                              Mover para Kanban
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {searchResult.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Página {searchResult.page} de {searchResult.totalPages} ({searchResult.total.toLocaleString()} empresas)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(searchResult.page - 1)}
                  disabled={searchResult.page <= 1 || loading}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(searchResult.page + 1)}
                  disabled={!searchResult.hasMore || loading}
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}