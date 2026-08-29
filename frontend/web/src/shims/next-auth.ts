// shim next-auth -> BFF JWT HttpOnly+CSRF (ADR 0004)
// TanStack Start BFF Token Relay will use auth-service Go + golang-jwt
export const useSession = () => ({ data: null, status: 'unauthenticated' })
export const signIn = async () => {}
export const signOut = async () => {}
export default { useSession, signIn, signOut }
