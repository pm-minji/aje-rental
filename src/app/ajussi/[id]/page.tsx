import { Metadata } from 'next'
import AjussiDetailClient from './AjussiDetailClient'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import Script from 'next/script'

// Direct Supabase client for metadata generation (avoids API route overhead)
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Helper type for the query result
import { AjussiWithProfile } from '@/types/database'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const { data } = await supabase
      .from('ajussi_profiles')
      .select(`
        *,
        profiles (
          id,
          name,
          nickname,
          profile_image,
          introduction,
          role,
          email,
          created_at,
          updated_at
        )
      `)
      .eq('id', params.id)
      .single()

    const ajussi = data as unknown as AjussiWithProfile

    if (ajussi) {
      const profileName = ajussi.profiles?.nickname || ajussi.profiles?.name || '아저씨'
      const title = `${ajussi.title} - ${profileName} | 아저씨렌탈`
      // ... rest of the code ...
      const description = ajussi.description.slice(0, 160)
      const images = ajussi.profiles?.profile_image ? [ajussi.profiles.profile_image] : []

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          images,
          type: 'profile',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images,
        },
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  return {
    title: '아저씨 상세정보',
    description: '아저씨렌탈에서 아저씨의 상세 정보를 확인하고 서비스를 요청하세요.',
  }
}

export default async function AjussiDetailPage({ params }: { params: { id: string } }) {
  // Fetch data again for JSON-LD (Next.js dedupes fetch requests automatically, 
  // but since we're using supabase-js, we might want to pass data or rely on client fetching.
  // For JSON-LD, we'll do a quick server-side fetch to ensure SEO data is present in HTML)

  const { data } = await supabase
    .from('ajussi_profiles')
    .select(`
      *,
      profiles (
        id,
        name,
        nickname,
        profile_image,
        introduction,
        role,
        email,
        created_at,
        updated_at
      )
    `)
    .eq('id', params.id)
    .single()

  const ajussi = data as unknown as AjussiWithProfile

  const jsonLd = ajussi ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: ajussi.title,
    description: ajussi.description,
    image: ajussi.profiles?.profile_image,
    offers: {
      '@type': 'Offer',
      price: ajussi.hourly_rate,
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
    },
    brand: {
      '@type': 'Brand',
      name: '아저씨렌탈',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0', // This should be dynamic based on reviews
      reviewCount: '1',  // This should be dynamic
    },
  } : null

  return (
    <>
      {jsonLd && (
        <Script
          id="product-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <AjussiDetailClient params={params} />
    </>
  )
}