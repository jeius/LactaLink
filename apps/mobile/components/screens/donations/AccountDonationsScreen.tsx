import { SceneProps } from '@/components/tabs/scenes/types';
import { Tab } from '@/components/tabs/Tab';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import AccountDonations from '@/features/donation&request/components/lists/AccountDonationList';

import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { CollectionSlug } from '@lactalink/types/payload-types';

import { Link, Stack } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Route, SceneMap } from 'react-native-tab-view';

const SLUG: Extract<CollectionSlug, 'donations'> = 'donations';

const routes = createTabRoutes();
const renderScene = createTabSceneMap(routes);

export default function AccountDonationsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ headerShadowVisible: false, headerTitle: 'My Donations' }} />
      <VStack className="flex-1">
        <Tab routes={routes} renderScene={renderScene} />

        <Box
          className="rounded-t-3xl border border-outline-200 bg-background-0 p-4"
          style={{ paddingBottom: insets.bottom + 4 }}
        >
          <Link href="/donations/create" asChild>
            <Button>
              <ButtonIcon as={PlusIcon} />
              <ButtonText>New Donation</ButtonText>
            </Button>
          </Link>
        </Box>
      </VStack>
    </>
  );
}

function createTabRoutes(): Route[] {
  const routes = Object.values(DONATION_REQUEST_STATUS);

  return routes.map(({ label, value }) => ({
    key: value,
    title: label,
    accessibilityLabel: label,
    testID: `${SLUG}-tab-${value}`,
    accessible: true,
  }));
}

function createTabSceneMap(routes: Route[]) {
  const scenes: Record<string, React.FC<SceneProps>> = {};

  routes.forEach((route) => {
    scenes[route.key] = AccountDonations;
  });

  return SceneMap(scenes);
}
