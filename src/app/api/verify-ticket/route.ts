import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')

  if (!code) {
    return Response.json({ valid: false, error: 'No ticket code provided' }, { status: 400 })
  }

  const payload = await getPayload({ config: await config })

  const result = await payload.find({
    collection: 'tickets',
    where: {
      ticketCode: { equals: code },
    },
    limit: 1,
  })

  const ticket = result.docs[0]

  if (!ticket) {
    return Response.json({ valid: false, error: 'Ticket not found' }, { status: 404 })
  }

  if (ticket.status !== 'verified') {
    return Response.json(
      {
        valid: false,
        status: ticket.status,
        error: `Ticket is ${ticket.status}`,
      },
      { status: 400 },
    )
  }

  return Response.json({
    valid: true,
    ticket: {
      buyerName: ticket.buyerName,
      buyerEmail: ticket.buyerEmail,
      quantity: ticket.quantity,
      totalPrice: ticket.totalPrice,
      ticketCode: ticket.ticketCode,
      status: ticket.status,
    },
  })
}
