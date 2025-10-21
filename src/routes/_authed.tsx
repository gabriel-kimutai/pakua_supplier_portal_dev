import { API_URL } from '@/utils/env';
import { useAppSession, type SessionUser } from '@/utils/session';
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'


export const loginFn = createServerFn({ method: 'POST' })
  .validator((d: { email: string; password: string }) => d)
  .handler(async ({ data }) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: data.email, password: data.password })
    })



    if (!res.ok) {
      return {
        error: true,
        message: await res.text()
      }
    }

    const jsonData = await res.json()

    const session = await useAppSession()
    await session.update(jsonData as SessionUser)

  })

export const Route = createFileRoute('/_authed')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed"!</div>
}

