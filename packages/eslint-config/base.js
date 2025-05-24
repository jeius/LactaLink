/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier', 'turbo'],
  ignorePatterns: ['node_modules', 'build', 'dist', '.turbo'],
  env: {
    node: true,
    browser: true,
  },
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
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
    'prettier/prettier': [
      'warn',
      {
        endOfLine: 'auto',
        printWidth: 100,
        tabWidth: 2,
        singleQuote: true,
        semi: true,
        trailingComma: 'es5',
      },
    ],
  },
  overrides: [
    {
      files: ['*.cjs', '*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-undef': 'off',
      },
    },
  ],
};
