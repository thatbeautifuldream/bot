"use client"

import type { EveAuthorizationPart } from "eve/react"

import { safeHttpUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item"

export function AuthorizationPart({ part }: { part: EveAuthorizationPart }) {
  if (part.state === "completed") {
    return (
      <div className="px-1.5 text-sm text-muted-foreground">
        {part.outcome === "authorized"
          ? `${part.displayName} connected.`
          : `${part.displayName} authorization ${part.outcome}.`}
      </div>
    )
  }

  const url = part.authorization?.url
    ? safeHttpUrl(part.authorization.url)
    : undefined

  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>Connect {part.displayName}</ItemTitle>
        <ItemDescription>
          {part.authorization?.instructions ?? part.description}
        </ItemDescription>
        {part.authorization?.userCode && (
          <code className="font-mono text-sm">{part.authorization.userCode}</code>
        )}
      </ItemContent>
      {url && (
        <Button
          variant="outline"
          size="sm"
          render={<a href={url} target="_blank" rel="noreferrer" />}
          nativeButton={false}
        >
          Sign in
        </Button>
      )}
    </Item>
  )
}
