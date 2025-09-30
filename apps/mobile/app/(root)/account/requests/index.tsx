import { BottomSheetActionButton } from '@/components/buttons';
import { ScrollProvider } from '@/components/contexts/ScrollProvider';
import SafeArea from '@/components/SafeArea';
import { SceneProps } from '@/components/tabs/scenes/types';
import { UserDonationsOrRequestsScene } from '@/components/tabs/scenes/UserDonationsOrRequests';
import { Tab } from '@/components/tabs/Tab';

import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { CollectionSlug } from '@lactalink/types/payload-types';

import { Stack, useRouter } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { Route, SceneMap } from 'react-native-tab-view';

const SLUG: Extract<CollectionSlug, 'requests'> = 'requests';

const routes = createTabRoutes();
const renderScene = createTabSceneMap(routes);

export default function RequestsPage() {
  const router = useRouter();

  function handleCreateNew() {
    router.push(`/requests/create`);
  }

  return (
    <ScrollProvider>
      <Stack.Screen options={{ headerShadowVisible: false }} />
      <SafeArea safeTop={false} safeBottom={false}>
        <Tab routes={routes} renderScene={renderScene} />
        <BottomSheetActionButton
          icon={PlusIcon}
          animateDistance={200}
          label={`New Request`}
          onPress={handleCreateNew}
        />
      </SafeArea>
    </ScrollProvider>
  );
}

// #region TabHelpers
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
    scenes[route.key] = Scene;
  });

  return SceneMap(scenes);
}

function Scene(props: SceneProps) {
  return <UserDonationsOrRequestsScene collection="requests" {...props} />;
}

// #endregion TabHelpers
