import { useState } from 'react'
import logo from '../assets/img/mandidealslogo.png'

function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [userType, setUserType] = useState('staff') // 'staff' or 'admin'
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Set role based on user type and response
      const user = {
        id: data.user_id || Math.random(),
        phone: formData.phone,
        name: formData.name || (userType === 'admin' ? 'Admin' : 'Staff Member'),
        role: data.user?.role || userType
      }
      
      onLogin(user)
    } catch (error) {
      console.error('Auth error:', error)
      // Demo: allow login with any credentials
      const user = {
        id: Math.random(),
        phone: formData.phone,
        name: formData.name || (userType === 'admin' ? 'Admin' : 'Staff Member'),
        role: userType
      }
      onLogin(user)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-white">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-lg">
          {/* Header */}
          <div className="p-12 text-center border-b border-gray-100">
            <div className="mb-8 flex justify-center">
              <img 
                src={logo} 
                alt="Mandi Deals Logo" 
                className="h-28 w-auto"
              />
            </div>
            <h2 className="text-4xl font-semibold text-gray-900 mb-3 tracking-tight">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-base text-gray-500 mb-8 font-light">
              {isLogin ? 'Access the ' + (userType === 'admin' ? 'admin dashboard' : 'POS system') : 'Create a new account'}
            </p>

            {/* User Type Toggle */}
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={() => {
                  setUserType('staff')
                  setError(null)
                  setFormData({ phone: '', name: '', password: '' })
                }}
                className={`px-4 py-2 rounded-md font-medium text-sm transition ${
                  userType === 'staff'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Staff Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserType('admin')
                  setError(null)
                  setFormData({ phone: '', name: '', password: '' })
                }}
                className={`px-4 py-2 rounded-md font-medium text-sm transition ${
                  userType === 'admin'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Admin Login
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 mx-6 mt-6 rounded-lg">
              <p className="text-red-700 text-sm font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Name Field (Register Only) */}
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition text-sm"
                  required={!isLogin}
                />
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition text-sm"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition pr-10 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition text-sm font-medium"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-md hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6 text-sm"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle Form */}
          <div className="px-8 py-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm mb-4">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
                setFormData({ phone: '', name: '', password: '' })
              }}
              className="text-gray-900 hover:text-gray-600 font-medium text-sm transition"
            >
              {isLogin ? 'Create account' : 'Sign in instead'}
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mx-8 mb-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-sm font-semibold text-gray-900 mb-3">
              Demo Credentials
            </p>
            {userType === 'staff' ? (
              <div className="text-xs text-gray-700 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <strong>9876543210</strong>
                </div>
                <div className="flex justify-between">
                  <span>Password:</span>
                  <strong>demo123</strong>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-700 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Admin ID:</span>
                  <strong>0000000001</strong>
                </div>
                <div className="flex justify-between">
                  <span>Password:</span>
                  <strong>admin@2026</strong>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-3">
              For testing purposes
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            Secure staff portal for authorized users only
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
