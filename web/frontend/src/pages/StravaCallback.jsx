import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

export default function StravaCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const errorParam = searchParams.get('error')

      if (errorParam) {
        setError('Authorization denied')
        setTimeout(() => navigate('/settings'), 3000)
        return
      }

      if (!code) {
        setError('No authorization code received')
        setTimeout(() => navigate('/settings'), 3000)
        return
      }

      try {
        const token = localStorage.getItem('token')
        const apiUrl = import.meta.env.VITE_API_URL || '/api'
        
        await axios.get(`${apiUrl}/strava/callback?code=${code}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        navigate('/settings?strava=connected')
      } catch (error) {
        console.error('Failed to connect Strava:', error)
        setError('Failed to connect Strava account')
        setTimeout(() => navigate('/settings'), 3000)
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {error ? (
          <div>
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">{error}</h2>
            <p className="mt-2 text-gray-600">Redirecting to settings...</p>
          </div>
        ) : (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Connecting Strava...</h2>
            <p className="mt-2 text-gray-600">Please wait while we authorize your account</p>
          </div>
        )}
      </div>
    </div>
  )
}
