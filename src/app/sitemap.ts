import { glob } from 'glob'
import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://ajussirental.com'

    // 1. 파일 시스템에서 정적 페이지 자동 스캔
    // src/app/**/page.tsx 패턴으로 찾음
    const pages = await glob('src/app/**/page.tsx', {
        cwd: process.cwd(),
        ignore: [
            'src/app/api/**',        // API 라우트 제외
            'src/app/admin/**',      // 관리자 페이지 제외
            'src/app/mypage/**',     // 마이 페이지 제외
            'src/app/auth/**',       // 인증 페이지 제외 (로그인은 별도 처리 원할 시)
            'src/app/**/[*]/**',     // 동적 라우트 제외 (별도 로직으로 처리)
            'src/app/layout.tsx',    // 레이아웃 제외
            'src/app/not-found.tsx', // 404 제외
            'src/app/error.tsx',     // 에러 페이지 제외
        ]
    })

    // 2. 파일 경로를 URL로 변환
    const staticRoutes: MetadataRoute.Sitemap = pages.map((page) => {
        const path = page
            .replace('src/app', '')
            .replace('/page.tsx', '')
            .replace('/page.js', '')

        const routeUrl = path === '' ? baseUrl : `${baseUrl}${path}`

        // 우선순위 자동 설정 (메인: 1.0, 그 외: 0.8)
        const priority = path === '' ? 1.0 : 0.8

        return {
            url: routeUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: priority,
        }
    })

    // 로그인 페이지 등 특정 페이지 수동 추가 필요시 병합 가능
    // (현재는 glob 패턴에서 제외했으므로 필요하면 ignore 목록 조절)

    // Anonymous Supabase client
    const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // ... 아저씨 동적 라우트 로직 ...

    // 아저씨 상세 페이지들 (동적 생성 - slug 기반)
    try {
        const { data: ajussis } = await supabase
            .from('ajussi_profiles')
            .select('slug, updated_at')
            .eq('is_active', true)
            .not('slug', 'is', null)
            .order('updated_at', { ascending: false })

        if (ajussis) {
            const ajussiRoutes = (ajussis as { slug: string; updated_at: string }[]).map((ajussi) => ({
                url: `${baseUrl}/ajussi/${ajussi.slug}`,
                lastModified: new Date(ajussi.updated_at),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }))

            return [...staticRoutes, ...ajussiRoutes]
        }
    } catch (error) {
        console.error('Error generating sitemap:', error)
    }

    return staticRoutes
}
