import { SCREENING_FORM_SLUG, SCREENING_FORM_TITLE } from '@/lib/constants';
import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { PayloadRequest } from 'payload';
import { sections } from './data';

export default createPayloadHandler({
  requireAdmin: true,
  handler: seedScreeningFormHandler,
  successMessage: 'Screening form seeded successfully',
});

async function seedScreeningFormHandler(req: PayloadRequest) {
  const { payload } = req;

  // Delete existing screening form with the same title to prevent duplicates
  await payload
    .delete({
      collection: SCREENING_FORM_SLUG,
      where: {
        or: [
          { title: { equals: SCREENING_FORM_TITLE } },
          { slug: { equals: 'standard-screening-form' } },
        ],
      },
      req,
    })
    .then(() => {
      payload.logger.info(
        `[ScreeningFormSeeder] Deleted existing screening form with title "${SCREENING_FORM_TITLE}".`
      );
    });

  // Create the new screening form with the predefined structure
  return await payload.create({
    collection: SCREENING_FORM_SLUG,
    draft: false,
    data: {
      _status: 'published',
      title: SCREENING_FORM_TITLE,
      sections: sections,
      submitButtonLabel: 'Submit',
      slug: 'standard-screening-form',
      isDefault: true,
    },
    req,
  });
}
