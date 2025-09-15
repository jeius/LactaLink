import eslintConfig from '@lactalink/eslint-config';

export default [
  {
    ignores: [
      '**/node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'packages/**/node_modules/**',
    ],
  },
  ...eslintConfig,
];
