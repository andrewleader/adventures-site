import type { Collection } from 'tinacms';

const Area: Collection = {
  label: 'Areas',
  name: 'area',
  path: 'content/areas',
  format: 'mdx',
  ui: {
    router: ({ document }) => {
      return `/areas/${document._sys.breadcrumbs.join('/')}`;
    },
  },
  fields: [
    {
      type: 'string',
      label: 'Title',
      name: 'title',
      isTitle: true,
      required: true,
    },
    {
      type: 'image',
      name: 'featuredImage',
      label: 'Featured Image',
      // @ts-ignore
      uploadDir: () => 'areas',
    },
    {
      type: 'string',
      label: 'Summit Coordinates',
      name: 'summitCoords',
      description: 'Format: 47.2892, -121.321',
    },
    {
      type: 'string',
      label: 'Mountain Forecast URL',
      name: 'mountainForecastUrl',
      description: 'Link to weather forecast for this area',
    },
    {
      type: 'rich-text',
      label: 'Body',
      name: '_body',
      isBody: true,
    },
  ],
};

export default Area;