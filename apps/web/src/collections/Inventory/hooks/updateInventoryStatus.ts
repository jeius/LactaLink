import { Inventory, Request } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { CollectionBeforeChangeHook } from 'payload';

export const updateInventoryStatus: CollectionBeforeChangeHook<Inventory> = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  // When creating a new inventory item, no need to update
  if (operation === 'create') {
    return data;
  }

  // If new allocations have been added
  if (
    originalDoc &&
    (data.allocationDetails?.length || 0) > (originalDoc.allocationDetails?.length || 0)
  ) {
    // Find newly added allocations
    const newAllocations = data.allocationDetails?.filter((_, index) => {
      return !originalDoc.allocationDetails || index >= originalDoc.allocationDetails.length;
    });

    // Generate a shared allocationId for allocations added in this update
    // This allows tracking when multiple inventory items fulfill the same request
    if ((newAllocations?.length || 0) > 0) {
      const sharedAllocationId = crypto.randomUUID();

      // Apply the shared ID to new allocations
      data.allocationDetails = data.allocationDetails?.map((allocation, index) => {
        if (!originalDoc.allocationDetails || index >= originalDoc.allocationDetails.length) {
          return {
            ...allocation,
            allocationId: allocation.allocationId || sharedAllocationId,
          };
        }
        return allocation;
      });
    }

    // Keep track of all allocated bag IDs
    const allAllocatedBagIds = new Set<string>();

    // Get all allocated bags from all allocations
    data.allocationDetails?.forEach((allocation) => {
      if (allocation.allocatedBags) {
        allocation.allocatedBags.forEach((bag) => {
          allAllocatedBagIds.add(extractID(bag));
        });
      }
    });

    // Fetch all milk bags to calculate volumes and check availability
    const { docs: milkBags } = await req.payload.find({
      collection: 'milkBags',
      pagination: false,
      depth: 0,
      limit: 1000,
      where: {
        id: {
          in: Array.from([...extractID(data.milkBags || []), ...allAllocatedBagIds]),
        },
      },
    });

    // Create maps for quick lookups
    const bagVolumes = new Map<string, number>();
    const bagStatuses = new Map<string, string>();
    milkBags.forEach((bag) => {
      bagVolumes.set(bag.id, bag.volume || 0);
      bagStatuses.set(bag.id, bag.status || 'AVAILABLE');
    });

    // Calculate available bags by checking their status
    const availableBagIds = (data.milkBags || [])
      .map((bag) => extractID(bag))
      .filter((bagId) => bagStatuses.get(bagId) === 'AVAILABLE');

    // Calculate total allocated volume from all allocations
    let totalAllocatedVolume = 0;
    data.allocationDetails?.forEach((allocation) => {
      if (allocation.allocatedBags) {
        allocation.allocatedBags.forEach((bag) => {
          const bagId = extractID(bag);
          totalAllocatedVolume += bagVolumes.get(bagId) || 0;
        });
      }
    });

    // Calculate remaining volume
    data.remainingVolume = Math.max(0, (data.initialVolume || 0) - totalAllocatedVolume);

    // Update status based on available bags
    if (availableBagIds.length === 0) {
      data.status = 'CONSUMED';
    } else {
      // If there are still available bags, keep it as AVAILABLE
      data.status = 'AVAILABLE';
    }

    // For each newly allocated request, update its fulfilled volume
    for (const allocation of newAllocations || []) {
      if (!allocation.allocatedBags || allocation.allocatedBags.length === 0) {
        continue;
      }

      const requestId = extractID(allocation.request);

      try {
        const request = await req.payload.findByID({
          collection: 'requests',
          id: requestId,
          depth: 0,
          select: {
            volumeNeeded: true,
            volumeFulfilled: true,
            status: true,
            details: { bags: true },
          },
        });

        // Calculate volume from allocated bags
        const allocatedVolume = allocation.allocatedBags.reduce((sum, bagId) => {
          return sum + (bagVolumes.get(extractID(bagId)) || 0);
        }, 0);

        // Update the request's fulfilled volume and allocated bags
        const newVolumeFulfilled = (request.volumeFulfilled || 0) + allocatedVolume;
        const volumeNeeded = request.volumeNeeded || 0;

        // Get existing milk bags in the request
        const existingBags = extractID(request.details?.bags || []);

        // Add newly allocated bags
        const newBags = extractID(allocation.allocatedBags);
        const allBags = [...existingBags, ...newBags];

        // Prepare update data
        const updateData: Partial<Request> = {
          volumeFulfilled: newVolumeFulfilled,
          details: {
            ...request.details,
            bags: allBags,
          },
        };

        // Update request status based on fulfillment level
        if (newVolumeFulfilled >= volumeNeeded) {
          // Only mark as completed if fully fulfilled
          updateData.status = 'COMPLETED';
          updateData.completedAt = new Date().toISOString();
          req.payload.logger.info(`Request ${requestId} fully fulfilled and marked as COMPLETED`);
        } else {
          // Keep partially fulfilled requests as AVAILABLE
          updateData.status = 'AVAILABLE';
          req.payload.logger.info(
            `Request ${requestId} partially fulfilled (${newVolumeFulfilled}/${volumeNeeded}ml) and kept as AVAILABLE`
          );
        }

        // Update the request
        await req.payload.update({
          collection: 'requests',
          id: requestId,
          data: updateData,
        });

        // Update status of allocated milk bags to ALLOCATED
        for (const bagId of newBags) {
          await req.payload.update({
            collection: 'milkBags',
            id: bagId,
            data: { status: 'ALLOCATED' },
          });
        }
      } catch (error) {
        req.payload.logger.error(
          `Failed to update request ${requestId}: ${extractErrorMessage(error)}`
        );
      }
    }

    req.payload.logger.info({
      message: `Updated inventory ${originalDoc.id} status to ${data.status} - ${availableBagIds.length} bags remaining`,
      remainingBags: availableBagIds.length,
      remainingVolume: data.remainingVolume,
    });
  }

  return data;
};
