import { useState, useEffect } from 'react'
import CustomerRegistrationModal from '../components/CustomerRegistrationModal'
import ReceiptModal from '../components/ReceiptModal'
import Toast from '../components/Toast'
import Loader from '../components/Loader'

function POSPage({ user }) {
  const [searchPhone, setSearchPhone] = useState('')
  const [customer, setCustomer] = useState(null)
  const [products, setProducts] = useState(getDemoProducts())
  const [billItems, setBillItems] = useState([])
  const [searchProduct, setSearchProduct] = useState('')
  const [usePoints, setUsePoints] = useState(false)
  const [pointsAmount, setPointsAmount] = useState(0)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [modalPhone, setModalPhone] = useState('')
  const [toast, setToast] = useState({ message: '', type: 'info' })
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [currentReceipt, setCurrentReceipt] = useState(null)
  const [allocatePoints, setAllocatePoints] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`${import.meta.env.VITE_API_URL}/api/products`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch products')
        return r.json()
      })
      .then(data => {
        // API returns array directly
        if (Array.isArray(data)) {
          setProducts(data)
        } else if (data.products && Array.isArray(data.products)) {
          setProducts(data.products)
        }
      })
      .catch(error => {
        console.error('Product fetch error:', error)
        setProducts(getDemoProducts())
      })
      .finally(() => {
        setLoading(false)
        setProducts(getDemoProducts())
      })
  }, [])

  function getDemoProducts() {
    return [
      { id: 1, name: 'Tomatoes', price: 40, quantity: 100, current_stock: 100, category: 'Vegetables' },
      { id: 2, name: 'Potatoes', price: 25, quantity: 200, current_stock: 200, category: 'Vegetables' },
      { id: 3, name: 'Apples', price: 80, quantity: 50, current_stock: 50, category: 'Fruits' },
      { id: 4, name: 'Bananas', price: 50, quantity: 75, current_stock: 75, category: 'Fruits' },
      { id: 5, name: 'Carrots', price: 35, quantity: 120, current_stock: 120, category: 'Vegetables' },
    ]
  }

  const searchCustomer = async () => {
    if (!searchPhone.trim()) {
      setCustomer(null)
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/customers/search?phone=${searchPhone}`,
        { method: 'GET' }
      )

      if (response.ok) {
        const data = await response.json()
        setCustomer(data.customer)
        setUsePoints(false)
        setPointsAmount(0)
        setToast({ message: 'Customer found successfully', type: 'success' })
      } else {
        // Customer not found - show modal to create
        setCustomer(null)
        setModalPhone(searchPhone)
        setShowCustomerModal(true)
        setToast({ message: 'Customer not found. Create a new one.', type: 'info' })
      }
    } catch (error) {
      console.error('Search error:', error)
      setToast({ message: 'Error searching customer. Please try again.', type: 'error' })
    }
  }

  const addToCart = (product) => {
    const existingItem = billItems.find(item => item.productId === product.id)
    
    if (existingItem) {
      setBillItems(billItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setBillItems([...billItems, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      }])
    }
  }

  const removeFromCart = (productId) => {
    setBillItems(billItems.filter(item => item.productId !== productId))
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      setBillItems(billItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  const calculateTotals = () => {
    const subtotal = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const discount = usePoints ? Math.min(pointsAmount / 10, subtotal * 0.5) : 0
    const total = subtotal - discount
    return { subtotal, discount, total }
  }

  const { subtotal, discount, total } = calculateTotals()

  // Calculate available stock for each product (original quantity - quantity in bill)
  const getAvailableStock = (productId) => {
    const originalProduct = products.find(p => p.id === productId)
    if (!originalProduct) return 0
    
    const cartItem = billItems.find(item => item.productId === productId)
    const quantityInCart = cartItem ? cartItem.quantity : 0
    
    // Use current_stock if available, fallback to quantity
    const stock = originalProduct.current_stock !== undefined ? originalProduct.current_stock : originalProduct.quantity
    return (stock || 0) - quantityInCart
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  ).map(product => ({
    ...product,
    availableQuantity: getAvailableStock(product.id)
  }))

  const completeSale = async () => {
    if (billItems.length === 0) {
      setToast({ message: 'Add items to bill first', type: 'warning' })
      return
    }

    try {
      // First, create a bill
      const billResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/pos/create-bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: user.id || 'staff-1',
          counter_id: 'counter-1',
          customer_id: customer?.id || null
        })
      })

      if (!billResponse.ok) throw new Error('Failed to create bill')
      const { bill_id } = await billResponse.json()

      // Add items to bill
      for (const item of billItems) {
        const addResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/pos/add-item`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bill_id,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price
          })
        })
        if (!addResponse.ok) throw new Error('Failed to add item to bill')
      }

      // Apply points if needed
      let pointsUsed = 0
      if (usePoints && pointsAmount > 0 && customer) {
        try {
          const pointsResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/api/wallet/${customer.id}/redeem-points`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                points_amount: pointsAmount,
                bill_total: subtotal
              })
            }
          )
          if (pointsResponse.ok) {
            const pointsData = await pointsResponse.json()
            pointsUsed = pointsData.points_used || Math.floor(pointsAmount / 10)
          }
        } catch (error) {
          console.error('Points error:', error)
          // Continue without points if error
        }
      }

      // Complete transaction
      const pointsEarned = allocatePoints ? Math.floor(subtotal / 100) : 0
      
      const txnResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/pos/complete-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bill_id,
          customer_id: customer?.id || null,
          payment_method: 'cash',
          points_used: pointsUsed,
          points_earned: pointsEarned,
          allocate_points: allocatePoints
        })
      })

      if (!txnResponse.ok) throw new Error('Failed to complete transaction')
      const txnData = await txnResponse.json()

      // Store receipt data for display
      const receiptData = {
        transaction_id: txnData.transaction_id,
        transaction_date: new Date().toISOString(),
        staff_id: user.id || user.name || 'staff-1',
        counter_id: 'counter-1',
        customer: customer || null,
        items: billItems,
        subtotal: subtotal,
        points_used: usePoints ? pointsAmount : 0,
        points_earned: pointsEarned,
        final_amount: txnData.final_amount,
        payment_method: 'cash',
        new_wallet_balance: txnData.new_wallet_balance || null
      }

      setCurrentReceipt(receiptData)
      setShowReceiptModal(true)

      setToast({ 
        message: `Sale completed! Transaction ID: ${txnData.transaction_id} | Total: ₹${txnData.final_amount.toFixed(2)}`, 
        type: 'success',
        duration: 5000
      })
      
      // Clear bill
      setBillItems([])
      setCustomer(null)
      setSearchPhone('')
      setUsePoints(false)
      setPointsAmount(0)

      // Refresh products to show updated stock
      fetch(`${import.meta.env.VITE_API_URL}/api/products`)
        .then(r => {
          if (!r.ok) throw new Error('Failed to fetch products')
          return r.json()
        })
        .then(data => {
          // API returns array directly
          if (Array.isArray(data)) {
            setProducts(data)
          } else if (data.products && Array.isArray(data.products)) {
            setProducts(data.products)
          }
        })
        .catch(error => console.error('Product refresh error:', error))

    } catch (error) {
      console.error('Sale error:', error)
      setToast({ message: `Error: ${error.message}`, type: 'error' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Point of Sale</h2>
          <p className="text-base text-gray-700 mt-2 font-medium">Staff: <span className="text-gray-900 font-bold">{user.name}</span></p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-700 mb-1 font-medium">Active Counter</p>
          <p className="text-3xl font-bold text-gray-900">Counter 1</p>
        </div>
      </div>

      {loading && <Loader />}

      {!loading && (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: Customer Search & Details */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Customer</h3>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">Search by Phone</label>
                <input
                  type="tel"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchCustomer()}
                  placeholder="10-digit number"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-base"
                />
              </div>
              
              <button
                onClick={searchCustomer}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-md font-medium transition-colors text-sm"
              >
                Search Customer
              </button>

              {customer ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4 flex-1">
                  <div>
                    <p className="text-sm text-gray-700 font-semibold mb-1">Customer Name</p>
                    <p className="text-2xl font-bold text-gray-900">{customer.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-sm text-gray-700 mb-1 font-semibold">Phone</p>
                      <p className="text-base font-bold text-gray-900">{customer.phone}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-sm text-gray-700 mb-1 font-semibold">Tier</p>
                      <p className="text-base font-bold text-gray-900">{customer.tier || 'Standard'}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-medium">Available Points</span>
                      <span className="font-bold text-gray-900">{customer.available_points || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-medium">Redeemable Points</span>
                      <span className="font-bold text-gray-900">{customer.redeemable_points || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-medium">Remaining Points</span>
                      <span className="font-bold text-gray-900">{customer.remaining_points || 0}</span>
                    </div>
                    <div className="text-gray-700 bg-white p-3 rounded border border-gray-200 text-center mt-2 font-medium text-sm">
                      Rate: 100 pts = 10 Rs
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCustomer(null)
                      setSearchPhone('')
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded-md font-medium transition-colors text-sm"
                  >
                    Clear Customer
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-600 text-base flex-1 flex items-center justify-center">
                  <div>
                    <p className="font-medium">No customer</p>
                    <p className="text-sm mt-1">Search to add</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle-Left: Products Catalog */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Products</h3>
            </div>

            <div className="p-6 space-y-3 flex-1 flex flex-col">
              <input
                type="text"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-base"
              />
              
              <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                {filteredProducts.length === 0 ? (
                  <div className="text-center text-gray-600 text-base py-8">
                    <p>No products found</p>
                  </div>
                ) : (
                  filteredProducts.map(product => {
                    const isOutOfStock = product.availableQuantity <= 0
                    const isLowStock = product.availableQuantity < 10 && product.availableQuantity > 0
                    return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={isOutOfStock}
                      className={`w-full text-left p-3 rounded-md transition-colors border text-base ${isOutOfStock ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60' : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-base text-gray-900">{product.name}</p>
                        <p className="text-base font-bold text-gray-900">₹{product.price}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className={`text-sm ${isOutOfStock ? 'text-gray-500' : isLowStock ? 'text-orange-600 font-bold' : 'text-gray-700'}`}>
                          Stock: {product.availableQuantity} kg
                        </p>
                        {isOutOfStock && (
                          <span className="text-sm font-bold text-gray-500">Out</span>
                        )}
                      </div>
                    </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Middle-Right: Bill Items */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Bill Items</h3>
              <p className="text-sm text-gray-700 mt-1 font-medium">{billItems.length} item(s)</p>
            </div>

            <div className="p-6 space-y-2 flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {billItems.length === 0 ? (
                  <div className="text-center text-gray-600 text-base py-8">
                    <p className="font-medium">No items</p>
                    <p className="mt-2 text-sm">Select products to add</p>
                  </div>
                ) : (
                  billItems.map(item => (
                    <div key={item.productId} className="bg-gray-50 p-3 rounded-md border border-gray-200 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-base text-gray-900">{item.name}</span>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-gray-500 hover:text-gray-900 font-bold text-xl"
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-700">
                        <span className="font-medium">₹{item.price}</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                          className="w-12 border border-gray-300 rounded px-2 py-1 text-center text-sm"
                        />
                        <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Billing & Payment */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-6 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Billing</h3>
            </div>

            <div className="p-6 space-y-4 flex flex-col">
              {/* Amount Breakdown */}
              <div className="space-y-2 pb-4 border-b border-gray-200 text-base">
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Subtotal</span>
                  <span className="font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>

                {customer && (
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-md space-y-2 mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={usePoints}
                        onChange={(e) => {
                          setUsePoints(e.target.checked)
                          if (!e.target.checked) setPointsAmount(0)
                        }}
                        disabled={(customer.available_points || 0) === 0}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm font-bold text-gray-900">Use Points</span>
                    </label>
                    
                    {usePoints && (customer.available_points || 0) > 0 && (
                      <div className="space-y-2">
                        <input
                          type="number"
                          value={pointsAmount}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0
                            const maxPoints = (customer.available_points || 0) * 10
                            const maxDiscount = subtotal * 0.5 * 10
                            setPointsAmount(Math.min(val, Math.min(maxPoints, maxDiscount)))
                          }}
                          max={(customer.available_points || 0) * 10}
                          placeholder="Points to redeem"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-base"
                        />
                        <div className="text-sm space-y-1.5 bg-white p-3 rounded border border-gray-200">
                          <p className="text-gray-700">Available: <strong className="text-gray-900">{customer.available_points || 0}</strong> pts</p>
                          <p className="text-gray-700">Max Discount: 50%</p>
                          <p className="text-gray-900 font-bold">Discount: ₹{(pointsAmount / 10).toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                    
                    {!usePoints && (customer.available_points || 0) === 0 && (
                      <p className="text-sm text-gray-700 font-medium">No points available</p>
                    )}
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex justify-between text-sm font-bold text-gray-900 pt-2">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Allocate Points Toggle */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-md space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allocatePoints}
                    onChange={(e) => setAllocatePoints(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-bold text-blue-900">Allocate Points for This Purchase</span>
                </label>
                <p className="text-sm text-blue-800 font-medium ml-6">
                  {allocatePoints ? `Will earn ~${Math.floor(total / 100)} points` : 'Points allocation disabled'}
                </p>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-md border border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-white">Total</span>
                  <span className="text-3xl font-bold text-white">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={completeSale}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-md font-bold transition-colors text-base"
                >
                  Complete Sale
                </button>

                <button
                  onClick={() => {
                    setBillItems([])
                    setCustomer(null)
                    setSearchPhone('')
                    setUsePoints(false)
                    setPointsAmount(0)
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-md font-bold transition-colors text-base"
                >
                  Clear Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Customer Registration Modal */}
      <CustomerRegistrationModal
        isOpen={showCustomerModal}
        phone={modalPhone}
        onClose={() => setShowCustomerModal(false)}
        onSuccess={(newCustomer) => {
          setCustomer(newCustomer)
          setToast({ message: 'New customer created successfully!', type: 'success' })
        }}
        isLoading={false}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        receipt={currentReceipt}
        onClose={() => {
          setShowReceiptModal(false)
          // Clear bill after receipt is closed
          setBillItems([])
          setCustomer(null)
          setSearchPhone('')
          setUsePoints(false)
          setPointsAmount(0)
          // Refresh products
          fetch(`${import.meta.env.VITE_API_URL}/api/products`)
            .then(r => {
              if (!r.ok) throw new Error('Failed to fetch products')
              return r.json()
            })
            .then(data => {
              if (Array.isArray(data)) {
                setProducts(data)
              } else if (data.products && Array.isArray(data.products)) {
                setProducts(data.products)
              }
            })
            .catch(error => console.error('Product refresh error:', error))
        }}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
        duration={toast.duration || 3000}
      />
    </div>
  )
}

export default POSPage
