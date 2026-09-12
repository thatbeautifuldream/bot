import Link from "next/link"

import { signOut } from "@/app/login/actions"
import { NewChatButton } from "@/components/new-chat-button"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-2 px-6 py-3">
      <Link href="/" className="text-sm font-medium">
        Chat
      </Link>
      <div className="flex items-center gap-2">
        <NewChatButton />
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  )
}
