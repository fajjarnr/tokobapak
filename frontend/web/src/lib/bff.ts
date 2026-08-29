// BFF Token Relay server function - TanStack Start server function pattern
// Uses auth-service Go + golang-jwt HttpOnly cookie + CSRF (ADR 0004)

export async function relayToken(request: Request) {
  // ponytail: minimal stub - real impl forwards JWT via HttpOnly cookie to auth-service :3007
  const token = request.headers.get('cookie')?.match(/accessToken=([^;]+)/)?.[1]
  return { token, relayed: !!token }
}

export async function refreshToken(refreshToken: string) {
  // calls auth-service /v1/auth/refresh with HttpOnly refreshToken
  return fetch(`${process.env.VITE_AUTH_URL || 'http://localhost:3007'}/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
}
