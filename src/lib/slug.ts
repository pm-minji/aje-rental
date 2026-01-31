import { transliterate } from 'transliteration'
import slugifyLib from 'slugify'

/**
 * 한글 텍스트를 SEO 친화적인 영문 슬러그로 변환
 * 예: "캠핑 고수 아저씨" → "camping-gosu-ajussi"
 */
export function generateSlug(text: string): string {
    // 1. 한글 → 영문 변환 (transliteration)
    const romanized = transliterate(text, { unknown: '' })

    // 2. 슬러그화 (소문자, 하이픈 구분, 특수문자 제거)
    const slug = slugifyLib(romanized, {
        lower: true,
        strict: true, // 특수문자 모두 제거
        trim: true,
    })

    return slug
}

/**
 * 중복 체크를 포함한 유니크 슬러그 생성
 * 중복 시 -2, -3 등 접미사 추가
 */
export async function generateUniqueSlug(
    text: string,
    checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
    const baseSlug = generateSlug(text)

    // 빈 슬러그 방지
    if (!baseSlug) {
        return `ajussi-${Date.now()}`
    }

    // 첫 번째 시도: 기본 슬러그
    if (!(await checkExists(baseSlug))) {
        return baseSlug
    }

    // 중복 시: 숫자 접미사 추가 (-2, -3, ...)
    let counter = 2
    while (counter < 100) { // 무한 루프 방지
        const candidateSlug = `${baseSlug}-${counter}`
        if (!(await checkExists(candidateSlug))) {
            return candidateSlug
        }
        counter++
    }

    // 극단적인 경우: 타임스탬프 추가
    return `${baseSlug}-${Date.now()}`
}

/**
 * 슬러그 유효성 검사
 */
export function isValidSlug(slug: string): boolean {
    // 영문 소문자, 숫자, 하이픈만 허용
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)
}
