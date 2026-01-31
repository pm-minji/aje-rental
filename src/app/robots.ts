import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://ajussirental.com'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/mypage/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
