import tsEsLint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import turbo from 'eslint-plugin-turbo';

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  {
    files: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      parser: parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        browser: true,
        node: true,
      },
    },
    plugins: {
      '@typescript-eslint': tsEsLint,
      prettier: prettier,
      turbo: turbo,
    },
    ignores: ['node_modules', 'build', 'dist', '.turbo'],
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
          plugins: ['prettier-plugin-tailwindcss'],
          tailwindFunctions: ['tva'],
        },
      ],
    },
  },
  {
    files: ['*.cjs', '*.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-undef': 'off',
    },
  },
];
