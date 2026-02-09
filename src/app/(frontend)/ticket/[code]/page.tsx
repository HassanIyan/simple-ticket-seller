import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import React from 'react'
import { CopyLinkButton } from '@/components/CopyLinkButton'

export default async function TicketPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const payload = await getPayload({ config: await config })

  const result = await payload.find({
    collection: 'tickets',
    where: {
      ticketCode: { equals: code },
    },
    limit: 1,
  })

  const ticket = result.docs[0]
  if (!ticket) return notFound()

  const isVerified = ticket.status === 'verified'
  const isPending = ticket.status === 'pending'
  const isRejected = ticket.status === 'rejected'

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const ticketUrl = `${baseUrl}/ticket/${ticket.ticketCode}`

  let qrDataUrl: string | null = null
  if (isVerified) {
    const verifyUrl = `${baseUrl}/api/verify-ticket?code=${ticket.ticketCode}`
    qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
  }

  const badgeStyle: React.CSSProperties = {
    ...styles.badge,
    background: isVerified ? '#22c55e' : isPending ? '#f59e0b' : '#ef4444',
  }

  const statusText = isVerified ? 'VERIFIED' : isPending ? 'PENDING' : 'REJECTED'

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>🎫 Event Ticket</h1>
          <span style={badgeStyle}>{statusText}</span>
        </div>

        {isPending && (
          <div style={styles.pendingBanner}>
            <p style={styles.pendingText}>
              ⏳ Your payment is being reviewed. This page will update once your payment is
              verified. Please bookmark this page.
            </p>
          </div>
        )}

        {isRejected && (
          <div style={styles.rejectedBanner}>
            <p style={styles.rejectedText}>
              ❌ Your payment could not be verified. Please contact support.
            </p>
          </div>
        )}

        <div style={styles.divider} />

        <div style={styles.info}>
          <div style={styles.row}>
            <span style={styles.label}>Name</span>
            <span style={styles.value}>{ticket.buyerName}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Email</span>
            <span style={styles.value}>{ticket.buyerEmail}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Quantity</span>
            <span style={styles.value}>{ticket.quantity}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Total Paid</span>
            <span style={styles.value}>{ticket.totalPrice}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Ticket Code</span>
            <span style={{ ...styles.value, fontFamily: 'monospace' }}>{ticket.ticketCode}</span>
          </div>
        </div>

        <div style={styles.divider} />

        {isVerified && qrDataUrl ? (
          <>
            <div style={styles.qrSection}>
              <p style={styles.qrLabel}>Scan to verify authenticity</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="Ticket QR Code" style={styles.qr} />
            </div>
            <p style={styles.footer}>Present this QR code at the venue for entry.</p>
            <CopyLinkButton url={ticketUrl} />
          </>
        ) : (
          <>
            <p style={styles.footer}>
              {isPending
                ? 'QR code will appear here once your payment is verified.'
                : 'This ticket is not valid for entry.'}
            </p>
            {isPending && <CopyLinkButton url={ticketUrl} />}
          </>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f9fafb',
    padding: '24px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '36px',
    maxWidth: '440px',
    width: '100%',
    color: '#111827',
    border: '1px solid #e5e7eb',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
    color: '#111827',
    letterSpacing: '-0.01em',
  },
  badge: {
    color: '#fff',
    padding: '3px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  divider: {
    height: '1px',
    background: '#f3f4f6',
    margin: '20px 0',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#9ca3af',
    fontSize: '13px',
  },
  value: {
    fontWeight: '500',
    fontSize: '13px',
    color: '#111827',
  },
  qrSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  qrLabel: {
    color: '#9ca3af',
    fontSize: '12px',
    margin: 0,
  },
  qr: {
    width: '180px',
    height: '180px',
  },
  footer: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '12px',
    marginTop: '16px',
    marginBottom: 0,
  },
  pendingBanner: {
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    padding: '12px 16px',
    marginTop: '8px',
  },
  pendingText: {
    color: '#92400e',
    fontSize: '13px',
    margin: 0,
    lineHeight: '1.5',
  },
  rejectedBanner: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px 16px',
    marginTop: '8px',
  },
  rejectedText: {
    color: '#991b1b',
    fontSize: '13px',
    margin: 0,
    lineHeight: '1.5',
  },
}
