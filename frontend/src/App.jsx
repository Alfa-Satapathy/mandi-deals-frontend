import { useState, useEffect } from 'react'
import './App.css'
import { API_URL } from './config/api'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import POSPage from './pages/POSPage'
import AdminDashboard from './pages/AdminDashboard'
import WishlistPage from './pages/WishlistPage'
import PurchaseHistoryPage from './pages/PurchaseHistoryPage'
import SalesAnalyticsPage from './pages/SalesAnalyticsPage'
import logo from './assets/img/mandidealslogo.png'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [user, setUser] = useState(null)
  const [apiStatus, setApiStatus] = useState('checking...')

  // Check API health on load
  useEffect(() => {
    checkApiHealth()
  }, [])

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_URL}/api/health`)
      if (response.ok) {
        setApiStatus('✅ API Connected')
      } else {
        setApiStatus('❌ API Error')
      }
    } catch (error) {
      setApiStatus('❌ API Offline')
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setCurrentPage('pos')
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentPage('home')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center cursor-pointer hover:opacity-90 transition-opacity duration-300" onClick={() => setCurrentPage('home')}>
            <img 
              src={logo} 
              alt="Mandi Deals Logo" 
              className="h-16 w-auto"
              title="Go to Home"
            />
          </div>
          <div className="flex items-center gap-8">
            <span className="text-xs text-gray-400 font-medium tracking-wide">{apiStatus}</span>
            {user && (
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-0 flex gap-12">
          <button
            onClick={() => setCurrentPage('home')}
            className={`px-0 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
              currentPage === 'home' 
                ? 'border-gray-900 text-gray-900' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setCurrentPage('login')}
            className={`px-0 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
              currentPage === 'login' 
                ? 'border-gray-900 text-gray-900' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          {user && (
            <>
              {user.role === 'staff' && (
                <button
                  onClick={() => setCurrentPage('pos')}
                  className={`px-0 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    currentPage === 'pos' 
                      ? 'border-gray-900 text-gray-900' 
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  POS
                </button>
              )}
              {user.role === 'admin' && (
                <>
                  <button
                    onClick={() => setCurrentPage('admin')}
                    className={`px-0 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      currentPage === 'admin' 
                        ? 'border-gray-900 text-gray-900' 
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Admin Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentPage('analytics')}
                    className={`px-0 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      currentPage === 'analytics' 
                        ? 'border-gray-900 text-gray-900' 
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📈 Analytics
                  </button>
                </>
              )}
              {user.role === 'customer' && (
                <>
                  <button
                    onClick={() => setCurrentPage('wishlist')}
                    className={`px-0 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      currentPage === 'wishlist' 
                        ? 'border-gray-900 text-gray-900' 
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    ❤️ Wishlist
                  </button>
                  <button
                    onClick={() => setCurrentPage('history')}
                    className={`px-0 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      currentPage === 'history' 
                        ? 'border-gray-900 text-gray-900' 
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📜 History
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'login' && <LoginPage onLogin={handleLogin} />}
        {currentPage === 'pos' && user && user.role === 'staff' && <POSPage user={user} />}
        {currentPage === 'admin' && user && user.role === 'admin' && <AdminDashboard user={user} />}
        {currentPage === 'analytics' && user && user.role === 'admin' && <SalesAnalyticsPage />}
        {currentPage === 'wishlist' && user && user.role === 'customer' && <WishlistPage />}
        {currentPage === 'history' && user && user.role === 'customer' && <PurchaseHistoryPage />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-8 py-16">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <div className="mb-8 flex justify-center">
            <img 
              src={logo} 
              alt="Mandi Deals Logo" 
              className="h-24 w-auto opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
          <p className="text-xl text-gray-800 font-bold">© 2026 Mandi Deals</p>
          <p className="text-lg text-gray-700 mt-3 font-semibold">Building sustainable marketplaces • Fresh Produce & Waste Rewards</p>
        </div>
      </footer>
    </div>
  )
}

export default App
