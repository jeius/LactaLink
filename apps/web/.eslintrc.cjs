module.exports = {
  extends: '@lactalink/eslint-config/next',
  ignorePatterns: ['node_modules', '.next', 'assets', 'public', '(payload)'],
  settings: {
    next: {
      rootDir: ['./src/'],
    },
  },
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@/lib/types/payload-types',
            message: 'Please import types from @lactalink/types for single source of truth.',
          },
        ],
      },
    ],
  },
};
