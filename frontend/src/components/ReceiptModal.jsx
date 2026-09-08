import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, RotateCcw, Printer, AlertCircle, Loader2 } from 'lucide-react'
import {
  ReceiptPrinterRoot,
  ReceiptPrinterMachine,
  ReceiptPrinterHeader,
  ReceiptPrinterScreen,
  ReceiptPrinterStatus,
  ReceiptPrinterOutput,
  ReceiptPrinterPaper,
} from './ReceiptPrinter'
import { formatSlotDate } from '../utils/dateFormatter'

// High-Precision Vector SVG Barcode with dynamic sizing
const BarcodeSVG = ({ value = "75549462A9", compact = false }) => {
  const bars = [
    2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2, 2, 1, 3, 1
  ]
  return (
    <div className="flex flex-col items-center justify-center my-0.5 select-none">
      <svg className={`${compact ? 'w-34 h-4.5' : 'w-38 h-5'}`} viewBox="0 0 160 32" fill="currentColor">
        {bars.map((width, i) => {
          if (i % 2 === 1) return null
          const x = bars.slice(0, i).reduce((acc, b) => acc + b * 2, 4)
          return (
            <rect key={i} x={x} y="0" width={width * 2} height="32" fill="#111827" />
          )
        })}
      </svg>
      <span className="text-[8.5px] font-mono tracking-[0.22em] text-gray-700 font-bold mt-0.5 uppercase">
        {value}
      </span>
    </div>
  )
}

const ReceiptModal = ({ isOpen, onClose, data, type = 'order' }) => {
  const [stage, setStage] = useState('processing')
  const printRef = useRef(null)

  // Lock background body scroll while modal is open to prevent page scroll leak
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  // Reset and run animated printing sequence whenever modal opens or data changes
  const startPrintSequence = () => {
    setStage('processing')
    const timer1 = setTimeout(() => {
      setStage('printing')
    }, 850)

    const timer2 = setTimeout(() => {
      setStage('complete')
    }, 2800)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }

  useEffect(() => {
    if (isOpen) {
      const cleanup = startPrintSequence()
      return cleanup
    }
  }, [isOpen, data])

  if (!isOpen || !data) return null

  // Format Date and Time
  const formatDate = (rawDate) => {
    if (!rawDate) return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const d = new Date(rawDate)
    if (isNaN(d.getTime())) return String(rawDate)
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // --- Calculations ---
  const isOrder = type === 'order'
  const isCancelled = !isOrder && Boolean(data.cancelled)
  const orderId = data._id ? data._id.slice(-6).toUpperCase() : '1024'
  const barcodeValue = data._id ? data._id.slice(-10).toUpperCase() : '75549462A9'
  const amount = Number(data.amount) || 0
  const currency = '₹'

  let subtotal = 0
  let tax = 0
  let shipping = 0

  if (isOrder) {
    const isCod = data.paymentMethod?.toLowerCase().includes('cod') || data.paymentMethod?.toLowerCase().includes('cash')
    shipping = isCod ? 50 : 0
    subtotal = Math.round((amount - shipping) / 1.05)
    tax = amount - subtotal - shipping
    if (tax < 0) tax = 0
  } else {
    // Appointment calculation
    if (data.paidWithCoins) {
      subtotal = data.amount || 500
      tax = 0
    } else {
      const docFee = Math.round(amount * 0.82)
      tax = amount - docFee
      subtotal = docFee
    }
  }

  const customerName = isOrder
    ? (data.address?.firstName ? `${data.address.firstName} ${data.address.lastName || ''}`.trim() : (data.userData?.name || 'Customer'))
    : (data.userData?.name || 'Patient')

  const paymentMethodLabel = data.paidWithCoins
    ? 'THERAPIQUE TOKENS'
    : (data.paymentMethod ? data.paymentMethod.toUpperCase() : (data.payment ? 'ONLINE PAYMENT (RAZORPAY)' : 'NOT PAID / NO PAYMENT'))

  // --- Dynamic Cancellation & Refund Scenario Classification ---
  let scenario = 'NONE' // 'BANK_REFUNDED' | 'TOKENS' | 'PENDING' | 'UNPAID'
  let cancellationStatusText = 'CANCELLED'
  let refundStatusText = 'NOT APPLICABLE'
  let refundMethodLabel = 'NOT APPLICABLE'
  let refundAmountDisplay = '₹0'
  let originalAmountDisplay = `${currency}${amount.toLocaleString('en-IN')}`
  let refundBadgeColor = 'text-gray-500'

  if (isCancelled) {
    if (data.paidWithCoins) {
      // Scenario C: Paid with tokens/coins
      scenario = 'TOKENS'
      cancellationStatusText = 'CANCELLED'
      refundStatusText = 'REFUNDED'
      refundMethodLabel = 'TOKENS'
      const tokensRefunded = data.refundedCoins || data.amount || 500
      refundAmountDisplay = `${tokensRefunded} Tokens`
      originalAmountDisplay = `${tokensRefunded} Tokens`
      refundBadgeColor = 'text-amber-700'
    } else if (data.payment) {
      // Paid with real money (Razorpay)
      if (data.refundStatus === 'refunded_bank') {
        // Scenario A: Full refund completed to bank
        scenario = 'BANK_REFUNDED'
        cancellationStatusText = 'CANCELLED & REFUNDED'
        refundStatusText = 'REFUNDED'
        refundMethodLabel = 'ORIGINAL BANK / UPI (RAZORPAY)'
        refundAmountDisplay = `${currency}${amount.toLocaleString('en-IN')}`
        originalAmountDisplay = `${currency}${amount.toLocaleString('en-IN')}`
        refundBadgeColor = 'text-emerald-700'
      } else if (data.refundStatus === 'refunded_tokens') {
        // Scenario C: Money payment refunded as tokens by choice
        scenario = 'TOKENS'
        cancellationStatusText = 'CANCELLED'
        refundStatusText = 'REFUNDED'
        refundMethodLabel = 'TOKENS'
        const tokensRefunded = data.refundedCoins || data.amount || 500
        refundAmountDisplay = `${tokensRefunded} Tokens`
        originalAmountDisplay = `${currency}${amount.toLocaleString('en-IN')}`
        refundBadgeColor = 'text-amber-700'
      } else if (data.refundStatus === 'pending_choice') {
        // Scenario B: Patient has not yet chosen or refund is pending
        scenario = 'PENDING'
        cancellationStatusText = 'APPOINTMENT CANCELLED'
        refundStatusText = 'PROCESSING / PENDING'
        refundMethodLabel = 'PENDING USER CHOICE'
        refundAmountDisplay = `${currency}${amount.toLocaleString('en-IN')}`
        originalAmountDisplay = `${currency}${amount.toLocaleString('en-IN')}`
        refundBadgeColor = 'text-amber-600'
      } else {
        // Scenario B fallback: Paid, refund processing
        scenario = 'PENDING'
        cancellationStatusText = 'APPOINTMENT CANCELLED'
        refundStatusText = 'PROCESSING / PENDING'
        refundMethodLabel = 'ONLINE PAYMENT (RAZORPAY)'
        refundAmountDisplay = `${currency}${amount.toLocaleString('en-IN')}`
        originalAmountDisplay = `${currency}${amount.toLocaleString('en-IN')}`
        refundBadgeColor = 'text-amber-600'
      }
    } else {
      // Scenario D: No payment / unpaid appointment
      scenario = 'UNPAID'
      cancellationStatusText = 'APPOINTMENT CANCELLED'
      refundStatusText = 'NOT APPLICABLE'
      refundMethodLabel = 'NOT APPLICABLE'
      originalAmountDisplay = 'NOT PAID / NO PAYMENT'
      refundAmountDisplay = 'NOT APPLICABLE'
      refundBadgeColor = 'text-gray-500'
    }
  }

  // High-Definition Responsive PDF Generator with intelligent proportional aspect-ratio scaling
  const handlePrint = () => {
    const fileName = isOrder
      ? `Therapique_Receipt_ORD-${orderId}`
      : (isCancelled ? `Therapique_Cancellation_Receipt_APT-${orderId}` : `Therapique_Receipt_APT-${orderId}`)
    const previousTitle = document.title
    document.title = fileName

    const printFrame = document.createElement('iframe')
    printFrame.style.position = 'fixed'
    printFrame.style.left = '-9999px'
    printFrame.style.top = '-9999px'
    printFrame.style.width = '794px'
    printFrame.style.height = '1123px'
    printFrame.style.visibility = 'hidden'
    printFrame.style.border = 'none'
    document.body.appendChild(printFrame)

    const doc = printFrame.contentWindow.document
    doc.open()

    const itemsHtml = isOrder ? (
      (data.items || []).map((item) => {
        const name = item.name || item.book?.name || item.title || 'Book'
        const qty = item.quantity || 1
        const price = item.price || item.offerPrice || item.book?.offerPrice || 0
        return `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
            <div>
              <div style="font-weight: 700; font-size: 14px; color: #0f172a; line-height: 1.3;">${name}</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Qty: ${qty} &times; ${currency}${price.toLocaleString('en-IN')}</div>
            </div>
            <div style="font-weight: 700; font-size: 14px; color: #0f172a;">${currency}${(qty * price).toLocaleString('en-IN')}</div>
          </div>
        `
      }).join('')
    ) : (
      isCancelled ? `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
          <div>
            <div style="font-weight: 700; font-size: 14px; color: #0f172a; line-height: 1.3;">
              Therapy Consultation <span style="color: #b91c1c; font-size: 12px; font-weight: 700;">(Cancelled)</span>
            </div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              1-on-1 Video Session with Dr. ${data.docData?.name || 'Therapist'} (Slot Released)
            </div>
          </div>
          <div style="font-weight: 700; font-size: 14px; color: #94a3b8; text-decoration: line-through;">
            ${data.paidWithCoins ? `${data.amount || 500} Tokens` : `${currency}${subtotal.toLocaleString('en-IN')}`}
          </div>
        </div>
      ` : `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
          <div>
            <div style="font-weight: 700; font-size: 14px; color: #0f172a; line-height: 1.3;">Therapy Consultation</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">1-on-1 Video Consultation with Dr. ${data.docData?.name || 'Therapist'}</div>
          </div>
          <div style="font-weight: 700; font-size: 14px; color: #0f172a;">
            ${data.paidWithCoins ? `${data.amount || 500} Tokens` : `${currency}${subtotal.toLocaleString('en-IN')}`}
          </div>
        </div>
      `
    )

    const metaHtml = isOrder ? `
      <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 13px;">
        <span style="color: #64748b;">Receipt No.</span>
        <span style="font-weight: 700; color: #0f172a;">ORD-${orderId}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 13px;">
        <span style="color: #64748b;">Date</span>
        <span style="color: #0f172a; font-weight: 600;">${formatDate(data.date || data.createdAt)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 13px;">
        <span style="color: #64748b;">Customer</span>
        <span style="font-weight: 700; color: #0f172a;">${customerName}</span>
      </div>
    ` : `
      <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 12.5px;">
        <span style="color: #64748b;">Receipt No.</span>
        <span style="font-weight: 700; color: #0f172a;">APT-${orderId}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 12.5px;">
        <span style="color: #64748b;">Booking Date</span>
        <span style="color: #0f172a; font-weight: 600;">${formatDate(data.date || data.createdAt)}</span>
      </div>
      ${isCancelled ? `
        <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 12.5px;">
          <span style="color: #64748b;">Cancellation Date</span>
          <span style="color: #b91c1c; font-weight: 700;">${formatDate(data.updatedAt || Date.now())}</span>
        </div>
      ` : ''}
      <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 12.5px;">
        <span style="color: #64748b;">Patient</span>
        <span style="font-weight: 700; color: #0f172a;">${customerName}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 12.5px;">
        <span style="color: #64748b;">Doctor</span>
        <span style="font-weight: 700; color: #0f172a;">Dr. ${data.docData?.name}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 12.5px;">
        <span style="color: #64748b;">Speciality</span>
        <span style="color: #0f172a; font-weight: 600;">${data.docData?.speciality}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 12.5px;">
        <span style="color: #64748b;">Slot Time</span>
        <span style="font-weight: 700; color: #0f172a;">${formatSlotDate(data.slotDate)} &bull; ${data.slotTime}</span>
      </div>
      ${isCancelled ? `
        <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 12.5px;">
          <span style="color: #64748b;">Appointment Status</span>
          <span style="font-weight: 800; color: #b91c1c;">${cancellationStatusText}</span>
        </div>
      ` : ''}
    `

    // Generate precision vector barcode SVG for print
    const barcodeBars = [
      2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2, 2, 1, 3, 1
    ]
    const barcodeRects = barcodeBars.map((w, idx, arr) => {
      if (idx % 2 === 1) return ''
      const xPos = arr.slice(0, idx).reduce((sum, b) => sum + b * 2, 4)
      return `<rect x="${xPos}" y="0" width="${w * 2}" height="30" fill="#111827" />`
    }).join('')

    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fileName}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 10mm !important;
            }
            @media print {
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: #ffffff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .print-container {
                width: 100% !important;
                min-height: 100% !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
              }
              .page-wrapper {
                box-shadow: none !important;
                border: 1.5px solid #cbd5e1 !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                page-break-after: avoid !important;
                break-after: avoid !important;
              }
              * {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background: #ffffff;
              color: #0f172a;
              width: 100%;
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 0;
            }
            .print-container {
              width: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .page-wrapper {
              width: 660px;
              max-width: 95%;
              background: #ffffff;
              border-radius: 20px;
              border: 1.5px solid #e2e8f0;
              padding: ${isCancelled ? '24px 34px 18px' : '28px 38px 22px'};
              position: relative;
              overflow: hidden;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              transform-origin: center top;
            }
            .top-right-badge {
              position: absolute;
              top: 14px;
              right: 22px;
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
              letter-spacing: 0.02em;
            }
            .brand-logo-img {
              width: 32px;
              height: 27px;
              object-fit: contain;
              margin: 0 auto 2px;
              display: block;
            }
            .title {
              font-size: 23px;
              font-weight: 900;
              letter-spacing: -0.02em;
              color: #0f172a;
              text-align: center;
            }
            .subtitle {
              font-size: 11.5px;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              color: ${isCancelled ? '#b91c1c' : '#16a34a'};
              text-align: center;
              margin-top: 2px;
            }
            .badge-sub {
              font-size: 12px;
              color: #64748b;
              text-align: center;
              margin-top: 4px;
            }
            .dashed-sep {
              border-top: 1.2px dashed #cbd5e1;
              margin: 11px 0;
            }
            .table-header {
              display: flex;
              justify-content: space-between;
              font-size: 11.5px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.04em;
              color: #0f172a;
              padding-bottom: 6px;
              border-bottom: 1.5px solid #0f172a;
              margin-top: 8px;
            }
            .breakdown-row {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
              font-size: 12.5px;
              color: #475569;
            }
            .breakdown-total {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 9px 0 3px;
              font-size: 17px;
              font-weight: 900;
              color: #0f172a;
              margin-top: 4px;
              border-top: 1.2px solid #cbd5e1;
            }
            .payment-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 10px 16px;
              margin-top: 9px;
            }
            .status-badge {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              color: #15803d;
              font-weight: 800;
              font-size: 12.5px;
              letter-spacing: 0.02em;
            }
            .thankyou-card {
              display: flex;
              align-items: center;
              gap: 12px;
              background: #ffffff;
              border: 1px solid #edf2ed;
              border-radius: 12px;
              padding: 8px 16px;
              margin-top: 8px;
              box-shadow: 0 1px 2px rgba(0,0,0,0.02);
            }
            .heart-circle {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: #eaf4eb;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #15803d;
              flex-shrink: 0;
            }
            .waves-container {
              margin-top: 10px;
              margin-left: -34px;
              margin-right: -34px;
              margin-bottom: -18px;
              overflow: hidden;
              border-bottom-left-radius: 20px;
              border-bottom-right-radius: 20px;
              line-height: 0;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="page-wrapper">
              <!-- Top Right Corner Badge -->
              <div class="top-right-badge">
                Therapique ${isCancelled ? 'Cancellation Record' : 'Receipt'} - ${isOrder ? `ORD-${orderId}` : `APT-${orderId}`}
              </div>

              <!-- Brand Logo vite.svg -->
              <div style="text-align: center;">
                <img src="/vite.svg" alt="Therapique" class="brand-logo-img" />
                <h1 class="title">THERAPIQUE</h1>
                <p class="subtitle">${isOrder ? 'MENTAL HEALTH &amp; BOOKSTORE' : 'CLINICAL THERAPY &amp; CARE'}</p>
                <p class="badge-sub" style="${isCancelled ? 'color: #b91c1c; font-weight: 700; text-transform: uppercase;' : ''}">
                  ${isCancelled ? 'Cancellation &amp; Refund Receipt' : 'Tax Invoice / Original Receipt'}
                </p>
              </div>

              <div class="dashed-sep"></div>

              <!-- Metadata Info -->
              ${metaHtml}

              <!-- Items Table Header -->
              <div class="table-header">
                <span>DESCRIPTION</span>
                <span>${isCancelled ? 'ORIGINAL FEE' : 'AMOUNT'}</span>
              </div>

              <!-- Items List -->
              <div style="margin-bottom: 4px;">
                ${itemsHtml}
              </div>

              <!-- Financial Breakdown -->
              <div style="padding-top: 4px;">
                ${isCancelled ? `
                  <div class="breakdown-row">
                    <span>Original Amount Paid</span>
                    <span style="font-weight: 600; color: #0f172a;">${originalAmountDisplay}</span>
                  </div>
                  ${!data.paidWithCoins && data.payment ? `
                    <div class="breakdown-row" style="font-size: 11.5px; color: #64748b;">
                      <span>Base Consultation Fee</span>
                      <span>${currency}${subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="breakdown-row" style="font-size: 11.5px; color: #64748b;">
                      <span>GST / Taxes</span>
                      <span>${currency}${tax.toLocaleString('en-IN')}</span>
                    </div>
                  ` : ''}
                  <div class="breakdown-row" style="padding-top: 3px; border-top: 1px solid #f1f5f9;">
                    <span>Refund Amount</span>
                    <span style="font-weight: 700; color: ${scenario === 'UNPAID' ? '#64748b' : '#b91c1c'};">${refundAmountDisplay}</span>
                  </div>
                  <div class="breakdown-total">
                    <span>${scenario === 'TOKENS' ? 'REFUNDED TOKENS' : (scenario === 'UNPAID' ? 'TOTAL CHARGED' : 'REFUND AMOUNT')}</span>
                    <span style="font-size: 18px; font-weight: 900; color: ${scenario === 'UNPAID' ? '#64748b' : '#b91c1c'};">
                      ${scenario === 'UNPAID' ? '₹0' : refundAmountDisplay}
                    </span>
                  </div>
                ` : `
                  <div class="breakdown-row">
                    <span>Subtotal</span>
                    <span>${data.paidWithCoins ? `${data.amount || 500} Tokens` : `${currency}${subtotal.toLocaleString('en-IN')}`}</span>
                  </div>
                  ${!data.paidWithCoins ? `
                    <div class="breakdown-row">
                      <span>GST / Taxes</span>
                      <span>${currency}${tax.toLocaleString('en-IN')}</span>
                    </div>
                    ${isOrder ? `
                      <div class="breakdown-row">
                        <span>Delivery / Shipping</span>
                        <span style="color: #15803d; font-weight: 700;">${shipping === 0 ? 'FREE' : `${currency}${shipping}`}</span>
                      </div>
                    ` : ''}
                  ` : ''}

                  <div class="breakdown-total">
                    <span>TOTAL PAID</span>
                    <span style="font-size: 18px; font-weight: 900; color: #0f172a;">
                      ${data.paidWithCoins ? `${data.amount || 500} Tokens` : `${currency}${amount.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                `}
              </div>

              <!-- Payment Mode Block -->
              <div class="payment-card">
                <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 4px;">
                  <span style="color: #64748b;">Payment Method</span>
                  <span style="font-weight: 700; color: #0f172a;">${paymentMethodLabel}</span>
                </div>
                ${isCancelled ? `
                  <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 4px;">
                    <span style="color: #64748b;">Refund Method</span>
                    <span style="font-weight: 700; color: #0f172a;">${refundMethodLabel}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 4px;">
                    <span style="color: #64748b;">Cancellation Status</span>
                    <span style="font-weight: 800; color: #b91c1c;">${cancellationStatusText}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 12.5px;">
                    <span style="color: #64748b;">Refund Status</span>
                    <span class="status-badge" style="color: ${scenario === 'BANK_REFUNDED' ? '#15803d' : (scenario === 'UNPAID' ? '#64748b' : (scenario === 'TOKENS' ? '#b45309' : '#d97706'))};">
                      <span>${refundStatusText}</span>
                    </span>
                  </div>
                ` : `
                  <div style="display: flex; justify-content: space-between; font-size: 12.5px;">
                    <span style="color: #64748b;">Status</span>
                    <span class="status-badge">
                      <span>PAID &amp; CONFIRMED</span>
                      <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style="display: inline-block; vertical-align: middle;">
                        <circle cx="10" cy="10" r="10" fill="#15803d"/>
                        <path d="M6 10.2L8.8 13L14 7" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  </div>
                `}
              </div>

              <!-- Thank You / Status Card -->
              <div class="thankyou-card">
                <div class="heart-circle" style="${isCancelled ? 'background: #fef2f2; color: #b91c1c;' : ''}">
                  ${isCancelled ? `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  ` : `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                  `}
                </div>
                <div>
                  <div style="font-weight: 700; font-size: 13.5px; color: #0f172a;">
                    ${isCancelled ? 'Appointment Cancelled' : 'Thank you for choosing Therapique!'}
                  </div>
                  <div style="font-size: 12px; color: #64748b; margin-top: 1px;">
                    ${isCancelled ? 'Official cancellation and refund record.' : 'We appreciate your support.'}
                  </div>
                </div>
              </div>

              <!-- Authentic Sharp Vector SVG Barcode on PDF -->
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 9px; padding-top: 8px; border-top: 1.2px dashed #cbd5e1;">
                <svg width="160" height="23" viewBox="0 0 160 30" fill="currentColor" style="display: block;">
                  ${barcodeRects}
                </svg>
                <span style="font-size: 9.5px; font-family: monospace; letter-spacing: 0.22em; color: #374151; font-weight: 700; margin-top: 2px; text-transform: uppercase;">
                  ${barcodeValue}
                </span>
                <p style="font-size: 10.5px; color: #64748b; margin-top: 2px; font-weight: 500;">
                  ${isCancelled ? 'Cancellation &amp; Refund Record' : 'Thank you for choosing Therapique!'}
                </p>
              </div>

              <!-- Organic Multi-layered Decorative Bottom Wave -->
              <div class="waves-container">
                <svg viewBox="0 0 660 30" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style="width: 100%; height: 22px; display: block;">
                  <path d="M0 10C130 2 260 18 390 8C490 0 580 14 660 6V30H0V10Z" fill="${isCancelled ? '#fee2e2' : '#dbe6dc'}" opacity="0.6"/>
                  <path d="M0 16C150 7 290 22 420 12C520 5 590 16 660 12V30H0V16Z" fill="${isCancelled ? '#fecaca' : '#b9cebe'}" opacity="0.8"/>
                  <path d="M0 20C120 13 240 24 370 17C480 11 570 20 660 17V30H0V20Z" fill="${isCancelled ? '#fca5a5' : '#a4bfa8'}" opacity="0.9"/>
                </svg>
              </div>
            </div>
          </div>
        </body>
      </html>
    `)
    doc.close()

    // Dynamic Responsive Auto-Scaling: Calculate scale based on receipt dimensions to fill the PDF page without clipping
    setTimeout(() => {
      try {
        const wrapper = doc.querySelector('.page-wrapper')
        if (wrapper) {
          // A4 printable height at 96 DPI with 8mm margin is ~1040px, width is ~718px
          const targetWidth = 690
          const targetHeight = 1010
          const naturalWidth = wrapper.offsetWidth || 660
          const naturalHeight = wrapper.offsetHeight || 800

          let scale = 1.0
          if (naturalHeight < 820) {
            // Short receipt: Scale up proportionally to fill empty white space
            const scaleW = targetWidth / naturalWidth
            const scaleH = (targetHeight * 0.90) / naturalHeight
            scale = Math.min(scaleW, scaleH, 1.14)
          } else if (naturalHeight > targetHeight) {
            // Tall receipt: Scale down proportionally so it fits on 1 single page without page break
            scale = Math.max(0.85, (targetHeight - 10) / naturalHeight)
          } else {
            // Proportional expansion to use printable area efficiently
            const scaleW = targetWidth / naturalWidth
            const scaleH = targetHeight / naturalHeight
            scale = Math.min(scaleW, scaleH, 1.05)
          }

          if (scale !== 1.0) {
            wrapper.style.transform = `scale(${scale.toFixed(4)})`
            wrapper.style.transformOrigin = 'center top'
            const heightDiff = Math.round(naturalHeight * (1 - scale))
            if (heightDiff > 0) {
              wrapper.style.marginBottom = `-${heightDiff}px`
            }
          }
        }
      } catch (err) {
        console.warn('PDF scaling calculation:', err)
      }

      printFrame.contentWindow.focus()
      printFrame.contentWindow.print()
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame)
        }
        document.title = previousTitle
      }, 1000)
    }, 250)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto w-screen h-screen flex justify-center items-start sm:items-center p-2 sm:p-3">
        {/* Full-coverage Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-lg transition-all"
        />

        {/* Modal Container with responsive viewport scaling to ensure full receipt visibility */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-[95vw] sm:max-w-[450px] my-auto flex flex-col items-center select-none py-2 origin-center transform-gpu will-change-transform"
        >
          {/* Top Actions Control Bar - Responsive & Clean on Mobile */}
          <div className="w-full flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 mb-1.5 bg-[#1C1C22]/95 border border-gray-800 rounded-2xl backdrop-blur-md shadow-2xl text-white gap-1.5 sm:gap-2 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 mr-2">
              <span className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full ${isCancelled ? 'bg-rose-400' : 'bg-emerald-400'} animate-pulse shrink-0`} />
              <span className="text-[9.5px] sm:text-[11px] font-black tracking-wider text-gray-100 uppercase whitespace-nowrap truncate">
                {isCancelled ? 'Cancellation & Refund Receipt' : (isOrder ? 'Order Receipt' : 'Appointment Receipt')}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={startPrintSequence}
                title="Replay Print Animation"
                className="px-2 sm:px-2.5 py-1 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px] sm:text-[12px] font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
                <span className="hidden sm:inline">Replay</span>
              </button>

              <button
                onClick={handlePrint}
                title="Print or Save PDF"
                className="px-2.5 sm:px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold transition cursor-pointer flex items-center gap-1.5 text-[11px] sm:text-[12px] shadow-md whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span>Save PDF</span>
              </button>

              <button
                onClick={onClose}
                title="Close"
                className="p-1 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 rounded-xl transition cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Receipt Printer Machine & Paper */}
          <ReceiptPrinterRoot stage={stage} feedMotion="stepped">
            <ReceiptPrinterMachine className="!p-2.5 !pb-4">
              {/* Header inside machine screen */}
              <ReceiptPrinterHeader className="!h-6 !mb-1">
                <div className="flex items-center gap-1.5">
                  <img src="/vite.svg" alt="Logo" className="w-3.5 h-3.5 min-w-[14px] max-w-[14px] max-h-[14px] object-contain shrink-0" />
                  <span className="font-bold text-[11px] tracking-wider text-gray-200">THERAPIQUE</span>
                </div>
                <span className="text-[9.5px] font-mono text-gray-400 bg-black/40 px-1.5 py-0.5 rounded border border-gray-800">
                  {isOrder ? `ORD#${orderId}` : `APT#${orderId}`}
                </span>
              </ReceiptPrinterHeader>

              {/* LCD Screen Display */}
              <ReceiptPrinterScreen className="!p-2">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11.5px] font-bold text-white truncate">
                      {isOrder
                        ? `${data.items?.length || 1} Book Item${data.items?.length > 1 ? 's' : ''}`
                        : `Dr. ${data.docData?.name || 'Therapist'}`}
                    </p>
                    <p className="text-[9.5px] text-gray-400 mt-0.5 truncate">
                      {isOrder
                        ? (data.items?.[0]?.name || data.items?.[0]?.title || 'Store Purchase')
                        : (data.docData?.speciality || 'Therapy Session')}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2.5">
                    <span className="text-[8.5px] uppercase font-semibold text-gray-400 block">
                      {isCancelled ? (scenario === 'UNPAID' ? 'Fee' : 'Refund') : 'Total'}
                    </span>
                    <span className={`text-[13px] font-extrabold ${isCancelled ? (scenario === 'UNPAID' ? 'text-gray-400' : 'text-rose-400') : 'text-emerald-400'}`}>
                      {isCancelled
                        ? (scenario === 'TOKENS' ? `${data.amount || 500} Tokens` : (scenario === 'UNPAID' ? '₹0' : `${currency}${amount.toLocaleString('en-IN')}`))
                        : (data.paidWithCoins ? `${data.amount || 500} Tokens` : `${currency}${amount.toLocaleString('en-IN')}`)}
                    </span>
                  </div>
                </div>

                <div className="mt-1 pt-1 border-t border-gray-800/80">
                  {isCancelled ? (
                    <div className="flex items-center gap-1.5">
                      {stage === 'complete' ? (
                        <span className="relative grid size-3.5 shrink-0 place-items-center text-rose-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="relative grid size-3.5 shrink-0 place-items-center text-rose-400">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        </span>
                      )}
                      <div className="truncate font-medium text-[11px] text-gray-300 leading-none">
                        {stage === 'processing'
                          ? 'Processing cancellation'
                          : stage === 'printing'
                          ? 'Printing cancellation receipt'
                          : 'APPOINTMENT CANCELLED'}
                      </div>
                    </div>
                  ) : (
                    <ReceiptPrinterStatus />
                  )}
                </div>
              </ReceiptPrinterScreen>
            </ReceiptPrinterMachine>

            {/* Paper Output with Stepped Motor Feed Animation */}
            <ReceiptPrinterOutput ref={printRef} className="!pb-5">
              <ReceiptPrinterPaper className={`printable-receipt ${isCancelled ? '!px-4 !pt-2.5 !pb-6' : '!px-4.5 !pt-3 !pb-6.5'}`}>
                {/* Brand Header with vite.svg logo */}
                <div className="text-center pb-1 border-b border-dashed border-gray-300">
                  <img src="/vite.svg" alt="Therapique Logo" className="w-[26px] h-[22px] max-w-[26px] max-h-[22px] object-contain mx-auto mb-0.5 block" />
                  <h3 className="text-[13.5px] font-black tracking-tight text-gray-900 font-sans">
                    THERAPIQUE
                  </h3>
                  <p className="text-[8.5px] tracking-wider text-gray-600 uppercase font-medium mt-0.5">
                    {isOrder ? 'Mental Health & Bookstore' : 'Clinical Therapy & Care'}
                  </p>
                  <p className={`text-[7.5px] ${isCancelled ? 'font-bold text-rose-600 uppercase tracking-wide' : 'text-gray-500'}`}>
                    {isCancelled ? 'Cancellation & Refund Receipt' : 'Tax Invoice / Original Receipt'}
                  </p>
                </div>

                {/* Metadata details */}
                <div className="py-1 space-y-0.5 text-[9px] border-b border-dashed border-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Receipt No:</span>
                    <span className="font-bold text-gray-900">{isOrder ? `ORD-${orderId}` : `APT-${orderId}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Booking Date:</span>
                    <span className="text-gray-800 font-medium">{formatDate(data.date || data.createdAt)}</span>
                  </div>
                  {isCancelled && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cancellation Date:</span>
                      <span className="text-rose-700 font-semibold">{formatDate(data.updatedAt || Date.now())}</span>
                    </div>
                  )}
                  {isOrder && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Customer:</span>
                      <span className="text-gray-900 font-medium truncate max-w-[200px]">
                        {customerName}
                      </span>
                    </div>
                  )}
                  {!isOrder && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Patient:</span>
                        <span className="font-medium text-gray-900">{customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Doctor:</span>
                        <span className="font-bold text-gray-900">Dr. {data.docData?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Speciality:</span>
                        <span className="text-gray-800">{data.docData?.speciality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Slot Time:</span>
                        <span className="text-gray-900 font-bold">{formatSlotDate(data.slotDate)} • {data.slotTime}</span>
                      </div>
                      {isCancelled && (
                        <div className="flex justify-between pt-0.5">
                          <span className="text-gray-500">Appointment Status:</span>
                          <span className="font-bold text-rose-700 uppercase">{cancellationStatusText}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Line Items Table */}
                <div className="py-1 border-b border-dashed border-gray-300">
                  <div className="flex justify-between text-[8.5px] font-bold uppercase text-gray-500 mb-0.5 pb-0.5 border-b border-gray-200">
                    <span>Description</span>
                    <span>{isCancelled ? 'Original Fee' : 'Amount'}</span>
                  </div>

                  {isOrder ? (
                    <div className="space-y-0.5 text-[9px]">
                      {data.items?.map((item, idx) => {
                        const name = item.name || item.book?.name || item.title || 'Book'
                        const qty = item.quantity || 1
                        const price = item.price || item.offerPrice || item.book?.offerPrice || 0
                        return (
                          <div key={idx} className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 truncate leading-tight">{name}</p>
                              <p className="text-[8.5px] text-gray-500">Qty: {qty} × {currency}${price}</p>
                            </div>
                            <span className="font-bold text-gray-900 shrink-0">{currency}{qty * price}</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="space-y-0.5 text-[9px]">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-bold text-gray-900 leading-tight">
                            Therapy Consultation {isCancelled && <span className="text-rose-600 font-bold">(Cancelled)</span>}
                          </p>
                          <p className="text-[8.5px] text-gray-500">
                            {isCancelled ? '1-on-1 Session (Slot Released)' : '1-on-1 Video Session'}
                          </p>
                        </div>
                        <span className={`font-bold ${isCancelled ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {data.paidWithCoins ? `${data.amount || 500} Tokens` : `${currency}${subtotal.toLocaleString('en-IN')}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Financials & Tax Breakdown */}
                <div className="py-0.5 space-y-0.5 text-[9px] border-b border-dashed border-gray-300">
                  {isCancelled ? (
                    <>
                      <div className="flex justify-between text-gray-600">
                        <span>Original Amount Paid:</span>
                        <span className="font-medium text-gray-900">{originalAmountDisplay}</span>
                      </div>

                      {!data.paidWithCoins && data.payment && (
                        <>
                          <div className="flex justify-between text-gray-500 text-[8.5px]">
                            <span>Base Consultation Fee:</span>
                            <span>{currency}${subtotal.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-gray-500 text-[8.5px]">
                            <span>GST / Taxes:</span>
                            <span>{currency}${tax.toLocaleString('en-IN')}</span>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between text-gray-700 font-medium pt-0.5">
                        <span>Refund Amount:</span>
                        <span className={`font-bold ${scenario === 'UNPAID' ? 'text-gray-500' : 'text-rose-600'}`}>{refundAmountDisplay}</span>
                      </div>

                      {/* Highlight row */}
                      <div className="flex justify-between items-center pt-1 text-[10.5px] font-black text-gray-900 border-t border-gray-400">
                        <span>{scenario === 'TOKENS' ? 'REFUNDED TOKENS:' : (scenario === 'UNPAID' ? 'TOTAL CHARGED:' : 'REFUND AMOUNT:')}</span>
                        <span className={`text-[11.5px] font-black ${scenario === 'UNPAID' ? 'text-gray-500' : 'text-rose-600'}`}>
                          {scenario === 'TOKENS' ? refundAmountDisplay : (scenario === 'UNPAID' ? '₹0' : refundAmountDisplay)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span>{data.paidWithCoins ? `${data.amount || 500} Tokens` : `${currency}${subtotal.toLocaleString('en-IN')}`}</span>
                      </div>

                      {!data.paidWithCoins && (
                        <>
                          <div className="flex justify-between text-gray-600">
                            <span>GST / Taxes:</span>
                            <span>{currency}${tax.toLocaleString('en-IN')}</span>
                          </div>
                          {isOrder && (
                            <div className="flex justify-between text-gray-600">
                              <span>Delivery / Shipping:</span>
                              <span className={shipping === 0 ? "text-emerald-700 font-bold" : ""}>
                                {shipping === 0 ? 'FREE' : `${currency}${shipping}`}
                              </span>
                            </div>
                          )}
                        </>
                      )}

                      {/* TOTAL PAID HIGHLIGHT */}
                      <div className="flex justify-between items-center pt-1 text-[10.5px] font-black text-gray-900 border-t border-gray-400">
                        <span>TOTAL PAID:</span>
                        <span className="text-[11.5px] text-gray-950 font-black">
                          {data.paidWithCoins ? `${data.amount || 500} Tokens` : `${currency}${amount.toLocaleString('en-IN')}`}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Payment info footer */}
                <div className="pt-0.5 text-[8.5px] text-gray-600 space-y-0.5">
                  {isCancelled ? (
                    <>
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span className="font-bold uppercase text-gray-900">
                          {paymentMethodLabel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Refund Method:</span>
                        <span className="font-bold uppercase text-gray-900">
                          {refundMethodLabel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cancellation Status:</span>
                        <span className="font-bold text-rose-700 uppercase">
                          {cancellationStatusText}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Refund Status:</span>
                        <span className={`font-bold ${refundBadgeColor} uppercase`}>
                          {refundStatusText}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>Payment Mode:</span>
                        <span className="font-bold uppercase text-gray-900">
                          {paymentMethodLabel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-bold text-emerald-700">PAID & CONFIRMED</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Sharp Authentic SVG Barcode */}
                <div className="mt-1 pt-1 pb-1 text-center border-t border-dashed border-gray-300 flex flex-col items-center">
                  <BarcodeSVG value={barcodeValue} compact={true} />
                  <p className="text-[8px] text-gray-500 mt-0.5 font-medium tracking-tight">
                    {isCancelled ? 'Cancellation & Refund Record' : 'Thank you for choosing Therapique!'}
                  </p>
                </div>
              </ReceiptPrinterPaper>
            </ReceiptPrinterOutput>
          </ReceiptPrinterRoot>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ReceiptModal
