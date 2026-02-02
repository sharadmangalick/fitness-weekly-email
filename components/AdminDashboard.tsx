'use client'

interface AdminData {
  overview: {
    totalUsers: number
    usersWithGoals: number
    plansGenerated: number
  }
  platforms: {
    garmin: { active: number; expired: number; error: number }
    strava: { active: number; expired: number; error: number }
  }
  emails: {
    sent: number
    failed: number
    successRate: number
  }
  signupsByDay: Record<string, number>
  donations: {
    total: number
    totalAmount: number
    recent: Array<{ amount_cents: number; email: string | null; created_at: string }>
  }
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  color?: string
}

function StatCard({ title, value, subtitle, color = 'purple' }: StatCardProps) {
  const colorClasses = {
    purple: 'border-purple-200 bg-purple-50',
    green: 'border-green-200 bg-green-50',
    blue: 'border-blue-200 bg-blue-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    red: 'border-red-200 bg-red-50',
  }

  return (
    <div className={`rounded-lg border-2 p-4 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.purple}`}>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

export default function AdminDashboard({ data }: { data: AdminData }) {
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-8">
      {/* Overview Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={data.overview.totalUsers} />
          <StatCard title="Users with Goals" value={data.overview.usersWithGoals} />
          <StatCard title="Plans Generated" value={data.overview.plansGenerated} />
          <StatCard
            title="Activation Rate"
            value={`${data.overview.totalUsers > 0 ? Math.round((data.overview.usersWithGoals / data.overview.totalUsers) * 100) : 0}%`}
            subtitle="Users with goals"
          />
        </div>
      </section>

      {/* Platform Connections */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Connections</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Garmin */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Garmin</h3>
            <div className="grid grid-cols-3 gap-3">
              <StatCard title="Active" value={data.platforms.garmin.active} color="green" />
              <StatCard title="Expired" value={data.platforms.garmin.expired} color="yellow" />
              <StatCard title="Error" value={data.platforms.garmin.error} color="red" />
            </div>
          </div>
          {/* Strava */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Strava</h3>
            <div className="grid grid-cols-3 gap-3">
              <StatCard title="Active" value={data.platforms.strava.active} color="green" />
              <StatCard title="Expired" value={data.platforms.strava.expired} color="yellow" />
              <StatCard title="Error" value={data.platforms.strava.error} color="red" />
            </div>
          </div>
        </div>
      </section>

      {/* Email Stats */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Stats (Last 30 Days)</h2>
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Sent" value={data.emails.sent} color="green" />
          <StatCard title="Failed" value={data.emails.failed} color="red" />
          <StatCard title="Success Rate" value={`${data.emails.successRate}%`} color="blue" />
        </div>
      </section>

      {/* Signups Chart */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Signups (Last 14 Days)</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {Object.keys(data.signupsByDay).length > 0 ? (
            <div className="flex items-end space-x-2 h-32">
              {Object.entries(data.signupsByDay).map(([day, count]) => {
                const maxCount = Math.max(...Object.values(data.signupsByDay))
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0
                return (
                  <div key={day} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-purple-500 rounded-t"
                      style={{ height: `${height}%`, minHeight: count > 0 ? '8px' : '0' }}
                    />
                    <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                      {day}
                    </span>
                    <span className="text-xs font-medium text-gray-700">{count}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No signups in the last 14 days</p>
          )}
        </div>
      </section>

      {/* Donations */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Donations</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <StatCard title="Total Donations" value={data.donations.total} color="green" />
          <StatCard title="Total Amount" value={formatCurrency(data.donations.totalAmount)} color="green" />
          <StatCard
            title="Average Donation"
            value={data.donations.total > 0 ? formatCurrency(Math.round(data.donations.totalAmount / data.donations.total)) : '$0.00'}
            color="blue"
          />
        </div>
        <div className="bg-white rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-900 p-4 border-b border-gray-200">Recent Donations</h3>
          {data.donations.recent.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {data.donations.recent.map((donation, i) => (
                <li key={i} className="px-4 py-3 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-900">{formatCurrency(donation.amount_cents)}</span>
                    {donation.email && (
                      <span className="text-gray-500 text-sm ml-2">{donation.email}</span>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">{formatDate(donation.created_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">No donations yet</p>
          )}
        </div>
      </section>
    </div>
  )
}
