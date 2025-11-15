# ✅ API 키 설정 완료

## 설정된 API 키

### 1. Artificial Analysis API
**용도**: AI 모델 성능 데이터 수집 (기능 #1)

```
ARTIFICIAL_ANALYSIS_API_KEY=aa_uInrMxtbivCXYIvoYTTfckIiYmFVJYRa
```

**사용 기능**:
- 기능 #1: 모델 성능 발전사 (타임라인)
- 기능 #6: AI 모델 업데이트 알림

**API 문서**: https://artificialanalysis.ai/

---

### 2. Naver API
**용도**: 뉴스 기사 수집 (기능 #5, #7, #9)

```
NAVER_CLIENT_ID=q1aA7IXmMiyuXuyCyXzo
NAVER_CLIENT_SECRET=97G_YlsjEK
```

**사용 기능**:
- 기능 #5: AI 이슈 지수 시각화
- 기능 #7: 뉴스 수집 및 분류
- 기능 #9: SLM 기반 뉴스 분류

**API 문서**: https://developers.naver.com/docs/search/news/

---

## 환경변수 파일 위치

### 실제 설정 파일
`C:\path\MProject14v2\.env`

⚠️ **보안 주의사항**:
- 이 파일은 Git에 커밋되지 않습니다 (`.gitignore`에 포함됨)
- API 키를 외부에 공유하지 마세요
- 프로덕션 환경에서는 환경변수를 서버에 직접 설정하세요

### 템플릿 파일
`C:\path\MProject14v2\.env.example`

---

## 추가 설정이 필요한 API

### Google OAuth (소셜 로그인)
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

**설정 방법**:
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성
3. OAuth 2.0 클라이언트 ID 생성
4. 리다이렉트 URI 설정: `http://localhost:3000/auth/google/callback`

### Kakao OAuth (소셜 로그인)
```env
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_CALLBACK_URL=http://localhost:3000/auth/kakao/callback
```

**설정 방법**:
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 생성
3. REST API 키 발급
4. 리다이렉트 URI 설정: `http://localhost:3000/auth/kakao/callback`

---

## JWT Secret (이미 생성됨)

보안을 위해 자동으로 생성된 JWT Secret이 `.env` 파일에 저장되어 있습니다:

```env
JWT_SECRET=e5f3801d41a5326adb124ba8fecaa18c6e3e73654987090e37a43f2dbade9959
JWT_REFRESH_SECRET=2894376bc1596f820435e4ab565c6b0c00fede32fd05b52958e6e7d19090128a
```

---

## API 사용 시작

### 1. Docker 환경 실행
```powershell
cd C:\path\MProject14v2
.\start.ps1
```

### 2. API 연결 테스트 (향후 백엔드 개발 시)

**Artificial Analysis API**:
```javascript
const API_KEY = process.env.ARTIFICIAL_ANALYSIS_API_KEY;
const response = await fetch('https://artificialanalysis.ai/api/v1/models', {
  headers: {
    'Authorization': `Bearer ${API_KEY}`
  }
});
```

**Naver News API**:
```javascript
const CLIENT_ID = process.env.NAVER_CLIENT_ID;
const CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const response = await fetch('https://openapi.naver.com/v1/search/news.json?query=AI', {
  headers: {
    'X-Naver-Client-Id': CLIENT_ID,
    'X-Naver-Client-Secret': CLIENT_SECRET
  }
});
```

---

## 환경변수 로드 (Node.js)

프로젝트에서 환경변수를 사용하려면:

```javascript
// 1. dotenv 패키지 설치
// npm install dotenv

// 2. 코드 최상단에 추가
require('dotenv').config();

// 3. 환경변수 사용
const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;
const naverId = process.env.NAVER_CLIENT_ID;
```

---

## 다음 단계

✅ API 키 설정 완료  
✅ 환경변수 파일 생성 완료  
✅ Docker 환경 준비 완료

🚀 **이제 백엔드 API 개발을 시작할 수 있습니다!**

다음 작업:
1. Docker 컨테이너 실행
2. MySQL 스키마 확인
3. Node.js 프로젝트 초기화
4. 기능 #1 개발 시작

---

**설정 완료일**: 2025-11-10  
**문의**: 프로젝트 채널에 질문 남겨주세요!
