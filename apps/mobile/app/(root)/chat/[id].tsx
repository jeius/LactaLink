// import { useMarkAsRead, useMessages, useSendMessage } from '@/lib/hooks/useConversations';
// import type { Message } from '@lactalink/types/payload-generated-types';
// import { formatLocaleTime } from '@lactalink/utilities/formatters';
// import { useLocalSearchParams } from 'expo-router';
// import { useState } from 'react';
// import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';

// export default function ConversationPage() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const [messageText, setMessageText] = useState('');

//   const { data, isLoading, fetchNextPage } = useMessages(id);
//   const sendMessageMutation = useSendMessage();
//   const markAsReadMutation = useMarkAsRead();

//   const messages = data?.pages.flatMap((page) => page.docs).reverse() ?? [];

//   const handleSend = async () => {
//     if (!messageText.trim()) return;

//     await sendMessageMutation.mutateAsync({
//       conversationId: id,
//       content: messageText.trim(),
//     });

//     setMessageText('');
//   };

//   const renderMessage = ({ item }: { item: Message }) => {
//     const isOwnMessage = item.sender.id === 'current-user-id';

//     return (
//       <View
//         className={`mb-2 px-4 ${isOwnMessage ? 'items-end' : 'items-start'}`}
//         onLayout={() => {
//           // Mark as read when rendered
//           if (!isOwnMessage) {
//             markAsReadMutation.mutate(item.id);
//           }
//         }}
//       >
//         <View
//           className={`max-w-[80%] rounded-2xl p-3 ${isOwnMessage ? 'bg-blue-500' : 'bg-gray-200'}`}
//         >
//           <Text className={isOwnMessage ? 'text-white' : 'text-black'}>{item.content}</Text>
//         </View>
//         <Text className="mt-1 text-xs text-gray-400">{formatLocaleTime(item.createdAt)}</Text>
//       </View>
//     );
//   };

//   return (
//     <View className="flex-1">
//       <FlatList
//         data={messages}
//         renderItem={renderMessage}
//         keyExtractor={(item) => item.id}
//         inverted
//         onEndReached={() => fetchNextPage()}
//         className="flex-1"
//       />

//       <View className="flex-row items-center border-t border-gray-200 p-3">
//         <TextInput
//           value={messageText}
//           onChangeText={setMessageText}
//           placeholder="Type a message..."
//           className="mr-2 flex-1 rounded-full bg-gray-100 px-4 py-2"
//         />
//         <TouchableOpacity
//           onPress={handleSend}
//           disabled={sendMessageMutation.isPending}
//           className="h-10 w-10 items-center justify-center rounded-full bg-blue-500"
//         >
//           <Text className="font-bold text-white">→</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

import React from 'react';
import { Text, View } from 'react-native';

export default function ConversationPage() {
  return (
    <View>
      <Text>ConversationPage</Text>
    </View>
  );
}
