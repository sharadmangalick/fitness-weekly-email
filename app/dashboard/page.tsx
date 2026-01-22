'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase-browser'
import PlatformConnector from '@/components/PlatformConnector'
import GarminConnectModal from '@/components/GarminConnectModal'
import GoalWizard from '@/components/GoalWizard'

interface Connection {
  platform: 'garmin' | 'strava'
  status: 'active' | 'expired' | 'error'
}

interface TrainingConfig {
  goal_category: 'race' | 'non_race'
  goal_type: string
  goal_date: string | null
  goal_time_minutes: number | null
  current_weekly_mileage: number
  email_enabled: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [config, setConfig] = useState<TrainingConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [showGarminModal, setShowGarminModal] = useState(false)
  const [showGoalWizard, setShowGoalWizard] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Load connections
      const { data: connectionsData } = await supabase
        .from('platform_connections')
        .select('platform, status')
        .eq('user_id', user.id)

      if (connectionsData) {
        setConnections(connectionsData as Connection[])
      }

      // Load training config
      const { data: configData } = await supabase
        .from('training_configs')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (configData) {
        setConfig(configData)
      }
    } catch (err) {
      console.error('Error loading user data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleStravaConnect = () => {
    // Redirect to Strava OAuth
    window.location.href = '/api/connect/strava'
  }

  const handleDisconnect = async (platform: 'garmin' | 'strava') => {
    if (!user) return

    if (confirm(`Are you sure you want to disconnect ${platform}?`)) {
      await supabase
        .from('platform_connections')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', platform)

      loadUserData()
    }
  }

  const handleTriggerEmail = async () => {
    if (!config || connections.length === 0) {
      alert('Please connect a platform and configure your goals first.')
      return
    }

    try {
      const response = await fetch('/api/cron/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-manual-trigger': 'true',
        },
        body: JSON.stringify({ user_id: user.id }),
      })

      if (response.ok) {
        alert('Email sent! Check your inbox.')
      } else {
        const data = await response.json()
        alert(`Failed to send email: ${data.error}`)
      }
    } catch (err) {
      alert('Failed to send email. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const garminConnection = connections.find(c => c.platform === 'garmin')
  const stravaConnection = connections.find(c => c.platform === 'strava')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="gradient-primary">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Fitness Weekly Email</h1>
          <div className="flex items-center gap-4">
            <span className="text-white/80">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="text-white/80 hover:text-white text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Platform Connections */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Connect Your Fitness Platform</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <PlatformConnector
              platform="garmin"
              connected={!!garminConnection}
              status={garminConnection?.status}
              onConnect={() => setShowGarminModal(true)}
              onDisconnect={() => handleDisconnect('garmin')}
            />
            <PlatformConnector
              platform="strava"
              connected={!!stravaConnection}
              status={stravaConnection?.status}
              onConnect={handleStravaConnect}
              onDisconnect={() => handleDisconnect('strava')}
            />
          </div>
        </section>

        {/* Training Goals */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Training Goals</h2>
            <button
              onClick={() => setShowGoalWizard(true)}
              className="text-primary font-semibold hover:underline"
            >
              {config ? 'Edit Goals' : 'Set Goals'}
            </button>
          </div>

          {config ? (
            <div className="card p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-gray-500">Goal Type</div>
                  <div className="font-semibold text-gray-900">
                    {config.goal_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </div>
                </div>
                {config.goal_date && (
                  <div>
                    <div className="text-sm text-gray-500">Target Date</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(config.goal_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">Weekly Mileage</div>
                  <div className="font-semibold text-gray-900">{config.current_weekly_mileage} miles</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email Status</div>
                  <div className={`font-semibold ${config.email_enabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {config.email_enabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Goals Set</h3>
              <p className="text-gray-500 mb-4">Configure your training goals to receive personalized weekly plans.</p>
              <button onClick={() => setShowGoalWizard(true)} className="btn-primary">
                Set Up Goals
              </button>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        {config && connections.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="card p-6">
              <div className="flex flex-wrap gap-4">
                <button onClick={handleTriggerEmail} className="btn-primary">
                  Send Test Email Now
                </button>
                <button className="btn-secondary">
                  Preview This Week's Plan
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Modals */}
      <GarminConnectModal
        isOpen={showGarminModal}
        onClose={() => setShowGarminModal(false)}
        onSuccess={loadUserData}
      />

      {showGoalWizard && (
        <GoalWizard
          initialConfig={config}
          onClose={() => setShowGoalWizard(false)}
          onSave={() => {
            setShowGoalWizard(false)
            loadUserData()
          }}
        />
      )}
    </div>
  )
}
