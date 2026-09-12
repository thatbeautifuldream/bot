"use client"

import { useActionState } from "react"

import { signIn } from "@/app/login/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"

export function LoginForm() {
  const [error, formAction, isPending] = useActionState(signIn, undefined)

  return (
    <Empty className="w-full max-w-sm">
      <EmptyHeader>
        <EmptyTitle>Sign in</EmptyTitle>
        <EmptyDescription>
          This agent is private. Enter the password to continue.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <form action={formAction} className="flex w-full flex-col gap-3">
          <Input
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            autoFocus
            required
          />
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Signing in…" : "Continue"}
          </Button>
        </form>
      </EmptyContent>
    </Empty>
  )
}
