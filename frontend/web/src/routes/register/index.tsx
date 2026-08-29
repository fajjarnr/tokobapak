import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/register/')({ component: Register })

function Register() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = fd.get('email') as string
    const name = fd.get('name') as string
    const token = 'demo-token-' + Date.now()
    localStorage.setItem('auth-storage', JSON.stringify({ state: { token, user: { email, name }, isAuthenticated: true }, version: 0 }))
    window.location.href = '/'
  }
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md border-2 border-border shadow-sm bg-card p-8">
        <h1 data-testid="register-title" className="text-3xl font-bold mb-2">Register</h1>
        <p className="text-muted-foreground mb-6">Welcome</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input name="name" placeholder="name" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input name="email" type="email" placeholder="email" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input name="password" type="password" placeholder="password" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm</Label>
            <Input name="confirmPassword" type="password" placeholder="confirm" className="mt-1" />
          </div>
          <Button type="submit" className="w-full">Sign Up</Button>
          <a href="/login" className="block text-center text-sm text-primary underline">Login</a>
        </form>
      </div>
    </div>
  )
}
