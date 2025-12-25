import { useState, useEffect } from 'react'
import { getParameters, createParameters, updateParameters, deleteParameters, estimateParameters } from '../services/api'

export default function Parameters() {
  const [parameters, setParameters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    total_mass_kg: '',
    frontal_area_m2: '',
    drag_coefficient: '',
    rolling_resistance: '0.004',
    drivetrain_loss: '0.03',
    ftp: ''
  })
  
  useEffect(() => {
    loadParameters()
  }, [])
  
  const loadParameters = async () => {
    try {
      const response = await getParameters()
      setParameters(response.data)
    } catch (error) {
      console.error('Failed to load parameters:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const params = {
      ...formData,
      total_mass_kg: parseFloat(formData.total_mass_kg),
      frontal_area_m2: parseFloat(formData.frontal_area_m2),
      drag_coefficient: parseFloat(formData.drag_coefficient),
      rolling_resistance: parseFloat(formData.rolling_resistance),
      drivetrain_loss: parseFloat(formData.drivetrain_loss),
      ftp: formData.ftp ? parseInt(formData.ftp) : null
    }
    
    try {
      if (editingId) {
        await updateParameters(editingId, params)
      } else {
        await createParameters(params)
      }
      await loadParameters()
      setShowForm(false)
      setEditingId(null)
      setFormData({
        name: '',
        total_mass_kg: '',
        frontal_area_m2: '',
        drag_coefficient: '',
        rolling_resistance: '0.004',
        drivetrain_loss: '0.03',
        ftp: ''
      })
    } catch (error) {
      console.error('Failed to save parameters:', error)
      alert('Failed to save parameters')
    }
  }
  
  const handleEdit = (param) => {
    setEditingId(param.id)
    setFormData({
      name: param.name,
      total_mass_kg: param.total_mass_kg.toString(),
      frontal_area_m2: param.frontal_area_m2.toString(),
      drag_coefficient: param.drag_coefficient.toString(),
      rolling_resistance: param.rolling_resistance.toString(),
      drivetrain_loss: param.drivetrain_loss.toString(),
      ftp: param.ftp ? param.ftp.toString() : ''
    })
    setShowForm(true)
  }
  
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this parameter set?')) return
    
    try {
      await deleteParameters(id)
      setParameters(parameters.filter(p => p.id !== id))
    } catch (error) {
      console.error('Failed to delete parameters:', error)
      alert('Failed to delete parameters')
    }
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rider Parameters</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({
              name: '',
              total_mass_kg: '',
              frontal_area_m2: '',
              drag_coefficient: '',
              rolling_resistance: '0.004',
              drivetrain_loss: '0.03',
              ftp: ''
            })
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          {showForm ? 'Cancel' : 'New Parameter Set'}
        </button>
      </div>
      
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit' : 'New'} Parameter Set
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="e.g., Road Bike, TT Bike"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total Mass (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.total_mass_kg}
                  onChange={(e) => setFormData({ ...formData, total_mass_kg: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Rider + bike weight"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  FTP (watts)
                </label>
                <input
                  type="number"
                  value={formData.ftp}
                  onChange={(e) => setFormData({ ...formData, ftp: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Functional Threshold Power"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Frontal Area (m²)
                </label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={formData.frontal_area_m2}
                  onChange={(e) => setFormData({ ...formData, frontal_area_m2: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Typical: 0.35-0.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Drag Coefficient (Cd)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.drag_coefficient}
                  onChange={(e) => setFormData({ ...formData, drag_coefficient: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Typical: 0.7-1.0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rolling Resistance (Crr)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={formData.rolling_resistance}
                  onChange={(e) => setFormData({ ...formData, rolling_resistance: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Typical: 0.003-0.005"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Drivetrain Loss (%)
                </label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={formData.drivetrain_loss}
                  onChange={(e) => setFormData({ ...formData, drivetrain_loss: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Typical: 0.02-0.04"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : parameters.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No parameter sets created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {parameters.map((param) => (
            <div key={param.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">{param.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(param)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(param.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Total Mass:</dt>
                  <dd className="font-medium text-gray-900">{param.total_mass_kg} kg</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">CdA:</dt>
                  <dd className="font-medium text-gray-900">
                    {(param.frontal_area_m2 * param.drag_coefficient).toFixed(3)} m²
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Rolling Resistance:</dt>
                  <dd className="font-medium text-gray-900">{param.rolling_resistance}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Drivetrain Loss:</dt>
                  <dd className="font-medium text-gray-900">
                    {(param.drivetrain_loss * 100).toFixed(1)}%
                  </dd>
                </div>
                {param.ftp && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">FTP:</dt>
                    <dd className="font-medium text-gray-900">{param.ftp} W</dd>
                  </div>
                )}
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
