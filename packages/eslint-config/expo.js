import expo from 'eslint-config-expo/flat.js';
import base from './base.js';

/**
 * A custom ESLint configuration for libraries that use React Native Expo.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [...base, ...expo];
