/**
 * 기존 아저씨 프로필에 slug 자동 생성 마이그레이션 스크립트
 * 
 * 실행 방법:
 * node scripts/migrate-slugs.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const { transliterate } = require('transliteration')
const slugify = require('slugify')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials')
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 슬러그 생성 함수
function generateSlug(text) {
    const romanized = transliterate(text, { unknown: '' })
    return slugify(romanized, {
        lower: true,
        strict: true,
        trim: true,
    })
}

// 중복 체크 함수 (generatedSlugs 세트도 확인)
const generatedSlugs = new Set()

async function slugExists(slug) {
    if (generatedSlugs.has(slug)) return true

    const { data } = await supabase
        .from('ajussi_profiles')
        .select('id')
        .eq('slug', slug)
        .single()
    return !!data
}

// 유니크 슬러그 생성
async function generateUniqueSlug(text) {
    const baseSlug = generateSlug(text)

    if (!baseSlug) {
        const fallback = `ajussi-${Date.now()}`
        generatedSlugs.add(fallback)
        return fallback
    }

    if (!(await slugExists(baseSlug))) {
        generatedSlugs.add(baseSlug)
        return baseSlug
    }

    let counter = 2
    while (counter < 100) {
        const candidateSlug = `${baseSlug}-${counter}`
        if (!(await slugExists(candidateSlug))) {
            generatedSlugs.add(candidateSlug)
            return candidateSlug
        }
        counter++
    }

    const fallback = `${baseSlug}-${Date.now()}`
    generatedSlugs.add(fallback)
    return fallback
}

async function migrateAllSlugs() {
    console.log('🚀 Starting slug migration...\n')

    // 1. slug가 없는 모든 아저씨 프로필 가져오기
    const { data: profiles, error } = await supabase
        .from('ajussi_profiles')
        .select('id, title, slug')
        .or('slug.is.null,slug.eq.')

    if (error) {
        console.error('❌ Error fetching profiles:', error.message)
        console.log('\n💡 slug 컬럼이 없다면, Supabase Dashboard에서 다음 SQL을 실행하세요:')
        console.log('   ALTER TABLE ajussi_profiles ADD COLUMN slug VARCHAR(255);')
        process.exit(1)
    }

    if (!profiles || profiles.length === 0) {
        console.log('✅ No profiles need slug migration. All done!')
        return
    }

    console.log(`📝 Found ${profiles.length} profiles without slug\n`)

    // 2. 각 프로필에 slug 생성 및 업데이트
    let successCount = 0
    let errorCount = 0

    for (const profile of profiles) {
        try {
            const slug = await generateUniqueSlug(profile.title)

            const { error: updateError } = await supabase
                .from('ajussi_profiles')
                .update({ slug })
                .eq('id', profile.id)

            if (updateError) {
                console.error(`❌ Failed to update ${profile.title}: ${updateError.message}`)
                errorCount++
            } else {
                console.log(`✅ ${profile.title} → ${slug}`)
                successCount++
            }
        } catch (err) {
            console.error(`❌ Error processing ${profile.title}:`, err.message)
            errorCount++
        }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`🎉 Migration complete!`)
    console.log(`   ✅ Success: ${successCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
}

migrateAllSlugs()
