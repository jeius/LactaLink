module.exports = {
  extends: '@lactalink/eslint-config/expo',
  ignorePatterns: ['node_modules', 'build', '.expo', '.expo-shared'],
  overrides: [
    {
      files: ['*.js'],
      env: {
        node: true,
      },
    },
  ],
};
