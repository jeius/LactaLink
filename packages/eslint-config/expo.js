const base = require('./base.js');

/**
 * A custom ESLint configuration for libraries that use React Native Expo.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
module.exports = {
  ...base,
  extends: [...base.extends, 'expo', 'plugin:@typescript-eslint/recommended'],
  env: {
    browser: true,
    node: false,
  },
};
