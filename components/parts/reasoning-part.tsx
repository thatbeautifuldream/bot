"use client"

import * as React from "react"
import { ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function ReasoningPart({
  text,
  isStreaming = false,
}: {
  text: string
  isStreaming?: boolean
}) {
  const [isOpen, setIsOpen] = React.useState(false)

  if (!text.trim()) {
    return null
  }

  return (
    <div className="px-1.5">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground",
          isStreaming && "shimmer"
        )}
      >
        <ChevronRightIcon
          className={cn("size-3.5 transition-transform", isOpen && "rotate-90")}
        />
        {isStreaming ? "Thinking…" : "Thought process"}
      </button>
      {isOpen && (
        <div className="mt-2 whitespace-pre-wrap border-l pl-3 text-sm text-muted-foreground">
          {text}
        </div>
      )}
    </div>
  )
}
