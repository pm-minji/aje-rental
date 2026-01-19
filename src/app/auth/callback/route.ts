import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const requestUrl = new URL(request.url)
        const code = requestUrl.searchParams.get('code')
        const next = requestUrl.searchParams.get('next') || '/'
        const redirect = requestUrl.searchParams.get('redirect')

        if (code) {
            const supabase = await createServerSupabase()

            const { error } = await supabase.auth.exchangeCodeForSession(code)

            if (!error) {
                // redirect 파라미터가 있으면 거기로, 없으면 next(기본값 /)로 이동
                // redirect 파라미터가 우선순위 높음 (AuthProvider에서 설정)
                const target = redirect || next
                return NextResponse.redirect(`${requestUrl.origin}${target}`)
            } else {
                console.error('Exchange code error:', error)
            }
        }

        // 에러 발생 시 에러 페이지나 홈으로 리다이렉트
        return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error`)
    } catch (error) {
        console.error('Callback route error:', error)
        return NextResponse.redirect(new URL('/', request.url))
    }
}
