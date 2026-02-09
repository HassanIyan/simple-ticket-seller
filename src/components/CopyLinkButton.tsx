'use client'
import React, { useState } from 'react'

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button onClick={handleCopy} style={styles.button}>
      {copied ? '✓ Copied!' : '📋 Copy Ticket Link'}
    </button>
  )
}

const styles = {
  button: {
    display: 'block',
    width: '100%',
    padding: '10px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '16px',
    letterSpacing: '-0.01em',
  } satisfies React.CSSProperties,
}
