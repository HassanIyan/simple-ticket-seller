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
      name: 'ticketPrice',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Price per ticket (in your currency)',
      },
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
  ],
}
