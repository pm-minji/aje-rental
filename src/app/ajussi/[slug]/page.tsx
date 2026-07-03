import { Metadata } from 'next'
import { cache } from 'react'
import { redirect, notFound } from 'next/navigation'
import AjussiDetailClient, { AjussiDetailData } from './AjussiDetailClient'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import Script from 'next/script'

// 프로필/리뷰 변경이 반영되도록 캐시 수명을 60초로 제한한다.
// (클라이언트 재조회를 제거했으므로 서버 데이터가 무기한 캐시되면 스테일 고착)
export const revalidate = 60

// Direct Supabase client for metadata generation (avoids API route overhead)
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Helper type for the query result
import { AjussiWithProfile, ReviewWithDetails } from '@/types/database'

// UUID 형식 체크 (기존 URL 리다이렉트용)
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// slug 또는 id로 아저씨 정보 조회
// cache()로 감싸 generateMetadata와 페이지 본문이 같은 요청 내에서 1회만 조회한다
const getAjussiBySlugOrId = cache(async (slugOrId: string) => {
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
})

// 리뷰 포함 상세 데이터 - 서버에서 1회 조회 후 클라이언트에 initialData로 전달
// (기존에는 metadata/페이지/클라이언트가 같은 데이터를 3번 조회했다)
const getAjussiDetailData = cache(async (slugOrId: string): Promise<AjussiDetailData | null> => {
  const { ajussi } = await getAjussiBySlugOrId(slugOrId)
  if (!ajussi || !ajussi.is_active) return null

  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviewer_id (
        name,
        nickname,
        profile_image
      ),
      request:requests!request_id!inner (
        date,
        duration,
        location
      )
    `)
    .eq('request.ajussi_id', ajussi.user_id)
    .order('created_at', { ascending: false })

  if (reviewsError) {
    console.error('Error fetching reviews:', reviewsError)
  }

  const validReviews = (reviews || []) as unknown as ReviewWithDetails[]
  const averageRating = validReviews.length > 0
    ? validReviews.reduce((sum, review) => sum + review.rating, 0) / validReviews.length
    : 0

  // 클라이언트로 내려가는 데이터에는 공개 프로필 필드만 담는다 (email 등 제외)
  const publicAjussi = {
    ...ajussi,
    profiles: {
      id: ajussi.profiles?.id,
      name: ajussi.profiles?.name,
      nickname: ajussi.profiles?.nickname,
      profile_image: ajussi.profiles?.profile_image,
    },
  } as unknown as AjussiWithProfile

  return {
    ajussi: publicAjussi,
    reviews: validReviews,
    averageRating: Math.round(averageRating * 10) / 10,
    reviewCount: validReviews.length,
  }
})

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

  const initialData = await getAjussiDetailData(params.slug)

  // 비활성(is_active=false) 아저씨는 상세 데이터가 null → 404 처리.
  // (클라이언트에서 재조회 후 에러 토스트가 뜨던 문제 방지)
  if (!initialData) {
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
      ratingValue: initialData && initialData.reviewCount > 0 ? String(initialData.averageRating) : '5.0',
      reviewCount: String(initialData && initialData.reviewCount > 0 ? initialData.reviewCount : 1),
    },
  }

  return (
    <>
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AjussiDetailClient slug={params.slug} initialData={initialData} />
    </>
  )
}
