import { CollectionConfig } from 'payload/types';

const MessageAttachments: CollectionConfig = {
  slug: 'message-attachments',
  upload: {
    staticURL: '/media',
    staticDir: 'media',
    mimeTypes: ['image/*', 'video/*', 'application/pdf', 'audio/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'preview',
        width: 800,
        height: 600,
        position: 'centre',
      },
    ],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      // Users can only access attachments from conversations they're part of
      return {
        'message.conversation.participants.user': {
          equals: user.id,
        },
      };
    },
    create: ({ req: { user } }) => !!user,
    update: () => false,
    delete: ({ req: { user } }) => {
      if (!user) return false;
      return {
        uploadedBy: {
          equals: user.id,
        },
      };
    },
  },
  fields: [
    {
      name: 'message',
      type: 'relationship',
      relationTo: 'messages',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'fileType',
      type: 'select',
      required: true,
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' },
        { label: 'Audio', value: 'audio' },
        { label: 'Document', value: 'document' },
      ],
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, operation, data }) => {
        if (operation === 'create') {
          data.uploadedBy = req.user.id;

          // Determine file type
          if (data.mimeType) {
            if (data.mimeType.startsWith('image/')) {
              data.fileType = 'image';
            } else if (data.mimeType.startsWith('video/')) {
              data.fileType = 'video';
            } else if (data.mimeType.startsWith('audio/')) {
              data.fileType = 'audio';
            } else {
              data.fileType = 'document';
            }
          }
        }

        return data;
      },
    ],
  },
  timestamps: true,
};

export default MessageAttachments;
