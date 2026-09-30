/** Values displayed here are public merchant disclosures, never payment credentials. */
export default function BusinessInformation() {
  const fields = [
    ['상호', process.env.MERCHANT_BUSINESS_NAME],
    ['대표자', process.env.MERCHANT_REPRESENTATIVE_NAME],
    ['사업자등록번호', process.env.MERCHANT_BUSINESS_NUMBER],
    ['사업장 주소', process.env.MERCHANT_BUSINESS_ADDRESS],
    ['통신판매업 신고번호', process.env.MERCHANT_MAIL_ORDER_NUMBER],
    ['고객센터 전화', process.env.MERCHANT_SUPPORT_PHONE],
  ].filter(([, value]) => value?.trim())

  if (fields.length === 0) return null

  return (
    <section aria-label="사업자 정보" className="mt-6 border-t border-gray-200 pt-6 text-sm text-gray-600">
      <dl className="flex flex-wrap gap-x-6 gap-y-2">
        {fields.map(([label, value]) => (
          <div key={label} className={label === '사업장 주소' ? 'w-full' : ''}>
            <dt className="inline font-medium">{label}: </dt>
            <dd className="inline break-words">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2">
        고객문의: <a href="mailto:joon@pm-minji.com" className="hover:underline">joon@pm-minji.com</a>
      </p>
    </section>
  )
}
