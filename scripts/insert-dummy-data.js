require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경 변수가 설정되지 않았습니다.')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function insertDummyData() {
  console.log('더미 데이터 삽입을 시작합니다...')

  try {
    // 1. 기존 데이터 정리 (테스트 데이터만)
    console.log('기존 테스트 데이터 정리 중...')
    
    await supabase.from('reviews').delete().like('client_id', '%test%')
    await supabase.from('favorites').delete().like('user_id', '%test%')
    await supabase.from('requests').delete().like('client_id', '%test%')
    await supabase.from('ajussi_profiles').delete().like('user_id', '%test%')
    await supabase.from('profiles').delete().like('id', '%test%')

    // 2. 테스트 사용자 프로필 생성
    console.log('테스트 사용자 프로필 생성 중...')
    
    const profiles = [
      // 일반 사용자들
      {
        email: 'user1@test.com',
        name: '김고객',
        nickname: '김고객',
        introduction: '서비스를 이용하고 싶은 일반 사용자입니다.',
        role: 'user',
        profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      {
        email: 'user2@test.com',
        name: '이손님',
        nickname: '이손님',
        introduction: '다양한 아저씨 서비스에 관심이 많습니다.',
        role: 'user',
        profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      {
        email: 'user3@test.com',
        name: '박회원',
        nickname: '박회원',
        introduction: '처음 이용해보는 신규 사용자입니다.',
        role: 'user',
        profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
      },
      // 아저씨 사용자들
      {
        email: 'ajussi1@test.com',
        name: '김아저씨',
        nickname: '김아저씨',
        introduction: '20년 경력의 베테랑 아저씨입니다.',
        role: 'ajussi',
        profile_image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'
      },
      {
        email: 'ajussi2@test.com',
        name: '이삼촌',
        nickname: '이삼촌',
        introduction: '친근하고 유머러스한 아저씨입니다.',
        role: 'ajussi',
        profile_image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face'
      },
      {
        email: 'ajussi3@test.com',
        name: '박아빠',
        nickname: '박아빠',
        introduction: '자상하고 든든한 아버지 같은 아저씨입니다.',
        role: 'ajussi',
        profile_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=face'
      },
      {
        email: 'ajussi4@test.com',
        name: '최형님',
        nickname: '최형님',
        introduction: '운동을 좋아하는 건강한 아저씨입니다.',
        role: 'ajussi',
        profile_image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face'
      },
      {
        email: 'ajussi5@test.com',
        name: '정선생',
        nickname: '정선생',
        introduction: '교육 경험이 풍부한 지적인 아저씨입니다.',
        role: 'ajussi',
        profile_image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face'
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

    // 생성된 프로필에서 아저씨 ID들 찾기
    const ajussiProfiles_ids = profileData
      .filter(p => p.role === 'ajussi')
      .reduce((acc, p) => {
        if (p.email === 'ajussi1@test.com') acc.ajussi1 = p.id
        if (p.email === 'ajussi2@test.com') acc.ajussi2 = p.id
        if (p.email === 'ajussi3@test.com') acc.ajussi3 = p.id
        if (p.email === 'ajussi4@test.com') acc.ajussi4 = p.id
        if (p.email === 'ajussi5@test.com') acc.ajussi5 = p.id
        return acc
      }, {})

    // 3. 아저씨 프로필 생성
    console.log('아저씨 프로필 생성 중...')
    
    const ajussiProfiles = [
      {
        user_id: ajussiProfiles_ids.ajussi1,
        title: '경험 많은 산책 동반자',
        description: '20년간 다양한 사람들과 함께 걸어온 경험이 있습니다. 건강한 산책과 좋은 대화를 원하시는 분들께 최고의 서비스를 제공합니다. 특히 한강 공원과 남산 코스에 정통합니다.',
        hourly_rate: 25000,
        available_areas: ['강남구', '서초구', '용산구'],
        open_chat_url: 'https://open.kakao.com/o/test1',
        is_active: true,
        tags: ['산책', '대화', '운동', '한강'],
        total_requests: 45,
        completed_requests: 42,
        average_rating: 4.8
      },
      {
        user_id: ajussiProfiles_ids.ajussi2,
        title: '유머 넘치는 대화 전문가',
        description: '재미있는 이야기와 유머로 즐거운 시간을 만들어드립니다. 스트레스 해소가 필요하거나 웃음이 필요한 분들께 추천합니다. 다양한 주제로 대화 가능합니다.',
        hourly_rate: 20000,
        available_areas: ['마포구', '홍대', '신촌'],
        open_chat_url: 'https://open.kakao.com/o/test2',
        is_active: true,
        tags: ['대화', '유머', '상담', '카페'],
        total_requests: 32,
        completed_requests: 30,
        average_rating: 4.6
      },
      {
        user_id: ajussiProfiles_ids.ajussi3,
        title: '따뜻한 인생 상담사',
        description: '인생의 선배로서 따뜻한 조언과 격려를 해드립니다. 고민이 있거나 누군가와 진솔한 대화가 필요한 분들께 도움이 되고 싶습니다.',
        hourly_rate: 30000,
        available_areas: ['종로구', '중구', '성북구'],
        open_chat_url: 'https://open.kakao.com/o/test3',
        is_active: true,
        tags: ['상담', '조언', '대화', '멘토링'],
        total_requests: 28,
        completed_requests: 26,
        average_rating: 4.9
      },
      {
        user_id: ajussiProfiles_ids.ajussi4,
        title: '건강한 운동 파트너',
        description: '헬스, 조깅, 등산 등 다양한 운동을 함께 할 수 있습니다. 운동 초보자도 환영하며, 안전하고 즐거운 운동 시간을 만들어드립니다.',
        hourly_rate: 35000,
        available_areas: ['강남구', '송파구', '강동구'],
        open_chat_url: 'https://open.kakao.com/o/test4',
        is_active: true,
        tags: ['운동', '헬스', '조깅', '등산'],
        total_requests: 18,
        completed_requests: 17,
        average_rating: 4.7
      },
      {
        user_id: ajussiProfiles_ids.ajussi5,
        title: '지식 나눔 선생님',
        description: '오랜 교육 경험을 바탕으로 학습 도움이나 진로 상담을 해드립니다. 학생들이나 취업 준비생들에게 도움이 되고 싶습니다.',
        hourly_rate: 40000,
        available_areas: ['서대문구', '은평구', '마포구'],
        open_chat_url: 'https://open.kakao.com/o/test5',
        is_active: false,
        tags: ['교육', '상담', '진로', '학습'],
        total_requests: 12,
        completed_requests: 11,
        average_rating: 4.5
      }
    ]

    const { error: ajussiError } = await supabase
      .from('ajussi_profiles')
      .insert(ajussiProfiles)

    if (ajussiError) {
      console.error('아저씨 프로필 생성 오류:', ajussiError)
      return
    }

    // 4. 테스트용 서비스 요청 생성
    console.log('테스트 서비스 요청 생성 중...')
    
    const requests = [
      {
        client_id: 'user1-test-uuid-1111-111111111111',
        ajussi_id: 'ajussi1-test-uuid-1111-111111111111',
        service_type: '산책',
        requested_date: '2024-10-25T14:00:00',
        duration_hours: 2,
        location: '한강공원 반포지구',
        description: '스트레스 해소를 위한 한강 산책을 함께 해주세요.',
        status: 'COMPLETED',
        total_amount: 50000
      },
      {
        client_id: 'user2-test-uuid-2222-222222222222',
        ajussi_id: 'ajussi2-test-uuid-2222-222222222222',
        service_type: '대화',
        requested_date: '2024-10-26T19:00:00',
        duration_hours: 1,
        location: '홍대 카페거리',
        description: '재미있는 이야기를 들려주세요. 웃고 싶어요!',
        status: 'COMPLETED',
        total_amount: 20000
      },
      {
        client_id: 'user1-test-uuid-1111-111111111111',
        ajussi_id: 'ajussi3-test-uuid-3333-333333333333',
        service_type: '상담',
        requested_date: '2024-10-30T15:00:00',
        duration_hours: 1,
        location: '종로 카페',
        description: '인생 고민이 있어서 조언을 구하고 싶습니다.',
        status: 'CONFIRMED',
        total_amount: 30000
      },
      {
        client_id: 'user3-test-uuid-3333-333333333333',
        ajussi_id: 'ajussi1-test-uuid-1111-111111111111',
        service_type: '산책',
        requested_date: '2024-11-01T10:00:00',
        duration_hours: 3,
        location: '남산 N서울타워',
        description: '남산 등반과 함께 서울 구경을 하고 싶습니다.',
        status: 'PENDING',
        total_amount: 75000
      },
      {
        client_id: 'user2-test-uuid-2222-222222222222',
        ajussi_id: 'ajussi4-test-uuid-4444-444444444444',
        service_type: '운동',
        requested_date: '2024-11-02T07:00:00',
        duration_hours: 2,
        location: '강남 헬스장',
        description: '헬스 운동을 배우고 싶습니다. 초보자입니다.',
        status: 'PENDING',
        total_amount: 70000
      }
    ]

    const { data: requestData, error: requestError } = await supabase
      .from('requests')
      .insert(requests)
      .select()

    if (requestError) {
      console.error('요청 생성 오류:', requestError)
      return
    }

    // 5. 테스트용 즐겨찾기 생성
    console.log('테스트 즐겨찾기 생성 중...')
    
    const favorites = [
      { user_id: 'user1-test-uuid-1111-111111111111', ajussi_id: 'ajussi1-test-uuid-1111-111111111111' },
      { user_id: 'user1-test-uuid-1111-111111111111', ajussi_id: 'ajussi3-test-uuid-3333-333333333333' },
      { user_id: 'user2-test-uuid-2222-222222222222', ajussi_id: 'ajussi2-test-uuid-2222-222222222222' },
      { user_id: 'user2-test-uuid-2222-222222222222', ajussi_id: 'ajussi4-test-uuid-4444-444444444444' },
      { user_id: 'user3-test-uuid-3333-333333333333', ajussi_id: 'ajussi1-test-uuid-1111-111111111111' }
    ]

    const { error: favoriteError } = await supabase
      .from('favorites')
      .insert(favorites)

    if (favoriteError) {
      console.error('즐겨찾기 생성 오류:', favoriteError)
      return
    }

    // 6. 테스트용 리뷰 생성 (완료된 요청에 대해서만)
    console.log('테스트 리뷰 생성 중...')
    
    if (requestData && requestData.length > 0) {
      const completedRequests = requestData.filter(req => req.status === 'COMPLETED')
      
      const reviews = completedRequests.map(req => ({
        request_id: req.id,
        client_id: req.client_id,
        ajussi_id: req.ajussi_id,
        rating: req.ajussi_id === 'ajussi1-test-uuid-1111-111111111111' ? 5 : 5,
        comment: req.ajussi_id === 'ajussi1-test-uuid-1111-111111111111' 
          ? '정말 좋은 시간이었습니다! 김아저씨께서 한강의 숨겨진 명소들도 알려주시고, 재미있는 이야기도 많이 해주셨어요. 다음에도 꼭 함께하고 싶습니다.'
          : '이삼촌 정말 재미있으세요! 1시간 내내 웃었어요. 스트레스가 완전히 날아갔습니다. 유머 감각이 정말 뛰어나세요!'
      }))

      const { error: reviewError } = await supabase
        .from('reviews')
        .insert(reviews)

      if (reviewError) {
        console.error('리뷰 생성 오류:', reviewError)
        return
      }
    }

    console.log('✅ 더미 데이터 삽입이 완료되었습니다!')
    console.log('\n📋 생성된 테스트 계정:')
    console.log('👤 일반 사용자:')
    console.log('  - user1@test.com (김고객)')
    console.log('  - user2@test.com (이손님)')
    console.log('  - user3@test.com (박회원)')
    console.log('\n👨‍🦳 아저씨 사용자:')
    console.log('  - ajussi1@test.com (김아저씨) - 활성')
    console.log('  - ajussi2@test.com (이삼촌) - 활성')
    console.log('  - ajussi3@test.com (박아빠) - 활성')
    console.log('  - ajussi4@test.com (최형님) - 활성')
    console.log('  - ajussi5@test.com (정선생) - 비활성')

  } catch (error) {
    console.error('더미 데이터 삽입 중 오류 발생:', error)
  }
}

insertDummyData()