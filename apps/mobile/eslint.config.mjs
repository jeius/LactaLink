import eslintConfig from '@lactalink/eslint-config/expo';

export default [
  ...eslintConfig,
  {
    ignores: [
      '.expo/**',
      '.expo-shared/**',
      'ios/**',
      'android/**',
      'web/**',
      'patches/**',
      'assets/**',
    ],
  },
];
