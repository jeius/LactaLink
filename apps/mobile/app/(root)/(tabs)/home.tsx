import { useUser } from '@clerk/clerk-expo';
import { useAuth } from '@clerk/clerk-expo';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import GoogleTextInput from '@/components/GoogleTextInput';
import Map from '@/components/Map';
import RideCard from '@/components/RideCard';
import { icons, images } from '@/constants';
import { useFetch } from '@/lib/fetch';
import { useLocationStore } from '@/store';
import { Ride } from '@/types/type';

const Home = () => {
  const { user } = useUser();
  const { signOut } = useAuth();

  const { setUserLocation, setDestinationLocation } = useLocationStore();

  const handleSignOut = () => {
    signOut();
    router.replace('/(auth)/sign-in');
  };

  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const { data: recentRides, loading, error } = useFetch<Ride[]>(`/(api)/ride/${user?.id}`);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setHasPermission(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
      });

      setUserLocation({
        latitude: location.coords?.latitude,
        longitude: location.coords?.longitude,
        address: `${address[0].name}, ${address[0].region}`,
      });
    })();
  }, []);

  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestinationLocation(location);

    router.push('/(root)/find-ride');
  };

  return (
    <SafeAreaView className="bg-general-500">
      <FlatList
        data={recentRides?.slice(0, 5)}
        renderItem={({ item }) => <RideCard ride={item} />}
        keyExtractor={(item, index) => index.toString()}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="h-40 w-40"
                  alt="No recent rides found"
                  resizeMode="contain"
                />
                <Text className="text-sm">No recent rides found</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            <View className="my-5 flex flex-row items-center justify-between">
              <Text className="font-JakartaExtraBold text-2xl">Welcome {user?.firstName}👋</Text>
              <TouchableOpacity
                onPress={handleSignOut}
                className="h-10 w-10 items-center justify-center rounded-full bg-white"
              >
                <Image source={icons.out} className="h-4 w-4" />
              </TouchableOpacity>
            </View>

            <GoogleTextInput
              icon={icons.search}
              containerStyle="bg-white shadow-md shadow-neutral-300"
              handlePress={handleDestinationPress}
            />

            <>
              <Text className="font-JakartaBold mb-3 mt-5 text-xl">Your current location</Text>
              <View className="flex h-[300px] flex-row items-center bg-transparent">
                <Map />
              </View>
            </>

            <Text className="font-JakartaBold mb-3 mt-5 text-xl">Recent Rides</Text>
          </>
        }
      />
    </SafeAreaView>
  );
};

export default Home;
