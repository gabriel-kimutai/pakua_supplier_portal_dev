import { API_URL } from "@/utils/env"
import { useAppSession } from "@/utils/session"
import { createServerFn } from "@tanstack/react-start"

export const getOverviewStats = createServerFn()
  .validator((d: number) => d)
  .handler(async ({ data }) => {
    try {
      const { data: { token } } = await useAppSession()
      const res = await fetch(`${API_URL}/stats/users/${data}/overview`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }
      console.log(data)
      return await res.json()
    } catch (e) {
      console.error("failed to load overview", e)
    }
  })

