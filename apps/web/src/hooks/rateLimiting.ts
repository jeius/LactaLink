import { CollectionBeforeChangeHook } from 'payload';

export const rateLimitMessages: CollectionBeforeChangeHook = async ({ req, operation, data }) => {
  if (!req.user) return data;

  if (operation === 'create') {
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();

    const recentMessages = await req.payload.find({
      collection: 'messages',
      where: {
        and: [{ sender: { equals: req.user.id } }, { createdAt: { greater_than: oneMinuteAgo } }],
      },
    });

    if (recentMessages.totalDocs >= 10) {
      throw new Error('Rate limit exceeded. Please wait before sending more messages.');
    }
  }

  return data;
};

// Add to Messages collection hooks:
// beforeChange: [rateLimitMessages, ...existing hooks]
