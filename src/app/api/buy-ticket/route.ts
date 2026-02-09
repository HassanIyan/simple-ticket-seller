import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const buyerName = formData.get('buyerName') as string
    const buyerEmail = formData.get('buyerEmail') as string
    const buyerPhone = (formData.get('buyerPhone') as string) || ''
    const category = formData.get('category') as string
    const quantity = Number(formData.get('quantity'))
    const totalPrice = Number(formData.get('totalPrice'))
    const bankSlip = formData.get('bankTransferSlip') as File

    if (!buyerName || !buyerEmail || !category || !quantity || !totalPrice || !bankSlip) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const payload = await getPayload({ config: await config })

    // Check ticket limit
    const homePage = await payload.findGlobal({ slug: 'home-page' })
    const ticketCategories = (homePage.ticketCategories ?? []) as {
      name: string
      price: number
      limit: number
    }[]
    const categoryConfig = ticketCategories.find((c) => c.name === category)
    if (!categoryConfig) {
      return Response.json({ error: 'Invalid ticket category' }, { status: 400 })
    }

    const { docs: existingTickets } = await payload.find({
      collection: 'tickets',
      where: {
        category: { equals: category },
        status: { in: ['pending', 'verified'] },
      },
      limit: 0,
    })
    const sold = existingTickets.reduce((sum, t) => sum + (t.quantity ?? 0), 0)
    const remaining = categoryConfig.limit - sold

    if (quantity > remaining) {
      return Response.json(
        {
          error:
            remaining <= 0
              ? 'This ticket category is sold out'
              : `Only ${remaining} ticket(s) remaining for this category`,
        },
        { status: 400 },
      )
    }

    // Upload the bank slip to the media collection
    const uploadedMedia = await payload.create({
      collection: 'media',
      data: {
        alt: `Bank transfer slip from ${buyerName}`,
      },
      file: {
        data: Buffer.from(await bankSlip.arrayBuffer()),
        mimetype: bankSlip.type,
        name: bankSlip.name,
        size: bankSlip.size,
      },
    })

    // Create the ticket with a unique code
    const ticketCode = uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase()

    const ticket = await payload.create({
      collection: 'tickets',
      data: {
        buyerName,
        buyerEmail,
        buyerPhone,
        category,
        quantity,
        totalPrice,
        status: 'pending',
        bankTransferSlip: uploadedMedia.id,
        ticketCode,
      },
    })

    return Response.json({
      success: true,
      message:
        'Your ticket purchase is being processed. You will receive an email once your payment is verified.',
      ticketCode: ticket.ticketCode,
    })
  } catch (error) {
    console.error('Buy ticket error:', error)
    return Response.json({ error: 'Failed to process ticket purchase' }, { status: 500 })
  }
}
