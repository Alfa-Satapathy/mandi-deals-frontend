// API configuration with fallback
// In production (Vercel), use /api (proxied through Vercel functions)
// In development, use the backend URL from env or default
export const API_URL = import.meta.env.VITE_API_URL || '/api'

export const getApiUrl = (endpoint) => {
  return `${API_URL}${endpoint}`
}

export const fetchApi = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint)
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    return response
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error)
    throw error
  }
}
