import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { images } from '@/constants';

const Chat = () => {
  return (
    <SafeAreaView className="flex-1 bg-white p-5">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text className="font-JakartaBold text-2xl">Chat</Text>
        <View className="flex h-fit flex-1 items-center justify-center">
          <Image
            source={images.message}
            alt="message"
            className="h-40 w-full"
            resizeMode="contain"
          />
          <Text className="font-JakartaBold mt-3 text-3xl">No Messages Yet</Text>
          <Text className="mt-2 px-7 text-center text-base">
            Start a conversation with your friends and family
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Chat;
