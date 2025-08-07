const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/__tests__/**/*.(ts|tsx|js)', '**/?(*.)+(spec|test).(ts|tsx|js)'],
  moduleNameMapper: {
    '^@lactalink/(.*)$': '<rootDir>/../../packages/$1/src',
  },
  setupFilesAfterEnv: [],
  coverageDirectory: '<rootDir>/../../coverage',
  collectCoverageFrom: [
    '../../packages/**/*.{ts,tsx,js,jsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/*.d.ts',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/', '/.turbo/', '/scripts/'],
  transform: {
    ...tsJestTransformCfg,
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!(qs-esm)/)'],
};
