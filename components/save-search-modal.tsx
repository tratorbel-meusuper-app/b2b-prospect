"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Save, Search } from "lucide-react"
import { toast } from "sonner"

interface SaveSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: any
  activeFiltersCount: number
}

export function SaveSearchModal({ open, onOpenChange, filters, activeFiltersCount }: SaveSearchModalProps) {
  const [searchName, setSearchName] = useState("")
  const [searchDescription, setSearchDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!searchName.trim()) {
      toast.error("Nome da busca é obrigatório")
      return
    }

    setIsSaving(true)

    try {
      // Simulate API call to save search
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const savedSearch = {
        id: Date.now().toString(),
        name: searchName,
        description: searchDescription,
        filters: filters,
        activeFiltersCount: activeFiltersCount,
        createdAt: new Date().toISOString(),
      }

      // Here you would save to your backend/database
      console.log("Saving search:", savedSearch)

      toast.success("Busca salva com sucesso!")
      onOpenChange(false)
      setSearchName("")
      setSearchDescription("")
    } catch (error) {
      toast.error("Erro ao salvar busca")
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setSearchName("")
    setSearchDescription("")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Salvar Busca
          </DialogTitle>
          <DialogDescription>Salve esta configuração de busca para reutilizar posteriormente</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span className="text-sm text-gray-600">{activeFiltersCount} filtros ativos</span>
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-name">Nome da Busca *</Label>
            <Input
              id="search-name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Ex: Empresas de TI em SP"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-description">Descrição (opcional)</Label>
            <Textarea
              id="search-description"
              value={searchDescription}
              onChange={(e) => setSearchDescription(e.target.value)}
              placeholder="Descreva o objetivo desta busca..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !searchName.trim()}>
              {isSaving ? "Salvando..." : "Salvar Busca"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
