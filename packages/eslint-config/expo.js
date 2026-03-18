import expo from 'eslint-config-expo/flat.js';
import base from './base.js';

/**
 * A custom ESLint configuration for libraries that use React Native Expo.
 *
 */
export default [
  ...base,
  ...expo,
  {
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
];
