import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
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
        description="나의아저씨 서비스를 안전하고 효과적으로 이용하는 방법을 알아보세요"
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
                <CardContent>
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">1. 아저씨 찾기</h3>
                  <p className="text-sm text-gray-600">
                    지역, 서비스 종류, 요금 등으로 원하는 아저씨를 검색하세요
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent>
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">2. 오픈채팅 문의</h3>
                  <p className="text-sm text-gray-600">
                    서비스 요청 전 오픈채팅으로 가능 여부를 먼저 확인하세요
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent>
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">3. 공식 요청</h3>
                  <p className="text-sm text-gray-600">
                    날짜, 시간, 장소 등을 정하여 공식적으로 서비스를 요청하세요
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent>
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">4. 서비스 완료</h3>
                  <p className="text-sm text-gray-600">
                    서비스 이용 후 리뷰를 남겨 다른 사용자들에게 도움을 주세요
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Safety Guidelines */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">안전 수칙</h2>
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Shield className="h-6 w-6 text-green-500 mr-2" />
                  <h3 className="text-lg font-semibold">안전한 만남을 위한 가이드라인</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Badge variant="success" size="sm">필수</Badge>
                    <div>
                      <h4 className="font-medium">공개된 장소에서 만나기</h4>
                      <p className="text-sm text-gray-600">
                        카페, 공원, 쇼핑몰 등 사람들이 많은 공개된 장소에서 만나세요.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Badge variant="success" size="sm">필수</Badge>
                    <div>
                      <h4 className="font-medium">사전 오픈채팅 문의</h4>
                      <p className="text-sm text-gray-600">
                        공식 요청 전에 오픈채팅으로 서비스 가능 여부와 세부사항을 확인하세요.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Badge variant="info" size="sm">권장</Badge>
                    <div>
                      <h4 className="font-medium">지인에게 일정 공유</h4>
                      <p className="text-sm text-gray-600">
                        만남 일정과 장소를 가족이나 친구에게 미리 알려두세요.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Badge variant="warning" size="sm">주의</Badge>
                    <div>
                      <h4 className="font-medium">개인정보 보호</h4>
                      <p className="text-sm text-gray-600">
                        주소, 전화번호 등 민감한 개인정보는 함부로 공유하지 마세요.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">자주 묻는 질문</h2>
            <div className="space-y-4">
              <Card>
                <CardContent>
                  <h3 className="font-semibold mb-2">Q. 서비스 요금은 어떻게 결제하나요?</h3>
                  <p className="text-gray-600">
                    현재는 현장에서 직접 결제하는 방식입니다. 향후 온라인 결제 시스템을 도입할 예정입니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <h3 className="font-semibold mb-2">Q. 서비스를 취소하고 싶어요.</h3>
                  <p className="text-gray-600">
                    서비스 시작 24시간 전까지는 무료로 취소 가능합니다. 마이페이지의 의뢰 관리에서 취소할 수 있습니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <h3 className="font-semibold mb-2">Q. 아저씨가 되려면 어떻게 해야 하나요?</h3>
                  <p className="text-gray-600">
                    회원가입 후 마이페이지에서 &apos;아저씨 되기&apos;를 클릭하여 프로필을 작성하시면 됩니다. 
                    간단한 심사 과정을 거쳐 승인됩니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <h3 className="font-semibold mb-2">Q. 문제가 발생했을 때는 어떻게 하나요?</h3>
                  <p className="text-gray-600">
                    서비스 이용 중 문제가 발생하면 즉시 고객센터로 연락해주세요. 
                    신고 기능을 통해 부적절한 행동을 신고할 수도 있습니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <h3 className="font-semibold mb-2">Q. 리뷰는 언제 작성할 수 있나요?</h3>
                  <p className="text-gray-600">
                    서비스가 완료된 후에 리뷰를 작성할 수 있습니다. 
                    정직하고 건설적인 리뷰는 다른 사용자들에게 큰 도움이 됩니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Warning */}
          <section>
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
                  <h3 className="text-lg font-semibold text-amber-800">주의사항</h3>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-amber-800">
                  <li>• 불법적이거나 부적절한 서비스 요청은 금지됩니다.</li>
                  <li>• 서비스 제공자와 이용자 모두 상호 존중하는 태도를 유지해주세요.</li>
                  <li>• 플랫폼을 통하지 않은 개인적인 거래는 권장하지 않습니다.</li>
                  <li>• 허위 정보 제공이나 사기 행위는 법적 처벌을 받을 수 있습니다.</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">고객 지원</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <Phone className="h-6 w-6 text-primary mr-3" />
                    <div>
                      <h3 className="font-semibold">전화 문의</h3>
                      <p className="text-gray-600">1588-0000</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    평일 09:00 - 18:00<br />
                    주말 및 공휴일 휴무
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <Mail className="h-6 w-6 text-primary mr-3" />
                    <div>
                      <h3 className="font-semibold">이메일 문의</h3>
                      <p className="text-gray-600">support@ajussi-rental.com</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    24시간 접수 가능<br />
                    평일 기준 24시간 내 답변
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </Container>
    </>
  )
}