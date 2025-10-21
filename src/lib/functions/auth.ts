import { API_URL } from "@/utils/env";
import { createServerFn } from "@tanstack/react-start";

export const setNewPassword = createServerFn({ method: 'POST' })
  .validator((d: { password: string, email: string, token: string }) => d)
  .handler(async ({ data }) => {
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/reset?type=email`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: data.password, email: data.email, otp: data.token })
      })
      if (!res.ok) {
        return {
          error: true,
          message: await res.text()
        }
      }
    } catch (e) {
      console.error(e)
    }
  })
