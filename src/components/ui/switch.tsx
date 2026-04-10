"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-slate-300/90 shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600",
        "data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700",
        "data-[state=checked]:bg-slate-600 dark:data-[state=checked]:bg-slate-400",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full border border-slate-400/70 bg-slate-50 shadow-sm transition-transform dark:border-slate-500 dark:bg-slate-200",
          "translate-x-0 group-data-[state=checked]:translate-x-[calc(100%-2px)]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
