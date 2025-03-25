const base = require('./base.js');

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
module.exports = {
  ...base,
  extends: [...base.extends, 'next/core-web-vitals', 'next/typescript'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
};
