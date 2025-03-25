module.exports = {
  extends: '@lactalink/eslint-config/next',
  ignorePatterns: ['node_modules', '.next', 'assets', 'public'],
  settings: {
    next: {
      rootDir: ['./src/'],
    },
  },
};
