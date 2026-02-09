import type { GlobalConfig } from 'payload'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home Page',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'ticketCategories',
      type: 'array',
      required: true,
      minRows: 1,
      labels: {
        singular: 'Ticket Category',
        plural: 'Ticket Categories',
      },
      admin: {
        description: 'Add different ticket categories with their prices',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'e.g. First Row, Second Row, General',
          },
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'limit',
          type: 'number',
          required: true,
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Maximum number of tickets available for this category',
          },
        },
      ],
    },
    {
      name: 'ticketLabel',
      type: 'text',
      defaultValue: 'Buy Tickets',
      admin: {
        description: 'Label for the buy ticket button',
      },
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'USD',
      admin: {
        description: 'Currency code (e.g. USD, EUR, PKR)',
      },
    },
    {
      name: 'bankAccountName',
      type: 'text',
      admin: {
        description: 'Bank account holder name displayed to buyers',
      },
    },
    {
      name: 'bankAccountNumber',
      type: 'text',
      admin: {
        description: 'Bank account number displayed to buyers for transfer',
      },
    },
  ],
}
