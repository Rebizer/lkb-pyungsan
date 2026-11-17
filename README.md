# Razor 퍼블리싱 시작 패키지

새 프로젝트 폴더에 이 패키지의 **내용물**을 풀고 해당 폴더를 작업 프로젝트로 연다. AGENTS.md가 프로젝트 최상위에 놓여야 한다. 색상과 Figma 시안을 전달하면 제작자는 파일 생성·연결부터 실제 페이지 구현까지 수행한다. AGENTS.md 자체가 실행되는 생성기는 아니며, 프로젝트 제작 요청 시 따를 지침이다.

## 전달할 것

1. 이 패키지 전체(AGENTS.md, Views, wwwroot 및 실행 골격).
2. 사용자 지정 색상과 Figma 링크/대상 프레임.
3. 있는 경우 프로젝트 전용 reset.css, 이미지·폰트·아이콘, 별도 지시사항.

`PROJECT-SETTINGS.md`는 정리 양식이다. 같은 정보를 메시지로 전달해도 된다. 별도 reset.css가 없으면 패키지의 공통 reset을 쓰며, 색상은 사용자 제공값으로 채우고 컨테이너는 Figma에서 판단한다.

## 바로 사용할 요청문

> 첨부한 시작 패키지와 최상위 AGENTS.md를 기준으로 Razor(cshtml) 프로젝트를 만들어 주세요. 색상은 아래 제공값을 사용하고 컨테이너는 Figma의 콘텐츠 폭·정렬선·모바일 여백을 보고 판단해 주세요. reset의 공통 부분은 유지하고 default.css/default.js는 이번 디자인에 맞게 작성해 주세요. Lenis 모듈과 CSS/JS 번들을 실제 연결하고, 화면과 콘솔까지 확인해 주세요. Figma: [링크와 대상 프레임]. 색상: [변수명과 값]. 별도 지시: [내용].

## 파일 역할

| 구분 | 파일 | 처리 |
|---|---|---|
| 그대로 재사용 | wwwroot/lib의 라이브러리 | 기존 프로젝트의 버전을 보존. 임의 업그레이드 금지 |
| 기본 연결 | wwwroot/js/lenis.js | 사용자 모듈을 시작용으로 정리. type=module로 한 번 로드 |
| 공통 기반 + 설정 | wwwroot/css/reset.css | 초기화·유틸리티 재사용, 색상/폰트/컨테이너 등만 설정 |
| 프로젝트마다 작성 | default.css / default.js | 파일 위치·역할이 같고 내용은 다름 |
| 원본 목록으로 생성 | bundle.css / bundle.js | 실제 파일 제공, 원본·순서는 bundle.sources.json |
| 프로젝트마다 작성 | 헤더·푸터 partial, 페이지 cshtml/CSS/JS | Figma와 제공 콘텐츠 기준 |
| 최소 실행 골격 | csproj, Program.cs, HomeController.cs | Razor 화면 제공용. DB·인증·관리자 기능 없음 |

번들에는 공통으로 존재했던 jQuery 3.3.1, GSAP/ScrollTrigger 3.12.4, Swiper 11.0.5, toast를 포함했다. 기능별 UI를 자동으로 만들지는 않는다. 불필요한 라이브러리를 제거할 때는 참조를 확인하고 원본 목록을 변경한 뒤 번들을 다시 만든다. 라이브러리 버전은 원본 호환을 위한 것이며 최신 버전 추천이 아니다.

## 로드 순서

CSS: bundle.css → reset.css → default.css → 페이지 css section.

JS: bundle.js → lenis.js(type=module) → default.js → 페이지 scripts section. 모듈은 지연 실행되므로 바로 다음 일반 script의 최상단에서 window.lenis를 호출하지 않는다. DOM 준비 후 초기화 또는 실제 사용자 이벤트 안에서 사용한다.

Lenis 라이브러리는 기존 CDN과 같은 1.0.42를 로컬 파일로 포함했다. 네트워크 접속 없이도 모듈을 가져올 수 있다. 초기 인스턴스 생성과 RAF는 lenis.js만 담당한다. GSAP ticker에 또 등록하지 않는다.

## 실행과 번들

이 패키지의 최소 호스트는 ESC 원본 실행 정보에서 확인한 .NET 8을 대상으로 한다. 호환 SDK/ASP.NET Core 런타임이 있는 환경에서 프로젝트 폴더를 기준으로 `dotnet run --urls http://localhost:5080`을 실행한다. 기존 서버 프로젝트에 적용한다면 csproj/Program/Controller를 덮어쓰지 않고 Views·정적 파일·연결 부분을 병합한다. 실행 환경을 임의로 업그레이드하지 않는다.

번들은 미리 생성되어 있으므로 매번 만들 필요가 없다. 원본 목록을 바꾸었을 때만 PowerShell에서 `./tools/build-bundles.ps1`을 실행한다. 추가 npm 설치나 새로운 빌드 프레임워크는 필요 없다. 생성된 bundle 파일을 직접 편집하지 않는다.

기존 배포물에서 WebOptimizer 의존성과 /css/bundle.css, /js/bundle.js 연결을 확인했지만 번들 등록 소스는 제공되지 않았다. 이 패키지는 **공통 원본으로 새로 구성한 정적 번들**이며 원래 WebOptimizer 설정을 복원했다고 주장하지 않는다. 기존 WebOptimizer 설정이 있는 새 작업에는 그것을 우선한다.

## 공통 reset의 범위

초기화, 목록·링크·이미지 기본 방식, pre-line, 컨테이너 클래스와 변수 연결, 말줄임·정렬·그리드·폰트 크기/두께 유틸리티를 재사용할 기반으로 구성했다. 크기 토큰은 선택 가능한 단위표이며 특정 제목 크기를 강제하지 않는다. 색상·폰트·본문 행간·컨테이너·간격·모바일 분기점은 시안 적용 전까지 확정하지 않았다. 사용 변수는 실제 제작 시 반드시 정의한다.

기존 5개 reset의 어느 하나를 그대로 복제한 파일은 아니다. `:root`만 다른 것으로 단정할 수 없어 공통 구조와 예외를 분리했다. 다음은 새 시작 파일에 적용한 개선이며 기존 선호나 원본의 동일 동작으로 단정하지 않는다.

- 잘못된 단위 없는 letter-spacing, 존재하지 않는 input type, 중복 white-space 선언을 복제하지 않음.
- 기본 포커스 제거와 체크박스/파일 입력 전체 숨김을 제외하고 커스텀 폼은 필요한 UI에서 구현.
- 이미지 cover·링크 block 등 반복 패턴은 유지. 로고/콘텐츠 비율과 인라인 링크는 요소별 확인 필요.
- 고정 h1~h5 크기·행간, 스크롤바 장식, 체크박스·datepicker·pagination의 디자인은 전역 고정값으로 넣지 않음. 필요한 화면에서 공통 UI로 작성.
- grid의 긴 콘텐츠 넘침을 줄이기 위해 minmax(0, 1fr) 사용, align-stretch/justify-stretch 철자를 정리. 원본은 수정하지 않음.
- Lenis 공식 1.0.42 권장 CSS를 추가. 기존 smooth/smoothTouch 대신 해당 버전 API인 smoothWheel/syncTouch 사용. 처음 로드할 때 모션 감소 설정을 반영하고 ScrollTrigger가 있으면 scroll 이벤트를 연결. duration 1.5는 변경 가능한 시작값.

현재 샘플 페이지는 디자인 제작 전 연결 확인용이다. 색상·컨테이너가 채워졌거나 Figma 화면이 구현된 완성 사이트는 아니다. 원본 5개 프로젝트는 수정하지 않았다.


## 이번 패키지 검증

- 설치된 .NET 9에서 임시 복사본으로 Razor 빌드·렌더링: 경고 0, 오류 0. 배포 csproj는 net8.0을 유지했다. .NET 8 직접 실행은 해당 런타임이 없어 수행하지 않았다.
- Chromium 기반 Edge에서 CSS/JS/ES module 요청 200, jQuery·GSAP·ScrollTrigger·Swiper·toast·Lenis 로드 확인.
- Lenis 휠 이동, stop/start, 내부 data-lenis-prevent 영역, 프레임당 RAF 중복 없음, 초기 모션 감소 설정 확인.
- 시작 화면의 390px 폭에서 가로 넘침 없음, 키보드 본문 바로가기 확인. 실제 Figma 화면·기기 터치는 아직 대상 시안이 없어 검증하지 않았다.
- 원본 프로젝트에서 기록한 1,089개 파일의 해시 일치. 패키지의 복사 라이브러리 6개는 원본 바이트 유지.

Codex의 최상위 규칙 파일 탐색은 [공식 AGENTS.md 안내](https://learn.chatgpt.com/docs/agent-configuration/agents-md)를 참고한다. 하위 폴더의 별도 규칙이나 작업 지시가 있으면 함께 확인해야 한다.
