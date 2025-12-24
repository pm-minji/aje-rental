import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabase, getUser } from '@/lib/supabase'

// Vercel의 엣지 네트워크에서 동적으로 실행되도록 설정합니다.
export const dynamic = 'force-dynamic'

// --- 유효성 검사 스키마 ---
// zod를 사용하여 요청으로 들어온 데이터의 형식을 검사합니다.
// ajussiId가 UUID 형식인지 확인하여 잘못된 입력을 사전에 차단합니다.
const ajussiIdSchema = z.object({
  ajussiId: z.string().uuid({ message: "유효하지 않은 아저씨 ID 형식입니다." }),
});

/**
 * @api {post} /api/favorites
 * @description 즐겨찾기를 추가하거나 삭제하는 API (토글 방식).
 * 사용자가 특정 아저씨를 즐겨찾기 목록에 추가하거나, 이미 있다면 목록에서 제거합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // --- 1. 사용자 인증 확인 ---
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 })
    }

    // --- 2. 요청 본문 파싱 및 유효성 검사 ---
    const body = await request.json()
    const validation = ajussiIdSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    }
    const { ajussiId } = validation.data;

    // --- 3. 비즈니스 로직 검사 ---
    // 자기 자신을 즐겨찾기하는 것을 방지합니다.
    if (user.id === ajussiId) {
      return NextResponse.json({ success: false, error: '자기 자신은 즐겨찾기할 수 없습니다.' }, { status: 400 });
    }

    const supabase = await createServerSupabase()

    // --- 4. 즐겨찾기 상태 확인 및 토글 처리 ---
    // 먼저 사용자가 해당 아저씨를 이미 즐겨찾기 했는지 확인합니다.
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('ajussi_id', ajussiId)
      .single()

    if (existing) {
      // 이미 즐겨찾기 상태이면, 해당 항목을 삭제합니다.
      const { error: deleteError } = await supabase.from('favorites').delete().match({ id: existing.id });

      if (deleteError) {
        console.error('즐겨찾기 삭제 에러:', deleteError);
        return NextResponse.json({ success: false, error: '즐겨찾기 삭제 중 오류가 발생했습니다.' }, { status: 500 });
      }
      return NextResponse.json({ success: true, action: 'removed', message: '즐겨찾기에서 제거되었습니다.' });
    } else {
      // 즐겨찾기 상태가 아니면, 새로 추가합니다.
      // 먼저 대상 아저씨가 실제로 존재하는지 확인하는 방어 로직이 있으면 더 좋습니다.
      const { error: insertError } = await supabase.from('favorites').insert({ user_id: user.id, ajussi_id: ajussiId });

      if (insertError) {
        console.error('즐겨찾기 추가 에러:', insertError);
        return NextResponse.json({ success: false, error: '즐겨찾기 추가 중 오류가 발생했습니다.' }, { status: 500 });
      }
      return NextResponse.json({ success: true, action: 'added', message: '즐겨찾기에 추가되었습니다.' });
    }
  } catch (error) {
    console.error('API 라우트 에러 (POST):', error);
    return NextResponse.json({ success: false, error: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * @api {delete} /api/favorites
 * @description 특정 아저씨를 즐겨찾기에서 명시적으로 삭제하는 API.
 * POST와 기능이 유사하지만, 명시적인 삭제 요청을 처리하기 위해 존재합니다.
 */
export async function DELETE(request: NextRequest) {
  try {
    // --- 1. 사용자 인증 확인 ---
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 });
    }

    // --- 2. 쿼리 파라미터 유효성 검사 ---
    const { searchParams } = new URL(request.url)
    const ajussiId = searchParams.get('ajussiId')

    const validation = ajussiIdSchema.safeParse({ ajussiId });
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    }

    // --- 3. 데이터베이스 작업 ---
    const supabase = await createServerSupabase()
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('ajussi_id', validation.data.ajussiId)

    if (error) {
      console.error('즐겨찾기 삭제 에러 (DELETE):', error);
      return NextResponse.json({ success: false, error: '즐겨찾기 삭제 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '즐겨찾기에서 제거되었습니다.' });
  } catch (error) {
    console.error('API 라우트 에러 (DELETE):', error);
    return NextResponse.json({ success: false, error: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}

/**
 * @api {get} /api/favorites
 * @description 현재 로그인된 사용자의 전체 즐겨찾기 목록을 조회하는 API.
 */
export async function GET() {
  try {
    // --- 1. 사용자 인증 확인 ---
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 });
    }

    // --- 2. 데이터베이스 조회 ---
    const supabase = await createServerSupabase()
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        ajussi_id,
        created_at,
        ajussi_profile:ajussi_profiles (
          *,
          profiles (
            name,
            nickname,
            profile_image
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('즐겨찾기 목록 조회 에러:', error);
      return NextResponse.json({ success: false, error: '즐겨찾기 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
    }

    // --- 3. 데이터 형식 변환 및 반환 ---
    // 중첩된 프로필 정보를 더 사용하기 쉬운 형태로 가공합니다.
    const formattedData = favorites.map(fav => ({
      ajussi_id: fav.ajussi_id,
      created_at: fav.created_at,
      ...fav.ajussi_profile,
    }));

    return NextResponse.json({ success: true, data: formattedData || [] });
  } catch (error) {
    console.error('API 라우트 에러 (GET):', error);
    return NextResponse.json({ success: false, error: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}
