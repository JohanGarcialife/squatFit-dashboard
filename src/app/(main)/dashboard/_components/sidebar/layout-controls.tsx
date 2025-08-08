"use client";

import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { SidebarVariant, SidebarCollapsible, ContentLayout } from "@/lib/layout-preferences";
import { setValueToCookie } from "@/server/server-actions";

type LayoutControlsProps = {
  readonly variant: SidebarVariant;
  readonly collapsible: SidebarCollapsible;
  readonly contentLayout: ContentLayout;
};

export function LayoutControls({ variant, collapsible, contentLayout }: LayoutControlsProps) {
  const handleValueChange = async (key: string, value: string) => {
    await setValueToCookie(key, value);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon">
          <Settings />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end">
        <div className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <h4 className="text-sm leading-none font-medium">Configuración de Diseño</h4>
            <p className="text-muted-foreground text-xs">Personaliza las preferencias de diseño de tu panel.</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Variante de la Barra Lateral</Label>
              <ToggleGroup
                className="w-full"
                size="sm"
                variant="outline"
                type="single"
                value={variant}
                onValueChange={(value) => handleValueChange("sidebar_variant", value)}
              >
                <ToggleGroupItem className="text-xs" value="inset" aria-label="Toggle inset">
                  Insertada
                </ToggleGroupItem>
                <ToggleGroupItem className="text-xs" value="sidebar" aria-label="Toggle sidebar">
                  Barra Lateral
                </ToggleGroupItem>
                <ToggleGroupItem className="text-xs" value="floating" aria-label="Toggle floating">
                  Flotante
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Barra Lateral Colapsable</Label>
              <ToggleGroup
                className="w-full"
                size="sm"
                variant="outline"
                type="single"
                value={collapsible}
                onValueChange={(value) => handleValueChange("sidebar_collapsible", value)}
              >
                <ToggleGroupItem className="text-xs" value="icon" aria-label="Toggle icon">
                  Icono
                </ToggleGroupItem>
                <ToggleGroupItem className="text-xs" value="offcanvas" aria-label="Toggle offcanvas">
                  Menú Lateral
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Diseño del Contenido</Label>
              <ToggleGroup
                className="w-full"
                size="sm"
                variant="outline"
                type="single"
                value={contentLayout}
                onValueChange={(value) => handleValueChange("content_layout", value)}
              >
                <ToggleGroupItem className="text-xs" value="centered" aria-label="Toggle centered">
                  Centrado
                </ToggleGroupItem>
                <ToggleGroupItem className="text-xs" value="full-width" aria-label="Toggle full-width">
                  Ancho Completo
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
