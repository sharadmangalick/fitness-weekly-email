'use client'

import { useState, useEffect } from 'react'

interface EmailPreviewProps {
  isOpen: boolean
  onClose: () => void
  apiUrl?: string // Optional custom URL for authenticated user's actual email
}

export default function EmailPreview({ isOpen, onClose, apiUrl = '/api/preview-email' }: EmailPreviewProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emailHtml, setEmailHtml] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchEmailPreview()
    }
  }, [isOpen, apiUrl])

  const fetchEmailPreview = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error('Failed to load email preview')
      }
      const html = await response.text()
      setEmailHtml(html)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="gradient-primary p-4 rounded-t-2xl flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Email Preview</h2>
            <p className="text-white/80 text-sm">See what your weekly training email looks like</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2"
            aria-label="Close preview"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100" style={{ minHeight: '500px' }}>
          {loading && (
            <div className="h-full flex items-center justify-center" style={{ minHeight: '400px' }}>
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading preview...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="h-full flex items-center justify-center" style={{ minHeight: '400px' }}>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium mb-2">Failed to load preview</p>
                <p className="text-gray-500 text-sm mb-4">{error}</p>
                <button
                  onClick={fetchEmailPreview}
                  className="btn-secondary"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!loading && !error && emailHtml && (
            <iframe
              srcDoc={emailHtml}
              title="Email Preview"
              className="w-full rounded-lg bg-white border-0"
              style={{ height: '600px', minHeight: '500px' }}
              sandbox="allow-same-origin"
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white rounded-b-2xl shrink-0">
          <p className="text-center text-sm text-gray-500">
            This is a sample email. Connect your fitness platform to get personalized data.
          </p>
        </div>
      </div>
    </div>
  )
}
