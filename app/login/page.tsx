// Server-component wrapper. The route segment config below is what
// actually disables the static prerender — it has no effect on
// 'use client' files, so the form lives in LoginClient instead.
export const dynamic = 'force-dynamic'

import LoginClient from './LoginClient'

export default function LoginPage() {
  return <LoginClient />
}
