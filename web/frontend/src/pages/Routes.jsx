import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getRoutes, uploadGPX, deleteRoute } from '../services/api'
import { format } from 'date-fns'
import { MapIcon, ArrowUpTrayIcon, TrashIcon, ChartBarIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline'

export default function Routes() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
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
    } catch (error) {
      console.error('Failed to delete route:', error)
      alert('Failed to delete route')
    }
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Routes</h1>
          <p className="text-gray-600">Upload GPX files and sync them to your iPhone</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-50 border border-cyan-200 rounded-lg">
          <MapIcon className="w-5 h-5 text-cyan-600" />
          <span className="text-sm font-medium text-cyan-900">{routes.length} routes</span>
        </div>
      </div>
      
      {/* Upload Area */}
      <div
        className={`mb-8 border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${
          dragActive
            ? 'border-cyan-500 bg-cyan-50 scale-[1.02]'
            : 'border-gray-300 hover:border-cyan-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl">
            <ArrowUpTrayIcon className="h-12 w-12 text-white" />
          </div>
        </div>
        <div className="mt-6">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className={`text-lg font-semibold ${uploading ? 'text-gray-400' : 'text-cyan-600 hover:text-cyan-700'}`}>
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
          {routes.map((route) => (
            <div 
              key={route.id} 
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-cyan-200"
            >
              {/* Route Header */}
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white">
                <div className="flex items-start justify-between mb-3">
                  <MapIcon className="h-8 w-8" />
                  <button
                    onClick={() => handleDelete(route.id)}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    title="Delete route"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                <h3 className="text-xl font-bold group-hover:scale-105 transition-transform">
                  {route.name}
                </h3>
              </div>
              
              {/* Route Stats */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <ArrowsPointingOutIcon className="h-4 w-4" />
                      <span>Distance</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {(route.total_distance / 1000).toFixed(1)}
                      <span className="text-sm font-normal text-gray-500 ml-1">km</span>
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
                  className="mt-4 block w-full text-center py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  View Details
                </Link>
              </div>
            </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
