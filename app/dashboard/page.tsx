'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase-browser'
import PlatformConnector from '@/components/PlatformConnector'
import GarminConnectModal from '@/components/GarminConnectModal'
import GoalWizard from '@/components/GoalWizard'
import TrainingPlanView from '@/components/TrainingPlanView'
import FullPlanOverview from '@/components/FullPlanOverview'
import OnboardingFlow from '@/components/Onboarding/OnboardingFlow'
import OnboardingBanner from '@/components/Onboarding/OnboardingBanner'
import MileageMismatchBanner from '@/components/MileageMismatchBanner'
import { useCalculatedMileage } from '@/hooks/useCalculatedMileage'
import type { TrainingPlan } from '@/lib/training/planner'
import type { AnalysisResults } from '@/lib/training/analyzer'
import { setUserId, trackPlatformConnection } from '@/components/GoogleAnalytics'

type OnboardingStatus = 'not_started' | 'platform_connected' | 'goals_set' | 'completed' | 'skipped'

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
  intensity_preference?: 'conservative' | 'normal' | 'aggressive'
}

interface GeneratedPlanData {
  plan: TrainingPlan
  analysis: AnalysisResults
  generatedAt: string
}

// Map error codes to user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  strava_auth_failed: 'Failed to start Strava authorization. Please try again.',
  strava_denied: 'You declined to connect your Strava account.',
  no_code: 'No authorization code received from Strava.',
  invalid_state: 'Invalid or missing state parameter. Please try again.',
  state_expired: 'Authorization timed out. Please try connecting again.',
  token_exchange_failed: 'Failed to complete authorization with Strava.',
  encryption_failed: 'Failed to securely store your connection.',
  db_error: 'Failed to save your connection. Please try again.',
  verification_failed: 'Connection saved but could not be verified.',
  strava_callback_failed: 'Something went wrong. Please try again.',
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [config, setConfig] = useState<TrainingConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [showGarminModal, setShowGarminModal] = useState(false)
  const [showGoalWizard, setShowGoalWizard] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<GeneratedPlanData | null>(null)
  const [planLoading, setPlanLoading] = useState(false)
  const [planError, setPlanError] = useState<string | null>(null)
  const [emailPreviewHtml, setEmailPreviewHtml] = useState<string | null>(null)
  const [emailPreviewLoading, setEmailPreviewLoading] = useState(false)
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>('not_started')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [connectionError, setConnectionError] = useState<{ message: string; flowId?: string } | null>(null)
  const [mileageBannerDismissed, setMileageBannerDismissed] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient()
  const { calculatedMileage } = useCalculatedMileage()

  // Load mileage banner dismissal state from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('mileage-banner-dismissed')
    if (dismissed === 'true') {
      setMileageBannerDismissed(true)
    }
  }, [])

  useEffect(() => {
    loadUserData()

    // Track Strava connection success from OAuth callback
    const successParam = searchParams.get('success')
    if (successParam === 'strava_connected') {
      trackPlatformConnection('strava')
      setConnectionError(null)
      // Clean up URL
      router.replace('/dashboard', { scroll: false })
    }

    // Handle error parameters from OAuth callback
    const errorParam = searchParams.get('error')
    if (errorParam) {
      const flowId = searchParams.get('flow') || undefined
      const message = ERROR_MESSAGES[errorParam] || 'An error occurred connecting to Strava.'
      setConnectionError({ message, flowId })
      // Clean up URL but keep error visible
      router.replace('/dashboard', { scroll: false })
    }
  }, [searchParams, router])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Set GA user ID for cross-session tracking
      setUserId(user.id)

      // Load user profile including onboarding status
      const { data: profileData } = await (supabase as any)
        .from('user_profiles')
        .select('onboarding_status')
        .eq('id', user.id)
        .single()

      const status = (profileData?.onboarding_status as OnboardingStatus) || 'not_started'
      setOnboardingStatus(status)

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

      // Show onboarding if not completed or skipped
      if (status !== 'completed' && status !== 'skipped') {
        setShowOnboarding(true)
      }

      // Load cached plan if user has connections and config
      if (connectionsData && connectionsData.length > 0 && configData) {
        loadCachedPlan()
      }
    } catch (err) {
      console.error('Error loading user data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadCachedPlan = async () => {
    try {
      const response = await fetch('/api/generate-plan')
      if (response.ok) {
        const data = await response.json()
        if (data.plan) {
          setCurrentPlan({
            plan: data.plan,
            analysis: data.analysis,
            generatedAt: data.generatedAt,
          })
        }
      }
    } catch (err) {
      console.error('Error loading cached plan:', err)
    }
  }

  const generatePlan = async (force: boolean = false) => {
    setPlanLoading(true)
    setPlanError(null)

    try {
      const url = force ? '/api/generate-plan?force=true' : '/api/generate-plan'
      const response = await fetch(url, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate plan')
      }

      const data = await response.json()
      setCurrentPlan({
        plan: data.plan,
        analysis: data.analysis,
        generatedAt: data.generatedAt,
      })
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : 'Failed to generate plan')
    } finally {
      setPlanLoading(false)
    }
  }

  const loadEmailPreview = async () => {
    setEmailPreviewLoading(true)
    try {
      const response = await fetch('/api/preview-email')
      if (response.ok) {
        const html = await response.text()
        setEmailPreviewHtml(html)
      }
    } catch (err) {
      console.error('Error loading email preview:', err)
    } finally {
      setEmailPreviewLoading(false)
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

  const handleIntensityChange = async (intensity: 'conservative' | 'normal' | 'aggressive') => {
    if (!user) return

    try {
      // Save to database
      const { error } = await (supabase as any)
        .from('training_configs')
        .update({ intensity_preference: intensity })
        .eq('user_id', user.id)

      if (error) {
        console.error('Error saving intensity preference:', error)
        return
      }

      // Update local state
      setConfig(prev => prev ? { ...prev, intensity_preference: intensity } : prev)

      // Regenerate plan with new intensity
      generatePlan(true)
    } catch (err) {
      console.error('Error updating intensity preference:', err)
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

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setOnboardingStatus('completed')
    loadUserData()
  }

  const handleOnboardingSkip = () => {
    setShowOnboarding(false)
    setOnboardingStatus('skipped')
  }

  const handleResumeOnboarding = () => {
    setShowOnboarding(true)
  }

  // Check if we should show the onboarding banner (skipped onboarding but not fully set up)
  const shouldShowBanner = onboardingStatus === 'skipped' && (connections.length === 0 || !config)

  // Check if we should show the mileage mismatch banner
  const showMileageMismatchBanner = config &&
    calculatedMileage !== null &&
    calculatedMileage > 0 &&
    Math.abs(calculatedMileage - config.current_weekly_mileage) / config.current_weekly_mileage > 0.3 &&
    !mileageBannerDismissed

  const handleMileageUpdate = async (newMileage: number) => {
    if (!user) return

    try {
      // Update config in database
      const { error } = await (supabase as any)
        .from('training_configs')
        .update({ current_weekly_mileage: newMileage })
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating mileage:', error)
        return
      }

      // Update local state
      setConfig(prev => prev ? { ...prev, current_weekly_mileage: newMileage } : prev)

      // Regenerate plan with new mileage
      generatePlan(true)
    } catch (err) {
      console.error('Error updating mileage:', err)
    }
  }

  const handleMileageBannerDismiss = () => {
    localStorage.setItem('mileage-banner-dismissed', 'true')
    setMileageBannerDismissed(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Fitness Weekly Email</h1>
          <div className="flex items-center gap-4">
            <span className="text-white/90">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="text-white/90 hover:text-white text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Connection Error Alert */}
        {connectionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-red-800">{connectionError.message}</p>
                {connectionError.flowId && (
                  <p className="text-sm text-red-600 mt-1">
                    Reference: {connectionError.flowId}
                  </p>
                )}
              </div>
              <button
                onClick={() => setConnectionError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Onboarding Banner for skipped users */}
        {shouldShowBanner && (
          <OnboardingBanner
            status={onboardingStatus}
            hasConnections={connections.length > 0}
            hasConfig={!!config}
            onResume={handleResumeOnboarding}
          />
        )}

        {/* Mileage Mismatch Banner for existing users */}
        {showMileageMismatchBanner && config && calculatedMileage !== null && (
          <MileageMismatchBanner
            configuredMileage={config.current_weekly_mileage}
            calculatedMileage={calculatedMileage}
            onUpdate={handleMileageUpdate}
            onDismiss={handleMileageBannerDismiss}
          />
        )}

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

        {/* Sample Email Preview - Show for users without connections */}
        {connections.length === 0 && (
          <section>
            <div className="card p-6 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">See What You'll Get</h3>
                  <p className="text-gray-600 mb-4">
                    Curious what your weekly training email will look like? Preview a sample email with realistic health metrics and a personalized training plan.
                  </p>
                  {!emailPreviewHtml && (
                    <button
                      onClick={loadEmailPreview}
                      disabled={emailPreviewLoading}
                      className="btn-secondary"
                    >
                      {emailPreviewLoading ? 'Loading...' : 'Preview Sample Email'}
                    </button>
                  )}
                  {emailPreviewHtml && (
                    <button
                      onClick={() => setEmailPreviewHtml(null)}
                      className="btn-secondary"
                    >
                      Hide Preview
                    </button>
                  )}
                </div>
              </div>
            </div>

            {emailPreviewHtml && (
              <div className="card overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b text-sm text-gray-600">
                  Sample Email Preview
                </div>
                <iframe
                  srcDoc={emailPreviewHtml}
                  title="Email Preview"
                  className="w-full border-0"
                  style={{ height: '800px' }}
                />
              </div>
            )}
          </section>
        )}

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
                {!emailPreviewHtml ? (
                  <button
                    onClick={loadEmailPreview}
                    disabled={emailPreviewLoading}
                    className="btn-secondary"
                  >
                    {emailPreviewLoading ? 'Loading...' : 'Preview This Week\'s Plan'}
                  </button>
                ) : (
                  <button
                    onClick={() => setEmailPreviewHtml(null)}
                    className="btn-secondary"
                  >
                    Hide Email Preview
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Inline Email Preview */}
        {config && connections.length > 0 && emailPreviewHtml && (
          <section>
            <div className="card overflow-hidden">
              <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Email Preview</span>
                <button
                  onClick={() => setEmailPreviewHtml(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <iframe
                srcDoc={emailPreviewHtml}
                title="Email Preview"
                className="w-full border-0"
                style={{ height: '800px' }}
              />
            </div>
          </section>
        )}

        {/* Live Training Plan View */}
        {config && connections.length > 0 && (
          <section>
            {planLoading && !currentPlan && (
              <div className="card p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Your Plan</h3>
                <p className="text-gray-500">Analyzing your fitness data and creating a personalized training plan...</p>
              </div>
            )}

            {planError && (
              <div className="card p-6 bg-red-50 border-red-200">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-red-700">Failed to generate plan</p>
                    <p className="text-sm text-red-600">{planError}</p>
                  </div>
                </div>
                <button
                  onClick={() => generatePlan(true)}
                  className="btn-secondary mt-4"
                >
                  Try Again
                </button>
              </div>
            )}

            {currentPlan && (
              <TrainingPlanView
                plan={currentPlan.plan}
                analysis={currentPlan.analysis}
                generatedAt={currentPlan.generatedAt}
                onRefresh={() => generatePlan(true)}
                refreshing={planLoading}
                intensityPreference={config?.intensity_preference || 'normal'}
                onIntensityChange={handleIntensityChange}
              />
            )}

            {!currentPlan && !planLoading && !planError && (
              <div className="card p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Your Training Plan</h3>
                <p className="text-gray-500 mb-4">
                  Get a personalized training plan based on your fitness data and goals.
                </p>
                <button onClick={() => generatePlan()} className="btn-primary">
                  Generate Plan Now
                </button>
              </div>
            )}
          </section>
        )}

        {/* Full Plan Overview - only show for race goals with a date */}
        {config && config.goal_category === 'race' && config.goal_date && connections.length > 0 && (
          <FullPlanOverview />
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
          onPlanGenerate={connections.length > 0 ? () => generatePlan(true) : undefined}
        />
      )}

      {/* Onboarding Flow Overlay */}
      {showOnboarding && (
        <OnboardingFlow
          initialStatus={onboardingStatus}
          connections={connections}
          config={config}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
          onConnectionsChange={loadUserData}
          onConfigChange={loadUserData}
        />
      )}
    </div>
  )
}
