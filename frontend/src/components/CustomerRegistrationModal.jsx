import { useState } from 'react'
import Modal from './Modal'

function CustomerRegistrationModal({ isOpen, phone, onClose, onSuccess, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name.trim()) {
      setError('Customer name is required')
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/customers/quick-register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phone,
            name: formData.name.trim(),
            email: formData.email.trim() || null,
            address: formData.address.trim() || null
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        setSuccess(`Customer registered successfully! ID: ${data.customer_id}`)
        setFormData({ name: '', email: '', address: '' })
        
        setTimeout(() => {
          onSuccess(data.customer)
          onClose()
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to register customer')
      }
    } catch (err) {
      setError('Network error. Please check your connection.')
      console.error('Registration error:', err)
    }
  }

  const handleClose = () => {
    setFormData({ name: '', email: '', address: '' })
    setError('')
    setSuccess('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Register New Customer"
      onClose={handleClose}
      size="md"
    >
      <div className="space-y-4">
        {/* Phone Display */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <p className="text-xs text-gray-600 font-medium">Phone Number</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{phone}</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <p className="text-sm text-gray-900">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <p className="text-sm text-gray-900">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Customer Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com (optional)"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address (optional)"
              rows="3"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-900 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Customer'}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center">
          Press ESC to close
        </p>
      </div>
    </Modal>
  )
}

export default CustomerRegistrationModal
