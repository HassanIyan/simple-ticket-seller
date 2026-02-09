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
    const quantity = Number(formData.get('quantity'))
    const totalPrice = Number(formData.get('totalPrice'))
    const bankSlip = formData.get('bankTransferSlip') as File

    if (!buyerName || !buyerEmail || !quantity || !totalPrice || !bankSlip) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const payload = await getPayload({ config: await config })

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
