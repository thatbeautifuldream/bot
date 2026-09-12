"use client"

import type { EveMessageInputRequest } from "eve/react"

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"

export type InputAnswer =
  | { requestId: string; optionId: string }
  | { requestId: string; text: string }

export function QuestionCard({
  request,
  disabled = false,
  onAnswer,
}: {
  request: EveMessageInputRequest
  disabled?: boolean
  onAnswer: (answer: InputAnswer) => void
}) {
  const options = request.options ?? []
  const allowFreeform = request.allowFreeform === true || options.length === 0

  return (
    <div className="sticky bottom-2 isolate z-50 mx-auto w-full max-w-2xl px-6 pt-2">
      <div className="w-full rounded-3xl bg-popover p-4 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/5 dark:ring-foreground/10">
        <Questionnaire
          key={request.requestId}
          defaultItem="answer"
          items={[{ name: "answer", required: true }]}
          onSubmit={(event) => {
            event.preventDefault()
            if (disabled) return
            const value = String(
              new FormData(event.currentTarget).get("answer") ?? ""
            )
            if (!value) return
            onAnswer(
              options.some((option) => option.id === value)
                ? { requestId: request.requestId, optionId: value }
                : { requestId: request.requestId, text: value }
            )
          }}
        >
          <QuestionnaireItem name="answer" required>
            <QuestionnaireTitle>{request.prompt}</QuestionnaireTitle>
            <QuestionnaireChoices>
              {options.map((option) => (
                <QuestionnaireChoice key={option.id} value={option.id}>
                  {option.label}
                </QuestionnaireChoice>
              ))}
              {allowFreeform && (
                <QuestionnaireInput
                  aria-label="Your answer"
                  placeholder={
                    options.length === 0
                      ? "Type your answer…"
                      : "Type another answer…"
                  }
                />
              )}
            </QuestionnaireChoices>
            <QuestionnaireError />
          </QuestionnaireItem>
          <QuestionnaireActions>
            <QuestionnaireSubmit disabled={disabled}>Answer</QuestionnaireSubmit>
          </QuestionnaireActions>
        </Questionnaire>
      </div>
    </div>
  )
}
