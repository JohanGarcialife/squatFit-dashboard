"use client";
/* eslint-disable max-lines */

import React, { useState, useEffect, useCallback } from "react";

import { X, Search, Plus, Edit2, Trash2, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  savedResponsesService,
  type SavedResponse,
  type CreateSavedResponseData,
  type UpdateSavedResponseData,
} from "@/lib/services/saved-responses.service";

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface SavedResponsesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResponse: (response: SavedResponse) => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function SavedResponsesPanel({ isOpen, onClose, onSelectResponse }: SavedResponsesPanelProps) {
  const [responses, setResponses] = useState<SavedResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<SavedResponse | null>(null);

  /**
   * Carga las respuestas guardadas
   */
  const loadResponses = useCallback(async () => {
    setLoading(true);
    try {
      const filters: { category?: string; search?: string } = {};
      if (categoryFilter !== "all") {
        filters.category = categoryFilter;
      }
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const data = await savedResponsesService.getResponses(filters);
      setResponses(data);
    } catch (error: any) {
      console.error("Error cargando respuestas guardadas:", error);
      toast.error("Error al cargar respuestas guardadas");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter]);

  // Cargar respuestas al abrir el panel o cambiar filtros
  useEffect(() => {
    if (isOpen) {
      loadResponses();
    }
  }, [isOpen, loadResponses]);

  /**
   * Maneja la selección de una respuesta
   */
  const handleSelectResponse = (response: SavedResponse) => {
    savedResponsesService.incrementUsageCount(response.id).catch(console.error);
    onSelectResponse(response);
    onClose();
  };

  /**
   * Maneja la eliminación de una respuesta
   */
  const handleDeleteResponse = async (responseId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta respuesta guardada?")) {
      return;
    }

    try {
      await savedResponsesService.deleteResponse(responseId);
      toast.success("Respuesta eliminada exitosamente");
      loadResponses();
    } catch (error: any) {
      console.error("Error eliminando respuesta:", error);
      toast.error("Error al eliminar respuesta");
    }
  };

  // Categorías disponibles
  const categories = [
    { value: "all", label: "Todas" },
    { value: "greeting", label: "Saludos" },
    { value: "farewell", label: "Despedidas" },
    { value: "support", label: "Soporte" },
    { value: "nutrition", label: "Nutrición" },
    { value: "training", label: "Entrenamiento" },
    { value: "emotional", label: "Emocional" },
    { value: "sales", label: "Ventas" },
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col">
          <DialogHeader>
            <DialogTitle>Respuestas Guardadas</DialogTitle>
            <DialogDescription>Selecciona una respuesta guardada para usarla en tu mensaje.</DialogDescription>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4">
            {/* Filtros y búsqueda */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar respuestas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Lista de respuestas */}
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : responses.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  {searchQuery || categoryFilter !== "all"
                    ? "No se encontraron respuestas con los filtros aplicados"
                    : "No tienes respuestas guardadas. Crea una nueva para comenzar."}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {responses.map((response) => (
                    <div
                      key={response.id}
                      className="rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{response.title}</h4>
                            {response.category && (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                {response.category}
                              </span>
                            )}
                            {response.usage_count > 0 && (
                              <span className="text-xs text-gray-500">
                                Usada {response.usage_count} vez{response.usage_count !== 1 ? "es" : ""}
                              </span>
                            )}
                          </div>
                          <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{response.content}</p>
                        </div>
                        <div className="ml-2 flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectResponse(response)}
                            className="h-8 px-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingResponse(response)}
                            className="h-8 px-2"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteResponse(response.id)}
                            className="h-8 px-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para crear/editar respuesta */}
      <CreateEditResponseModal
        isOpen={isCreateModalOpen || editingResponse !== null}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingResponse(null);
        }}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          setEditingResponse(null);
          loadResponses();
        }}
        editingResponse={editingResponse}
      />
    </>
  );
}

// ============================================================================
// MODAL PARA CREAR/EDITAR RESPUESTA
// ============================================================================

interface CreateEditResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingResponse: SavedResponse | null;
}

function CreateEditResponseModal({ isOpen, onClose, onSuccess, editingResponse }: CreateEditResponseModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Cargar datos de edición
  useEffect(() => {
    if (editingResponse) {
      setTitle(editingResponse.title);
      setContent(editingResponse.content);
      setCategory(editingResponse.category || "");
    } else {
      setTitle("");
      setContent("");
      setCategory("");
    }
  }, [editingResponse, isOpen]);

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("El título y el contenido son requeridos");
      return;
    }

    setLoading(true);
    try {
      if (editingResponse) {
        const updateData: UpdateSavedResponseData = {
          title: title.trim(),
          content: content.trim(),
          category: category || undefined,
        };
        await savedResponsesService.updateResponse(editingResponse.id, updateData);
        toast.success("Respuesta actualizada exitosamente");
      } else {
        const createData: CreateSavedResponseData = {
          title: title.trim(),
          content: content.trim(),
          category: category || undefined,
        };
        await savedResponsesService.createResponse(createData);
        toast.success("Respuesta creada exitosamente");
      }
      onSuccess();
    } catch (error: any) {
      console.error("Error guardando respuesta:", error);
      toast.error(error.message || "Error al guardar respuesta");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "", label: "Sin categoría" },
    { value: "greeting", label: "Saludos" },
    { value: "farewell", label: "Despedidas" },
    { value: "support", label: "Soporte" },
    { value: "nutrition", label: "Nutrición" },
    { value: "training", label: "Entrenamiento" },
    { value: "emotional", label: "Emocional" },
    { value: "sales", label: "Ventas" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingResponse ? "Editar Respuesta Guardada" : "Crear Respuesta Guardada"}</DialogTitle>
          <DialogDescription>
            {editingResponse
              ? "Modifica los detalles de tu respuesta guardada."
              : "Crea una nueva respuesta guardada para usar en tus conversaciones."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ej: Saludo inicial"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="content">
              Contenido <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Escribe el contenido de la respuesta..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              rows={6}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={category} onValueChange={setCategory} disabled={loading}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingResponse ? "Actualizando..." : "Creando..."}
                </>
              ) : editingResponse ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
