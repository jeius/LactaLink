import { Endpoint } from 'payload';

const typingEndpoint: Endpoint = {
  path: '/typing',
  method: 'post',
  handler: async (req, res) => {
    const { conversationId, isTyping } = req.body;

    // Emit to Supabase Realtime
    console.log(
      `[Realtime] User ${req.user.id} is ${isTyping ? 'typing' : 'stopped typing'} in ${conversationId}`
    );

    res.status(200).json({ success: true });
  },
};

export default typingEndpoint;
