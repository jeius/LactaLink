import eslintConfig from '@lactalink/eslint-config/next';

const Config = [
  {
    ignores: ['.next/**', 'assets/**', 'public/**', '**/payload/**', 'next-env.d.ts'],
  },
  ...eslintConfig,
  {
    settings: {
      next: {
        rootDir: ['./src/'],
      },
    },
  },
];

export default Config;
