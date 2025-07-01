"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { MoreHorizontal, Phone, Mail, MapPin, Building2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

interface Lead {
  cnpj: string
  razao_social: string
  nome_fantasia?: string
  situacao_cadastral?: string
  uf?: string
  municipio?: string
  telefone?: string
  email?: string
  atividade_principal?: string
  capital_social?: number
  crm_stage?: string
}

interface KanbanBoardProps {
  leads: Lead[]
  onLeadsUpdate: (leads: Lead[]) => void
  onRestoreToLeads: (leads: Lead[]) => void
}

const STAGES = [
  { id: "lead", name: "Lead", color: "bg-gray-100" },
  { id: "qualified", name: "Qualificado", color: "bg-blue-100" },
  { id: "proposal", name: "Proposta", color: "bg-yellow-100" },
  { id: "negotiation", name: "Negociação", color: "bg-orange-100" },
  { id: "closed_won", name: "Fechado", color: "bg-green-100" },
  { id: "closed_lost", name: "Perdido", color: "bg-red-100" },
]

export function KanbanBoard({ leads, onLeadsUpdate, onRestoreToLeads }: KanbanBoardProps) {
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())

  const getLeadsByStage = (stageId: string) => {
    return leads.filter((lead) => (lead.crm_stage || "lead") === stageId)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId === destination.droppableId) return

    const updatedLeads = leads.map((lead) =>
      lead.cnpj === draggableId ? { ...lead, crm_stage: destination.droppableId } : lead,
    )

    onLeadsUpdate(updatedLeads)
    toast.success("Lead movido com sucesso!")
  }

  const handleRestoreSelected = () => {
    if (selectedLeads.size === 0) {
      toast.error("Selecione pelo menos um lead para restaurar")
      return
    }

    const leadsToRestore = leads.filter((lead) => selectedLeads.has(lead.cnpj))
    onRestoreToLeads(leadsToRestore)
    setSelectedLeads(new Set())
    toast.success(`${leadsToRestore.length} leads restaurados para a busca`)
  }

  const formatCurrency = (value: number | undefined) => {
    if (!value) return "N/A"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  }

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum lead no pipeline</h3>
          <p className="text-gray-500 text-center">
            Mova leads da busca para o Kanban para começar a gerenciar seu pipeline de vendas.
          </p>
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
              <Building2 className="w-5 h-5" />
              Pipeline de Vendas
              <Badge variant="secondary">{leads.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              {selectedLeads.size > 0 && (
                <Button variant="outline" size="sm" onClick={handleRestoreSelected}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Restaurar ({selectedLeads.size})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {STAGES.map((stage) => {
            const stageLeads = getLeadsByStage(stage.id)
            return (
              <Card key={stage.id} className={stage.color}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    {stage.name}
                    <Badge variant="secondary" className="text-xs">
                      {stageLeads.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 min-h-[200px] p-2 rounded-lg transition-colors ${
                          snapshot.isDraggingOver ? "bg-blue-50" : ""
                        }`}
                      >
                        {stageLeads.map((lead, index) => (
                          <Draggable key={lead.cnpj} draggableId={lead.cnpj} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`cursor-move transition-shadow ${
                                  snapshot.isDragging ? "shadow-lg" : "hover:shadow-md"
                                } ${selectedLeads.has(lead.cnpj) ? "ring-2 ring-blue-500" : ""}`}
                                onClick={() => {
                                  const newSelected = new Set(selectedLeads)
                                  if (selectedLeads.has(lead.cnpj)) {
                                    newSelected.delete(lead.cnpj)
                                  } else {
                                    newSelected.add(lead.cnpj)
                                  }
                                  setSelectedLeads(newSelected)
                                }}
                              >
                                <CardContent className="p-3">
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                      <h4 className="text-sm font-medium line-clamp-2">{lead.razao_social}</h4>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            <MoreHorizontal className="w-3 h-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              onRestoreToLeads([lead])
                                            }}
                                          >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Restaurar para busca
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>

                                    {lead.nome_fantasia && (
                                      <p className="text-xs text-gray-600 line-clamp-1">{lead.nome_fantasia}</p>
                                    )}

                                    <div className="text-xs text-gray-500">
                                      <code>{formatCNPJ(lead.cnpj)}</code>
                                    </div>

                                    <div className="space-y-1">
                                      {lead.municipio && lead.uf && (
                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                          <MapPin className="w-3 h-3" />
                                          <span className="truncate">
                                            {lead.municipio}, {lead.uf}
                                          </span>
                                        </div>
                                      )}

                                      {lead.telefone && (
                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                          <Phone className="w-3 h-3" />
                                          <span>{lead.telefone}</span>
                                        </div>
                                      )}

                                      {lead.email && (
                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                          <Mail className="w-3 h-3" />
                                          <span className="truncate">{lead.email}</span>
                                        </div>
                                      )}
                                    </div>

                                    {lead.atividade_principal && (
                                      <p className="text-xs text-gray-600 line-clamp-2">{lead.atividade_principal}</p>
                                    )}

                                    {lead.capital_social && (
                                      <div className="text-xs font-medium text-green-600">
                                        {formatCurrency(lead.capital_social)}
                                      </div>
                                    )}

                                    {lead.situacao_cadastral && (
                                      <Badge
                                        variant={lead.situacao_cadastral === "ATIVA" ? "default" : "secondary"}
                                        className="text-xs"
                                      >
                                        {lead.situacao_cadastral}
                                      </Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}
