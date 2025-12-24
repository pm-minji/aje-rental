import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

// Vercel의 엣지 네트워크에서 동적으로 실행되도록 설정합니다. 캐시를 사용하지 않아 항상 최신 데이터를 반환합니다.
export const dynamic = 'force-dynamic'

/**
 * @api {get} /api/ajussi
 * @description 아저씨 프로필 목록을 조회하는 API 엔드포인트입니다.
 * 다양한 필터링(지역, 태그, 가격대, 검색어)과 페이지네이션 기능을 지원합니다.
 * @param {NextRequest} request - Next.js 서버로부터 전달받는 요청 객체.
 * @returns {NextResponse} - 조회된 아저씨 목록 데이터 또는 에러 메시지를 담은 응답 객체.
 */
export async function GET(request: NextRequest) {
  try {
    // --- 1. 요청 파라미터 분석 및 유효성 검사 ---
    const { searchParams } = new URL(request.url)

    // 필터링 조건들을 URL 쿼리 파라미터에서 추출합니다.
    const location = searchParams.get('location')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) // 쉼표로 구분된 문자열을 배열로 변환
    const search = searchParams.get('search')

    // 숫자 형태의 파라미터는 `parseInt`로 변환하되, 유효하지 않은 값이 들어올 경우를 대비해 기본값과 범위를 설정합니다.
    // 이는 악의적인 입력(예: 매우 큰 숫자, 문자열)으로부터 서버를 보호하는 방어 코드 역할을 합니다.
    const minRateParam = searchParams.get('minRate')
    const maxRateParam = searchParams.get('maxRate')
    const minRate = minRateParam ? parseInt(minRateParam, 10) : null
    const maxRate = maxRateParam ? parseInt(maxRateParam, 10) : null

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10)) // 페이지는 최소 1 이상
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12', 10))) // limit은 1과 100 사이

    // --- 2. Supabase 클라이언트 생성 및 기본 쿼리 작성 ---
    const supabase = await createServerSupabase()
    
    // `ajussi_profiles` 테이블에서 데이터를 조회하는 기본 쿼리입니다.
    // `is_active`가 true인 프로필만 조회하여 비활성화된 아저씨는 노출되지 않도록 합니다.
    // 또한, `profiles` 테이블과 조인하여 작성자(user)의 상세 정보를 함께 가져옵니다.
    let query = supabase
      .from('ajussi_profiles')
      .select(`
        *,
        profiles (
          id,
          name,
          nickname,
          profile_image
        )
      `, { count: 'exact' }) // `count: 'exact'`를 통해 필터링된 전체 개수를 함께 가져옵니다.
      .eq('is_active', true)

    // --- 3. 동적 필터링 조건 추가 ---
    // 각 필터링 조건이 존재할 경우에만 쿼리에 추가합니다.
    if (location) {
      query = query.contains('available_areas', [location]) // 활동 가능 지역 필터
    }
    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags) // 태그 필터 (배열 간 교집합)
    }
    if (minRate !== null && !isNaN(minRate)) {
      query = query.gte('hourly_rate', minRate) // 최소 시급 필터
    }
    if (maxRate !== null && !isNaN(maxRate)) {
      query = query.lte('hourly_rate', maxRate) // 최대 시급 필터
    }
    if (search) {
      // 제목(title) 또는 설명(description)에 검색어가 포함된 경우를 검색합니다. (대소문자 무시)
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // --- 4. 페이지네이션 및 정렬 ---
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1) // 특정 범위의 데이터만 가져오도록 설정
    query = query.order('created_at', { ascending: false }) // 최신순으로 정렬

    // --- 5. 쿼리 실행 및 에러 처리 ---
    const { data, error, count: totalCount } = await query

    // Supabase 쿼리 실행 중 에러가 발생했는지 확인합니다.
    if (error) {
      console.error('Supabase 쿼리 에러:', error)
      return NextResponse.json(
        { success: false, error: '데이터를 조회하는 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      )
    }

    // --- 6. 최종 응답 데이터 구성 및 반환 ---
    // 조회된 데이터와 함께 페이지네이션 정보를 메타데이터로 구성하여 반환합니다.
    return NextResponse.json({
      success: true,
      data: data || [], // 데이터가 없을 경우 빈 배열 반환
      meta: {
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit),
        },
      },
    })
  } catch (error) {
    // try-catch 블록을 통해 예기치 못한 서버 내부 에러를 처리합니다.
    console.error('API 라우트 에러:', error)
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 에러가 발생했습니다.'
    return NextResponse.json(
      { success: false, error: '서버 내부 오류가 발생했습니다.', details: errorMessage },
      { status: 500 }
    )
  }
}
