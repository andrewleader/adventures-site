import type { Collection } from 'tinacms';

const TripPlan: Collection = {
  label: 'Trip Plans',
  name: 'tripPlan',
  path: 'content/trip-plans',
  format: 'mdx',
  ui: {
    router: ({ document }) => {
      return `/trip-plans/${document._sys.breadcrumbs.join('/')}`;
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
      uploadDir: () => 'trip-plans',
    },
    {
      type: 'datetime',
      label: 'Start Date',
      name: 'startDate',
      ui: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
      },
    },
    {
      type: 'datetime',
      label: 'End Date',
      name: 'endDate',
      ui: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
      },
    },
    {
      type: 'object',
      label: 'Destinations',
      name: 'destinations',
      list: true,
      fields: [
        {
          type: 'reference',
          label: 'Route',
          name: 'route',
          collections: ['route'],
          ui: {
            optionComponent: (
              props: {
                title?: string;
              },
              _internalSys: { path: string }
            ) => props.title || _internalSys.path,
          },
        },
      ],
      ui: {
        itemProps: (item) => {
          return { label: item?.route };
        },
      },
    },
    {
      type: 'rich-text',
      label: 'Body',
      name: '_body',
      isBody: true,
    },
  ],
};

export default TripPlan;