import Image from 'next/image'

export const GarminLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <Image
    src="/garmin-connect-icon.png"
    alt="Garmin Connect"
    width={48}
    height={48}
    className={`${className} rounded-lg`}
  />
)

export const StravaLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116zm-3.065-9.057l2.084-4.116 2.084 4.116h5.066L15.387 0l-5.15 8.887h2.085z"/>
  </svg>
)
