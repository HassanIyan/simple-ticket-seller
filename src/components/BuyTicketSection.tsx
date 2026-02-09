'use client'
import React, { useState, useCallback } from 'react'

interface BuyTicketSectionProps {
  ticketPrice: number
  currency: string
  buttonLabel: string
}

export function BuyTicketSection({ ticketPrice, currency, buttonLabel }: BuyTicketSectionProps) {
  const [showPurchase, setShowPurchase] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [bankSlip, setBankSlip] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    error?: string
    ticketCode?: string
  } | null>(null)

  const totalPrice = ticketPrice * quantity

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!bankSlip) return

      setSubmitting(true)
      setResult(null)

      const formData = new FormData()
      formData.append('buyerName', buyerName)
      formData.append('buyerEmail', buyerEmail)
      formData.append('buyerPhone', buyerPhone)
      formData.append('quantity', String(quantity))
      formData.append('totalPrice', String(totalPrice))
      formData.append('bankTransferSlip', bankSlip)

      try {
        const res = await fetch('/api/buy-ticket', { method: 'POST', body: formData })
        const data = await res.json()
        if (res.ok) {
          setResult({ success: true, message: data.message, ticketCode: data.ticketCode })
        } else {
          setResult({ error: data.error || 'Something went wrong' })
        }
      } catch {
        setResult({ error: 'Network error. Please try again.' })
      } finally {
        setSubmitting(false)
      }
    },
    [bankSlip, buyerName, buyerEmail, buyerPhone, quantity, totalPrice],
  )

  // Redirect to ticket page on success
  if (result?.success && result?.ticketCode) {
    if (typeof window !== 'undefined') {
      window.location.href = `/ticket/${result.ticketCode}`
    }
    return (
      <div style={styles.successCard}>
        <div style={styles.successIcon}>⏳</div>
        <h2 style={styles.successTitle}>Redirecting to your ticket...</h2>
      </div>
    )
  }

  if (!showPurchase) {
    return (
      <button style={styles.buyBtn} onClick={() => setShowPurchase(true)}>
        {buttonLabel}
      </button>
    )
  }

  return (
    <div style={styles.purchaseCard}>
      <h2 style={styles.purchaseTitle}>Purchase Tickets</h2>

      <div style={styles.priceDisplay}>
        <span style={styles.priceLabel}>Price per ticket</span>
        <span style={styles.priceValue}>
          {currency} {ticketPrice.toLocaleString()}
        </span>
      </div>

      <div style={styles.quantitySection}>
        <label style={styles.label}>Quantity</label>
        <div style={styles.quantityControls}>
          <button
            style={styles.qtyBtn}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            type="button"
          >
            −
          </button>
          <span style={styles.qtyValue}>{quantity}</span>
          <button style={styles.qtyBtn} onClick={() => setQuantity(quantity + 1)} type="button">
            +
          </button>
        </div>
      </div>

      <div style={styles.totalRow}>
        <span style={styles.totalLabel}>Total</span>
        <span style={styles.totalValue}>
          {currency} {totalPrice.toLocaleString()}
        </span>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Full Name *</label>
          <input
            style={styles.input}
            type="text"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            required
            placeholder="Enter your full name"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Email *</label>
          <input
            style={styles.input}
            type="email"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Phone</label>
          <input
            style={styles.input}
            type="tel"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Bank Transfer Slip *</label>
          <div style={styles.fileUpload}>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setBankSlip(e.target.files?.[0] || null)}
              required
              id="bankSlip"
              style={styles.fileInput}
            />
            <label htmlFor="bankSlip" style={styles.fileLabel}>
              {bankSlip ? bankSlip.name : '📎 Choose file...'}
            </label>
          </div>
          <p style={styles.hint}>Upload a screenshot or photo of your bank transfer receipt</p>
        </div>

        {result?.error && <p style={styles.error}>{result.error}</p>}

        <button
          type="submit"
          style={{ ...styles.submitBtn, opacity: submitting ? 0.6 : 1 }}
          disabled={submitting}
        >
          {submitting ? 'Processing...' : `Pay ${currency} ${totalPrice.toLocaleString()} — Submit`}
        </button>
      </form>

      <button style={styles.cancelBtn} onClick={() => setShowPurchase(false)} type="button">
        Cancel
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  buyBtn: {
    background: '#111827',
    color: '#fff',
    border: 'none',
    padding: '14px 40px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '24px',
    letterSpacing: '-0.01em',
  },
  purchaseCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '32px',
    marginTop: '32px',
    width: '100%',
    maxWidth: '480px',
  },
  purchaseTitle: {
    margin: '0 0 24px 0',
    fontSize: '20px',
    fontWeight: '600',
    textAlign: 'center' as const,
    color: '#111827',
  },
  priceDisplay: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  priceLabel: {
    color: '#6b7280',
    fontSize: '14px',
  },
  priceValue: {
    fontWeight: '600',
    fontSize: '16px',
    color: '#111827',
  },
  quantitySection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    padding: '0 4px',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  qtyBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#111827',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: '18px',
    fontWeight: '600',
    minWidth: '30px',
    textAlign: 'center' as const,
    color: '#111827',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  totalLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  totalValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#15803d',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    color: '#374151',
    fontWeight: '500',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#111827',
    fontSize: '15px',
    outline: 'none',
  },
  fileUpload: {
    position: 'relative' as const,
  },
  fileInput: {
    position: 'absolute' as const,
    opacity: 0,
    width: '100%',
    height: '100%',
    cursor: 'pointer',
  },
  fileLabel: {
    display: 'block',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px dashed #d1d5db',
    background: '#f9fafb',
    color: '#6b7280',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'center' as const,
  },
  hint: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0,
  },
  submitBtn: {
    background: '#111827',
    color: '#fff',
    border: 'none',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  cancelBtn: {
    background: 'transparent',
    color: '#9ca3af',
    border: 'none',
    padding: '12px',
    fontSize: '14px',
    cursor: 'pointer',
    width: '100%',
    marginTop: '4px',
  },
  error: {
    color: '#dc2626',
    fontSize: '14px',
    margin: 0,
    padding: '8px 12px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
  },
  successCard: {
    textAlign: 'center' as const,
    padding: '40px 32px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    marginTop: '32px',
    maxWidth: '480px',
    width: '100%',
  },
  successIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  successTitle: {
    margin: '0',
    fontSize: '18px',
    color: '#111827',
    fontWeight: '600',
  },
}
