"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Building2, Phone, Globe, Users, DollarSign, Save, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface EnrichmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: any
  onComplete: () => void
}

export function EnrichmentModal({ open, onOpenChange, lead, onComplete }: EnrichmentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [enrichedData, setEnrichedData] = useState<any>({
    telefone: "",
    email: "",
    website: "",
    funcionarios: "",
    faturamento_anual: "",
    descricao: "",
    redes_sociais: {
      linkedin: "",
      facebook: "",
      instagram: "",
    },
    contatos: [{ nome: "", cargo: "", telefone: "", email: "" }],
  })

  const handleEnrich = async () => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate enriched data
      const mockEnrichedData = {
        telefone: "(11) 99999-9999",
        email: "contato@empresa.com.br",
        website: "www.empresa.com.br",
        funcionarios: "25-50",
        faturamento_anual: "R$ 2.500.000",
        descricao:
          "Empresa especializada em soluções tecnológicas para o mercado B2B, com foco em automação de processos e integração de sistemas.",
        redes_sociais: {
          linkedin: "linkedin.com/company/empresa",
          facebook: "facebook.com/empresa",
          instagram: "@empresa_oficial",
        },
        contatos: [
          { nome: "João Silva", cargo: "Diretor Comercial", telefone: "(11) 98888-8888", email: "joao@empresa.com.br" },
          {
            nome: "Maria Santos",
            cargo: "Gerente de Marketing",
            telefone: "(11) 97777-7777",
            email: "maria@empresa.com.br",
          },
        ],
      }

      setEnrichedData(mockEnrichedData)
      toast.success("Dados enriquecidos com sucesso!")
    } catch (error) {
      toast.error("Erro ao enriquecer dados")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = () => {
    // Here you would save the enriched data
    toast.success("Dados salvos com sucesso!")
    onComplete()
    onOpenChange(false)
  }

  const handleClose = () => {
    onComplete()
    onOpenChange(false)
  }

  if (!lead) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Enriquecer Dados da Empresa
          </DialogTitle>
          <DialogDescription>
            {lead.razao_social} - {lead.cnpj}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
            <TabsTrigger value="contact">Contatos</TabsTrigger>
            <TabsTrigger value="social">Redes Sociais</TabsTrigger>
            <TabsTrigger value="business">Negócio</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Razão Social</Label>
                    <Input value={lead.razao_social} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome Fantasia</Label>
                    <Input value={lead.nome_fantasia || ""} disabled />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CNPJ</Label>
                    <Input value={lead.cnpj} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Situação Cadastral</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant={lead.situacao_cadastral === "ATIVA" ? "default" : "secondary"}>
                        {lead.situacao_cadastral}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input
                    value={`${lead.logradouro || ""} ${lead.numero || ""}, ${lead.bairro || ""} - ${lead.municipio || ""}, ${lead.uf || ""}`}
                    disabled
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Dados de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={enrichedData.telefone}
                      onChange={(e) => setEnrichedData((prev) => ({ ...prev, telefone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={enrichedData.email}
                      onChange={(e) => setEnrichedData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="contato@empresa.com.br"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={enrichedData.website}
                    onChange={(e) => setEnrichedData((prev) => ({ ...prev, website: e.target.value }))}
                    placeholder="www.empresa.com.br"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Contatos da Empresa
                </CardTitle>
                <CardDescription>Adicione contatos importantes da empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrichedData.contatos.map((contato: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          value={contato.nome}
                          onChange={(e) => {
                            const newContatos = [...enrichedData.contatos]
                            newContatos[index].nome = e.target.value
                            setEnrichedData((prev) => ({ ...prev, contatos: newContatos }))
                          }}
                          placeholder="Nome do contato"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cargo</Label>
                        <Input
                          value={contato.cargo}
                          onChange={(e) => {
                            const newContatos = [...enrichedData.contatos]
                            newContatos[index].cargo = e.target.value
                            setEnrichedData((prev) => ({ ...prev, contatos: newContatos }))
                          }}
                          placeholder="Cargo na empresa"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input
                          value={contato.telefone}
                          onChange={(e) => {
                            const newContatos = [...enrichedData.contatos]
                            newContatos[index].telefone = e.target.value
                            setEnrichedData((prev) => ({ ...prev, contatos: newContatos }))
                          }}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          value={contato.email}
                          onChange={(e) => {
                            const newContatos = [...enrichedData.contatos]
                            newContatos[index].email = e.target.value
                            setEnrichedData((prev) => ({ ...prev, contatos: newContatos }))
                          }}
                          placeholder="contato@empresa.com.br"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={() => {
                    setEnrichedData((prev) => ({
                      ...prev,
                      contatos: [...prev.contatos, { nome: "", cargo: "", telefone: "", email: "" }],
                    }))
                  }}
                >
                  Adicionar Contato
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Redes Sociais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input
                    value={enrichedData.redes_sociais.linkedin}
                    onChange={(e) =>
                      setEnrichedData((prev) => ({
                        ...prev,
                        redes_sociais: { ...prev.redes_sociais, linkedin: e.target.value },
                      }))
                    }
                    placeholder="linkedin.com/company/empresa"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Facebook</Label>
                  <Input
                    value={enrichedData.redes_sociais.facebook}
                    onChange={(e) =>
                      setEnrichedData((prev) => ({
                        ...prev,
                        redes_sociais: { ...prev.redes_sociais, facebook: e.target.value },
                      }))
                    }
                    placeholder="facebook.com/empresa"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input
                    value={enrichedData.redes_sociais.instagram}
                    onChange={(e) =>
                      setEnrichedData((prev) => ({
                        ...prev,
                        redes_sociais: { ...prev.redes_sociais, instagram: e.target.value },
                      }))
                    }
                    placeholder="@empresa_oficial"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Informações de Negócio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Número de Funcionários</Label>
                    <Input
                      value={enrichedData.funcionarios}
                      onChange={(e) => setEnrichedData((prev) => ({ ...prev, funcionarios: e.target.value }))}
                      placeholder="Ex: 25-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Faturamento Anual</Label>
                    <Input
                      value={enrichedData.faturamento_anual}
                      onChange={(e) => setEnrichedData((prev) => ({ ...prev, faturamento_anual: e.target.value }))}
                      placeholder="Ex: R$ 2.500.000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição da Empresa</Label>
                  <Textarea
                    value={enrichedData.descricao}
                    onChange={(e) => setEnrichedData((prev) => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descreva as atividades e especialidades da empresa..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEnrich} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Enriquecendo...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Enriquecer Automaticamente
                </>
              )}
            </Button>

            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Dados
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
