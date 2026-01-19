// Script to disable RLS on Supabase using service role key
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: { schema: 'public' },
    auth: { autoRefreshToken: false, persistSession: false }
})

const DISABLE_RLS_SQL = `
-- Disable RLS on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE ajussi_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE ajussi_applications DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies
-- profiles table policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- ajussi_profiles table policies
DROP POLICY IF EXISTS "Anyone can view active ajussi profiles" ON ajussi_profiles;
DROP POLICY IF EXISTS "Users can manage own ajussi profile" ON ajussi_profiles;

-- requests table policies
DROP POLICY IF EXISTS "Users can view own requests" ON requests;
DROP POLICY IF EXISTS "Clients can create requests" ON requests;
DROP POLICY IF EXISTS "Involved parties can update requests" ON requests;

-- reviews table policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Reviewers can create reviews" ON reviews;

-- favorites table policies
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;

-- ajussi_applications table policies
DROP POLICY IF EXISTS "Users can view own applications" ON ajussi_applications;
DROP POLICY IF EXISTS "Users can create applications" ON ajussi_applications;
DROP POLICY IF EXISTS "Users can update pending applications" ON ajussi_applications;
`

async function disableRls() {
    console.log('🔧 Disabling RLS on Supabase...')
    console.log('URL:', supabaseUrl)
    console.log('')

    // Split SQL into individual statements and execute
    const statements = DISABLE_RLS_SQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📝 Executing ${statements.length} SQL statements...`)
    console.log('')

    let successCount = 0
    let errorCount = 0

    for (const statement of statements) {
        // Extract table name from statement for logging
        const match = statement.match(/(?:TABLE|ON)\s+(\w+)/i)
        const tableName = match ? match[1] : 'unknown'
        const action = statement.includes('DISABLE') ? 'Disable RLS' : 'Drop Policy'

        try {
            const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })

            if (error) {
                // If RPC doesn't exist, we need to use Supabase dashboard
                if (error.message.includes('function') || error.message.includes('does not exist')) {
                    console.log(`⚠️  RPC 'exec_sql' not available. Please run SQL in Supabase Dashboard.`)
                    console.log('')
                    console.log('📋 Copy this SQL and run in Supabase SQL Editor:')
                    console.log('   Dashboard > SQL Editor > New Query > Paste & Run')
                    console.log('')
                    console.log('--- SQL START ---')
                    console.log(DISABLE_RLS_SQL)
                    console.log('--- SQL END ---')
                    return
                }
                console.log(`❌ ${action} on ${tableName}: ${error.message}`)
                errorCount++
            } else {
                console.log(`✅ ${action} on ${tableName}`)
                successCount++
            }
        } catch (err) {
            console.log(`❌ ${action} on ${tableName}: ${err.message}`)
            errorCount++
        }
    }

    console.log('')
    console.log(`📊 Results: ${successCount} success, ${errorCount} errors`)
}

disableRls()
    .then(() => console.log('\n✅ Migration complete'))
    .catch(err => console.error('Error:', err))
