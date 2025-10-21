import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { z } from "zod"
import { useForm } from "@tanstack/react-form"
import { getRouteApi, useRouter } from "@tanstack/react-router"
import { loginFn } from "@/routes/_authed"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { AlertDestructive } from "./alert"


const ZFormSchema = z.object({
  email: z.string().email(),
  password: z.string()
})


const routeApi = getRouteApi('/auth/login')

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {

  const [error, setError] = useState<string | null>(null)

  const router = useRouter()


  const routeSearch = routeApi.useSearch()

  const loginMutation = useMutation({
    mutationFn: loginFn,
    onSuccess: async (ctx) => {
      if (!ctx?.error) {
        await router.invalidate()
        router.history.push(routeSearch.redirect || '/dashboard')
        return
      }
      setError(ctx.message)
    },
  })


  const form = useForm({
    validators: { onChange: ZFormSchema },
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => loginMutation.mutate({
      data: { email: value.email, password: value.password }
    })
  })

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={(e) => {
      e.preventDefault()
      e.stopPropagation()
      form.handleSubmit()
    }} onBlur={() => setError(null)} {...props}>
      <Card className="overflow-hidden py-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your Pakua account
                </p>
              </div>
              {error && <AlertDestructive error={new Error(error)} />}
              <div className="grid gap-2">
                <form.Field
                  name="email"
                  children={(field) => (
                    <>
                      <Label htmlFor={field.name}>Email</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type="email"
                        placeholder="m@example.com"
                        required
                      />
                    </>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <form.Field
                  name="password"
                  children={(field) => (
                    <>

                      <div className="flex items-center">
                        <Label htmlFor={field.name}>Password</Label>
                        <a
                          href="#"
                          className="ml-auto text-sm underline-offset-2 hover:underline"
                        >
                          Forgot your password?
                        </a>
                      </div>
                      <Input
                        id={field.name}
                        name={field.name}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type="password"
                        required
                      />
                    </>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </div>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/login.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </form>
  )
}

