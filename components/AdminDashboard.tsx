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

interface WebhookFailure {
  flow_id: string
  stripe_event_id: string | null
  stripe_event_type: string
  step: string
  status: string
  error_code: string | null
  error_message: string | null
  created_at: string
}

interface UserInfo {
  id: string
  email: string
  name: string | null
  onboarding_status: string
  created_at: string
  hasConnection: boolean
  connectionPlatform: string | null
  hasConfig: boolean
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
  webhooks: {
    total: number
    success: number
    successRate: number
  }
  signupsByDay: Record<string, number>
  donations: {
    total: number
    totalAmount: number
    recent: Array<{ amount_cents: number; email: string | null; created_at: string }>
  }
  oauthFailures: OAuthFailure[]
  webhookFailures: WebhookFailure[]
  users: UserInfo[]
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
  const [userSearch, setUserSearch] = useState('')
  const [resetLoading, setResetLoading] = useState<string | null>(null)
  const [resetMessage, setResetMessage] = useState<{ userId: string; message: string; type: 'success' | 'error' } | null>(null)

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

  const resetUser = async (userId: string, action: string) => {
    if (!confirm(`Are you sure you want to reset ${action} for this user?`)) {
      return
    }

    setResetLoading(`${userId}-${action}`)
    setResetMessage(null)

    try {
      const response = await fetch('/api/admin/reset-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      })

      const result = await response.json()

      if (response.ok) {
        setResetMessage({ userId, message: result.message, type: 'success' })
        // Reload page after short delay to show updated data
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setResetMessage({ userId, message: result.error, type: 'error' })
      }
    } catch (err) {
      setResetMessage({ userId, message: 'Failed to reset user', type: 'error' })
    } finally {
      setResetLoading(null)
    }
  }

  const filteredUsers = data.users.filter(user =>
    user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(userSearch.toLowerCase()))
  )

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

      {/* Webhook Stats */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Webhook Stats (Last 24 Hours)</h2>
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Total Webhooks" value={data.webhooks.total} color="blue" />
          <StatCard title="Successful" value={data.webhooks.success} color="green" />
          <StatCard title="Success Rate" value={`${data.webhooks.successRate}%`} color={data.webhooks.successRate >= 95 ? 'green' : 'red'} />
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

      {/* User Management */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">User</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Connection</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.slice(0, 20).map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{user.email}</div>
                      {user.name && <div className="text-gray-500 text-xs">{user.name}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.onboarding_status === 'completed' ? 'bg-green-100 text-green-800' :
                        user.onboarding_status === 'skipped' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.onboarding_status}
                      </span>
                      {user.hasConfig && (
                        <span className="ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          goals
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.hasConnection ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {user.connectionPlatform}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">none</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => resetUser(user.id, 'onboarding')}
                          disabled={resetLoading === `${user.id}-onboarding`}
                          className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
                        >
                          {resetLoading === `${user.id}-onboarding` ? '...' : 'Reset Onboarding'}
                        </button>
                        <button
                          onClick={() => resetUser(user.id, 'all')}
                          disabled={resetLoading === `${user.id}-all`}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                        >
                          {resetLoading === `${user.id}-all` ? '...' : 'Reset All'}
                        </button>
                      </div>
                      {resetMessage && resetMessage.userId === user.id && (
                        <div className={`mt-1 text-xs ${resetMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {resetMessage.message}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length > 20 && (
            <div className="p-3 text-center text-sm text-gray-500 border-t border-gray-200">
              Showing 20 of {filteredUsers.length} users. Use search to find specific users.
            </div>
          )}
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No users found matching "{userSearch}"
            </div>
          )}
        </div>
      </section>

      {/* Debugging Tools */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Debugging Tools</h2>

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

        {/* Recent Webhook Failures */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4">
          <h3 className="font-medium text-gray-900 p-4 border-b border-gray-200">
            Recent Webhook Failures (Last 7 Days)
            {data.webhookFailures.length > 0 && (
              <span className="ml-2 text-sm font-normal text-red-600">
                {data.webhookFailures.length} failure{data.webhookFailures.length !== 1 ? 's' : ''}
              </span>
            )}
          </h3>
          {data.webhookFailures.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium text-gray-600">Time</th>
                    <th className="px-4 py-2 font-medium text-gray-600">Flow ID</th>
                    <th className="px-4 py-2 font-medium text-gray-600">Event Type</th>
                    <th className="px-4 py-2 font-medium text-gray-600">Step</th>
                    <th className="px-4 py-2 font-medium text-gray-600">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.webhookFailures.map((failure, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                        {formatDate(failure.created_at)}
                      </td>
                      <td className="px-4 py-2">
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                          {failure.flow_id}
                        </code>
                      </td>
                      <td className="px-4 py-2 text-gray-700 text-xs">{failure.stripe_event_type}</td>
                      <td className="px-4 py-2 text-gray-700">{failure.step}</td>
                      <td className="px-4 py-2 text-red-600 text-xs">
                        {failure.error_code && <span className="font-medium">{failure.error_code}: </span>}
                        {failure.error_message?.substring(0, 60)}
                        {(failure.error_message?.length || 0) > 60 && '...'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No webhook failures in the last 7 days 🎉</p>
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

        {/* Webhook Debugging */}
        <div className="bg-white rounded-lg border border-gray-200 mt-4">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Stripe Webhook Debugging</h3>
            <p className="text-sm text-gray-500 mt-1">Track and debug donation webhook processing</p>
          </div>

          <div className="px-4 pb-4 space-y-4">
            <div className="mt-4">
              <h4 className="font-medium text-gray-800 mb-2">Quick Health Check:</h4>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`-- Recent webhook attempts (last 24 hours)
SELECT
  flow_id,
  stripe_event_type,
  step,
  status,
  error_code,
  created_at
FROM webhook_attempts
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 20;`}
                </pre>
                <button
                  onClick={() => copyToClipboard(`SELECT flow_id, stripe_event_type, step, status, error_code, created_at
FROM webhook_attempts
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 20;`)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white text-xs"
                >
                  {copiedQuery ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">When a user reports missing donation:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 mb-3">
                <li>Ask for their email and approximate donation time</li>
                <li>Check Stripe dashboard for the session ID (cs_xxx)</li>
                <li>Use the query below to find the webhook processing details</li>
              </ol>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`-- Find webhook by session ID
SELECT * FROM webhook_attempts
WHERE metadata->>'sessionId' = 'cs_xxxxx'
ORDER BY created_at;

-- Check if donation was created
SELECT * FROM donations
WHERE stripe_session_id = 'cs_xxxxx';`}
                </pre>
                <button
                  onClick={() => copyToClipboard(`-- Find webhook by session ID
SELECT * FROM webhook_attempts
WHERE metadata->>'sessionId' = 'cs_xxxxx'
ORDER BY created_at;

-- Check if donation was created
SELECT * FROM donations
WHERE stripe_session_id = 'cs_xxxxx';`)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white text-xs"
                >
                  {copiedQuery ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">Find webhook failures:</h4>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`-- Recent failures (last 7 days)
SELECT
  flow_id,
  stripe_event_id,
  stripe_event_type,
  step,
  error_code,
  error_message,
  created_at
FROM webhook_attempts
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;`}
                </pre>
                <button
                  onClick={() => copyToClipboard(`SELECT flow_id, stripe_event_id, stripe_event_type, step, error_code, error_message, created_at
FROM webhook_attempts
WHERE status = 'failed' AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;`)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white text-xs"
                >
                  {copiedQuery ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">Trace specific webhook flow:</h4>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`-- Use flow_id or stripe_event_id from logs
SELECT
  step,
  status,
  duration_ms,
  error_code,
  error_message,
  metadata,
  created_at
FROM webhook_attempts
WHERE flow_id = 'stripe-xxxxx'
   OR stripe_event_id = 'evt_xxxxx'
ORDER BY created_at;`}
                </pre>
                <button
                  onClick={() => copyToClipboard(`SELECT step, status, duration_ms, error_code, error_message, metadata, created_at
FROM webhook_attempts
WHERE flow_id = 'stripe-xxxxx' OR stripe_event_id = 'evt_xxxxx'
ORDER BY created_at;`)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white text-xs"
                >
                  {copiedQuery ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">Check for duplicate donations:</h4>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`-- Should return 0 rows
SELECT
  stripe_session_id,
  COUNT(*) as count
FROM donations
GROUP BY stripe_session_id
HAVING COUNT(*) > 1;`}
                </pre>
                <button
                  onClick={() => copyToClipboard(`SELECT stripe_session_id, COUNT(*) as count
FROM donations
GROUP BY stripe_session_id
HAVING COUNT(*) > 1;`)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white text-xs"
                >
                  {copiedQuery ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">Performance metrics:</h4>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`-- Average processing time by step
SELECT
  step,
  COUNT(*) as attempts,
  ROUND(AVG(duration_ms)::numeric, 2) as avg_ms,
  MAX(duration_ms) as max_ms
FROM webhook_attempts
WHERE duration_ms IS NOT NULL
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY step
ORDER BY avg_ms DESC;`}
                </pre>
                <button
                  onClick={() => copyToClipboard(`SELECT step, COUNT(*) as attempts, ROUND(AVG(duration_ms)::numeric, 2) as avg_ms, MAX(duration_ms) as max_ms
FROM webhook_attempts
WHERE duration_ms IS NOT NULL AND created_at > NOW() - INTERVAL '7 days'
GROUP BY step
ORDER BY avg_ms DESC;`)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white text-xs"
                >
                  {copiedQuery ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">Common error codes:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li><code className="bg-gray-100 px-1 rounded">SIGNATURE_MISSING</code> - No stripe-signature header (test requests)</li>
                <li><code className="bg-gray-100 px-1 rounded">SIGNATURE_INVALID</code> - Wrong webhook secret configured</li>
                <li><code className="bg-gray-100 px-1 rounded">WEBHOOK_SECRET_MISSING</code> - Environment variable not set</li>
                <li><code className="bg-gray-100 px-1 rounded">DB_INSERT_FAILED</code> - Database operation failed (Stripe will retry)</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
              <p className="font-medium text-blue-900 mb-1">💡 Pro Tip:</p>
              <p className="text-blue-800">
                All queries should be run in <strong>Supabase Dashboard → SQL Editor</strong>.
                Flow IDs appear in Vercel logs and can be used to trace the full webhook lifecycle.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
