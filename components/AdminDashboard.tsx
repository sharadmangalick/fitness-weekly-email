'use client'

import { useState } from 'react'

interface OAuthFailure {
  flow_id: string
  user_id: string | null
  platform: string
  step: string
  status: string
  error_code: string | null
  error_message: string | null
  created_at: string
}

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
  oauthFailures: OAuthFailure[]
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
  const [showDebugInstructions, setShowDebugInstructions] = useState(false)
  const [copiedQuery, setCopiedQuery] = useState(false)

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedQuery(true)
    setTimeout(() => setCopiedQuery(false), 2000)
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

      {/* Debugging Tools */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Strava Connection Debugging</h2>

        {/* Recent OAuth Failures */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4">
          <h3 className="font-medium text-gray-900 p-4 border-b border-gray-200">
            Recent OAuth Failures (Last 7 Days)
            {data.oauthFailures.length > 0 && (
              <span className="ml-2 text-sm font-normal text-red-600">
                {data.oauthFailures.length} failure{data.oauthFailures.length !== 1 ? 's' : ''}
              </span>
            )}
          </h3>
          {data.oauthFailures.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium text-gray-600">Time</th>
                    <th className="px-4 py-2 font-medium text-gray-600">Flow ID</th>
                    <th className="px-4 py-2 font-medium text-gray-600">Step</th>
                    <th className="px-4 py-2 font-medium text-gray-600">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.oauthFailures.map((failure, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                        {formatDate(failure.created_at)}
                      </td>
                      <td className="px-4 py-2">
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                          {failure.flow_id}
                        </code>
                      </td>
                      <td className="px-4 py-2 text-gray-700">{failure.step}</td>
                      <td className="px-4 py-2 text-red-600 text-xs">
                        {failure.error_code && <span className="font-medium">{failure.error_code}: </span>}
                        {failure.error_message?.substring(0, 80)}
                        {(failure.error_message?.length || 0) > 80 && '...'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No OAuth failures in the last 7 days</p>
          )}
        </div>

        {/* Debugging Instructions */}
        <div className="bg-white rounded-lg border border-gray-200">
          <button
            onClick={() => setShowDebugInstructions(!showDebugInstructions)}
            className="w-full p-4 flex justify-between items-center text-left hover:bg-gray-50"
          >
            <h3 className="font-medium text-gray-900">Debugging Instructions</h3>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${showDebugInstructions ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDebugInstructions && (
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2">When a user reports connection issues:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Ask them for the <strong>Reference ID</strong> shown in the error message (format: strava-xxx-xxx)</li>
                  <li>Check Vercel logs for structured log output with that flowId</li>
                  <li>Query the oauth_attempts table to see all steps in that flow</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">SQL Query to debug a flow:</h4>
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`SELECT flow_id, step, status, error_code, error_message, created_at
FROM oauth_attempts
WHERE flow_id = 'FLOW_ID_HERE'
ORDER BY created_at;`}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`SELECT flow_id, step, status, error_code, error_message, created_at
FROM oauth_attempts
WHERE flow_id = 'FLOW_ID_HERE'
ORDER BY created_at;`)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white text-xs"
                  >
                    {copiedQuery ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">Common failure points:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li><code className="bg-gray-100 px-1 rounded">initiation</code> - Auth check or state generation failed</li>
                  <li><code className="bg-gray-100 px-1 rounded">state_validation</code> - State expired or user mismatch</li>
                  <li><code className="bg-gray-100 px-1 rounded">token_exchange</code> - Strava API rejected the code</li>
                  <li><code className="bg-gray-100 px-1 rounded">db_storage</code> - Database upsert failed</li>
                  <li><code className="bg-gray-100 px-1 rounded">verification</code> - Connection not found after save</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">View all failures for a user:</h4>
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`SELECT * FROM oauth_attempts
WHERE user_id = 'USER_ID_HERE'
ORDER BY created_at DESC
LIMIT 20;`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
