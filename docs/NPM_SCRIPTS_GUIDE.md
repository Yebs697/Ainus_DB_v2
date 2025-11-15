# NPM 스크립트 사용 가이드

**작성일**: 2025-11-15  
**버전**: 1.0  
**파일**: `package.json`

---

## 개요

Ainus 프로젝트의 모든 NPM 스크립트를 설명합니다. 각 스크립트의 목적, 사용법, 예상 출력을 포함합니다.

---

## 목차

1. [개발 및 빌드](#1-개발-및-빌드)
2. [데이터 수집](#2-데이터-수집)
3. [데이터베이스 관리](#3-데이터베이스-관리)
4. [파이프라인](#4-파이프라인)
5. [테스트](#5-테스트)

---

## 1. 개발 및 빌드

### 1.1. npm run dev
**목적**: 개발 서버 실행 (핫 리로드)

```bash
npm run dev
```

**실행 파일**: `src/index.ts`  
**도구**: nodemon + ts-node

**동작**:
- TypeScript 파일을 실시간으로 감지
- 파일 변경 시 자동 재시작
- 브라우저 새로고침 없이 개발 가능

**예상 출력**:
```
[nodemon] 3.1.10
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: ts,json
[nodemon] starting `ts-node src/index.ts`
Server is running on port 3000
Database connected successfully
```

**사용 시기**: 백엔드 API 개발 중

---

### 1.2. npm run build
**목적**: TypeScript → JavaScript 컴파일

```bash
npm run build
```

**도구**: tsc (TypeScript Compiler)  
**출력 디렉토리**: `dist/`

**동작**:
- `tsconfig.json` 설정 기반 컴파일
- 타입 체크 수행
- JavaScript 파일 생성

**예상 출력**:
```
Compiled successfully.
dist/
├── index.js
├── config/
├── services/
└── routes/
```

**사용 시기**: 프로덕션 배포 전

---

### 1.3. npm start
**목적**: 프로덕션 서버 실행

```bash
npm start
```

**실행 파일**: `dist/index.js` (빌드된 파일)

**전제조건**: `npm run build` 먼저 실행

**동작**:
- 컴파일된 JavaScript 실행
- 프로덕션 환경 설정 사용

**사용 시기**: 프로덕션 배포 시

---

## 2. 데이터 수집

### 2.1. npm run collect:aa
**목적**: Artificial Analysis API 데이터 수집

```bash
npm run collect:aa
```

**실행 파일**: `src/services/collectors/artificialAnalysis.collector.ts`

**API 요구사항**:
- `.env`에 `ARTIFICIAL_ANALYSIS_API_KEY` 설정 필요

**수집 데이터**:
- AI 모델 정보 (326개)
- 제공사 정보 (32개)
- 벤치마크 점수 (3,616개)
- 가격 정보
- 성능 지표

**예상 출력**:
```
Fetching models from Artificial Analysis API...
✅ Successfully fetched 326 models
✅ Successfully fetched 32 creators
📊 Total evaluations: 3,616
💾 Data saved to: data/raw/artificial_analysis_models_2025-11-15.json
```

**주의사항**:
- API Rate Limiting 존재
- 하루 100회 제한 (Free Tier)

---

### 2.2. npm run collect:naver
**목적**: 네이버 뉴스 API 데이터 수집

```bash
npm run collect:naver
```

**실행 파일**: `src/services/collectors/naver.collector.ts`

**API 요구사항**:
- `.env`에 `NAVER_CLIENT_ID` 설정
- `.env`에 `NAVER_CLIENT_SECRET` 설정

**수집 데이터**:
- AI 관련 뉴스 기사
- 제목, 링크, 발행일, 요약

**예상 출력**:
```
Fetching news from Naver API...
Query: AI 인공지능
✅ Collected 100 articles
💾 Saved to: data/raw/naver_news_ai_2025-11-15.json
```

**수집 쿼리**:
- "AI 인공지능"
- "ChatGPT"
- "생성형 AI"
- "머신러닝"

---

### 2.3. npm run collect:trends
**목적**: Google Trends 데이터 수집

```bash
npm run collect:trends
```

**실행 파일**: `src/services/collectors/trends.collector.ts`  
**언어**: Python (scripts/collect_trends.py)

**수집 데이터**:
- AI 관련 검색 트렌드
- 키워드별 관심도 변화
- 지역별 데이터

**예상 출력**:
```
Fetching Google Trends data...
Keywords: ['AI', 'ChatGPT', 'Gemini', 'Claude']
Region: KR (South Korea)
Time range: Last 7 days
✅ Trend data collected successfully
💾 Saved to: data/raw/trends_2025-11-15.json
```

---

### 2.4. npm run collect:test
**목적**: 데이터 수집 테스트

```bash
npm run collect:test
```

**실행 파일**: `src/test/dataCollection.test.ts`

**동작**:
- API 연결 테스트
- 데이터 형식 검증
- 에러 핸들링 테스트

**사용 시기**: 
- 새 API 추가 시
- API 키 변경 후
- 디버깅 필요 시

---

## 3. 데이터베이스 관리

### 3.1. npm run db:init
**목적**: 데이터베이스 초기화 (구버전)

```bash
npm run db:init
```

**실행 파일**: `scripts/initDatabase.ts`

**주의**: 
- **사용 권장 안 함**
- `db:init:integrated` 사용 권장

**동작**:
- 11개 테이블 생성 (구버전 스키마)

---

### 3.2. npm run db:init:integrated (추천)
**목적**: 통합 스키마 초기화v2 기준 최신

```bash
npm run db:init:integrated
```

**실행 파일**: `scripts/initIntegratedDatabase.ts`

**동작**:
- 30개 테이블 생성
- 외래키 관계 설정
- 인덱스 생성

**예상 출력**:
```
🔧 Initializing Integrated Database Schema...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Connecting to MySQL...
✅ MySQL connection established

Step 2: Creating tables...
✅ SECTION 1: Job Categories (2 tables)
✅ SECTION 2: Users & Auth (3 tables)
✅ SECTION 3: AI Models (6 tables)
✅ SECTION 4: Model Updates (2 tables)
✅ SECTION 5: AI Issue Index (3 tables)
✅ SECTION 6: News & Tags (3 tables)
✅ SECTION 7: Community (4 tables)
✅ SECTION 8: User Interests (4 tables)
✅ SECTION 9: Mappings & Cache (2 tables)
✅ SECTION 10: Logs (1 table)

Total tables created: 30

Step 3: Verifying schema...
✅ All tables created successfully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Database initialization complete!
```

**주의사항**:
- 기존 데이터 삭제 안 함 (IF NOT EXISTS)
- 이미 테이블이 있으면 스킵

---

### 3.3. npm run db:reset
**목적**: 데이터베이스 완전 초기화 (위험)(만약 실행 시 npm run db:init:integrated도 실행)

```bash
npm run db:reset
```

**실행 파일**: `scripts/resetDatabase.ts`

**경고**: 
```
⚠️  WARNING: This will DELETE ALL DATA!
⚠️  Are you sure? (yes/no):
```

**동작**:
1. 모든 테이블 DROP
2. 30개 테이블 재생성
3. 모든 데이터 삭제

**사용 시기**:
- 개발 환경 초기화
- 테스트 데이터 정리
- 스키마 변경 후 재생성

**주의사항**:
- **프로덕션에서 절대 사용 금지**
- 백업 없이 실행하지 말 것

---

### 3.4. npm run db:check
**목적**: 데이터베이스 상태 확인

```bash
npm run db:check
```

**실행 파일**: `scripts/checkDatabase.ts`

**예상 출력**:
```
========================================
DATABASE STATUS CHECK
========================================

📊 Connection Status:
✅ MySQL: Connected
✅ Host: localhost:3307
✅ Database: ai_model_app

📋 Total Tables: 30

📊 Table Statistics:
╔═══════════════════════════════════╤═══════════╗
║ Table Name                        │ Row Count ║
╠═══════════════════════════════════╪═══════════╣
║ model_creators                    │        32 ║
║ ai_models                         │       326 ║
║ model_evaluations                 │     3,616 ║
║ model_overall_scores              │       326 ║
║ model_pricing                     │       326 ║
║ model_performance                 │       326 ║
║ users                             │         0 ║
║ community_posts                   │         0 ║
║ ... (24 more tables)              │           ║
╚═══════════════════════════════════╧═══════════╝

💾 Total Records: 4,952
```

**사용 시기**: 
- 매일 작업 시작 전
- 데이터 수집 후 확인
- 문제 발생 시 진단

---

### 3.5. npm run db:check:tables
**목적**: 테이블 목록만 출력

```bash
npm run db:check:tables
```

**예상 출력**:
```
Tables in ai_model_app:

 1. job_categories
 2. job_occupations
 3. users
 4. user_profiles
 5. user_sessions
 6. model_creators
 7. ai_models
 8. model_evaluations
 9. model_overall_scores
10. model_pricing
... (20 more)

Total: 30 tables
```

---

### 3.6. npm run db:check:count
**목적**: 테이블별 레코드 수만 출력

```bash
npm run db:check:count
```

**예상 출력**:
```
Record Count by Table:

model_creators         :     32
ai_models              :    326
model_evaluations      :  3,616
model_overall_scores   :    326
model_pricing          :    326
model_performance      :    326
users                  :      0
... (23 more)

Total Records: 4,952
```

---

### 3.7. npm run db:check:models
**목적**: AI 모델 목록 출력

```bash
npm run db:check:models
```

**예상 출력**:
```
AI Models (326 total):

ID                                   | Name                          | Creator
-------------------------------------|-------------------------------|-------------
abc123...                            | GPT-5 Codex (high)           | OpenAI
def456...                            | GPT-5 (high)                 | OpenAI
ghi789...                            | Kimi K2 Thinking             | Moonshot AI
... (323 more)
```

---

### 3.8. npm run db:check:top
**목적**: 상위 모델 출력 (overall_score 기준)

```bash
npm run db:check:top
```

**예상 출력**:
```
Top 10 AI Models (by Overall Score):

Rank | Model Name                          | Creator     | Score
-----|-------------------------------------|-------------|-------
  1  | GPT-5 Codex (high)                 | OpenAI      | 76.08
  2  | GPT-5 (high)                       | OpenAI      | 75.59
  3  | Kimi K2 Thinking                   | Moonshot AI | 74.99
  4  | Grok 4                             | xAI         | 74.16
  5  | GPT-5 (medium)                     | OpenAI      | 73.02
  6  | O3                                 | OpenAI      | 72.77
  7  | GPT-5 mini (high)                  | OpenAI      | 72.10
  8  | Claude 4.5 Sonnet (Reasoning)      | Anthropic   | 71.13
  9  | Grok 4 Fast (Reasoning)            | xAI         | 70.49
 10  | gpt-oss-128B (high)                | OpenAI      | 69.94
```

**사용 시기**:
- 데이터 수집 후 검증
- 점수 계산 확인
- 랭킹 확인

---

### 3.9. npm run db:check:describe
**목적**: 특정 테이블 구조 출력

```bash
npm run db:check:describe
# 프롬프트: Enter table name: ai_models
```

**예상 출력**:
```
Table Structure: ai_models

Field              | Type          | Null | Key | Default | Extra
-------------------|---------------|------|-----|---------|-------
model_id           | varchar(36)   | NO   | PRI | NULL    |       
model_name         | varchar(150)  | NO   |     | NULL    |       
model_slug         | varchar(150)  | NO   | UNI | NULL    |       
creator_id         | varchar(36)   | NO   | MUL | NULL    |       
release_date       | date          | YES  |     | NULL    |       
model_type         | varchar(50)   | YES  |     | NULL    |       
parameter_size     | varchar(50)   | YES  |     | NULL    |       
context_length     | int           | YES  |     | NULL    |       
is_open_source     | tinyint(1)    | YES  |     | 0       |       
is_active          | tinyint(1)    | YES  |     | 1       |       
raw_data           | json          | YES  |     | NULL    |       
created_at         | datetime      | YES  |     | CURRENT_TIMESTAMP |       
updated_at         | datetime      | YES  |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP
```

**사용 시기**:
- 테이블 구조 확인
- 컬럼 타입 확인
- 인덱스 확인

---

## 4. 파이프라인

### 4.1. npm run pipeline:aa
**목적**: Artificial Analysis 전체 파이프라인 실행

```bash
npm run pipeline:aa
```

**실행 파일**: `src/pipelines/artificialAnalysisPipeline.ts`

**동작 순서**:
1. API 데이터 수집 (326개 모델)
2. MySQL 연결
3. 제공사 데이터 저장
4. 모델 데이터 저장
5. 벤치마크 점수 저장
6. 가격/성능 정보 저장
7. 종합 점수 계산 (6개 지수)
8. 통계 출력

**예상 출력**:
```
======================================================================
ARTIFICIAL ANALYSIS PIPELINE START
======================================================================
시작 시간: 2025-11-15 12:00:00

Step 1: API 데이터 수집
----------------------------------------------------------------------
Fetching models from Artificial Analysis API...
✅ 326개 모델 수집 완료

Step 2: 데이터베이스 연결
----------------------------------------------------------------------
✅ MySQL 연결 완료

Step 3: 모델 데이터 저장
----------------------------------------------------------------------
Saving creators... ✅ 32개 저장
Saving models... ✅ 326개 저장
Saving evaluations... ✅ 3,616개 저장
Saving pricing... ✅ 326개 저장
Saving performance... ✅ 326개 저장
✅ 모델 데이터 저장 완료

Step 4: 종합 점수 계산
----------------------------------------------------------------------
326개 모델의 점수 계산 중...

  진행: 50/326...
  진행: 100/326...
  진행: 150/326...
  진행: 200/326...
  진행: 250/326...
  진행: 300/326...

점수 계산 완료:
  성공: 326개
  실패: 0개
✅ 종합 점수 계산 완료

Step 5: 저장된 데이터 통계
----------------------------------------------------------------------
모델 통계:
  제공사: 32개
  모델: 326개
  벤치마크 점수: 3,616개

점수 통계:
  평균 점수: 45.23
  최고 점수: 76.08
  최저 점수: 12.34

상위 10개 모델:
  1. GPT-5 Codex (high) (OpenAI) - 76.08점
  2. GPT-5 (high) (OpenAI) - 75.59점
  3. Kimi K2 Thinking (Moonshot AI) - 74.99점
  4. Grok 4 (xAI) - 74.16점
  5. GPT-5 (medium) (OpenAI) - 73.02점
  6. O3 (OpenAI) - 72.77점
  7. GPT-5 mini (high) (OpenAI) - 72.10점
  8. Claude 4.5 Sonnet (Reasoning) (Anthropic) - 71.13점
  9. Grok 4 Fast (Reasoning) (xAI) - 70.49점
 10. gpt-oss-128B (high) (OpenAI) - 69.94점

======================================================================
PIPELINE COMPLETE
======================================================================
종료 시간: 2025-11-15 12:05:30
소요 시간: 330.00초
======================================================================
```

**사용 시기**:
- 정기 데이터 업데이트 (주 1회)
- 새 모델 출시 시
- 점수 재계산 필요 시

**주의사항**:
- API Rate Limit 고려
- 약 5-10분 소요
- 네트워크 안정성 필요

---

### 4.2. npm run pipeline:aa:recalculate
**목적**: 특정 모델 점수 재계산

```bash
npm run pipeline:aa:recalculate [model_id]

# 예시
npm run pipeline:aa:recalculate abc123-def456-ghi789
```

**실행 파일**: `src/pipelines/artificialAnalysisPipeline.ts recalculate`

**동작**:
1. 해당 모델의 벤치마크 데이터 조회
2. 종합 점수 재계산
3. DB 업데이트

**예상 출력**:
```
모델 abc123-def456-ghi789의 점수 재계산 중...

✅ 점수 재계산 완료:
   종합 점수: 76.08
   지능 지수: 82.34
   코딩 지수: 75.21
   수학 지수: 78.90
```

**사용 시기**:
- 점수 계산 알고리즘 변경 후
- 특정 모델 오류 수정 후
- 디버깅

---

## 5. 테스트

### 5.1. npm test
**목적**: 전체 테스트 실행

```bash
npm test
```

**현재 상태**: 
```
Error: no test specified
```

**TODO**: 
- Jest 설정
- 단위 테스트 작성
- 통합 테스트 작성

---

## 스크립트 조합 예시

### 완전 초기 설정
```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
copy .env.example .env
# .env 파일 편집

# 3. Docker 시작
docker-compose up -d

# 4. DB 초기화 (자동이지만 확인)
npm run db:init:integrated

# 5. DB 상태 확인
npm run db:check

# 6. 데이터 수집
npm run pipeline:aa

# 7. 결과 확인
npm run db:check:top
```

---

### 일일 데이터 업데이트
```bash
# 1. 최신 데이터 수집
npm run pipeline:aa

# 2. 뉴스 수집
npm run collect:naver

# 3. 트렌드 수집
npm run collect:trends

# 4. 통계 확인
npm run db:check
```

---

### 개발 워크플로우
```bash
# Terminal 1: 개발 서버
npm run dev

# Terminal 2: DB 상태 모니터링
npm run db:check:count

# 코드 수정 후...
npm run build
```

---

### 문제 해결
```bash
# 1. DB 상태 확인
npm run db:check

# 2. 테이블 구조 확인
npm run db:check:describe

# 3. 데이터 확인
npm run db:check:models

# 4. 필요시 재설정
npm run db:reset
npm run db:init:integrated
npm run pipeline:aa
```

---

## 스크립트 빠른 참조

| 스크립트 | 목적 | 소요 시간 | 위험도 |
|----------|------|-----------|--------|
| `dev` | 개발 서버 | - | 안전 |
| `build` | 컴파일 | 10초 | 안전 |
| `start` | 프로덕션 서버 | - | 안전 |
| `collect:aa` | AA 데이터 수집 | 30초 | 안전 |
| `collect:naver` | 네이버 뉴스 | 10초 | 안전 |
| `collect:trends` | 트렌드 수집 | 20초 | 안전 |
| `pipeline:aa` | 전체 파이프라인 | 5-10분 | 안전 |
| `db:init:integrated` | DB 초기화 | 5초 | 안전 |
| `db:reset` | DB 완전 삭제 | 10초 | **위험** |
| `db:check` | DB 상태 확인 | 2초 | 안전 |
| `db:check:top` | 상위 모델 | 1초 | 안전 |

---

## 환경 변수 필요 여부

| 스크립트 | 필요 환경 변수 |
|----------|----------------|
| `dev`, `build`, `start` | `MYSQL_*`, `ELASTICSEARCH_*` |
| `collect:aa` | `ARTIFICIAL_ANALYSIS_API_KEY` |
| `collect:naver` | `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` |
| `collect:trends` | 없음 (public API) |
| `pipeline:aa` | `ARTIFICIAL_ANALYSIS_API_KEY`, `MYSQL_*` |
| `db:*` | `MYSQL_*` |

---

## 주의사항

### API Rate Limiting
```
- Artificial Analysis: 100 calls/day (Free)
- Naver: 25,000 calls/day (Free)
- Google Trends: 무제한 (공개 API)
```

### 데이터베이스 안전
```
⚠️  위험한 명령어:
- npm run db:reset (모든 데이터 삭제)

✅ 안전한 명령어:
- npm run db:check (읽기 전용)
- npm run db:init:integrated (IF NOT EXISTS)
```

### 성능 고려
```
- pipeline:aa: 5-10분 소요 (326개 모델)
- collect:naver: 10-30초 (100개 기사)
- db:check: 2-5초
```

---

## 문제 해결

### "Cannot find module"
```bash
npm install
```

### "Database connection failed"
```bash
# Docker 컨테이너 확인
docker ps

# 컨테이너 재시작
docker-compose restart mysql
```

### "API key not found"
```bash
# .env 파일 확인
cat .env

# API 키 추가
echo "ARTIFICIAL_ANALYSIS_API_KEY=your_key" >> .env
```

### "Permission denied"
```bash
# Windows
# PowerShell을 관리자 권한으로 실행

# Linux/Mac
sudo npm run [script]
```

---

## 추가 예정 스크립트

```json
{
  "scripts": {
    "test:unit": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts",
    "migrate:up": "ts-node scripts/migrations/up.ts",
    "migrate:down": "ts-node scripts/migrations/down.ts",
    "seed": "ts-node scripts/seed.ts",
    "api:start": "npm run dev",
    "api:test": "curl http://localhost:3000/health"
  }
}
```

---

## 참고 자료

- **데이터베이스**: `DATABASE_STRUCTURE.md`
- **환경 설정**: `TEAM_SETUP_GUIDE.md`
- **Docker**: `DOCKER_COMPOSE_CHANGELOG.md`
- **API 문서**: (작성 예정)

---

**마지막 업데이트**: 2025-11-15  
**작성자**: Ainus 개발팀
