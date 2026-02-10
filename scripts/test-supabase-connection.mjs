import { createClient } from '@supabase/supabase-js'

// Simple connectivity test for Supabase from Node.js
// Run with: node scripts/test-supabase-connection.mjs

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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


