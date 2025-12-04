import { and, eq, getTableColumns, inArray, sql } from '@payloadcms/db-postgres/drizzle';
import { QueryBuilder } from '@payloadcms/db-postgres/drizzle/pg-core';
import { conversation_participants, conversations } from '../schema/payload-schema';

export function findDirectConversation(participants: [string, string]) {
  const [p1ID, p2ID] = participants;
  const fields = getTableColumns(conversations);

  return (qb: QueryBuilder) => {
    // Create subquery for conversations with exactly 2 specific participants
    const conversationIdsSubquery = qb
      .selectDistinct({ id: conversation_participants.conversation })
      .from(conversation_participants)
      .where(inArray(conversation_participants.participant, [p1ID, p2ID]))
      .groupBy(conversation_participants.conversation)
      .having(sql`COUNT(DISTINCT ${conversation_participants.participant}) = 2`);

    return qb
      .select(fields)
      .from(conversations)
      .where(
        and(eq(conversations.type, 'DIRECT'), inArray(conversations.id, conversationIdsSubquery))
      )
      .limit(1);
  };
}
