require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function insertSimpleDummyData() {
  console.log('간단한 더미 데이터 삽입을 시작합니다...')

  try {
    // 1. 기존 테스트 데이터 정리
    console.log('기존 테스트 데이터 정리 중...')
    await supabase.from('reviews').delete().like('reviewer_id', '%test%')
    await supabase.from('favorites').delete().like('user_id', '%test%')
    await supabase.from('requests').delete().like('client_id', '%test%')
    await supabase.from('ajussi_profiles').delete().like('user_id', '%test%')
    await supabase.from('profiles').delete().like('email', '%test%')

    // 2. 테스트 사용자 프로필 생성 (간단하게)
    console.log('테스트 사용자 프로필 생성 중...')
    
    const profiles = [
      {
        email: 'user1@test.com',
        name: '김고객',
        nickname: '김고객',
        role: 'user'
      },
      {
        email: 'ajussi1@test.com',
        name: '김아저씨',
        nickname: '김아저씨',
        role: 'ajussi'
      },
      {
        email: 'ajussi2@test.com',
        name: '이삼촌',
        nickname: '이삼촌',
        role: 'ajussi'
      }
    ]

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert(profiles)
      .select()

    if (profileError) {
      console.error('프로필 생성 오류:', profileError)
      return
    }

    console.log('생성된 프로필:', profileData)

    // 3. 아저씨 프로필 생성
    console.log('아저씨 프로필 생성 중...')
    
    const ajussiUsers = profileData.filter(p => p.role === 'ajussi')
    
    for (const ajussi of ajussiUsers) {
      const ajussiProfile = {
        user_id: ajussi.id,
        title: ajussi.nickname === '김아저씨' ? '경험 많은 산책 동반자' : '유머 넘치는 대화 전문가',
        description: ajussi.nickname === '김아저씨' 
          ? '20년간 다양한 사람들과 함께 걸어온 경험이 있습니다.' 
          : '재미있는 이야기와 유머로 즐거운 시간을 만들어드립니다.',
        hourly_rate: ajussi.nickname === '김아저씨' ? 25000 : 20000,
        available_areas: ['강남구', '서초구'],
        open_chat_url: `https://open.kakao.com/o/${ajussi.id}`,
        is_active: true,
        tags: ajussi.nickname === '김아저씨' ? ['산책', '대화'] : ['대화', '유머'],
        availability_mask: {}
      }

      const { error: ajussiError } = await supabase
        .from('ajussi_profiles')
        .insert(ajussiProfile)

      if (ajussiError) {
        console.error('아저씨 프로필 생성 오류:', ajussiError)
      } else {
        console.log(`${ajussi.nickname} 아저씨 프로필 생성 완료`)
      }
    }

    console.log('✅ 간단한 더미 데이터 삽입이 완료되었습니다!')
    console.log('\n📋 생성된 테스트 계정:')
    console.log('👤 일반 사용자: user1@test.com (김고객)')
    console.log('👨‍🦳 아저씨 사용자: ajussi1@test.com (김아저씨)')
    console.log('👨‍🦳 아저씨 사용자: ajussi2@test.com (이삼촌)')
    console.log('\n💡 이제 Google OAuth로 로그인한 후 프로필에서 역할을 변경할 수 있습니다.')

  } catch (error) {
    console.error('더미 데이터 삽입 중 오류 발생:', error)
  }
}

insertSimpleDummyData()