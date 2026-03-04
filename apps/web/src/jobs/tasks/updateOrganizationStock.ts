import { extractID } from '@lactalink/utilities/extractors';
import { TaskConfig } from 'payload';

export const updateOrganizationStock: TaskConfig<'update-organization-stock-task'> = {
  slug: 'update-organization-stock-task',
  label: 'Update Organization Stock',
  retries: 2,
  interfaceName: 'UpdateOrganizationStockTask',
  concurrency: {
    key: ({ input: { organization } }) =>
      `sync:${organization.relationTo}:${extractID(organization.value)}`,
    /**
     * Setting exclusive to true ensures that only one instance of this task runs at a time
     * for a given organization.
     */
    exclusive: true,
    /**
     * Enables this as we want to ensure that only the latest stock update task runs for
     * an organization, and any previous pending tasks are canceled to prevent redundant updates.
     */
    supersedes: true,
  },
  inputSchema: [
    {
      name: 'organization',
      type: 'relationship',
      required: true,
      relationTo: ['hospitals', 'milkBanks'],
    },
  ],
  outputSchema: [{ name: 'remainingStock', type: 'number', required: true }],
  handler: async ({ input: { organization }, req }) => {
    const docID = extractID(organization.value);
    const docSlug = organization.relationTo;

    const inventoryItems = await req.payload.find({
      collection: 'inventories',
      where: {
        and: [
          { 'organization.value': { equals: docID } },
          { 'organization.relationTo': { equals: docSlug } },
        ],
      },
      depth: 0,
      limit: 0, // Ensure we get all inventory items
      pagination: false,
      select: { remainingVolume: true },
    });

    const totalRemainingVolume = inventoryItems.docs.reduce((total, item) => {
      return total + (item.remainingVolume || 0);
    }, 0);

    await req.payload.update({
      collection: docSlug,
      id: docID,
      data: { totalVolume: totalRemainingVolume },
      req,
    });

    return { output: { remainingStock: totalRemainingVolume }, state: 'succeeded' };
  },
  onFail: ({ req, job, taskStatus, input }) => {
    req.payload.logger.error(
      {
        jobID: job.id,
        taskStatus,
        input,
      },
      `Job Failed: Unable to update available stock in the organization.`
    );
  },
};
