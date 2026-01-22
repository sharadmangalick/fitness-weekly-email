/**
 * Platform Exports
 *
 * Central export point for all platform adapters and utilities.
 */

// Interface and types
export * from './interface'

// Garmin
export { GarminClient } from './garmin/client'
export { GarminAdapter, garminAdapter } from './garmin/adapter'

// Strava
export {
  StravaClient,
  getStravaAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  createStravaClient,
} from './strava/client'
export { StravaAdapter, stravaAdapter } from './strava/adapter'

// Factory function to get adapter by platform name
import { GarminAdapter } from './garmin/adapter'
import { StravaAdapter } from './strava/adapter'
import type { FitnessPlatform, PlatformName } from './interface'

export function getAdapter(platform: PlatformName): FitnessPlatform {
  switch (platform) {
    case 'garmin':
      return new GarminAdapter()
    case 'strava':
      return new StravaAdapter()
    default:
      throw new Error(`Unknown platform: ${platform}`)
  }
}
