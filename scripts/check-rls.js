// Script to check RLS status on Supabase
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkRlsStatus() {
  console.log('🔍 Checking RLS status on Supabase...\n')
  console.log('URL:', supabaseUrl)
  
  // Check RLS status for each table
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        schemaname,
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('profiles', 'ajussi_profiles', 'requests', 'reviews', 'favorites', 'ajussi_applications')
      ORDER BY tablename;
    `
  })
  
  if (error) {
    // If rpc doesn't work, try direct query
    console.log('RPC not available, checking tables directly...')
    
    const tables = ['profiles', 'ajussi_profiles', 'requests', 'reviews', 'favorites', 'ajussi_applications']
    
    for (const table of tables) {
      const { data: tableData, error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (tableError) {
        console.log(`❌ ${table}: Error - ${tableError.message}`)
      } else {
        console.log(`✅ ${table}: Accessible (${tableData?.length || 0} rows returned)`)
      }
    }
  } else {
    console.log('RLS Status:')
    console.table(data)
  }
  
  // Count records in each table
  console.log('\n📊 Record counts:')
  const tables = ['profiles', 'ajussi_profiles', 'requests', 'reviews', 'favorites', 'ajussi_applications']
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
    
    console.log(`  ${table}: ${count ?? 'Error'} records`)
  }
}

checkRlsStatus()
  .then(() => console.log('\n✅ Check complete'))
  .catch(err => console.error('Error:', err))
