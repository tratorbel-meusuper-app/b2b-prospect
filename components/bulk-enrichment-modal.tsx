"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Clock, Sparkles, Users } from "lucide-react"
import { toast } from "sonner"

interface BulkEnrichmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedLeads: any[]
  onComplete: () => void
}

interface EnrichmentResult {
  cnpj: string
  razao_social: string
  status: "pending" | "success" | "error"
  error?: string
  enrichedData?: any
}

export function BulkEnrichmentModal({ open, onOpenChange, selectedLeads, onComplete }: BulkEnrichmentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<EnrichmentResult[]>([])
  const [currentProcessing, setCurrentProcessing] = useState<string>("")

  const startBulkEnrichment = async () => {
    setIsProcessing(true)
    setProgress(0)
    setResults([])

    // Initialize results
    const initialResults: EnrichmentResult[] = selectedLeads.map((lead) => ({
      cnpj: lead.cnpj,
      razao_social: lead.razao_social,
      status: "pending",
    }))
    setResults(initialResults)

    // Process each lead
    for (let i = 0; i < selectedLeads.length; i++) {
      const lead = selectedLeads[i]
      setCurrentProcessing(lead.razao_social)

      try {
        // Simulate API call for enrichment
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

        // Simulate success/failure (90% success rate)
        const success = Math.random() > 0.1

        setResults((prev) =>
          prev.map((result) =>
            result.cnpj === lead.cnpj
              ? {
                  ...result,
                  status: success ? "success" : "error",
                  error: success ? undefined : "Erro ao enriquecer dados",
                  enrichedData: success
                    ? {
                        telefone: "(11) 99999-9999",
                        email: "contato@empresa.com.br",
                        website: "www.empresa.com.br",
                        funcionarios: Math.floor(Math.random() * 100) + 1,
                        faturamento: Math.floor(Math.random() * 10000000) + 100000,
                      }
                    : undefined,
                }
              : result,
          ),
        )

        setProgress(((i + 1) / selectedLeads.length) * 100)
      } catch (error) {
        setResults((prev) =>
          prev.map((result) =>
            result.cnpj === lead.cnpj ? { ...result, status: "error", error: "Erro de conexão" } : result,
          ),
        )
      }
    }

    setCurrentProcessing("")
    setIsProcessing(false)

    const successCount = results.filter((r) => r.status === "success").length
    toast.success(
      `Enriquecimento concluído! ${successCount} de ${selectedLeads.length} empresas processadas com sucesso.`,
    )
  }

  const handleClose = () => {
    if (!isProcessing) {
      onComplete()
      onOpenChange(false)
      setResults([])
      setProgress(0)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const successCount = results.filter((r) => r.status === "success").length
  const errorCount = results.filter((r) => r.status === "error").length
  const pendingCount = results.filter((r) => r.status === "pending").length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Enriquecimento em Massa
          </DialogTitle>
          <DialogDescription>Processando {selectedLeads.length} empresas selecionadas</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{selectedLeads.length} empresas selecionadas</span>
              </div>
              <div className="text-sm text-gray-500">{Math.round(progress)}% concluído</div>
            </div>

            <Progress value={progress} className="w-full" />

            {isProcessing && currentProcessing && (
              <div className="text-sm text-gray-600">
                Processando: <span className="font-medium">{currentProcessing}</span>
              </div>
            )}

            {/* Status Summary */}
            {results.length > 0 && (
              <div className="flex gap-4">
                <Badge variant="outline" className="bg-green-50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {successCount} Sucesso
                </Badge>
                <Badge variant="outline" className="bg-red-50">
                  <XCircle className="w-3 h-3 mr-1" />
                  {errorCount} Erro
                </Badge>
                <Badge variant="outline" className="bg-gray-50">
                  <Clock className="w-3 h-3 mr-1" />
                  {pendingCount} Pendente
                </Badge>
              </div>
            )}
          </div>

          {/* Results List */}
          {results.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Resultados do Processamento</h4>
              <ScrollArea className="h-64 border rounded-md p-2">
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={result.cnpj} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <div>
                          <div className="text-sm font-medium">{result.razao_social}</div>
                          <div className="text-xs text-gray-500">{result.cnpj}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getStatusColor(result.status)}`}>
                          {result.status === "success" ? "Sucesso" : result.status === "error" ? "Erro" : "Pendente"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
              {isProcessing ? "Processando..." : "Fechar"}
            </Button>

            {!isProcessing && results.length === 0 && (
              <Button onClick={startBulkEnrichment}>
                <Sparkles className="w-4 h-4 mr-2" />
                Iniciar Enriquecimento
              </Button>
            )}

            {!isProcessing && results.length > 0 && <Button onClick={handleClose}>Concluir</Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
