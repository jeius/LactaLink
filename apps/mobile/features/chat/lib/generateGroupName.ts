import { ConversationParticipant } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractName } from '@lactalink/utilities/extractors';

export function generateGroupName(members: (string | ConversationParticipant)[]) {
  const memberNames = members.map((member) => {
    const doc = extractCollection(member);
    if (!doc) {
      throw new Error('Unable to generate group name: ConversationParticipant is not populated.');
    }

    const user = extractCollection(doc.participant);
    if (!user) {
      throw new Error(
        'Unable to generate group name: ConversationParticipant.participant is not populated.'
      );
    }

    const name = extractName(user);

    if (!name) {
      throw new Error(
        'Unable to generate group name: Missing user profile or might not be populated.'
      );
    }

    return name;
  });

  if (memberNames.length === 0) {
    return 'Unnamed Group';
  } else if (memberNames.length <= 3) {
    return memberNames.join(', ');
  } else {
    const firstThree = memberNames.slice(0, 3).join(', ');
    const remainingCount = memberNames.length - 3;
    return `${firstThree}, + ${remainingCount}`;
  }
}
