// Server-component wrapper. The route segment config below is what
// actually disables the static prerender — it has no effect on
// 'use client' files, so the form lives in SignupClient instead.
export const dynamic = 'force-dynamic'

import SignupClient from './SignupClient'

export default function SignupPage() {
  return <SignupClient />
}
