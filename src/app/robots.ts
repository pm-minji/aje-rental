import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://aje-rental.vercel.app'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/mypage/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
