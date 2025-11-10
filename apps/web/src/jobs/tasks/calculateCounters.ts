import { TaskConfig } from 'payload';

export const calculatePostCommentCount: TaskConfig<'calculate-post-comment-count-task'> = {
  slug: 'calculate-post-comment-count-task',
  label: 'Calculate Post Comment Counts',
  retries: 2,
  interfaceName: 'CalculatePostCommentCountTask',
  inputSchema: [{ name: 'postID', type: 'text', required: true, label: 'Post ID' }],
  outputSchema: [
    { name: 'count', type: 'number', required: true, label: 'Comments Count' },
    { name: 'post', type: 'relationship', relationTo: 'posts', required: true, label: 'Post' },
  ],
  handler: async ({ input: { postID }, req }) => {
    const comments = await req.payload.count({
      collection: 'comments',
      req: req,
      where: {
        and: [{ post: { equals: postID } }, { deletedAt: { exists: false } }],
      },
    });

    const count = comments.totalDocs;

    const updatedPost = await req.payload.update({
      collection: 'posts',
      id: postID,
      data: { commentsCount: count },
      req: req,
    });

    return { output: { count, post: updatedPost }, state: 'succeeded' };
  },
  onFail: ({ req, job, taskStatus, input }) => {
    req.payload.logger.error(
      {
        jobID: job.id,
        taskStatus,
        input,
      },
      `Job Failed: Unable to calculate comment count for a post.`
    );
  },
};

export const calculateCommentReplyCount: TaskConfig<'calculate-comment-reply-count-task'> = {
  slug: 'calculate-comment-reply-count-task',
  label: 'Calculate Comment Reply Counts',
  retries: 2,
  interfaceName: 'CalculateCommentReplyCountTask',
  inputSchema: [
    { name: 'commentID', type: 'text', required: true, label: 'Comment ID' },
    { name: 'postID', type: 'text', required: true, label: 'Post ID' },
  ],
  outputSchema: [
    { name: 'count', type: 'number', required: true, label: 'Replies Count' },
    {
      name: 'comment',
      type: 'relationship',
      relationTo: 'comments',
      required: true,
      label: 'Comment',
    },
  ],
  handler: async ({ input: { commentID: parentID, postID }, req }) => {
    const comments = await req.payload.count({
      collection: 'comments',
      req: req,
      where: {
        and: [
          { post: { equals: postID } },
          { parent: { equals: parentID } },
          { deletedAt: { exists: false } },
        ],
      },
    });

    const count = comments.totalDocs;

    const updatedComment = await req.payload.update({
      collection: 'comments',
      id: parentID,
      data: { repliesCount: count },
      req: req,
    });

    return { output: { count, comment: updatedComment }, state: 'succeeded' };
  },
  onFail: ({ req, job, taskStatus, input }) => {
    req.payload.logger.error(
      {
        jobID: job.id,
        taskStatus,
        input,
      },
      `Job Failed: Unable to calculate reply count for a comment.`
    );
  },
};
