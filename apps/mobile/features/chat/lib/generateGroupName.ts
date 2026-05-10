import { PopulatedUserProfile } from '@lactalink/types';
import { extractName } from '@lactalink/utilities/extractors';

export function generateGroupName(members: PopulatedUserProfile[]) {
  const memberNames = members.map((member) => extractName({ profile: member }));

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
