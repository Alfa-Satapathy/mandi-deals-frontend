import logo from '../assets/img/mandidealslogo.png'

function Loader({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
        <style>{`
          @keyframes popIn {
            0% {
              opacity: 0;
              transform: scale(0.5);
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          .pop-in {
            animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
        `}</style>
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="pop-in">
              <img 
                src={logo} 
                alt="Mandi Deals Logo" 
                className="h-32 w-auto"
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-gray-600 text-sm mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <style>{`
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .pop-in {
          animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
      <div className="mb-4 flex justify-center">
        <div className="pop-in">
          <img 
            src={logo} 
            alt="Mandi Deals Logo" 
            className="h-20 w-auto"
          />
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <p className="text-gray-500 text-sm mt-3">Loading products...</p>
    </div>
  )
}

export default Loader
