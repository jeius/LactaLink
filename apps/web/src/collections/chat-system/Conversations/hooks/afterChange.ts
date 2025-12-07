import { CONVERSATION_ROLE, CONVERSATION_TYPE, MESSAGE_TYPE } from '@lactalink/enums';
import { Conversation } from '@lactalink/types/payload-generated-types';
import { extractID, extractName } from '@lactalink/utilities/extractors';
import status from 'http-status';
import { APIError, CollectionAfterChangeHook } from 'payload';

const GROUP = CONVERSATION_TYPE.GROUP.value;
const SYSTEM = MESSAGE_TYPE.SYSTEM.value;
const ADMIN = CONVERSATION_ROLE.ADMIN.value;

export const createFirstGroupMessage: CollectionAfterChangeHook<Conversation> = async ({
  req,
  doc,
  operation,
}) => {
  if (operation !== 'create' || doc.type !== GROUP) return;

  const senderDoc = await req.payload.findByID({
    collection: 'users',
    id: extractID(doc.createdBy),
    depth: 2,
    select: { profile: true },
  });

  if (!senderDoc.profile) {
    throw new APIError(
      'Group chat creator has no profile, Setup a profile first.',
      status.NOT_FOUND,
      { user: senderDoc },
      false
    );
  }

  const name = extractName(senderDoc);

  const firstMessageContent = `Group created${name ? ` by ${name}` : ''}. Start the conversation!`;

  const message = await req.payload.create({
    collection: 'messages',
    req,
    depth: 3,
    data: {
      conversation: doc.id,
      type: SYSTEM,
      content: firstMessageContent,
      sender: {
        relationTo: senderDoc.profile.relationTo,
        value: extractID(senderDoc.profile.value),
      },
    },
  });

  const messages = {
    docs: doc.messages?.docs ? [message, ...doc.messages.docs] : [message],
    totalDocs: (doc.messages?.totalDocs ?? 0) + 1,
    hasNextPage: doc.messages?.hasNextPage ?? false,
  };

  doc['messages'] = messages;

  req.payload.logger.info(
    `[System Message] Created system message for group conversation ${doc.id}`
  );

  return doc;
};

export const addFirstParticipant: CollectionAfterChangeHook<Conversation> = async ({
  req,
  doc,
  operation,
}) => {
  if (operation !== 'create') return;

  const participant = await req.payload.create({
    collection: 'conversation-participants',
    req,
    depth: 3,
    data: {
      conversation: doc.id,
      participant: extractID(doc.createdBy),
      role: ADMIN,
      addedBy: extractID(doc.createdBy),
    },
  });

  req.payload.logger.info(
    `[Conversation Participant] Added first participant to conversation ${doc.id}`
  );

  const participants = {
    docs: doc.participants?.docs ? [...doc.participants.docs, participant] : [participant],
    totalDocs: (doc.participants?.totalDocs ?? 0) + 1,
    hasNextPage: doc.participants?.hasNextPage ?? false,
  };

  doc['participants'] = participants;

  return doc;
};
