const { execSync } = require('child_process');
const path = require('path');

// Load environment variables from api
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

// Extract database URL from environment variables
function getDatabaseUrl() {
  // Priority: CLI arg > DATABASE_URI > SUPABASE_URL > default
  const directUrl = process.argv[2] || process.env.DATABASE_URI;

  if (directUrl) return directUrl;

  return 'postgresql://postgres:postgres@localhost:54322/postgres'; // Local default
}

const dbUrl = getDatabaseUrl();
const outputPath = path.resolve(__dirname, '../../types/src/supabase-types.ts');

console.log(`🔄 Generating Supabase types from database: ${dbUrl.replace(/:[^@]*@/, ':***@')}`); // Hide password in logs
console.log(`📂 Output: ${outputPath}`);

try {
  const command = `supabase gen types typescript --db-url "${dbUrl}" -s public`;
  console.log(`🔧 Running: ${command.replace(/:[^@]*@/, ':***@')}`); // Show command with hidden password

  const types = execSync(command, { encoding: 'utf8' });

  require('fs').writeFileSync(outputPath, types);
  console.log(`✅ Types generated successfully at ${outputPath}`);
} catch (error) {
  console.error('❌ Failed to generate types:', error.message);
  console.error('Make sure:');
  console.error('  - Supabase CLI is installed');
  console.error('  - Database URI is correct and accessible');
  console.error('  - Database connection credentials are valid');
  console.error('  - Environment file exists at packages/api/.env');
  process.exit(1);
}
