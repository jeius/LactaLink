import { useUser } from '@clerk/clerk-expo';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import InputField from '@/components/InputField';

const Profile = () => {
  const { user } = useUser();

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 120 }}>
        <Text className="font-JakartaBold my-5 text-2xl">My profile</Text>

        <View className="my-5 flex items-center justify-center">
          <Image
            source={{
              uri: user?.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
            }}
            style={{ width: 110, height: 110, borderRadius: 110 / 2 }}
            className="h-[110px] w-[110px] rounded-full border-[3px] border-white shadow-sm shadow-neutral-300"
          />
        </View>

        <View className="flex flex-col items-start justify-center rounded-lg bg-white px-5 py-3 shadow-sm shadow-neutral-300">
          <View className="flex w-full flex-col items-start justify-start">
            <InputField
              label="First name"
              placeholder={user?.firstName || 'Not Found'}
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={false}
            />

            <InputField
              label="Last name"
              placeholder={user?.lastName || 'Not Found'}
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={false}
            />

            <InputField
              label="Email"
              placeholder={user?.primaryEmailAddress?.emailAddress || 'Not Found'}
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={false}
            />

            <InputField
              label="Phone"
              placeholder={user?.primaryPhoneNumber?.phoneNumber || 'Not Found'}
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={false}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
