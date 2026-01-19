import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Search,
  MessageCircle,
  Calendar,
  CheckCircle,
  Star,
  Shield,
  AlertTriangle,
  Phone,
  Mail
} from 'lucide-react'

export default function GuidePage() {
  return (
    <>
      <PageHeader
        title="이용 가이드"
        description="아저씨렌탈 서비스를 안전하고 효과적으로 이용하는 방법을 알아보세요"
        breadcrumbs={[
          { label: '이용 가이드' }
        ]}
      />

      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* How it works */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">서비스 이용 절차</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardBody>
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">1. 아저씨 찾기</h3>
                  <p className="text-sm text-gray-600">
                    전문 분야, 지역, 가격대를 비교하여<br />나에게 딱 맞는 아저씨를 찾으세요.
                  </p>
                </CardBody>
              </Card>

              <Card className="text-center">
                <CardBody>
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">2. 사전 문의</h3>
                  <p className="text-sm text-gray-600">
                    오픈채팅으로 일정과 가능 여부를<br />미리 협의하면 매칭 확률이 높아집니다.
                  </p>
                </CardBody>
              </Card>

              <Card className="text-center">
                <CardBody>
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">3. 안전 결제</h3>
                  <p className="text-sm text-gray-600">
                    첫 1시간 요금을 플랫폼에서 선결제하여<br />안전하게 예약을 확정하세요.
                  </p>
                </CardBody>
              </Card>

              <Card className="text-center">
                <CardBody>
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">4. 만남 및 연장</h3>
                  <p className="text-sm text-gray-600">
                    약속 장소에서 만나 서비스를 이용하고,<br />추가 시간은 현장에서 직거래하세요.
                  </p>
                </CardBody>
              </Card>
            </div>
          </section>

          {/* Safety Guidelines */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">안전 및 신뢰 가이드</h2>
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Shield className="h-6 w-6 text-green-500 mr-2" />
                  <h3 className="text-lg font-semibold">모두가 행복한 거래를 위한 약속</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Badge variant="success" size="sm">필수</Badge>
                    <div>
                      <h4 className="font-medium">공개된 장소에서 첫 만남</h4>
                      <p className="text-sm text-gray-600">
                        카페, 스터디룸, 공원 등 밝고 개방된 장소에서 만남을 시작하세요.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Badge variant="success" size="sm">중요</Badge>
                    <div>
                      <h4 className="font-medium">상호 존중과 매너</h4>
                      <p className="text-sm text-gray-600">
                        서로를 "아저씨", "회원님" 등으로 호칭하며 예의를 지켜주세요.<br />
                        무리한 요구, 폭언, 성희롱 등은 계정 영구 정지 및 법적 조치의 대상이 됩니다.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Badge variant="info" size="sm">팁</Badge>
                    <div>
                      <h4 className="font-medium">명확한 업무 범위 합의</h4>
                      <p className="text-sm text-gray-600">
                        사전 문의 시 어떤 도움이 필요한지 명확히 협의하면 만족도가 높아집니다.
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">자주 묻는 질문</h2>
            <div className="space-y-4">
              <Card>
                <CardBody>
                  <h3 className="font-semibold mb-2">Q. 서비스 요금 체계가 어떻게 되나요?</h3>
                  <p className="text-gray-600">
                    기본 1시간 요금은 예약 확정을 위해 플랫폼에서 선결제합니다.<br />
                    이후 추가되는 시간이나 별도 비용(식대, 재료비 등)은 현장에서 아저씨와 직접 협의하여 정산하시면 됩니다.
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h3 className="font-semibold mb-2">Q. 예약을 취소하고 싶어요. 환불되나요?</h3>
                  <p className="text-gray-600">
                    아저씨의 일정 보호를 위해 취소 시점에 따라 위약금이 발생할 수 있습니다.<br />
                    - 이용 24시간 전: 100% 환불<br />
                    - 이용 당일 취소: 환불 불가<br />
                    자세한 내용은 마이페이지 의뢰 관리에서 확인 가능합니다.
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h3 className="font-semibold mb-2">Q. 검증된 아저씨인가요?</h3>
                  <p className="text-gray-600">
                    네, 아저씨렌탈의 모든 전문가는 실명, 생년월일, 연락처 등 신원 인증을 거칩니다.<br />
                    또한 관리자의 1:1 승인 절차를 통과한 분들만 활동할 수 있어 안심하셔도 됩니다.
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h3 className="font-semibold mb-2">Q. 어떤 도움도 요청할 수 있나요?</h3>
                  <p className="text-gray-600">
                    법적, 도덕적으로 문제가 없는 범위 내에서 다양한 생활 도움을 요청할 수 있습니다.<br />
                    단, 불법 행위, 유흥 관련, 전문 의료 행위 등은 엄격히 금지됩니다.
                  </p>
                </CardBody>
              </Card>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">고객 지원</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardBody>
                  <div className="flex items-center mb-4">
                    <MessageCircle className="h-6 w-6 text-primary mr-3" />
                    <div>
                      <h3 className="font-semibold">온라인 고객센터</h3>
                      <p className="text-gray-600">평일 10:00 - 18:00</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    서비스 이용 중 궁금한 점이나 불편사항이 있으시면<br />
                    언제든지 문의 남겨주세요.
                  </p>
                  <a href="#" className="text-primary hover:underline font-medium text-sm">
                    1:1 문의하기 &rarr;
                  </a>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="flex items-center mb-4">
                    <Mail className="h-6 w-6 text-primary mr-3" />
                    <div>
                      <h3 className="font-semibold">제휴 및 사업 문의</h3>
                      <p className="text-gray-600">joon@pm-minji.com</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    기업 단체 강연이나 제휴 제안은 이메일로 보내주시면<br />
                    담당자 확인 후 연락드리겠습니다.
                  </p>
                </CardBody>
              </Card>
            </div>
          </section>
        </div>
      </Container>
    </>
  )
}