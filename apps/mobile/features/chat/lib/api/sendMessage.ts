import { uploadImage } from '@/lib/api/file';
import { getChatService } from '@/lib/services/chat';
import { getApiClient } from '@lactalink/api';
import { SendMessageError } from '@lactalink/api/services';
import { MessageMedia } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { ChatMessage } from '../types';

export async function sendMessage(message: ChatMessage) {
  const chatService = getChatService();
  const apiClient = getApiClient();

  const mediaDocs: MessageMedia[] = [];
  try {
    if (message.media && message.media.length > 0) {
      const uploadPromises = message.media.map(async (media) => {
        const uploadedFile = await uploadImage('message-media', media);
        mediaDocs.push(uploadedFile);
        return uploadedFile;
      });

      await Promise.all(uploadPromises).catch(async (err) => {
        await apiClient.delete({
          collection: 'message-media',
          where: { id: { in: extractID(mediaDocs) } },
        });
        throw new Error(`Failed to upload message media: ${extractErrorMessage(err)}`);
      });
    }

    return chatService.sendMessage({
      conversation: message.conversation,
      sender: message.sender,
      content: message.text,
      attachments:
        mediaDocs.length > 0
          ? mediaDocs.map((media) => ({ relationTo: 'message-media', value: media.id }))
          : undefined,
    });
  } catch (error) {
    // Clean up any uploaded attachments or created message on failure
    if (error instanceof SendMessageError) {
      const attachmentsToDelete = error.data.attachments?.filter(
        (att) => att.attachment.relationTo === 'message-media'
      );

      if (attachmentsToDelete && attachmentsToDelete.length > 0) {
        await apiClient.delete({
          collection: 'message-attachments',
          where: { id: { in: extractID(attachmentsToDelete) } },
        });
      }

      if (error.data.message) {
        await apiClient.deleteByID({ collection: 'messages', id: error.data.message.id });
      }
    }

    throw error;
  }
}
