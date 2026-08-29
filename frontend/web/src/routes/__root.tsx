import { createRootRoute, Outlet } from '@tanstack/react-router'
import Providers from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'
export const Route = createRootRoute({ component: () => (<Providers><Outlet /><Toaster /></Providers>) })
