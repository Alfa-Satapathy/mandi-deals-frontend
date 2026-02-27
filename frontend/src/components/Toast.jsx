import { useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return
    
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  if (!message) return null

  const bgColor = {
    success: 'bg-white border-gray-200',
    error: 'bg-white border-gray-200',
    info: 'bg-white border-gray-200',
    warning: 'bg-white border-gray-200'
  }

  const textColor = {
    success: 'text-gray-900',
    error: 'text-gray-900',
    info: 'text-gray-900',
    warning: 'text-gray-900'
  }

  const iconColor = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    warning: 'text-yellow-600'
  }

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle
  }

  const Icon = icons[type]

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fadeIn">
      <div className={`border rounded-md p-4 ${bgColor[type]} shadow-md max-w-sm`}>
        <div className="flex items-start gap-3">
          <Icon size={20} strokeWidth={2.5} className={`flex-shrink-0 ${iconColor[type]}`} />
          <p className={`text-sm font-medium ${textColor[type]}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Toast
