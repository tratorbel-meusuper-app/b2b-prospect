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
import { Send, Plus, Calendar, CheckCircle, XCircle, Clock, Play, Pause } from "lucide-react"

interface Campaign {
  id: number
  name: string
  message_template: string
  status: string
  scheduled_at: string | null
  sent_count: number
  delivered_count: number
  failed_count: number
  created_at: string
}

export function FollowUpCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form states
  const [campaignName, setCampaignName] = useState("")
  const [messageTemplate, setMessageTemplate] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [selectedAudience, setSelectedAudience] = useState("")

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/campaigns")
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns)
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error)
    }
  }

  const createCampaign = async () => {
    if (!campaignName.trim() || !messageTemplate.trim()) return

    setLoading(true)
    try {
      const scheduledAt =
        scheduledDate && scheduledTime ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString() : null

      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignName,
          message_template: messageTemplate,
          scheduled_at: scheduledAt,
          audience_id: selectedAudience || null,
        }),
      })

      if (response.ok) {
        await fetchCampaigns()
        setIsCreateModalOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error creating campaign:", error)
    } finally {
      setLoading(false)
    }
  }

  const startCampaign = async (campaignId: number) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/start`, {
        method: "POST",
      })

      if (response.ok) {
        await fetchCampaigns()
      }
    } catch (error) {
      console.error("Error starting campaign:", error)
    }
  }

  const pauseCampaign = async (campaignId: number) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/pause`, {
        method: "POST",
      })

      if (response.ok) {
        await fetchCampaigns()
      }
    } catch (error) {
      console.error("Error pausing campaign:", error)
    }
  }

  const resetForm = () => {
    setCampaignName("")
    setMessageTemplate("")
    setScheduledDate("")
    setScheduledTime("")
    setSelectedAudience("")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700"
      case "paused":
        return "bg-yellow-100 text-yellow-700"
      case "completed":
        return "bg-blue-100 text-blue-700"
      case "failed":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play className="w-3 h-3" />
      case "paused":
        return <Pause className="w-3 h-3" />
      case "completed":
        return <CheckCircle className="w-3 h-3" />
      case "failed":
        return <XCircle className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Campanhas de Follow-up</h2>
          <p className="text-slate-600">Gerencie campanhas automatizadas de follow-up em massa</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Campanha</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="message">Mensagem</TabsTrigger>
                <TabsTrigger value="schedule">Agendamento</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="campaignName">Nome da Campanha</Label>
                  <Input
                    id="campaignName"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Ex: Follow-up Empresas Tecnologia"
                  />
                </div>
                <div>
                  <Label>Audiência Alvo</Label>
                  <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma audiência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os leads</SelectItem>
                      <SelectItem value="high-score">Score Alto (70+)</SelectItem>
                      <SelectItem value="active">Empresas Ativas</SelectItem>
                      <SelectItem value="tech">Tecnologia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="message" className="space-y-4">
                <div>
                  <Label htmlFor="messageTemplate">Template da Mensagem</Label>
                  <Textarea
                    id="messageTemplate"
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                    placeholder="Olá {{nome_empresa}}, 

Espero que esteja tudo bem! Sou {{seu_nome}} da {{sua_empresa}}.

Notei que sua empresa {{nome_empresa}} atua no segmento de {{segmento}} e acredito que podemos ajudar com nossas soluções.

Gostaria de agendar uma conversa rápida de 15 minutos para apresentar como podemos otimizar seus processos?

Aguardo seu retorno!

Atenciosamente,
{{seu_nome}}"
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Use variáveis como: {`{{nome_empresa}}, {{cnpj}}, {{nome_fantasia}}, {{seu_nome}}, {{sua_empresa}}`}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduledDate">Data de Envio</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduledTime">Horário</Label>
                    <Input
                      id="scheduledTime"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Dica:</strong> O melhor horário para envio de mensagens B2B é entre 14h-16h em dias
                    úteis.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={createCampaign} disabled={loading}>
                {loading ? "Criando..." : "Criar Campanha"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="bg-white/70 backdrop-blur-sm border border-white/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <Badge className={`mt-2 ${getStatusColor(campaign.status)}`}>
                    {getStatusIcon(campaign.status)}
                    <span className="ml-1 capitalize">{campaign.status}</span>
                  </Badge>
                </div>
                <div className="flex gap-1">
                  {campaign.status === "draft" && (
                    <Button size="sm" onClick={() => startCampaign(campaign.id)}>
                      <Play className="w-3 h-3 mr-1" />
                      Iniciar
                    </Button>
                  )}
                  {campaign.status === "active" && (
                    <Button size="sm" variant="outline" onClick={() => pauseCampaign(campaign.id)}>
                      <Pause className="w-3 h-3 mr-1" />
                      Pausar
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{campaign.sent_count}</div>
                    <div className="text-xs text-slate-600">Enviadas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{campaign.delivered_count}</div>
                    <div className="text-xs text-slate-600">Entregues</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{campaign.failed_count}</div>
                    <div className="text-xs text-slate-600">Falhas</div>
                  </div>
                </div>

                {/* Message Preview */}
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Prévia da mensagem:</p>
                  <p className="text-sm text-slate-800 line-clamp-3">
                    {campaign.message_template.substring(0, 100)}...
                  </p>
                </div>

                {/* Schedule Info */}
                {campaign.scheduled_at && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>Agendada para: {new Date(campaign.scheduled_at).toLocaleString("pt-BR")}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    Ver Detalhes
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    Relatório
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border border-white/20">
          <CardContent className="text-center py-12">
            <Send className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma campanha criada</h3>
            <p className="text-slate-600 mb-4">
              Crie sua primeira campanha de follow-up para automatizar o contato com seus leads.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Campanha
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
