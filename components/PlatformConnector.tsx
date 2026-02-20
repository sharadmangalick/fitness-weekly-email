'use client'

import { useState } from 'react'
import Image from 'next/image'

interface PlatformConnectorProps {
  platform: 'garmin' | 'strava'
  connected: boolean
  status?: 'active' | 'expired' | 'error'
  onConnect: () => void
  onDisconnect: () => void
}

export default function PlatformConnector({
  platform,
  connected,
  status = 'active',
  onConnect,
  onDisconnect,
}: PlatformConnectorProps) {
  const platformInfo = {
    garmin: {
      name: 'Garmin Connect\u2122',
      icon: (
        <Image
          src="/garmin-connect-icon.png"
          alt="Garmin Connect"
          width={32}
          height={32}
          className="w-8 h-8 rounded-lg"
        />
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Connect via Garmin\u2019s official OAuth',
    },
    strava: {
      name: 'Strava',
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
        </svg>
      ),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      description: 'Connect via OAuth (no password stored)',
    },
  }

  const info = platformInfo[platform]

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  }

  const statusLabels = {
    active: 'Connected',
    expired: 'Token Expired',
    error: 'Connection Error',
  }

  return (
    <div className={`p-6 rounded-xl border-2 ${connected ? info.borderColor : 'border-gray-200'} ${connected ? info.bgColor : 'bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`${info.color}`}>
            {info.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{info.name}</h3>
            <p className="text-sm text-gray-500">{info.description}</p>
          </div>
        </div>

        {connected && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        {connected ? (
          <>
            {(status === 'expired' || status === 'error') && (
              <button
                onClick={onConnect}
                className="btn-primary text-sm px-4 py-2"
              >
                Reconnect
              </button>
            )}
            <button
              onClick={onDisconnect}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={onConnect}
            className={`btn-primary text-sm px-4 py-2`}
          >
            Connect {info.name}
          </button>
        )}
      </div>
    </div>
  )
}
