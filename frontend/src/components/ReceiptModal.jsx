import { useRef } from 'react'
import { jsPDF } from 'jspdf'
import { Wallet, Gift, CreditCard, Printer, Download } from 'lucide-react'
import Modal from './Modal'

function ReceiptModal({ isOpen, receipt, onClose }) {
  const receiptRef = useRef(null)

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '', 'height=600,width=800')
      printWindow.document.write(receiptRef.current.innerHTML)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleDownloadPDF = () => {
    if (!receipt) return

    // Create PDF document (A4 size, mm units)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    let yPosition = 10

    const setFont = (size, weight = 'normal') => {
      pdf.setFontSize(size)
      pdf.setFont(undefined, weight)
    }

    const addLine = (text, x = 10, fontSize = 10, weight = 'normal') => {
      setFont(fontSize, weight)
      pdf.text(text, x, yPosition)
      yPosition += fontSize / 2 + 2
    }

    const addCenteredLine = (text, fontSize = 10, weight = 'normal') => {
      setFont(fontSize, weight)
      pdf.text(text, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += fontSize / 2 + 2
    }

    const addDivider = () => {
      pdf.setDrawColor(0, 0, 0)
      pdf.line(10, yPosition, pageWidth - 10, yPosition)
      yPosition += 4
    }

    // Header
    addCenteredLine('MANDI DEALS', 14, 'bold')
    addCenteredLine('Society Marketplace POS', 10)
    addCenteredLine('Phone: +91-XXXXXXXXXX | www.mandideals.in', 9)
    yPosition += 2
    addDivider()

    // Receipt Info
    addLine(`Receipt #: ${receipt?.transaction_id || 'N/A'}`, 10, 11, 'bold')
    yPosition += 2
    addLine(`Date: ${new Date(receipt?.transaction_date || '').toLocaleDateString()}`)
    addLine(`Time: ${new Date(receipt?.transaction_date || '').toLocaleTimeString()}`)
    addLine(`Staff: ${receipt?.staff_id || 'N/A'} | Counter: ${receipt?.counter_id || 'N/A'}`)
    yPosition += 3

    // Customer Details
    if (receipt?.customer) {
      addLine('CUSTOMER DETAILS', 10, 10, 'bold')
      addLine(`Name: ${receipt.customer.name}`)
      addLine(`Phone: ${receipt.customer.phone}`)
      addLine(`Tier: ${receipt.customer.tier || 'Standard'}`)
      yPosition += 3
    }

    // Items Header
    addDivider()
    setFont(10, 'bold')
    pdf.text('ITEM', 10, yPosition)
    pdf.text('QTY', 120, yPosition)
    pdf.text('RATE', 145, yPosition)
    pdf.text('AMOUNT', 170, yPosition)
    yPosition += 5
    addDivider()

    // Items
    setFont(9)
    receipt?.items?.forEach(item => {
      const itemText = item.name.substring(0, 35)
      const lines = pdf.splitTextToSize(itemText, 110)
      
      lines.forEach((line, index) => {
        if (index === 0) {
          pdf.text(line, 10, yPosition)
          pdf.text(item.quantity.toString(), 120, yPosition)
          pdf.text(`₹${item.price}`, 145, yPosition)
          pdf.text(`₹${(item.quantity * item.price).toFixed(2)}`, 170, yPosition, { align: 'right' })
        } else {
          pdf.text(line, 10, yPosition)
        }
        yPosition += 5
      })
      
      // SKU info
      setFont(8)
      pdf.text(`SKU: ${item.productId}`, 10, yPosition)
      yPosition += 3
      setFont(9)
    })

    yPosition += 2
    addDivider()

    // Totals
    setFont(10)
    pdf.text('Subtotal:', 10, yPosition)
    pdf.text(`₹${receipt?.subtotal?.toFixed(2)}`, pageWidth - 10, yPosition, { align: 'right' })
    yPosition += 5

    setFont(9)
    pdf.text('Tax (5% GST):', 10, yPosition)
    pdf.text(`₹${(receipt?.subtotal * 0.05).toFixed(2)}`, pageWidth - 10, yPosition, { align: 'right' })
    yPosition += 5

    if (receipt?.points_earned > 0) {
      pdf.setTextColor(34, 197, 94) // Green
      pdf.text(`Points Earned: ${receipt.points_earned} pts`, 10, yPosition)
      yPosition += 5
      pdf.setTextColor(0, 0, 0)
    }

    if (receipt?.points_used > 0) {
      pdf.setTextColor(59, 130, 246) // Blue
      pdf.text(`Points Used (${receipt.points_used} pts):`, 10, yPosition)
      pdf.text(`-₹${(receipt.points_used / 10).toFixed(2)}`, pageWidth - 10, yPosition, { align: 'right' })
      yPosition += 5
      pdf.setTextColor(0, 0, 0)
    }

    yPosition += 2
    pdf.setDrawColor(0, 0, 0)
    pdf.setLineWidth(0.5)
    pdf.line(10, yPosition, pageWidth - 10, yPosition)
    yPosition += 5

    // Grand Total
    setFont(12, 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('TOTAL AMOUNT:', 10, yPosition)
    pdf.text(`₹${receipt?.final_amount?.toFixed(2)}`, pageWidth - 10, yPosition, { align: 'right' })
    yPosition += 8

    // Payment Info
    setFont(9)
    pdf.text(`Payment Method: ${receipt?.payment_method?.toUpperCase() || 'CASH'}`, 10, yPosition)
    yPosition += 5

    // Points Balance Update
    if (receipt?.customer && receipt?.new_wallet_balance !== undefined) {
      yPosition += 2
      addDivider()
      addLine('LOYALTY ACCOUNT UPDATE', 10, 10, 'bold')
      
      const prevBalance = Math.max(0, receipt.new_wallet_balance - receipt.points_earned + Math.floor(receipt.points_used / 10))
      addLine(`Previous Balance: ${prevBalance} pts`)
      
      if (receipt.points_earned > 0) {
        setFont(9)
        pdf.setTextColor(34, 197, 94)
        addLine(`+ Points Earned: ${receipt.points_earned} pts`)
        pdf.setTextColor(0, 0, 0)
      }
      
      if (receipt.points_used > 0) {
        setFont(9)
        pdf.setTextColor(239, 68, 68)
        addLine(`- Points Redeemed: ${Math.floor(receipt.points_used / 10)} pts`)
        pdf.setTextColor(0, 0, 0)
      }
      
      yPosition += 2
      pdf.setDrawColor(100, 100, 100)
      pdf.line(10, yPosition, pageWidth - 10, yPosition)
      yPosition += 4
      
      setFont(11, 'bold')
      pdf.setTextColor(59, 130, 246)
      pdf.text('NEW BALANCE:', 10, yPosition)
      pdf.text(`${receipt.new_wallet_balance} pts`, pageWidth - 10, yPosition, { align: 'right' })
      pdf.setTextColor(0, 0, 0)
    }

    // Footer
    yPosition = pageHeight - 25
    pdf.setDrawColor(0, 0, 0)
    pdf.line(10, yPosition, pageWidth - 10, yPosition)
    yPosition += 5
    
    setFont(10, 'bold')
    addCenteredLine('Thank you for your purchase!')
    setFont(8)
    addCenteredLine('Supporting local farmers & communities')
    addCenteredLine('Earn Points • Get Discounts • Enjoy Benefits')
    addCenteredLine(`Generated: ${new Date().toLocaleString()}`)

    // Save PDF
    pdf.save(`receipt-${receipt?.transaction_id || 'unknown'}.pdf`)
  }

  const handleSendReceipt = () => {
    alert(`Receipt will be sent to ${receipt?.customer?.phone || 'customer'}\n\n(SMS/Email integration coming soon)`)
  }

  if (!isOpen || !receipt) return null

  const taxRate = 0.05
  const tax = receipt.subtotal * taxRate

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Receipt Content - Printable */}
        <div ref={receiptRef} className="p-8 font-mono text-xs space-y-3 bg-white">
          {/* Store Header */}
          <div className="text-center border-b-2 border-gray-900 pb-3">
            <p className="text-lg font-bold tracking-wider">MANDI DEALS</p>
            <p className="text-xs text-gray-700">Society Marketplace POS</p>
            <p className="text-xs text-gray-700">Phone: +91-XXXXXXXXXX | Web: www.mandideals.in</p>
            <p className="text-xs font-semibold text-gray-800 mt-1">Receipt #{receipt?.transaction_id}</p>
          </div>

          {/* Transaction Meta Info */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-gray-600 font-semibold">DATE</p>
              <p className="font-mono">{new Date(receipt?.transaction_date || '').toLocaleDateString()}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 font-semibold">TIME</p>
              <p className="font-mono">{new Date(receipt?.transaction_date || '').toLocaleTimeString()}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600 font-semibold">STAFF</p>
              <p className="font-mono">{receipt?.staff_id}</p>
            </div>
          </div>

          {/* Customer Information Section */}
          {receipt?.customer && (
            <div className="bg-gray-100 p-3 rounded border border-gray-400 text-xs space-y-1">
              <p className="font-bold text-gray-900">CUSTOMER DETAILS</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-700">Name:</span>
                  <p className="font-semibold">{receipt.customer.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-700">Phone:</span>
                  <p className="font-semibold">{receipt.customer.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-300">
                <div>
                  <span className="text-gray-700">Tier:</span>
                  <p className="font-semibold">{receipt.customer.tier || 'Standard'}</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-700">Counter:</span>
                  <p className="font-semibold">{receipt?.counter_id}</p>
                </div>
              </div>
            </div>
          )}

          {/* Items Table Header */}
          <div className="border-b-2 border-t-2 border-gray-900 py-2">
            <div className="grid grid-cols-12 gap-1 text-xs font-bold text-gray-900">
              <div className="col-span-5">ITEM</div>
              <div className="col-span-2 text-center">QTY</div>
              <div className="col-span-2 text-right">RATE</div>
              <div className="col-span-3 text-right">AMOUNT</div>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            {receipt?.items?.map((item, idx) => (
              <div key={idx} className="text-xs space-y-0.5">
                <div className="grid grid-cols-12 gap-1">
                  <div className="col-span-5 font-semibold text-gray-900">{item.name}</div>
                  <div className="col-span-2 text-center">{item.quantity}</div>
                  <div className="col-span-2 text-right">₹{item.price}</div>
                  <div className="col-span-3 text-right font-semibold">₹{(item.quantity * item.price).toFixed(2)}</div>
                </div>
                <div className="text-gray-600 ml-6">SKU: {item.productId}</div>
              </div>
            ))}
          </div>

          {/* Items Footer Line */}
          <div className="border-b-2 border-gray-900 py-1"></div>

          {/* Amount Breakdown Section */}
          <div className="space-y-1 pt-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-700">Subtotal</span>
              <span className="font-semibold text-gray-900">₹{receipt?.subtotal?.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Tax (5% GST)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>

            {receipt?.points_earned > 0 && (
              <div className="flex justify-between bg-green-100 p-1.5 rounded text-green-800 font-bold text-xs">
                <span className="flex items-center gap-1"><Gift size={14} strokeWidth={2.5} /> POINTS EARNED</span>
                <span>{receipt.points_earned} pts</span>
              </div>
            )}

            {receipt?.points_used > 0 && (
              <div className="flex justify-between bg-blue-100 p-1.5 rounded text-blue-800 font-bold text-xs">
                <span className="flex items-center gap-1"><CreditCard size={14} strokeWidth={2.5} /> POINTS USED ({receipt.points_used} pts)</span>
                <span>-₹{(receipt.points_used / 10).toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Total Amount - Highlighted */}
          <div className="border-t-2 border-b-2 border-gray-900 py-2 bg-gray-50">
            <div className="flex justify-between text-sm font-bold text-gray-900">
              <span>TOTAL AMOUNT</span>
              <span>₹{receipt?.final_amount?.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-700">Payment Method:</span>
              <span className="font-semibold">{receipt?.payment_method?.toUpperCase() || 'CASH'}</span>
            </div>
          </div>

          {/* Loyalty Points Account Update */}
          {receipt?.customer && receipt?.new_wallet_balance !== undefined && (
            <div className="bg-blue-50 border-2 border-blue-300 p-2.5 rounded space-y-1.5 text-xs">
              <p className="font-bold text-blue-900 flex items-center gap-2"><Wallet size={16} strokeWidth={2.5} />LOYALTY ACCOUNT UPDATE</p>
              
              <div className="space-y-1">
                <div className="flex justify-between text-blue-700">
                  <span>Previous Balance:</span>
                  <span className="font-semibold">{Math.max(0, receipt.new_wallet_balance - receipt.points_earned + Math.floor(receipt.points_used / 10))} pts</span>
                </div>
                
                {receipt.points_earned > 0 && (
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>+ Points Earned:</span>
                    <span>{receipt.points_earned} pts</span>
                  </div>
                )}
                
                {receipt.points_used > 0 && (
                  <div className="flex justify-between text-red-700 font-semibold">
                    <span>- Points Redeemed:</span>
                    <span>{Math.floor(receipt.points_used / 10)} pts</span>
                  </div>
                )}
              </div>

              <div className="border-t border-blue-300 pt-1.5 flex justify-between font-bold text-lg text-blue-900">
                <span>NEW BALANCE:</span>
                <span>{receipt.new_wallet_balance} pts</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center space-y-1 border-t-2 border-gray-900 pt-3">
            <p className="font-bold text-gray-900">Thank You for Your Purchase!</p>
            <p className="text-xs text-gray-700">Supporting local farmers & communities</p>
            <p className="text-xs text-gray-600 mt-2">Earn Points • Get Discounts • Enjoy Benefits</p>
            <p className="text-xs font-semibold text-gray-700">www.mandideals.in</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded font-semibold transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Printer size={16} strokeWidth={2.5} /> Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded font-semibold transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Download size={16} strokeWidth={2.5} /> PDF Download
            </button>
          </div>
          
          <button
            onClick={handleSendReceipt}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-colors text-sm flex items-center justify-center"
          >
            📱 Send Receipt (Coming Soon)
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-400 hover:bg-gray-500 text-white py-2 rounded font-semibold transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ReceiptModal
