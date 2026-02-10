import { createClient } from '@supabase/supabase-js'

// Simple connectivity test for Supabase from Node.js
// Run with: node scripts/test-supabase-connection.mjs

const SUPABASE_URL = 'https://mlesabvweritzyjvswcg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sZXNhYnZ3ZXJpdHp5anZzd2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NDM0OTgsImV4cCI6MjA3OTExOTQ5OH0.jap6_CH_FJVdP82VORQrYgzPrba0bZ9OCYG7Cet60xY'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function main() {
  try {
    console.log('Testing Supabase connection...')

    // Try a very simple query; adjust table name if needed
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    console.log('Result data:', data)
    console.log('Result error:', error)
  } catch (err) {
    console.error('Unexpected error while talking to Supabase:', err)
  }
}

main()


