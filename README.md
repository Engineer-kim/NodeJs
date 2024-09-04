NodeJS & ExpressJs 를 이용한 주문및상품 조회(추가) 쇼핑몰 토이프로젝트

사용 기술: 
- 프레임워크: ExpressJs
- ORM: Sequelize
- Ejs
- 사용DB: mysql -> MongDb 로 DB 변경 (ORM: Mongoose 사용)
- 인증 , 인가 처리 
- 로그인 , 회원가입 기능 (몽고 db Session Connector 사용)
- 결제 기능(Strip 통한 결제 기능   ,  https://docs.stripe.com/dashboard/basics)
- 회원가입 및 상품 등록시 인풋들에 대한 validation 기능 추가(express validator 사용)
- 페이지네이션 기능 추가
- 결제 청구서 pdf 형식 문서 다운로드및 생성 로직 추가 (참고: https://pdfkit.org/)
- 비밀번호 초기화시 가입한 이메일로 송신및 변경 로직 (사용: https://mailtrap.io/ )