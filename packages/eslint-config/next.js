import { FlatCompat } from '@eslint/eslintrc';
import base from './base.js';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export default [
  ...base,
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
    plugins: ['@next/eslint-plugin-next'],
  }),
];
