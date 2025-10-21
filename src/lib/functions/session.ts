import { useAppSession } from "@/utils/session"
import { createServerFn } from "@tanstack/react-start"


export const getSession = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data: { user, token } } = await useAppSession()
    if (!user || !token) return null
    return {
      user: user,
      token: token
    }
  })
