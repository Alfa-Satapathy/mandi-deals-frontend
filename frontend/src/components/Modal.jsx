import { useEffect } from 'react'

function Modal({ isOpen, title, children, onClose, buttons, size = 'md' }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-lg shadow-md border border-gray-200 ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Buttons Footer */}
        {buttons && buttons.length > 0 && (
          <div className="flex gap-2 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg justify-end">
            {buttons.map((button, index) => {
              const baseClass = 'px-4 py-2 rounded font-medium transition-colors text-sm'
              const variantClasses = {
                primary: 'bg-blue-600 text-white hover:bg-blue-700',
                secondary: 'bg-gray-300 text-gray-900 hover:bg-gray-400',
                danger: 'bg-red-600 text-white hover:bg-red-700'
              }
              
              return (
                <button
                  key={index}
                  onClick={button.onClick}
                  className={`${baseClass} ${variantClasses[button.variant] || variantClasses.secondary}`}
                >
                  {button.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
