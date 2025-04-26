module.exports = {
  extends: '@lactalink/eslint-config/base',
  ignorePatterns: ['node_modules', 'dist', '.turbo'],
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
};
