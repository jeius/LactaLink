import {
  ConversationParticipant,
  Message,
  MessageAttachment,
} from '@lactalink/types/payload-generated-types';

class SendMessageError extends Error {
  constructor(
    message: string,
    public data: { attachments?: MessageAttachment[]; message?: Message }
  ) {
    super(message);
    this.name = 'SendMessageError';
  }
}

class CreateConvoParticipantError extends Error {
  constructor(
    message: string,
    public data: ConversationParticipant[]
  ) {
    super(message);
    this.name = 'CreateConvoParticipantError';
  }
}

export { CreateConvoParticipantError, SendMessageError };
