import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-server'
import AdminDashboard from '@/components/AdminDashboard'

const ADMIN_EMAIL = 'smangalick@gmail.com'

interface ConnectionRecord {
  platform: string
  status: string
  user_id?: string
}

interface EmailRecord {
  status: string
  sent_at: string
}

interface UserRecord {
  id: string
  email: string
  name: string | null
  onboarding_status: string
  created_at: string
}

interface DonationRecord {
  amount_cents: number
  email: string | null
  created_at: string
}

interface ConfigRecord {
  user_id: string
}

interface OAuthRecord {
  flow_id: string
  user_id: string | null
  platform: string
  step: string
  status: string
  error_code: string | null
  error_message: string | null
  created_at: string
}

interface WebhookRecord {
  flow_id: string
  stripe_event_id: string | null
  stripe_event_type: string
  step: string
  status: string
  error_code: string | null
  error_message: string | null
  created_at: string
}

async function getAdminData() {
  // Use admin client to bypass RLS and see all users
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

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
  const { data: connectionsData } = await supabase
    .from('platform_connections')
    .select('platform, status')
  const connections = connectionsData as ConnectionRecord[] | null

  const garminActive = connections?.filter(c => c.platform === 'garmin' && c.status === 'active').length || 0
  const garminExpired = connections?.filter(c => c.platform === 'garmin' && c.status === 'expired').length || 0
  const garminError = connections?.filter(c => c.platform === 'garmin' && c.status === 'error').length || 0
  const stravaActive = connections?.filter(c => c.platform === 'strava' && c.status === 'active').length || 0
  const stravaExpired = connections?.filter(c => c.platform === 'strava' && c.status === 'expired').length || 0
  const stravaError = connections?.filter(c => c.platform === 'strava' && c.status === 'error').length || 0

  // Get email stats (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: emailHistoryData } = await supabase
    .from('email_history')
    .select('status, sent_at')
    .gte('sent_at', thirtyDaysAgo.toISOString())
  const emailHistory = emailHistoryData as EmailRecord[] | null

  const emailsSent = emailHistory?.filter(e => e.status === 'sent').length || 0
  const emailsFailed = emailHistory?.filter(e => e.status === 'failed').length || 0

  // Get recent signups (last 14 days)
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const { data: recentUsersData } = await supabase
    .from('user_profiles')
    .select('created_at')
    .gte('created_at', fourteenDaysAgo.toISOString())
    .order('created_at', { ascending: true })
  const recentUsers = recentUsersData as { created_at: string }[] | null

  // Group signups by day
  const signupsByDay: Record<string, number> = {}
  recentUsers?.forEach(user => {
    const day = new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    signupsByDay[day] = (signupsByDay[day] || 0) + 1
  })

  // Get donation stats
  const { data: donationsData } = await supabase
    .from('donations')
    .select('amount_cents, email, created_at')
    .order('created_at', { ascending: false })
    .limit(10)
  const donations = donationsData as DonationRecord[] | null

  const { data: donationTotalsData } = await supabase
    .from('donations')
    .select('amount_cents')
  const donationTotals = donationTotalsData as { amount_cents: number }[] | null

  const totalDonations = donationTotals?.length || 0
  const totalDonationAmount = donationTotals?.reduce((sum, d) => sum + d.amount_cents, 0) || 0

  // Get recent OAuth failures (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: oauthFailuresData } = await supabase
    .from('oauth_attempts')
    .select('flow_id, user_id, platform, step, status, error_code, error_message, created_at')
    .eq('status', 'failed')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(20)
  const oauthFailures = oauthFailuresData as OAuthRecord[] | null

  // Get recent webhook failures (last 7 days)
  const { data: webhookFailuresData } = await supabase
    .from('webhook_attempts')
    .select('flow_id, stripe_event_id, stripe_event_type, step, status, error_code, error_message, created_at')
    .eq('status', 'failed')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(20)
  const webhookFailures = webhookFailuresData as WebhookRecord[] | null

  // Get webhook stats (last 24 hours)
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)

  const { count: webhookTotal } = await supabase
    .from('webhook_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('step', 'completed')
    .gte('created_at', oneDayAgo.toISOString())

  const { count: webhookSuccess } = await supabase
    .from('webhook_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('step', 'completed')
    .eq('status', 'success')
    .gte('created_at', oneDayAgo.toISOString())

  // Get all users for admin management
  const { data: allUsersData } = await supabase
    .from('user_profiles')
    .select('id, email, name, onboarding_status, created_at')
    .order('created_at', { ascending: false })
  const allUsers = allUsersData as UserRecord[] | null

  // Get connections and configs for user status
  const { data: userConnectionsData } = await supabase
    .from('platform_connections')
    .select('user_id, platform, status')
  const userConnections = userConnectionsData as ConnectionRecord[] | null

  const { data: userConfigsData } = await supabase
    .from('training_configs')
    .select('user_id')
  const userConfigs = userConfigsData as ConfigRecord[] | null

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
    webhooks: {
      total: webhookTotal || 0,
      success: webhookSuccess || 0,
      successRate: (webhookTotal || 0) > 0
        ? Math.round(((webhookSuccess || 0) / (webhookTotal || 0)) * 100)
        : 0,
    },
    signupsByDay,
    donations: {
      total: totalDonations,
      totalAmount: totalDonationAmount,
      recent: donations || [],
    },
    oauthFailures: oauthFailures || [],
    webhookFailures: webhookFailures || [],
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
