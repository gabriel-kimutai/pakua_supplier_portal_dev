import { createFileRoute, useRouter } from '@tanstack/react-router'
import { z } from 'zod';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useForm } from '@tanstack/react-form';
import { PasswordInput } from '@/components/password-input';
import { setNewPassword } from '@/lib/functions/auth';
import { useMutation } from '@tanstack/react-query';
import { AlertDestructive } from '@/components/Alert';
import { toast } from 'sonner';

const searchSchema = z.object({
  email: z.string().email(),
  token: z.string()
})


const ZFormSchema = z.object({
  new_password: z.string(),
  confirm_password: z.string()
})

export const Route = createFileRoute('/reset-password')({
  validateSearch: searchSchema,
  component: RouteComponent,
})


function RouteComponent() {
  const router = useRouter()

  const { mutate, data } = useMutation({
    mutationFn: setNewPassword,
    mutationKey: ['reset-password'],
    onSuccess: async (ctx) => {
      if (!ctx?.error) {
        router.navigate({ to: "/dashboard" })
        return
      }
      toast.error(ctx.message)
    }
  })

  const { email, token } = Route.useSearch()

  const form = useForm({
    validators: { onChange: ZFormSchema },
    defaultValues: {
      new_password: '',
      confirm_password: ''
    },
    onSubmit: async ({ value }) => {
      if (value.new_password !== value.confirm_password) {
        toast.error("Passwords do not match", { position: 'top-center' })
        return
      }
      mutate({
        data: { password: value.new_password, email: email, token: token }
      })
    }
  })
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6",)}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                <a
                  href="#"
                  className="flex flex-col items-center gap-2 font-medium"
                >
                  <div className="flex size-8 items-center justify-center rounded-md">
                    <img className='rounded-sm' src='/pakua_logo.jpg' width={700} height={700} />
                  </div>
                  <span className="sr-only">Pakua</span>
                </a>
                <h1 className="text-xl font-bold">Set New Password</h1>
              </div>
              <div className="flex flex-col gap-6">
                {
                  data?.message
                    ? <AlertDestructive error={new Error(data?.message)} />
                    : ""
                }
                <div className="grid gap-3">
                  <form.Field
                    name='new_password'
                    children={(field) => {
                      return (
                        <>
                          <Label htmlFor={field.name}>New Password</Label>
                          <PasswordInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required
                          />
                          <p className="text-sm text-red-300">{field.state.meta.errors.map((e) => e?.message)}</p>
                        </>
                      )
                    }}
                  />
                </div>
                <div className="grid gap-3">
                  <form.Field
                    name='confirm_password'
                    children={(field) => {
                      return (
                        <>
                          <Label htmlFor={field.name}>New Password</Label>
                          <PasswordInput
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required
                          />
                          <p className="text-sm text-red-300">{field.state.meta.errors.map((e) => e?.message)}</p>
                        </>
                      )
                    }}
                  />
                </div>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button disabled={!canSubmit} type="submit" className="w-full">
                      {isSubmitting ? "..." : "Submit"}
                    </Button>
                  )}
                />
              </div>
            </div>
          </form>
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our <a href="https://pakua.co.ke/terms-and-conditions">Terms of Service</a>{" "}
            and <a href="https://pakua.co.ke/privacy-policy">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  )
}
