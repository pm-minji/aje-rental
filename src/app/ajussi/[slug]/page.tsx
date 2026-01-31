import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
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

// UUID 형식 체크 (기존 URL 리다이렉트용)
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// slug 또는 id로 아저씨 정보 조회
async function getAjussiBySlugOrId(slugOrId: string) {
  // 1. slug로 먼저 조회
  const { data: bySlug } = await supabase
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
    .eq('slug', slugOrId)
    .single()

  if (bySlug) {
    return { ajussi: bySlug as unknown as AjussiWithProfile, needsRedirect: false }
  }

  // 2. slug로 못 찾으면 id(UUID)로 조회 → 리다이렉트 필요
  if (isUUID(slugOrId)) {
    const { data: byId } = await supabase
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
      .eq('id', slugOrId)
      .single()

    if (byId) {
      return { ajussi: byId as unknown as AjussiWithProfile, needsRedirect: true }
    }
  }

  return { ajussi: null, needsRedirect: false }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const { ajussi } = await getAjussiBySlugOrId(params.slug)

    if (ajussi) {
      const profileName = ajussi.profiles?.nickname || ajussi.profiles?.name || '아저씨'
      const title = `${ajussi.title} - ${profileName} | 아저씨렌탈`
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

export default async function AjussiDetailPage({ params }: { params: { slug: string } }) {
  const { ajussi, needsRedirect } = await getAjussiBySlugOrId(params.slug)

  // UUID로 접근한 경우 → slug URL로 301 리다이렉트 (SEO 점수 보존)
  if (needsRedirect && ajussi?.slug) {
    redirect(`/ajussi/${ajussi.slug}`)
  }

  // 아저씨를 찾지 못한 경우
  if (!ajussi) {
    notFound()
  }

  const jsonLd = {
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
      ratingValue: '5.0', // TODO: 리뷰 데이터에서 동적으로 계산
      reviewCount: '1',
    },
  }

  return (
    <>
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AjussiDetailClient slug={params.slug} />
    </>
  )
}