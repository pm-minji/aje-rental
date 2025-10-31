import { Metadata } from 'next'
import AjussiDetailClient from './AjussiDetailClient'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/ajussi/${params.id}`)
    const result = await response.json()
    
    if (result.success) {
      const { ajussi } = result.data
      return {
        title: ajussi.title,
        description: ajussi.description.slice(0, 160),
        openGraph: {
          title: ajussi.title,
          description: ajussi.description.slice(0, 160),
          images: ajussi.profiles.profile_image ? [ajussi.profiles.profile_image] : [],
        },
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }
  
  return {
    title: '아저씨 상세정보',
    description: '아저씨의 상세 정보를 확인하고 서비스를 요청하세요.',
  }
}

export default function AjussiDetailPage({ params }: { params: { id: string } }) {
  return <AjussiDetailClient params={params} />
}