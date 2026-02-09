import type { CollectionConfig } from 'payload'

export const Tickets: CollectionConfig = {
  slug: 'tickets',
  admin: {
    useAsTitle: 'buyerName',
    defaultColumns: [
      'buyerName',
      'buyerEmail',
      'category',
      'quantity',
      'totalPrice',
      'status',
      'createdAt',
    ],
  },
  access: {
    read: () => true, // Public can read tickets (by ticketCode link)
    create: () => true, // Public can create (buy tickets)
    update: ({ req: { user } }) => Boolean(user), // Only admins
    delete: ({ req: { user } }) => Boolean(user), // Only admins
  },
  fields: [
    {
      name: 'buyerName',
      type: 'text',
      required: true,
    },
    {
      name: 'buyerEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'buyerPhone',
      type: 'text',
    },
    {
      name: 'category',
      type: 'text',
      required: true,
      admin: {
        description: 'Ticket category (e.g. First Row, Second Row)',
      },
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      min: 1,
      defaultValue: 1,
    },
    {
      name: 'totalPrice',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Verified', value: 'verified' },
        { label: 'Rejected', value: 'rejected' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'bankTransferSlip',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Upload bank transfer receipt/slip',
      },
    },
    {
      name: 'ticketCode',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated unique ticket code',
      },
    },
  ],
  timestamps: true,
}
