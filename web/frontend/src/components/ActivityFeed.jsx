import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSessions } from '../services/api'
import { format, formatDistanceToNow, isSameDay, startOfDay, subDays } from 'date-fns'
import { 
  MapIcon, 
  ClockIcon, 
  BoltIcon, 
  FireIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function ActivityFeed({ limit = 10 }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [groupedActivities, setGroupedActivities] = useState({})

  useEffect(() => {
    loadActivities()
  }, [limit])

  const loadActivities = async () => {
    try {
      const response = await getSessions(limit, 0)
      const sessions = response.data.sessions || []
      
      // Group by date
      const grouped = sessions.reduce((acc, session) => {
        const date = format(startOfDay(new Date(session.start_time)), 'yyyy-MM-dd')
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(session)
        return acc
      }, {})
      
      setActivities(sessions)
      setGroupedActivities(grouped)
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (session) => {
    // Determine icon based on session characteristics
    if (session.average_power > 250) {
      return <BoltIcon className="w-5 h-5 text-orange-500" />
    }
    if (session.distance > 100000) { // > 62 miles
      return <TrophyIcon className="w-5 h-5 text-yellow-500" />
    }
    if (session.elevation_gain > 1000) {
      return <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
    }
    return <MapIcon className="w-5 h-5 text-cyan-500" />
  }

  const getActivityBadge = (session) => {
    const badges = []
    
    if (session.average_power > 300) {
      badges.push({ label: 'High Power', color: 'bg-orange-100 text-orange-700' })
    }
    if (session.distance > 160000) { // > 100 miles
      badges.push({ label: 'Century', color: 'bg-purple-100 text-purple-700' })
    }
    if (session.elevation_gain > 2000) {
      badges.push({ label: 'Climber', color: 'bg-green-100 text-green-700' })
    }
    if (session.duration > 14400) { // > 4 hours
      badges.push({ label: 'Endurance', color: 'bg-blue-100 text-blue-700' })
    }
    
    return badges
  }

  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    
    if (isSameDay(date, now)) {
      return 'Today'
    }
    if (isSameDay(date, subDays(now, 1))) {
      return 'Yesterday'
    }
    if (date > subDays(now, 7)) {
      return format(date, 'EEEE')
    }
    return format(date, 'MMMM d, yyyy')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl">
        <MapIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No recent activity</p>
        <p className="text-sm text-gray-500 mt-1">Your rides will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.keys(groupedActivities).sort((a, b) => new Date(b) - new Date(a)).map(dateStr => (
        <div key={dateStr}>
          {/* Date Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="text-sm font-semibold text-gray-600 px-3 py-1 bg-gray-100 rounded-full">
              {getDateLabel(dateStr)}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Activities for this date */}
          <div className="space-y-3">
            {groupedActivities[dateStr].map(session => {
              const badges = getActivityBadge(session)
              
              return (
                <Link
                  key={session.id}
                  to={`/sessions/${session.id}`}
                  className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 hover:border-cyan-300"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          {getActivityIcon(session)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 truncate">
                              {session.name || 'Unnamed Ride'}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {format(new Date(session.start_time), 'h:mm a')} • {formatDistanceToNow(new Date(session.start_time), { addSuffix: true })}
                            </p>
                          </div>
                          <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <MapIcon className="w-4 h-4" />
                            <span>{(session.distance / 1609.34).toFixed(1)} mi</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>{Math.round(session.duration / 60)} min</span>
                          </div>
                          {session.average_power && (
                            <div className="flex items-center gap-1">
                              <BoltIcon className="w-4 h-4" />
                              <span>{Math.round(session.average_power)}W</span>
                            </div>
                          )}
                          {session.elevation_gain > 0 && (
                            <div className="flex items-center gap-1">
                              <ArrowTrendingUpIcon className="w-4 h-4" />
                              <span>{Math.round(session.elevation_gain * 3.28084)}ft</span>
                            </div>
                          )}
                        </div>

                        {/* Badges */}
                        {badges.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            {badges.map((badge, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
                              >
                                {badge.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar (optional - shows relative effort) */}
                  {session.average_power && (
                    <div className="h-1 bg-gray-100">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{ width: `${Math.min((session.average_power / 300) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
