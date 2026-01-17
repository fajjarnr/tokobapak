
'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'

export default function LoginPage() {
    const router = useRouter()
    const { setUser } = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    })

    async function onSubmit(data: LoginInput) {
        setIsLoading(true)
        try {
            const response = await authApi.login(data)

            // Assuming response structure matches AuthResponse
            // If backend returns 'accessToken', adjust accordingly.
            const { token, refreshToken, user } = response

            setUser({
                id: user.id,
                name: user.name,
                email: user.email,
                image: `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`, // Fallback/Generated image
            })

            // setTokens(token, refreshToken) // Need to expose setTokens from store or use it logic inside setUser?
            // Checking store... setTokens is separate.
            useAuthStore.getState().setTokens(token, refreshToken)

            toast.success('Successfully logged in!')
            router.push('/')
        } catch (error: any) {
            console.error('Login error:', error)
            toast.error(error.message || 'Invalid email or password')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold" data-testid="login-title">Login</CardTitle>
                <CardDescription data-testid="login-description">
                    Enter your email to sign in to your account
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {/* Social Login Buttons Placeholder */}
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" disabled={isLoading}>
                        Google
                    </Button>
                    <Button variant="outline" disabled={isLoading}>
                        Facebook
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="user@example.com" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="********" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center justify-between">
                            <FormField
                                control={form.control}
                                name="rememberMe"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isLoading}
                                                data-testid="remember-me-checkbox"
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Remember me
                                            </FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-center gap-2">
                <div className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-primary hover:underline font-medium">
                        Sign up
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
