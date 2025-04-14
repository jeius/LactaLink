import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { View } from 'react-native';

export default function App() {
  async function handleGoogleSignIn() {
    try {
      await GoogleSignin.hasPlayServices();
      const res = await GoogleSignin.signIn();
      if (isSuccessResponse(res)) {
        const { idToken, user } = res.data;
        const { email, familyName, givenName, id, name } = user;

        console.log('User Info: ', { email, familyName, givenName, id, name });
        console.log('ID Token: ', idToken);
        // You can now use the idToken to authenticate with your backend server
      } else {
        console.log('Error signing in: ', res);
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log('Play services not available or outdated.');
            break;
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('User cancelled the sign-in flow.');
            break;
          case statusCodes.IN_PROGRESS:
            console.log('Sign-in is in progress already.');
            break;
          case statusCodes.SIGN_IN_REQUIRED:
            console.log('Sign-in is required.');
            break;
          default:
            break;
        }
      }
    }
  }

  return (
    <View className="flex-1 items-center justify-center gap-y-2">
      <View className="items-center">
        <Heading bold={true} size="2xl">
          Sign in with Google
        </Heading>
      </View>
      <Button variant="solid" size="lg" onPress={handleGoogleSignIn}>
        <Text className="text-primary-0">Sign in</Text>
      </Button>
    </View>
  );
}
