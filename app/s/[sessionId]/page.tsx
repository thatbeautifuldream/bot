import { Chat } from "@/components/chat"

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  return <Chat sessionId={sessionId} />
}
