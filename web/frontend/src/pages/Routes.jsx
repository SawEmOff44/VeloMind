import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getRoutes, uploadGPX, deleteRoute } from '../services/api'
import { format } from 'date-fns'
import { MapIcon, ArrowUpTrayIcon, TrashIcon, ChartBarIcon, ArrowsPointingOutIcon, FunnelIcon, XMarkIcon, ScaleIcon } from '@heroicons/react/24/outline'

export default function Routes() {
  const navigate = useNavigate()
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    minDistance: 0,
    maxDistance: 100,
    minElevation: 0,
    maxElevation: 5000,
    difficulty: 'all'
  })
  
  useEffect(() => {
    loadRoutes()
  }, [])
  
  const loadRoutes = async () => {
    try {
      const response = await getRoutes()
      setRoutes(response.data.routes || [])
    } catch (error) {
      console.error('Failed to load routes:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleFileChange = async (files) => {
    if (!files || files.length === 0) return
    
    const file = files[0]
    const allowedExtensions = ['.gpx', '.fit', '.tcx', '.kml']
    const hasValidExtension = allowedExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    )
    
    if (!hasValidExtension) {
      alert('Please upload a GPX, FIT, TCX, or KML file')
      return
    }
    
    // Remove file extension from name
    const fileName = file.name.replace(/\.(gpx|fit|tcx|kml)$/i, '')
    
    setUploading(true)
    try {
      await uploadGPX(file, fileName)
      await loadRoutes()
    } catch (error) {
      console.error('Failed to upload route:', error)
      alert('Failed to upload route file')
    } finally {
      setUploading(false)
    }
  }
  
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files)
    }
  }
  
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this route?')) return
    
    try {
      await deleteRoute(id)
      setRoutes(routes.filter(r => r.id !== id))
      setSelectedForCompare(selectedForCompare.filter(routeId => routeId !== id))
    } catch (error) {
      console.error('Failed to delete route:', error)
      alert('Failed to delete route')
    }
  }
  
  const toggleCompareSelection = (routeId) => {
    if (selectedForCompare.includes(routeId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== routeId))
    } else {
      if (selectedForCompare.length >= 3) {
        alert('You can compare up to 3 routes at a time')
        return
      }
      setSelectedForCompare([...selectedForCompare, routeId])
    }
  }
  
  const startComparison = () => {
    if (selectedForCompare.length < 2) {
      alert('Please select at least 2 routes to compare')
      return
    }
    navigate(`/routes/compare?ids=${selectedForCompare.join(',')}`)
  }
  
  const getDifficultyScore = (route) => {
    const distanceKm = route.total_distance / 1000
    const elevationPerKm = route.total_elevation_gain / distanceKm
    return elevationPerKm * distanceKm / 10
  }
  
  const getDifficultyLabel = (score) => {
    if (score < 10) return { label: 'Easy', color: 'bg-green-500' }
    if (score < 30) return { label: 'Moderate', color: 'bg-yellow-500' }
    if (score < 60) return { label: 'Hard', color: 'bg-orange-500' }
    return { label: 'Extreme', color: 'bg-red-500' }
  }
  
  const filteredRoutes = routes.filter(route => {
    const distanceMi = route.total_distance / 1609.34
    const elevationM = route.total_elevation_gain
    const difficulty = getDifficultyScore(route)
    
    if (distanceMi < filters.minDistance || distanceMi > filters.maxDistance) return false
    if (elevationM < filters.minElevation || elevationM > filters.maxElevation) return false
    
    if (filters.difficulty !== 'all') {
      const diffLabel = getDifficultyLabel(difficulty).label.toLowerCase()
      if (diffLabel !== filters.difficulty.toLowerCase()) return false
    }
    
    return true
  })
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Routes</h1>
          <p className="text-gray-600">Upload GPX files and sync them to your iPhone</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-velo-cyan/10 border border-velo-cyan/30 rounded-lg">
            <MapIcon className="w-5 h-5 text-velo-cyan" />
            <span className="text-sm font-medium text-velo-cyan-dark">{filteredRoutes.length} routes</span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              showFilters 
                ? 'bg-velo-cyan text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
          </button>
        </div>
      </div>
      
      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Filter Routes</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Distance Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distance Range (miles)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={filters.minDistance}
                  onChange={(e) => setFilters({...filters, minDistance: Number(e.target.value)})}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Min"
                  min="0"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  value={filters.maxDistance}
                  onChange={(e) => setFilters({...filters, maxDistance: Number(e.target.value)})}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Max"
                  min="0"
                />
              </div>
            </div>
            
            {/* Elevation Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Elevation Gain (meters)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={filters.minElevation}
                  onChange={(e) => setFilters({...filters, minElevation: Number(e.target.value)})}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Min"
                  min="0"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  value={filters.maxElevation}
                  onChange={(e) => setFilters({...filters, maxElevation: Number(e.target.value)})}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Max"
                  min="0"
                />
              </div>
            </div>
            
            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
                <option value="extreme">Extreme</option>
              </select>
            </div>
            
            {/* Reset Filters */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  minDistance: 0,
                  maxDistance: 100,
                  minElevation: 0,
                  maxElevation: 5000,
                  difficulty: 'all'
                })}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Compare Bar */}
      {selectedForCompare.length > 0 && (
        <div className="mb-8 bg-gradient-to-r from-velo-cyan to-velo-teal rounded-2xl shadow-lg p-6 text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ScaleIcon className="w-6 h-6" />
              <span className="font-semibold">
                {selectedForCompare.length} route{selectedForCompare.length !== 1 ? 's' : ''} selected for comparison
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={startComparison}
                disabled={selectedForCompare.length < 2}
                className={`px-6 py-2 font-semibold rounded-lg transition-all ${
                  selectedForCompare.length >= 2
                    ? 'bg-white text-velo-cyan hover:shadow-lg hover:scale-105'
                    : 'bg-white/20 text-white/50 cursor-not-allowed'
                }`}
              >
                Compare Routes
              </button>
              <button
                onClick={() => setSelectedForCompare([])}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Upload Area */}
      <div
        className={`mb-8 border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${
          dragActive
            ? 'border-velo-cyan bg-velo-cyan/10 scale-[1.02]'
            : 'border-gray-300 hover:border-velo-teal hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-velo-cyan to-velo-teal rounded-2xl">
            <ArrowUpTrayIcon className="h-12 w-12 text-white" />
          </div>
        </div>
        <div className="mt-6">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className={`text-lg font-semibold ${uploading ? 'text-gray-400' : 'text-velo-teal hover:text-velo-green'}`}>
              {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </span>
            <input
              id="file-upload"
              type="file"
              className="sr-only"
              accept=".gpx,.fit,.tcx,.kml"
              onChange={(e) => handleFileChange(e.target.files)}
              disabled={uploading}
            />
          </label>
          <p className="text-sm text-gray-500 mt-2">GPX, FIT, TCX, or KML files supported</p>
          <p className="text-xs text-gray-400 mt-1">Routes automatically sync to your iPhone app</p>
        </div>
      </div>
      
      {/* Routes List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
      ) : routes.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-inner">
          <MapIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">No routes uploaded yet</p>
          <p className="text-sm text-gray-500 mt-2">Upload a GPX file to get started with navigation</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map((route) => {
            const isSelected = selectedForCompare.includes(route.id)
            const difficultyScore = getDifficultyScore(route)
            const difficulty = getDifficultyLabel(difficultyScore)
            
            return (
            <div 
              key={route.id} 
              className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
                isSelected ? 'border-velo-cyan ring-4 ring-velo-cyan/20' : 'border-gray-100 hover:border-velo-cyan'
              }`}
            >
              {/* Route Header */}
              <div className="bg-gradient-to-br from-velo-cyan to-velo-teal p-6 text-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapIcon className="h-8 w-8" />
                    {isSelected && (
                      <span className="px-2 py-1 bg-white/30 rounded-full text-xs font-bold">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCompareSelection(route.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isSelected 
                          ? 'bg-white text-velo-cyan' 
                          : 'bg-white/20 hover:bg-white/30'
                      }`}
                      title={isSelected ? 'Remove from comparison' : 'Add to comparison'}
                    >
                      <ScaleIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(route.id)}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                      title="Delete route"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold group-hover:scale-105 transition-transform">
                  {route.name}
                </h3>
              </div>
              
              {/* Route Stats */}
              <div className="p-6">
                {/* Difficulty Badge */}
                <div className="mb-4 flex items-center gap-2">
                  <span className={`inline-block px-3 py-1 ${difficulty.color} text-white text-xs font-bold rounded-full`}>
                    {difficulty.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    Score: {difficultyScore.toFixed(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <ArrowsPointingOutIcon className="h-4 w-4" />
                      <span>Distance</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {(route.total_distance / 1609.34).toFixed(1)}
                      <span className="text-sm font-normal text-gray-500 ml-1">mi</span>
                    </p>
                  </div>
                  
                  {route.total_elevation_gain > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <ChartBarIcon className="h-4 w-4" />
                        <span>Elevation</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(route.total_elevation_gain)}
                        <span className="text-sm font-normal text-gray-500 ml-1">m</span>
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Uploaded {format(new Date(route.created_at), 'PPp')}
                  </p>
                </div>
                
                <Link
                  to={`/routes/${route.id}`}
                  className="mt-4 block w-full text-center py-2.5 px-4 bg-gradient-to-r from-velo-cyan to-velo-green text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  View Details
                </Link>
              </div>
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
