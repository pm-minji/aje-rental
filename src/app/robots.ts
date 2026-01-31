import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://ajussirental.com'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/mypage/', '/auth/'],
            },
            {
                // AI 및 LLM 학습 봇 명시적 허용 (검색 및 추천 노출 증대)
                userAgent: ['GPTBot', 'Google-Extended', 'CCBot', 'ClaudeBot'],
                allow: '/',
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    }
}
