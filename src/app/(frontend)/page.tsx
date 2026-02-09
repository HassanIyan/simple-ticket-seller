import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import type { Media as MediaType } from '@/payload-types'

import config from '@/payload.config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { BuyTicketSection } from '@/components/BuyTicketSection'
import './styles.css'

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  let homePage
  try {
    homePage = await payload.findGlobal({ slug: 'home-page' })
  } catch {
    // Global might not have data yet
  }

  const featuredImage = homePage?.featuredImage as MediaType | undefined
  const categories = (homePage?.ticketCategories ?? []) as { name: string; price: number }[]
  const currency = homePage?.currency ?? 'USD'
  const buttonLabel = homePage?.ticketLabel ?? 'Buy Tickets'

  return (
    <div className="home">
      <div className="content">
        {featuredImage?.url ? (
          <Image
            src={featuredImage.url}
            alt={featuredImage.alt || 'Featured image'}
            width={featuredImage.width ?? 800}
            height={featuredImage.height ?? 450}
            style={{ borderRadius: '8px', objectFit: 'cover', maxHeight: '360px', width: '100%' }}
            priority
          />
        ) : (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <p style={{ color: '#9ca3af' }}>Set up your home page content in the admin panel.</p>
          </div>
        )}

        {homePage?.content ? (
          <div className="rich-text-content">
            <RichText data={homePage.content} />
          </div>
        ) : (
          <h1>Welcome to our event!</h1>
        )}

        {categories.length > 0 && (
          <BuyTicketSection categories={categories} currency={currency} buttonLabel={buttonLabel} />
        )}
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
