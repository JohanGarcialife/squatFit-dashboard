"use client";
/* eslint-disable max-lines */

import { useState } from "react";

import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  RefreshCcw,
  Trash2,
  Save,
  Edit2,
  Search,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { alimentosData, recetasData } from "./data";

// Tipos para la importación
interface ImportRow {
  id: string;
  data: Record<string, string | number>;
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

interface ImportResult {
  fileName: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  rows: ImportRow[];
}

// Simulación de datos de importación para demo
const mockImportResult: ImportResult = {
  fileName: "recetas_nuevas.csv",
  totalRows: 5,
  validRows: 3,
  errorRows: 2,
  rows: [
    {
      id: "1",
      data: {
        nombre: "Ensalada César",
        tipoComida: "comida",
        calorias: 350,
        proteinas: 15,
        carbohidratos: 20,
        grasas: 25,
      },
      errors: [],
      warnings: [],
      isValid: true,
    },
    {
      id: "2",
      data: {
        nombre: "Smoothie verde",
        tipoComida: "desayuno",
        calorias: 180,
        proteinas: 5,
        carbohidratos: 35,
        grasas: 3,
      },
      errors: [],
      warnings: ["Tiempo de preparación no especificado, usando valor por defecto (15 min)"],
      isValid: true,
    },
    {
      id: "3",
      data: { nombre: "", tipoComida: "cena", calorias: 400, proteinas: 30, carbohidratos: 40, grasas: 12 },
      errors: ["El nombre es requerido"],
      warnings: [],
      isValid: false,
    },
    {
      id: "4",
      data: {
        nombre: "Bowl de quinoa",
        tipoComida: "almuerzo",
        calorias: -50,
        proteinas: 12,
        carbohidratos: 45,
        grasas: 8,
      },
      errors: ["Las calorías deben ser un número positivo"],
      warnings: [],
      isValid: false,
    },
    {
      id: "5",
      data: {
        nombre: "Tortilla francesa",
        tipoComida: "desayuno",
        calorias: 220,
        proteinas: 14,
        carbohidratos: 2,
        grasas: 18,
      },
      errors: [],
      warnings: [],
      isValid: true,
    },
  ],
};

export function CargaMasiva() {
  const [activeTab, setActiveTab] = useState("importar");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [editingAlimentos, setEditingAlimentos] = useState<typeof alimentosData>([...alimentosData]);
  const [editingRecetas, setEditingRecetas] = useState<typeof recetasData>([...recetasData]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkEditMode, setBulkEditMode] = useState<"alimentos" | "recetas">("alimentos");
  const [pendingChanges, setPendingChanges] = useState<number>(0);

  // Handlers de drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) {
      void handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);
    setProgress(0);

    // Simular procesamiento
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setProgress(i);
    }

    // Simular resultado
    setImportResult(mockImportResult);
    setIsProcessing(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleToggleRow = (rowId: string) => {
    setSelectedRows((prev) => (prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]));
  };

  const handleSelectAllValid = () => {
    if (importResult) {
      const validIds = importResult.rows.filter((r) => r.isValid).map((r) => r.id);
      setSelectedRows((prev) => (prev.length === validIds.length ? [] : validIds));
    }
  };

  const handleImportSelected = () => {
    // TODO: Integrar con backend
    console.log("Importando filas:", selectedRows);
    setIsConfirmDialogOpen(false);
    setImportResult(null);
    setUploadedFile(null);
    setSelectedRows([]);
  };

  const handleReset = () => {
    setImportResult(null);
    setUploadedFile(null);
    setSelectedRows([]);
    setProgress(0);
  };

  // Handlers para edición masiva
  const handleBulkFieldChange = (id: string, field: string, value: string | number) => {
    if (bulkEditMode === "alimentos") {
      setEditingAlimentos((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    } else {
      setEditingRecetas((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    }
    setPendingChanges((prev) => prev + 1);
  };

  const handleSaveBulkChanges = () => {
    // TODO: Integrar con backend
    console.log("Guardando cambios masivos:", bulkEditMode === "alimentos" ? editingAlimentos : editingRecetas);
    setPendingChanges(0);
  };

  const handleDiscardBulkChanges = () => {
    setEditingAlimentos([...alimentosData]);
    setEditingRecetas([...recetasData]);
    setPendingChanges(0);
  };

  const filteredItems =
    bulkEditMode === "alimentos"
      ? editingAlimentos.filter((a) => a.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
      : editingRecetas.filter((r) => r.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Edición y Carga Masiva</h2>
          <p className="text-muted-foreground text-sm">Importa y modifica múltiples alimentos o recetas a la vez</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 size-4" />
            Plantilla Alimentos
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 size-4" />
            Plantilla Recetas
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="importar">
            <Upload className="mr-2 size-4" />
            Importar CSV
          </TabsTrigger>
          <TabsTrigger value="editar">
            <Edit2 className="mr-2 size-4" />
            Edición Masiva
          </TabsTrigger>
        </TabsList>

        {/* Tab: Importar CSV */}
        <TabsContent value="importar" className="space-y-4">
          {!importResult ? (
            <Card>
              <CardContent className="pt-6">
                <div
                  className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                    isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isProcessing ? (
                    <div className="space-y-4">
                      <FileSpreadsheet className="text-primary mx-auto size-12 animate-pulse" />
                      <div>
                        <p className="font-medium">Procesando archivo...</p>
                        <p className="text-muted-foreground text-sm">{uploadedFile?.name}</p>
                      </div>
                      <div className="mx-auto max-w-xs">
                        <Progress value={progress} className="h-2" />
                        <p className="text-muted-foreground mt-1 text-xs">{progress}%</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="text-muted-foreground mx-auto mb-4 size-12" />
                      <p className="mb-2 text-lg font-medium">Arrastra tu archivo CSV aquí</p>
                      <p className="text-muted-foreground mb-4 text-sm">o haz clic para seleccionar un archivo</p>
                      <Input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        id="file-upload"
                        onChange={handleFileInputChange}
                      />
                      <label htmlFor="file-upload">
                        <Button asChild variant="outline">
                          <span>Seleccionar archivo</span>
                        </Button>
                      </label>
                    </>
                  )}
                </div>

                <div className="mt-6">
                  <h4 className="mb-2 text-sm font-medium">Formato requerido:</h4>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li>• Archivo CSV con separador de coma o punto y coma</li>
                    <li>• Primera fila con nombres de columnas</li>
                    <li>• Columnas requeridas: nombre, tipoComida, calorias, proteinas, carbohidratos, grasas</li>
                    <li>• Descarga la plantilla para ver el formato exacto</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Resumen de importación */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="text-primary size-8" />
                      <div>
                        <CardTitle className="text-base">{importResult.fileName}</CardTitle>
                        <CardDescription>{importResult.totalRows} filas procesadas</CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleReset}>
                      <X className="size-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
                      <CheckCircle2 className="mx-auto mb-1 size-5 text-green-600" />
                      <p className="text-2xl font-semibold text-green-700 dark:text-green-400">
                        {importResult.validRows}
                      </p>
                      <p className="text-xs text-green-600">Válidas</p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950">
                      <AlertCircle className="mx-auto mb-1 size-5 text-red-600" />
                      <p className="text-2xl font-semibold text-red-700 dark:text-red-400">{importResult.errorRows}</p>
                      <p className="text-xs text-red-600">Con errores</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                      <FileSpreadsheet className="mx-auto mb-1 size-5 text-blue-600" />
                      <p className="text-2xl font-semibold text-blue-700 dark:text-blue-400">{selectedRows.length}</p>
                      <p className="text-xs text-blue-600">Seleccionadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabla de resultados */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Vista previa de importación</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleSelectAllValid}>
                      {selectedRows.length === importResult.validRows ? "Deseleccionar todas" : "Seleccionar válidas"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10"></TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Calorías</TableHead>
                          <TableHead className="text-right">P/C/G</TableHead>
                          <TableHead>Notas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importResult.rows.map((row) => (
                          <TableRow key={row.id} className={!row.isValid ? "bg-red-50/50 dark:bg-red-950/20" : ""}>
                            <TableCell>
                              <Checkbox
                                checked={selectedRows.includes(row.id)}
                                onCheckedChange={() => handleToggleRow(row.id)}
                                disabled={!row.isValid}
                              />
                            </TableCell>
                            <TableCell>
                              {row.isValid ? (
                                <CheckCircle2 className="size-4 text-green-600" />
                              ) : (
                                <AlertCircle className="size-4 text-red-600" />
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {(row.data.nombre as string) || (
                                <span className="text-muted-foreground italic">Sin nombre</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {row.data.tipoComida}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{row.data.calorias}</TableCell>
                            <TableCell className="text-muted-foreground text-right text-xs">
                              {row.data.proteinas}/{row.data.carbohidratos}/{row.data.grasas}
                            </TableCell>
                            <TableCell>
                              {row.errors.length > 0 && (
                                <span className="text-xs text-red-600">{row.errors.join(", ")}</span>
                              )}
                              {row.warnings.length > 0 && (
                                <span className="text-xs text-yellow-600">{row.warnings.join(", ")}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button variant="outline" onClick={handleReset}>
                    <RefreshCcw className="mr-2 size-4" />
                    Cargar otro archivo
                  </Button>
                  <Button onClick={() => setIsConfirmDialogOpen(true)} disabled={selectedRows.length === 0}>
                    <Upload className="mr-2 size-4" />
                    Importar seleccionadas ({selectedRows.length})
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Tab: Edición Masiva */}
        <TabsContent value="editar" className="space-y-4">
          {pendingChanges > 0 && (
            <Alert>
              <AlertCircle className="size-4" />
              <AlertTitle>Cambios pendientes</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>Tienes {pendingChanges} cambios sin guardar.</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDiscardBulkChanges}>
                    Descartar
                  </Button>
                  <Button size="sm" onClick={handleSaveBulkChanges}>
                    <Save className="mr-2 size-4" />
                    Guardar todo
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                  <Button
                    variant={bulkEditMode === "alimentos" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBulkEditMode("alimentos")}
                  >
                    Alimentos ({alimentosData.length})
                  </Button>
                  <Button
                    variant={bulkEditMode === "recetas" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBulkEditMode("recetas")}
                  >
                    Recetas ({recetasData.length})
                  </Button>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {bulkEditMode === "alimentos" ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Nombre</TableHead>
                        <TableHead className="w-[100px]">Calorías</TableHead>
                        <TableHead className="w-[80px]">Proteínas</TableHead>
                        <TableHead className="w-[80px]">Carbohidratos</TableHead>
                        <TableHead className="w-[80px]">Grasas</TableHead>
                        <TableHead className="w-[80px]">Fibra</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(filteredItems as typeof alimentosData).map((alimento) => (
                        <TableRow key={alimento.id}>
                          <TableCell>
                            <Input
                              value={alimento.nombre}
                              onChange={(e) => handleBulkFieldChange(alimento.id, "nombre", e.target.value)}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={alimento.calorias}
                              onChange={(e) =>
                                handleBulkFieldChange(alimento.id, "calorias", parseFloat(e.target.value))
                              }
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={alimento.proteinas}
                              onChange={(e) =>
                                handleBulkFieldChange(alimento.id, "proteinas", parseFloat(e.target.value))
                              }
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={alimento.carbohidratos}
                              onChange={(e) =>
                                handleBulkFieldChange(alimento.id, "carbohidratos", parseFloat(e.target.value))
                              }
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={alimento.grasas}
                              onChange={(e) => handleBulkFieldChange(alimento.id, "grasas", parseFloat(e.target.value))}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={alimento.fibra ?? 0}
                              onChange={(e) => handleBulkFieldChange(alimento.id, "fibra", parseFloat(e.target.value))}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="text-destructive size-8">
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Nombre</TableHead>
                        <TableHead className="w-[100px]">Tipo</TableHead>
                        <TableHead className="w-[80px]">Tiempo</TableHead>
                        <TableHead className="w-[80px]">Porciones</TableHead>
                        <TableHead className="w-[100px]">Estado</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(filteredItems as typeof recetasData).map((receta) => (
                        <TableRow key={receta.id}>
                          <TableCell>
                            <Input
                              value={receta.nombre}
                              onChange={(e) => handleBulkFieldChange(receta.id, "nombre", e.target.value)}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {receta.tipoComida}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={receta.tiempoPreparacion}
                              onChange={(e) =>
                                handleBulkFieldChange(receta.id, "tiempoPreparacion", parseInt(e.target.value))
                              }
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={receta.porciones}
                              onChange={(e) => handleBulkFieldChange(receta.id, "porciones", parseInt(e.target.value))}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant={receta.estado === "publicado" ? "default" : "outline"} className="text-xs">
                              {receta.estado}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="text-destructive size-8">
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de confirmación */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar importación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas importar {selectedRows.length} {selectedRows.length === 1 ? "fila" : "filas"}?
              Esta acción añadirá los nuevos registros a tu base de datos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImportSelected}>
              <Upload className="mr-2 size-4" />
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
