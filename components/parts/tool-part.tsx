"use client"

import type { EveDynamicToolPart } from "eve/react"
import { BookOpenIcon, BotIcon, WrenchIcon } from "lucide-react"

import { Spinner } from "@/components/ui/spinner"

const icons = {
  "load-skill": BookOpenIcon,
  "subagent-call": BotIcon,
  "tool-call": WrenchIcon,
  unknown: WrenchIcon,
}

export function ToolPart({ part }: { part: EveDynamicToolPart }) {
  const kind = part.toolMetadata?.eve?.kind ?? "tool-call"
  const name = part.toolMetadata?.eve?.name ?? part.toolName
  const Icon = icons[kind]

  switch (part.state) {
    case "input-streaming":
    case "input-available":
      return (
        <div className="flex items-center gap-2 px-1.5 text-sm text-muted-foreground">
          <Spinner />
          {label(kind, name, true)}
        </div>
      )
    case "approval-requested":
    case "approval-responded":
      return (
        <div className="flex items-center gap-2 px-1.5 text-sm text-muted-foreground">
          <Icon className="size-4" />
          {label(kind, name, true)}
        </div>
      )
    case "output-available":
      return (
        <div className="flex items-center gap-2 px-1.5 text-sm text-muted-foreground">
          {part.partial ? <Spinner /> : <Icon className="size-4" />}
          {label(kind, name, part.partial === true)}
        </div>
      )
    case "output-denied":
      return (
        <div className="px-1.5 text-sm text-muted-foreground">
          Declined <span className="font-medium text-foreground">{name}</span>
          {part.approval.reason ? `: ${part.approval.reason}` : null}
        </div>
      )
    case "output-error":
      return (
        <div className="px-1.5 text-sm text-destructive">
          {name} failed: {part.errorText}
        </div>
      )
    default:
      return null
  }
}

function label(kind: keyof typeof icons, name: string, pending: boolean) {
  switch (kind) {
    case "load-skill":
      return pending ? `Loading skill ${name}…` : `Loaded skill ${name}`
    case "subagent-call":
      return pending ? `Delegating to ${name}…` : `Delegated to ${name}`
    default:
      return pending ? `Running ${name}…` : `Ran ${name}`
  }
}
