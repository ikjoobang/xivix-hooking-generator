# XIVIX 후킹메세지 생성기

AI를 활용한 마케팅 후킹 메시지 생성 서비스

## 배포 URL

**메인 페이지**: https://ai-hook-generator.pages.dev

## 기능

- 채널별 맞춤 후킹 메시지 생성 (블로그/스토리/릴스/게시물)
- 일일 3회 사용량 제한
- 결과물 복사하기
- TXT 파일 다운로드
- 로딩 애니메이션
- 에러 처리

## 보안 기능

- 우클릭 방지
- 개발자 도구 차단 (F12, Ctrl+Shift+I/J/C)
- 소스보기/저장/인쇄 차단 (Ctrl+U/S/P)
- 캡처 차단 (PrintScreen)
- 텍스트 선택/드래그 방지 (입력창 제외)
- API 키 노출 방지 (사용자 직접 입력 방식)

## API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/` | GET | 메인 페이지 |
| `/api/health` | GET | 서버 상태 확인 |
| `/api/generate` | POST | 후킹 메시지 생성 |

### /api/generate 요청 예시

```json
{
  "prompt": "후킹 메시지로 변환할 내용",
  "apiKey": "사용자의 Gemini API 키"
}
```

## 기술 스택

- **Backend**: Hono (Cloudflare Workers)
- **Frontend**: Tailwind CSS
- **Hosting**: Cloudflare Pages
- **AI**: Google Gemini API

## 사용 방법

1. https://ai-hook-generator.pages.dev 접속
2. 설정 버튼(⚙️) 클릭
3. Gemini API 키 입력 후 저장
4. 채널 선택 (블로그/스토리/릴스/게시물)
5. 변환할 내용 입력
6. "마법의 문장 생성하기" 클릭
7. 결과 복사 또는 TXT 다운로드

## Gemini API 키 발급

1. https://aistudio.google.com/apikey 접속
2. Google 계정 로그인
3. "Create API Key" 클릭
4. 생성된 키 복사

---

(c) 2025 XIVIX. ALL RIGHTS RESERVED.
https://xivix.kr/
