export const POST_STATUS = {
  DRAFT: { label: 'Draft', value: 'DRAFT' },
  PUBLISHED: { label: 'Published', value: 'PUBLISHED' },
  REMOVED: { label: 'Removed', value: 'REMOVED' },
} as const;

export const POST_VISIBILITY = {
  PUBLIC: { label: 'Public', value: 'PUBLIC' },
  PRIVATE: { label: 'Private (author only)', value: 'PRIVATE' },
} as const;

export const POST_ATTACHMENT_MEDIA_TYPE = {
  IMAGE: { label: 'Image', value: 'IMAGE' },
} as const;

export const COMMENT_STATUS = {
  PUBLISHED: { label: 'Published', value: 'PUBLISHED' },
  EDITED: { label: 'Edited', value: 'EDITED' },
};
