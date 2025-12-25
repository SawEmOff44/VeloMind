import { useState, useEffect } from 'react'
import { getRoutes, uploadGPX, deleteRoute } from '../services/api'
import { format } from 'date-fns'

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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Routes</h1>
      
      {/* Upload Area */}
      <div
        className={`mb-8 border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="text-primary-600 hover:text-primary-500">
              {uploading ? 'Uploading...' : 'Upload a route file'}
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
          <p className="text-xs text-gray-500 mt-2">GPX, FIT, TCX, or KML • drag and drop</p>
        </div>
      </div>
      
      {/* Routes List */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : routes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No routes uploaded yet</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {routes.map((route) => (
              <li key={route.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {route.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {(route.total_distance / 1000).toFixed(1)} km • 
                      {route.total_elevation_gain > 0 && ` ${Math.round(route.total_elevation_gain)}m elevation gain • `}
                      Uploaded {format(new Date(route.created_at), 'PP')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(route.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
