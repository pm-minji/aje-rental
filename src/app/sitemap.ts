import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://aje-rental.vercel.app'

    // Anonymous Supabase client
    const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 기본 페이지들
    const routes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/ajussi`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/guide`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/auth/login`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ]

    // 아저씨 상세 페이지들 (동적 생성)
    try {
        const { data: ajussis } = await supabase
            .from('ajussi_profiles')
            .select('id, updated_at')
            .eq('is_active', true)
            .order('updated_at', { ascending: false })

        if (ajussis) {
            const ajussiRoutes = ajussis.map((ajussi) => ({
                url: `${baseUrl}/ajussi/${ajussi.id}`,
                lastModified: new Date(ajussi.updated_at),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }))

            return [...routes, ...ajussiRoutes]
        }
    } catch (error) {
        console.error('Error generating sitemap:', error)
    }

    return routes
}
