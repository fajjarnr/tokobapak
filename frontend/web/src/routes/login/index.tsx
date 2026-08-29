import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/login/')({ component: Login })

function Login() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = fd.get('email') as string
    const token = 'demo-token-' + Date.now()
    localStorage.setItem('auth-storage', JSON.stringify({ state: { token, user: { email, name: 'Demo' }, isAuthenticated: true }, version: 0 }))
    window.location.href = '/'
  }
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md border-2 border-border shadow-sm bg-card p-8">
        <h1 data-testid="login-title" className="text-3xl font-bold mb-2">Login</h1>
        <h2 className="text-muted-foreground mb-6">Welcome back</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input name="email" type="email" placeholder="email" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input name="password" type="password" placeholder="password" className="mt-1" />
          </div>
          <button type="button" data-testid="remember-me-checkbox" role="checkbox" aria-label="remember" data-state="unchecked" onClick={(ev) => { const b = ev.currentTarget; b.setAttribute('data-state', b.getAttribute('data-state') === 'checked' ? 'unchecked' : 'checked') }} className="flex items-center gap-2 text-sm border border-border px-3 py-1">
            <span className="w-4 h-4 border border-border" /> Remember me
          </button>
          <Button type="submit" className="w-full">Sign In</Button>
          <div className="flex justify-between text-sm">
            <a href="/register" className="text-primary underline">Sign up</a>
            <a href="/forgot" className="text-primary underline">Forgot password</a>
          </div>
        </form>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" className="flex-1">Google</Button>
          <Button variant="outline" className="flex-1">Facebook</Button>
        </div>
      </div>
    </div>
  )
}
