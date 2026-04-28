import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'RunPlan — Free personalized weekly running plans built from your Garmin or Strava data'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #eff6ff 100%)',
          padding: '80px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '480px',
            height: '480px',
            borderRadius: '9999px',
            background: 'rgba(251, 146, 60, 0.25)',
            filter: 'blur(60px)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-160px',
            left: '-100px',
            width: '520px',
            height: '520px',
            borderRadius: '9999px',
            background: 'rgba(147, 51, 234, 0.22)',
            filter: 'blur(70px)',
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '36px' }}>
          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #fb923c 0%, #ec4899 50%, #9333ea 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '40px',
              fontWeight: 800,
              letterSpacing: '-2px',
            }}
          >
            R
          </div>
          <div style={{ display: 'flex', fontSize: '44px', fontWeight: 700, color: '#0f172a', letterSpacing: '-1px' }}>
            RunPlan
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: '76px',
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.05,
            letterSpacing: '-2px',
            maxWidth: '1000px',
            marginBottom: '28px',
          }}
        >
          Personalized weekly running plans.
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: '34px',
            color: '#475569',
            lineHeight: 1.35,
            maxWidth: '1000px',
            marginBottom: '40px',
          }}
        >
          Built from your Garmin or Strava data. Adapts to your recovery. Free forever.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              padding: '14px 28px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
              color: '#ffffff',
              fontSize: '26px',
              fontWeight: 700,
            }}
          >
            runplan.fun
          </div>
          <div style={{ display: 'flex', fontSize: '22px', color: '#64748b' }}>
            5K • 10K • Half • Marathon • Ultra • Base • Recovery
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
