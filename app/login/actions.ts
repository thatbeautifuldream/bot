"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  COOKIE_NAME,
  createSessionToken,
  isValidPassword,
} from "@/agent/lib/session"

export async function signIn(_state: string | undefined, formData: FormData) {
  const password = String(formData.get("password") ?? "")
  if (!password || !(await isValidPassword(password))) {
    return "Incorrect password."
  }

  const { token, maxAge } = await createSessionToken()
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  redirect("/")
}

export async function signOut() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
  redirect("/login")
}
