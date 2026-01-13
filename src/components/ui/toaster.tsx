import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function Toaster() {
  return (
    <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 p-4">
      {/* Toast notifications will be rendered here */}
    </div>
  )
}