const fs = require('fs');
const path = require('path');
const glob = require('glob');

const patterns = [
  'node_modules',
  '**/node_modules',
  '.turbo',
  '**/.turbo',
  'dist',
  '**/dist',
  '**/.next',
  '**/.expo',
  '**/tsconfig.tsbuildinfo',
];

patterns.forEach((pattern) => {
  glob.sync(pattern).forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { recursive: true, force: true });
      console.log(`🗑️  Deleted: ${filePath}`);
    } else {
      console.log(`❌ Path does not exist: ${filePath}`);
    }
  });
});