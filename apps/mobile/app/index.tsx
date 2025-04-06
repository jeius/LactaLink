import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Alert, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center gap-y-2">
      <View className="items-center">
        <Heading bold={true} size="4xl">
          Welcome to NativeWind!
        </Heading>
        <Text className="text-xl">Style your app with</Text>
        <Text className="bg-slate-500 text-3xl font-bold underline">Tailwind CSS!</Text>
      </View>
      <Button
        variant="solid"
        size="lg"
        onPress={() => {
          Alert.alert('NativeWind', "You're all set up!");
        }}
      >
        <Text>Sounds Good!</Text>
      </Button>
      {/* <Alert icon={Terminal} className="max-w-xl">
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  You can use a terminal to run commands on your computer.
                </AlertDescription>
              </Alert> */}
    </View>
  );
}
