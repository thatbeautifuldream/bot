"use client"

import type { EveMessage } from "eve/react"

import { AuthorizationPart } from "@/components/parts/authorization-part"
import { ReasoningPart } from "@/components/parts/reasoning-part"
import { TextPart } from "@/components/parts/text-part"
import { ToolPart } from "@/components/parts/tool-part"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageContent } from "@/components/ui/message"

export function ChatMessage({
  message,
  isStreaming = false,
}: {
  message: EveMessage
  isStreaming?: boolean
}) {
  if (message.role === "user") {
    return (
      <Message align="end">
        <MessageContent>
          <Bubble align="end" variant="muted">
            <BubbleContent>
              {message.parts
                .filter((part) => part.type === "text")
                .map((part) => part.text)
                .join("")}
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    )
  }

  return (
    <Message align="start">
      <MessageContent>
        {message.parts.map((part, index) => {
          switch (part.type) {
            case "text":
              return <TextPart key={index} text={part.text} />
            case "reasoning":
              return (
                <ReasoningPart
                  key={index}
                  text={part.text}
                  isStreaming={isStreaming && part.state === "streaming"}
                />
              )
            case "dynamic-tool":
              return <ToolPart key={part.toolCallId} part={part} />
            case "authorization":
              return <AuthorizationPart key={index} part={part} />
            default:
              return null
          }
        })}
      </MessageContent>
    </Message>
  )
}
