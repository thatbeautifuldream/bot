"use client"

import * as React from "react"
import { useEveAgent } from "eve/react"
import type { EveMessage, EveMessageInputRequest } from "eve/react"

import { ChatMessage } from "@/components/chat-message"
import { PromptForm } from "@/components/prompt-form"
import { QuestionCard } from "@/components/question-card"
import { Suggestions } from "@/components/suggestions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"

export function Chat({
  sessionId,
  sessionless = false,
}: {
  sessionId?: string
  sessionless?: boolean
}) {
  const [cancellationError, setCancellationError] = React.useState<string>()

  const agent = useEveAgent({
    initialSession:
      sessionId === undefined ? undefined : { sessionId, streamIndex: 0 },
    resume: sessionId !== undefined,
    onSessionChange(session) {
      if (sessionId === undefined && session !== undefined) {
        // Next patches window.history to navigate, which would detach the
        // active stream, so reach for the unpatched implementation.
        History.prototype.replaceState.call(
          window.history,
          window.history.state,
          "",
          `/s/${encodeURIComponent(session.sessionId)}`
        )
      }
    },
  })

  const isBusy = agent.status === "submitted" || agent.status === "streaming"
  const isResuming = agent.status === "resuming"
  const messages = agent.data.messages
  const lastMessage = messages.at(-1)

  const pendingRequest = React.useMemo(
    () => findPendingInputRequest(messages),
    [messages]
  )

  const errorMessage =
    cancellationError ?? agent.error?.message ?? latestTurnFailure(agent.events)
  const isEmpty = messages.length === 0 && !sessionless && !isResuming

  async function send(text: string) {
    if (isResuming) return
    setCancellationError(undefined)
    await agent.send(text, isBusy ? { turnPolicy: "steer" } : undefined)
  }

  return (
    <div className="mx-auto flex min-h-0 w-full flex-1 flex-col">
      {isEmpty ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>What can I help with?</EmptyTitle>
              <EmptyDescription>
                Start chatting. Every conversation is a durable eve session you
                can come back to by URL.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Suggestions onSelect={(prompt) => void send(prompt)} />
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <MessageScrollerProvider>
          <MessageScroller className="flex-1">
            <MessageScrollerViewport>
              <MessageScrollerContent className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-6">
                {messages.map((message, index) => (
                  <MessageScrollerItem
                    key={message.id}
                    messageId={message.id}
                    scrollAnchor={message.role === "user"}
                  >
                    <ChatMessage
                      message={message}
                      isStreaming={
                        agent.status === "streaming" &&
                        index === messages.length - 1
                      }
                    />
                  </MessageScrollerItem>
                ))}
                {(agent.status === "submitted" || isResuming) && (
                  <MessageScrollerItem messageId="thinking">
                    <div className="flex shimmer items-center gap-2 px-3 text-sm text-muted-foreground">
                      {isResuming ? "Catching up…" : "Thinking…"}
                    </div>
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
              {pendingRequest && (
                <QuestionCard
                  request={pendingRequest}
                  disabled={isResuming}
                  onAnswer={(response) => {
                    setCancellationError(undefined)
                    void agent.respond([response])
                  }}
                />
              )}
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      )}

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-6 pb-6">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertTitle>Request failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <PromptForm
          isBusy={isBusy}
          disabled={isResuming}
          onSubmit={(text) => void send(text)}
          onStop={() => {
            setCancellationError(undefined)
            void agent.cancel().catch((error: unknown) => {
              setCancellationError(
                error instanceof Error
                  ? error.message
                  : "Unable to cancel the response."
              )
            })
          }}
        />
      </div>
    </div>
  )
}

function findPendingInputRequest(
  messages: readonly EveMessage[]
): EveMessageInputRequest | undefined {
  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type !== "dynamic-tool" || part.state !== "approval-requested") {
        continue
      }
      const request = part.toolMetadata?.eve?.inputRequest
      if (request) return request
    }
  }

  return undefined
}

function latestTurnFailure(
  events: ReturnType<typeof useEveAgent>["events"]
): string | undefined {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index]

    if (event.type === "turn.failed") {
      return event.data.code === "MODEL_CALL_FAILED"
        ? "The model is temporarily unavailable. Please try again."
        : event.data.message
    }

    if (
      event.type === "turn.completed" ||
      event.type === "turn.cancelled" ||
      event.type === "message.received"
    ) {
      return undefined
    }
  }

  return undefined
}
