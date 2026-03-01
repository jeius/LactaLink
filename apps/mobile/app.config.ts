import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'LactaLink',
  slug: 'lactalink',
  description:
    'A breastmilk sharing platform that connects donors, recipients, hospitals, and milk banks for safe and efficient milk distribution.',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/logo/icon.png',
  backgroundColor: '#f6f6f6',
  primaryColor: '#FE828C',
  scheme: 'lactalink',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  platforms: ['ios', 'android'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.lactalink.mobile',
    config: { googleMapsApiKey: process.env.IOS_MAPS_API_KEY },
    icon: {
      dark: './assets/logo/ios_dark.png',
      light: './assets/logo/ios_light.png',
      tinted: './assets/logo/ios_tinted.png',
    },
  },
  android: {
    edgeToEdgeEnabled: true,
    adaptiveIcon: {
      foregroundImage: './assets/logo/adaptive_icon.png',
      monochromeImage: './assets/logo/adaptive_icon.png',
      backgroundColor: '#FE828C',
    },
    package: 'com.lactalink.mobile',
    config: { googleMaps: { apiKey: process.env.ANDROID_MAPS_API_KEY } },
    permissions: ['SCHEDULE_EXACT_ALARM'],
  },
  androidStatusBar: { translucent: true, hidden: true },
  plugins: [
    'expo-router',
    'expo-image-picker',
    'expo-mail-composer',
    'react-native-compressor',
    [
      'react-native-edge-to-edge',
      {
        android: {
          parentTheme: 'Default',
          enforceNavigationBarContrast: false,
        },
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'Allow LactaLink to access your camera',
        microphonePermission: 'Allow LactaLink to access your microphone',
        recordAudioAndroid: true,
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow LactaLink to use your location.',
        isIosBackgroundLocationEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
      },
    ],
    [
      'react-native-google-maps-plus',
      {
        googleMapsAndroidApiKey: process.env.ANDROID_MAPS_API_KEY,
        googleMapsIosApiKey: process.env.IOS_MAPS_API_KEY,
      },
    ],
    ['expo-font', { fonts: ['./assets/fonts'] }],
    [
      'expo-splash-screen',
      {
        image: './assets/logo/splash_icon_light.png',
        resizeMode: 'contain',
        backgroundColor: '#FE828C',
        imageWidth: 200,
        dark: {
          image: './assets/logo/splash_icon_dark.png',
          backgroundColor: '#272625',
        },
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/logo/logo_icon.png',
        color: '#FFE6E8',
        defaultChannel: 'default',
        enableBackgroundRemoteNotifications: false,
      },
    ],
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme: 'com.googleusercontent.apps.449221057044-99t6nn1ct12t11pa56utpao11t699d9k',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
    autolinkingModuleResolution: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: 'ee00ec97-b3a9-4e3e-b499-95bb14571879',
    },
  },
  owner: 'lactalink',
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://u.expo.dev/ee00ec97-b3a9-4e3e-b499-95bb14571879',
  },
});
