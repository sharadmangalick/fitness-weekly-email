import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import AdminDashboard from '@/components/AdminDashboard'

const ADMIN_EMAIL = 'smangalick@gmail.com'

async function getAdminData() {
  const supabase = createServerComponentClient({ cookies })

  // Get total users
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })

  // Get users with goals configured
  const { count: usersWithGoals } = await supabase
    .from('training_configs')
    .select('*', { count: 'exact', head: true })

  // Get generated plans count
  const { count: plansGenerated } = await supabase
    .from('generated_plans')
    .select('*', { count: 'exact', head: true })

  // Get platform connections breakdown
  const { data: connections } = await supabase
    .from('platform_connections')
    .select('platform, status')

  const garminActive = connections?.filter(c => c.platform === 'garmin' && c.status === 'active').length || 0
  const garminExpired = connections?.filter(c => c.platform === 'garmin' && c.status === 'expired').length || 0
  const garminError = connections?.filter(c => c.platform === 'garmin' && c.status === 'error').length || 0
  const stravaActive = connections?.filter(c => c.platform === 'strava' && c.status === 'active').length || 0
  const stravaExpired = connections?.filter(c => c.platform === 'strava' && c.status === 'expired').length || 0
  const stravaError = connections?.filter(c => c.platform === 'strava' && c.status === 'error').length || 0

  // Get email stats (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: emailHistory } = await supabase
    .from('email_history')
    .select('status, sent_at')
    .gte('sent_at', thirtyDaysAgo.toISOString())

  const emailsSent = emailHistory?.filter(e => e.status === 'sent').length || 0
  const emailsFailed = emailHistory?.filter(e => e.status === 'failed').length || 0

  // Get recent signups (last 14 days)
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const { data: recentUsers } = await supabase
    .from('user_profiles')
    .select('created_at')
    .gte('created_at', fourteenDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  // Group signups by day
  const signupsByDay: Record<string, number> = {}
  recentUsers?.forEach(user => {
    const day = new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    signupsByDay[day] = (signupsByDay[day] || 0) + 1
  })

  // Get donation stats
  const { data: donations } = await supabase
    .from('donations')
    .select('amount_cents, email, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: donationTotals } = await supabase
    .from('donations')
    .select('amount_cents')

  const totalDonations = donationTotals?.length || 0
  const totalDonationAmount = donationTotals?.reduce((sum, d) => sum + d.amount_cents, 0) || 0

  // Get recent OAuth failures (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: oauthFailures } = await supabase
    .from('oauth_attempts')
    .select('flow_id, user_id, platform, step, status, error_code, error_message, created_at')
    .eq('status', 'failed')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(20)

  // Get all users for admin management
  const { data: allUsers } = await supabase
    .from('user_profiles')
    .select('id, email, name, onboarding_status, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  // Get connections and configs for user status
  const { data: userConnections } = await supabase
    .from('platform_connections')
    .select('user_id, platform, status')

  const { data: userConfigs } = await supabase
    .from('training_configs')
    .select('user_id')

  // Enrich users with connection/config info
  const usersWithStatus = (allUsers || []).map(user => ({
    ...user,
    hasConnection: userConnections?.some(c => c.user_id === user.id && c.status === 'active') || false,
    connectionPlatform: userConnections?.find(c => c.user_id === user.id && c.status === 'active')?.platform || null,
    hasConfig: userConfigs?.some(c => c.user_id === user.id) || false,
  }))

  return {
    overview: {
      totalUsers: totalUsers || 0,
      usersWithGoals: usersWithGoals || 0,
      plansGenerated: plansGenerated || 0,
    },
    platforms: {
      garmin: { active: garminActive, expired: garminExpired, error: garminError },
      strava: { active: stravaActive, expired: stravaExpired, error: stravaError },
    },
    emails: {
      sent: emailsSent,
      failed: emailsFailed,
      successRate: emailsSent + emailsFailed > 0
        ? Math.round((emailsSent / (emailsSent + emailsFailed)) * 100)
        : 0,
    },
    signupsByDay,
    donations: {
      total: totalDonations,
      totalAmount: totalDonationAmount,
      recent: donations || [],
    },
    oauthFailures: oauthFailures || [],
    users: usersWithStatus,
  }
}

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  const data = await getAdminData()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <a
              href="/dashboard"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboard data={data} />
      </main>
    </div>
  )
}
