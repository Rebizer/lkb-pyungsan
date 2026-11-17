# LKB평산 퍼블리싱

- 디자인: https://www.figma.com/design/J6X7o3J1JMefIX8J4wq5dT?node-id=1175-11045
- 파일 세션: 2f2d0611-277d-40d7-a214-1a7c847f4a58
- 19개 화면: 메인, 법인소개, 오시는길, 구성원, 구성원 상세, 분야별, 분야 상세, 지역별, 지역 상세, 센터별, 센터 상세, 업무사례, 사례 상세, 법인소식, 소식 상세, 자료실, 미디어, 상담하기, 통합검색.
- 사용자 지시 우선: 색상은 Figma styles에서 확인. 패키지의 별도 색상 제공 조건 대신 적용.
- primary #00427F, primary-300 #C4D7E4, primary-100 #F2F5F9, title/bg_dark #1F2933, text #4B5563, placeholder #9CA3AF, line #D9D9D9, gray-100 #F2F2F2, white #FFFFFF.
- Pretendard / PC 1920px 기준, 일반 콘텐츠 폭 1400px, 메인 1620px.
- 컨테이너 외곽: 1448 / 1668px (좌우 24px 패딩 포함).
- PC 원본 프레임만 제공되어 모바일은 767px 이하에서 재배치. 1100/1400/1700에서 실제 콘텐츠 폭에 맞게 조정.
- .NET SDK 9.0.203 / ASP.NET 9.0.4만 설치되어 최소 호스트 target을 net9.0으로 변경. 원본 Razor 구조 유지.
- DB·외부 데이터·실제 상담 접수 없음. 상세 페이지는 유형별 대표 1개.
- 공식 SNS(유튜브·블로그·인스타그램·페이스북)는 사용자 제공 주소로 푸터와 전체 메뉴에 연결. 카카오톡/기사 원문/PDF는 정확한 URL·원본 미제공 항목에 안내 표시.
- 상담 입력은 전송/저장하지 않음. VCF는 시안 프로필로 생성.
- 공통 헤더와 퀵메뉴: Views/Shared/Common/_HeaderNavBar.cshtml. 푸터: _Footer.cshtml.
- 메타: 각 cshtml의 meta/ogtags section. Schema.org JSON-LD는 _Schema.cshtml.
- canonical/OG/sitemap URL은 요청 origin 기반. 운영 배포 시 신뢰하는 실제 도메인으로 고정 권장.
- 예시 날짜 26-00-00은 시안 표시만 유지. 날짜·통계·성과는 운영 검수 전 예시이며 JSON-LD 날짜로 사용하지 않음.
- 원본 명세: design-reference/*.txt. 원본 에셋: wwwroot/images.

이미지 이름: 아이콘은 images/icon/*_icon.svg, 로고는 images/brand/, 사진·배경은 메뉴별 폴더에서 관리합니다. 이전 경로 대응표는 design-reference/asset-path-map.json, 사용하지 않는 원본을 포함한 이전 파일은 design-reference/source-assets-before-rename.zip에 보관합니다.
