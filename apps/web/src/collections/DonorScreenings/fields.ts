import { extractID } from '@lactalink/utilities/extractors';
import { TextField } from 'payload';

export const formVersionField: TextField = {
  name: 'formVersion',
  label: 'Form Version Reference',
  type: 'text',
  required: true,
  hasMany: false,
  validate: () => true,
  hooks: {
    beforeChange: [
      async ({ req }) => {
        // Get latest form version from global config
        const { docs } = await req.payload.findGlobalVersions({
          slug: 'donor-screening-form',
          limit: 1,
          pagination: false,
          sort: '-updatedAt',
        });
        return extractID(docs[0]) ?? '';
      },
    ],
  },
  admin: {
    description: 'Reference to the specific version of the questionnaire that was answered',
    position: 'sidebar',
    readOnly: true,
  },
};
