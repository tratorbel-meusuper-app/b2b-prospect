"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tag, Plus, Edit, Trash2, Users } from "lucide-react"

interface TagsManagerProps {
  selectedCompanies?: string[]
  onTagsUpdated?: () => void
}

export function TagsManager({ selectedCompanies = [], onTagsUpdated }: TagsManagerProps) {
  const [tags, setTags] = useState<any[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [tagName, setTagName] = useState("")
  const [tagColor, setTagColor] = useState("#3B82F6")
  const [tagDescription, setTagDescription] = useState("")

  const createTag = async () => {
    if (!tagName.trim()) return

    setLoading(true)
    try {
      const newTag = {
        id: Date.now(),
        name: tagName,
        color: tagColor,
        description: tagDescription,
        company_count: 0,
        created_at: new Date().toISOString(),
      }

      setTags(prev => [...prev, newTag])
      setIsCreateModalOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error creating tag:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateTag = async () => {
    if (!editingTag || !tagName.trim()) return

    setLoading(true)
    try {
      setTags(prev => prev.map(tag => 
        tag.id === editingTag.id 
          ? { ...tag, name: tagName, color: tagColor, description: tagDescription }
          : tag
      ))
      setEditingTag(null)
      resetForm()
    } catch (error) {
      console.error("Error updating tag:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTag = async (tagId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta etiqueta?")) return

    setTags(prev => prev.filter(tag => tag.id !== tagId))
  }

  const applyTagToSelected = async (tagId: number) => {
    if (selectedCompanies.length === 0) {
      alert("Selecione pelo menos uma empresa para aplicar a etiqueta")
      return
    }

    setLoading(true)
    try {
      // Simulate applying tag
      setTags(prev => prev.map(tag => 
        tag.id === tagId 
          ? { ...tag, company_count: tag.company_count + selectedCompanies.length }
          : tag
      ))
      
      onTagsUpdated?.()
      alert(`Etiqueta aplicada a ${selectedCompanies.length} empresa(s)`)
    } catch (error) {
      console.error("Error applying tag:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTagName("")
    setTagColor("#3B82F6")
    setTagDescription("")
  }

  const openEditModal = (tag: any) => {
    setEditingTag(tag)
    setTagName(tag.name)
    setTagColor(tag.color)
    setTagDescription(tag.description)
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
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Gerenciamento de Etiquetas</h2>
            <p className="text-slate-600">Organize e categorize suas empresas com etiquetas personalizadas</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Etiqueta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Etiqueta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tagName">Nome da Etiqueta</Label>
                  <Input
                    id="tagName"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="Ex: Cliente Potencial"
                  />
                </div>

                <div>
                  <Label>Cor</Label>
                  <div className="flex gap-2 mt-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          tagColor === color ? "border-slate-900" : "border-slate-300"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setTagColor(color)}
                      />
                    ))}
                  </div>
                  <Input
                    type="color"
                    value={tagColor}
                    onChange={(e) => setTagColor(e.target.value)}
                    className="w-20 h-10 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="tagDescription">Descrição (opcional)</Label>
                  <Input
                    id="tagDescription"
                    value={tagDescription}
                    onChange={(e) => setTagDescription(e.target.value)}
                    placeholder="Descreva o uso desta etiqueta..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createTag} disabled={loading}>
                    {loading ? "Criando..." : "Criar Etiqueta"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Selected Companies Info */}
        {selectedCompanies.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">{selectedCompanies.length} empresa(s) selecionada(s)</span>
                </div>
                <p className="text-sm text-blue-700">Clique em uma etiqueta para aplicar às empresas selecionadas</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tags Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags.map((tag) => (
            <Card
              key={tag.id}
              className="bg-white/70 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }} />
                    <div>
                      <CardTitle className="text-lg">{tag.name}</CardTitle>
                      {tag.description && <p className="text-sm text-slate-600 mt-1">{tag.description}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEditModal(tag)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteTag(tag.id)}>
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Empresas</span>
                    <Badge variant="secondary" style={{ backgroundColor: `${tag.color}20`, color: tag.color }}>
                      <Users className="w-3 h-3 mr-1" />
                      {tag.company_count}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => applyTagToSelected(tag.id)}
                      disabled={selectedCompanies.length === 0 || loading}
                      style={{ backgroundColor: tag.color }}
                    >
                      <Tag className="w-3 h-3 mr-2" />
                      Aplicar Etiqueta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Modal */}
        <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Etiqueta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editTagName">Nome da Etiqueta</Label>
                <Input
                  id="editTagName"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="Ex: Cliente Potencial"
                />
              </div>

              <div>
                <Label>Cor</Label>
                <div className="flex gap-2 mt-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        tagColor === color ? "border-slate-900" : "border-slate-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setTagColor(color)}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  className="w-20 h-10 mt-2"
                />
              </div>

              <div>
                <Label htmlFor="editTagDescription">Descrição (opcional)</Label>
                <Input
                  id="editTagDescription"
                  value={tagDescription}
                  onChange={(e) => setTagDescription(e.target.value)}
                  placeholder="Descreva o uso desta etiqueta..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingTag(null)}>
                  Cancelar
                </Button>
                <Button onClick={updateTag} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {tags.length === 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border border-white/20">
            <CardContent className="text-center py-12">
              <Tag className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma etiqueta criada</h3>
              <p className="text-slate-600 mb-4">
                Crie etiquetas para organizar e categorizar suas empresas de forma eficiente.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Etiqueta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}