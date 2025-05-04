const resolveConfig = require('tailwindcss/resolveConfig');
const tailwindConfig = require('tailwind.config');
const fullConfig = resolveConfig(tailwindConfig);

module.exports = fullConfig.theme?.colors;
