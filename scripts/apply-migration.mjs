#!/usr/bin/env node
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Read environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

// Read migration file
const migrationSQL = readFileSync('supabase/migrations/008_webhook_attempts.sql', 'utf8');

console.log('🔄 Applying migration: 008_webhook_attempts.sql');
console.log('');

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

try {
  // Execute the migration SQL
  const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

  if (error) {
    // RPC might not exist, try direct query
    console.log('⚠️  RPC method not available, trying direct execution...');

    // Split SQL into individual statements and execute
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
      if (stmtError) {
        // If RPC doesn't work, we need to use a different approach
        throw new Error('Direct SQL execution not available via Supabase client');
      }
    }
  }

  console.log('✅ Migration applied successfully!');
  console.log('');
  console.log('📊 Verifying table creation...');

  // Verify the table exists
  const { data: tableCheck, error: checkError } = await supabase
    .from('webhook_attempts')
    .select('count')
    .limit(1);

  if (checkError) {
    console.error('❌ Error verifying table:', checkError.message);
    process.exit(1);
  }

  console.log('✅ Table webhook_attempts exists and is accessible!');
  console.log('');
  console.log('Next step: Deploy the code changes');

} catch (err) {
  console.error('❌ Migration failed:', err.message);
  console.log('');
  console.log('Alternative approach:');
  console.log('1. Go to Supabase dashboard → SQL Editor');
  console.log('2. Paste contents of supabase/migrations/008_webhook_attempts.sql');
  console.log('3. Execute the SQL');
  process.exit(1);
}
