# Ainus - AI 모델 정보 및 커뮤니티 플랫폼

AI 모델 성능 데이터 수집, 분석, 시각화 및 커뮤니티 기능을 제공하는 통합 플랫폼

**프로젝트 위치**: `C:\path\MProject14v2`  
**개발 팀**: 최수안 (팀장), 예병성 (백엔드), 박선우 (프론트엔드)

---

## 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [빠른 시작](#빠른-시작)
4. [프로젝트 구조](#프로젝트-구조)
5. [데이터베이스 스키마](#데이터베이스-스키마)
6. [NPM 스크립트](#npm-스크립트)
7. [API 문서](#api-문서)
8. [데이터 파이프라인](#데이터-파이프라인)
9. [배포 가이드](#배포-가이드)
10. [문제 해결](#문제-해결)

---

## 프로젝트 개요

### 주요 기능

1. **AI 모델 성능 추적**
   - 326개 AI 모델의 벤치마크 점수 수집
   - 가중치 기반 종합 점수 계산 (Intelligence, Coding, Math 지수)
   - 모델 비교 및 랭킹

2. **AI 이슈 지수**
   - 네이버 뉴스 기반 AI 관심도 측정
   - 일별/카테고리별 이슈 지수 계산
   - Google Trends 연동

3. **커뮤니티**
   - 게시글, 댓글, 좋아요
   - Elasticsearch 기반 전문 검색
   - 직업별 맞춤 추천

4. **알림 시스템**
   - 모델 업데이트 알림
   - FCM 푸시 알림
   - 관심 모델 구독

---

## 기술 스택

### Backend
- **Runtime**: Node.js 18+ / TypeScript
- **Framework**: Express.js
- **ORM**: Sequelize (MySQL)

### Database & Search
- **MySQL 8.0**: 정형 데이터 (30개 테이블, 4,952개 레코드)
- **Elasticsearch 8.11**: 전문 검색 (Nori 한글 형태소 분석)
- **Redis 7.2**: 세션 관리, 캐싱
- **Kibana 8.11**: 데이터 시각화

### Infrastructure
- **Docker Compose**: 컨테이너 오케스트레이션
- **WSL 2**: Windows 개발 환경

### External APIs
- **Artificial Analysis API**: AI 모델 성능 데이터
- **Naver News API**: 뉴스 수집
- **Google Trends API**: 트렌드 분석
- **Firebase Cloud Messaging (FCM)**: 푸시 알림

---

## 빠른 시작

### 사전 요구사항

- **Windows 10/11** + WSL 2
- **Docker Desktop** 20.10+
- **Docker Compose** 2.0+
- **Node.js** 18+
- **최소 RAM**: 4GB (권장 8GB)

---

### 1. 저장소 클론

```powershell
# PowerShell에서 실행
cd C:\path
git clone <repository-url> MProject14v2
cd MProject14v2
```

---

### 2. 환경변수 설정

```bash
# .env.example을 .env로 복사
cp .env.example .env

# .env 파일 편집 (중요!)
# - MYSQL_ROOT_PASSWORD: MySQL 루트 비밀번호
# - ARTIFICIAL_ANALYSIS_API_KEY: API 키
# - NAVER_CLIENT_ID, NAVER_CLIENT_SECRET: 네이버 API
# - JWT_SECRET: 인증용 시크릿 키
```

**필수 환경변수**:
```env
# MySQL
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=ai_model_app
MYSQL_USER=ainus_user
MYSQL_PASSWORD=your_user_password

# External APIs
ARTIFICIAL_ANALYSIS_API_KEY=your_aa_api_key
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret

# JWT
JWT_SECRET=your_jwt_secret_key
```

---

### 3. Docker 컨테이너 시작

```powershell
# PowerShell에서 실행

# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 상태 확인
docker-compose ps
```

**예상 출력**:
```
NAME                 STATUS
ainus_mysql          Up (healthy)
ainus_elasticsearch  Up (healthy)
ainus_redis          Up (healthy)
ainus_kibana         Up (healthy)
```

---

### 4. 데이터베이스 초기화

```bash
# 통합 스키마 적용 (30개 테이블 생성)
npm run db:migrate

# 벤치마크 정규화 기준 데이터 삽입
npm run db:seed
```

---

### 5. 데이터 수집

```bash
# AI 모델 데이터 수집 (Artificial Analysis API)
npm run collect:models

# 뉴스 데이터 수집 (Naver News API)
npm run collect:news

# Google Trends 데이터 수집
npm run collect:trends

# 종합 점수 계산
npm run calculate:scores
```

---

### 6. 개발 서버 시작

```bash
# 개발 모드 (Hot Reload)
npm run dev

# 프로덕션 모드
npm run build
npm start
```

서버 접속: `http://localhost:3000`

---

## 프로젝트 구조

```
MProject14v2/
├── docker-compose.yml              # Docker 설정
├── .env.example                    # 환경변수 템플릿
├── package.json                    # NPM 의존성
├── tsconfig.json                   # TypeScript 설정
│
├── src/                            # 소스 코드
│   ├── config/                     # 설정
│   │   ├── database.ts             # DB 연결
│   │   └── elasticsearch.ts        # ES 연결
│   │
│   ├── models/                     # Sequelize 모델
│   │   ├── AIModel.ts
│   │   ├── ModelEvaluation.ts
│   │   └── User.ts
│   │
│   ├── routes/                     # API 라우트
│   │   ├── models.ts               # /api/v1/models
│   │   ├── community.ts            # /api/v1/community
│   │   └── auth.ts                 # /api/v1/auth
│   │
│   ├── services/                   # 비즈니스 로직
│   │   ├── ModelService.ts         # 모델 관련
│   │   ├── ScoreCalculator.ts      # 점수 계산
│   │   └── NewsCollector.ts        # 뉴스 수집
│   │
│   ├── collectors/                 # 데이터 수집 스크립트
│   │   ├── artificial-analysis.ts  # AA API 수집
│   │   ├── naver-news.ts           # 네이버 뉴스
│   │   └── google-trends.ts        # 트렌드
│   │
│   └── utils/                      # 유틸리티
│       ├── logger.ts               # 로깅
│       └── cache.ts                # Redis 캐싱
│
├── database/                       # 데이터베이스
│   ├── migrations/
│   │   └── integrated_schema.sql   # 통합 스키마 (30개 테이블)
│   ├── seeds/                      # 초기 데이터
│   │   ├── benchmark_normalization.sql
│   │   └── job_categories.sql
│   └── ERD.md                      # ERD 문서
│
├── config/                         # 컨테이너 설정
│   ├── mysql/
│   │   └── my.cnf
│   ├── elasticsearch/
│   │   └── elasticsearch.yml
│   ├── redis/
│   │   └── redis.conf
│   └── kibana/
│       └── kibana.yml
│
├── docs/                           # 문서
│   ├── DATABASE_STRUCTURE.md       # DB 구조 상세
│   ├── NPM_SCRIPTS_GUIDE.md        # 스크립트 가이드
│   ├── TEAM_SETUP_GUIDE.md         # 팀원 환경 구축
│   └── API.md                      # API 문서
│
└── tests/                          # 테스트
    ├── unit/
    └── integration/
```

---

## 데이터베이스 스키마

### 개요

- **총 테이블**: 30개
- **현재 데이터**: 4,952개 레코드
- **스키마 파일**: `database/migrations/integrated_schema.sql`
- **ERD**: `database/ERD.md`

---

### 주요 테이블 그룹

#### 1. 직업 카테고리 (2개)
- `job_categories`: 13개 직업 카테고리
- `job_occupations`: 구체적 직업

#### 2. 사용자 및 인증 (3개)
- `users`: 사용자 기본 정보
- `user_profiles`: 상세 정보
- `user_sessions`: JWT 세션

#### 3. AI 모델 (6개)
- `model_creators`: 제공사 (32개)
- `ai_models`: 모델 정보 (326개)
- `model_evaluations`: 벤치마크 점수 (3,616개)
- `model_overall_scores`: 종합 점수 (326개)
- `model_pricing`: 가격 정보 (326개)
- `model_performance`: 성능 지표 (326개)

#### 4. AI 이슈 지수 (3개)
- `ai_categories`: AI 카테고리
- `issue_index_daily`: 일별 이슈 지수
- `issue_index_by_category`: 카테고리별 지수

#### 5. 뉴스 (3개)
- `news_articles`: 뉴스 메타데이터
- `interest_tags`: 태그 (40개)
- `article_to_tags`: 기사-태그 매핑

#### 6. 커뮤니티 (4개)
- `community_posts`: 게시글
- `community_comments`: 댓글
- `post_likes`: 좋아요
- `community_post_tags`: 게시글 태그

#### 7-10. 기타 (9개)
- 사용자 관심 모델/태그
- 푸시 알림
- FCM 토큰
- 직업별 추천 가중치
- 모델 비교 캐시
- 데이터 수집 로그

---

### 데이터 현황 (2025-11-15)

| 테이블 | 현재 레코드 | 예상 증가율 |
|--------|------------|------------|
| model_creators | 32 | +10/년 |
| ai_models | 326 | +50/월 |
| model_evaluations | 3,616 | 모델당 15개 |
| model_overall_scores | 326 | 모델당 1개 |
| news_articles | 0 | 일 100개 |
| users | 0 | 월 1,000명 |

---

## NPM 스크립트

### 개발 스크립트

```bash
# 개발 서버 (Hot Reload)
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start

# 타입 체크
npm run type-check

# Lint
npm run lint
```

---

### 데이터베이스 관리

```bash
# 마이그레이션 적용 (30개 테이블 생성)
npm run db:migrate

# 초기 데이터 삽입
npm run db:seed

# 데이터베이스 리셋 (주의!)
npm run db:reset

# 백업
npm run db:backup

# 복원
npm run db:restore
```

---

### 데이터 수집

```bash
# AI 모델 데이터 수집 (Artificial Analysis)
npm run collect:models

# 뉴스 수집 (Naver)
npm run collect:news

# Google Trends 수집
npm run collect:trends

# 전체 데이터 수집 (순차 실행)
npm run collect:all
```

---

### 점수 계산

```bash
# 벤치마크 정규화 (0-100 스케일)
npm run normalize:benchmarks

# 종합 점수 계산 (가중치 기반)
npm run calculate:scores

# AI 이슈 지수 계산
npm run calculate:issue-index

# 전체 계산 파이프라인
npm run calculate:all
```

---

### 캐시 관리

```bash
# Redis 캐시 초기화
npm run cache:clear

# 캐시 통계 조회
npm run cache:stats

# 캐시 워밍업 (주요 데이터 사전 로드)
npm run cache:warm
```

---

### 테스트

```bash
# 단위 테스트
npm run test:unit

# 통합 테스트
npm run test:integration

# 전체 테스트
npm test

# 커버리지
npm run test:coverage
```

---

### Docker 관리

```bash
# Docker 컨테이너 시작
npm run docker:up

# Docker 컨테이너 중지
npm run docker:down

# Docker 로그 확인
npm run docker:logs

# Docker 상태 확인
npm run docker:ps
```

**상세 가이드**: `docs/NPM_SCRIPTS_GUIDE.md`

---

## API 문서

### Base URL

```
http://localhost:3000/api/v1
```

---

### 인증

모든 인증 필요 API는 JWT Bearer Token 사용:

```bash
Authorization: Bearer <your_jwt_token>
```

---

### 주요 엔드포인트

#### AI 모델

```
GET    /models                    # 모델 목록 (페이지네이션)
GET    /models/:id                # 모델 상세
GET    /models/:id/benchmarks     # 벤치마크 점수
GET    /models/compare            # 모델 비교
GET    /models/ranking            # 랭킹 (종합/코딩/수학)
```

#### 커뮤니티

```
GET    /community/posts           # 게시글 목록
POST   /community/posts           # 게시글 작성 (인증 필요)
GET    /community/posts/:id       # 게시글 상세
POST   /community/posts/:id/like  # 좋아요 (인증 필요)
POST   /community/posts/:id/comments  # 댓글 작성 (인증 필요)
GET    /community/search          # 게시글 검색 (Elasticsearch)
```

#### AI 이슈 지수

```
GET    /issue-index/daily         # 일별 이슈 지수
GET    /issue-index/category      # 카테고리별 지수
GET    /issue-index/sources       # 관련 뉴스 소스
```

#### 사용자

```
POST   /auth/register             # 회원가입
POST   /auth/login                # 로그인
GET    /users/me                  # 내 정보 (인증 필요)
POST   /users/models/subscribe    # 모델 구독 (인증 필요)
GET    /users/notifications       # 알림 목록 (인증 필요)
```

**상세 API 문서**: `docs/API.md`

---

## 데이터 파이프라인

### 1. AI 모델 데이터 파이프라인

```
Artificial Analysis API
         ↓
  (수집) collect:models
         ↓
    ┌────┴────┐
    │         │
  MySQL    Redis
  (저장)    (캐싱)
    │
    ├─ model_creators (32개)
    ├─ ai_models (326개)
    ├─ model_evaluations (3,616개)
    ├─ model_pricing (326개)
    └─ model_performance (326개)
         ↓
  (계산) calculate:scores
         ↓
  model_overall_scores (326개)
    - overall_score (종합)
    - intelligence_index (지능)
    - coding_index (코딩)
    - math_index (수학)
```

---

### 2. 뉴스 데이터 파이프라인

```
Naver News API
         ↓
  (수집) collect:news
         ↓
    ┌────┴────┐
    │         │
  MySQL    Elasticsearch
  (메타)      (본문)
    │
    ├─ news_articles
    └─ article_to_tags
         ↓
  (분석) calculate:issue-index
         ↓
  issue_index_daily
  issue_index_by_category
         ↓
      Kibana
    (시각화)
```

---

### 3. 트렌드 데이터 파이프라인

```
Google Trends API
         ↓
  (수집) collect:trends
         ↓
  Elasticsearch
  (시계열 데이터)
         ↓
  (분석 & 계산)
         ↓
  issue_index_daily
  (트렌드 점수 반영)
```

---

## 배포 가이드

### 개발 환경 (로컬)

```bash
# 1. Docker 시작
docker-compose up -d

# 2. DB 초기화
npm run db:migrate
npm run db:seed

# 3. 데이터 수집
npm run collect:all

# 4. 점수 계산
npm run calculate:all

# 5. 개발 서버 시작
npm run dev
```

---

### 프로덕션 환경

```bash
# 1. 환경변수 설정 (프로덕션)
cp .env.example .env.production
# .env.production 편집

# 2. 빌드
npm run build

# 3. Docker 프로덕션 모드
docker-compose -f docker-compose.prod.yml up -d

# 4. 프로덕션 서버 시작
NODE_ENV=production npm start

# 5. 프로세스 관리 (PM2)
pm2 start ecosystem.config.js
pm2 logs
```

---

### 배치 작업 설정 (Cron)

```bash
# crontab -e

# AI 모델 데이터 수집 (매주 일요일 자정)
0 0 * * 0 cd /path/MProject14v2 && npm run collect:models

# 뉴스 수집 (매시간)
0 * * * * cd /path/MProject14v2 && npm run collect:news

# 이슈 지수 계산 (매일 자정)
0 0 * * * cd /path/MProject14v2 && npm run calculate:issue-index

# 캐시 워밍업 (매일 오전 6시)
0 6 * * * cd /path/MProject14v2 && npm run cache:warm
```

---

## 문제 해결

### 1. Docker 컨테이너 시작 실패

**증상**: `docker-compose up` 실패

**해결**:
```bash
# Docker Desktop 실행 확인
docker --version

# WSL 2 상태 확인
wsl --status

# 포트 충돌 확인
netstat -ano | findstr "3306 9200 6379 5601"

# Docker 재시작
docker-compose down
docker-compose up -d
```

---

### 2. MySQL 연결 실패

**증상**: `ECONNREFUSED 3307`

**해결**:
```bash
# 컨테이너 상태 확인
docker-compose ps

# MySQL 로그 확인
docker-compose logs mysql

# 직접 접속 테스트
docker exec -it ainus_mysql mysql -u ainus_user -pqwer1234

# 재시작
docker-compose restart mysql
```

---

### 3. Elasticsearch 시작 실패

**증상**: `max virtual memory areas vm.max_map_count [65530] is too low`

**해결 (WSL)**:
```bash
# WSL 터미널에서
wsl -d docker-desktop
sysctl -w vm.max_map_count=262144

# 영구 적용
echo "vm.max_map_count=262144" >> /etc/sysctl.conf
```

---

### 4. API 키 오류

**증상**: `401 Unauthorized` (Artificial Analysis API)

**해결**:
```bash
# .env 파일 확인
cat .env | grep ARTIFICIAL_ANALYSIS_API_KEY

# API 키 갱신
# https://artificialanalysis.ai/account 에서 새 키 발급

# 환경변수 재로드
npm run dev
```

---

### 5. 데이터 수집 실패

**증상**: `npm run collect:models` 실패

**해결**:
```bash
# 로그 확인
npm run collect:models 2>&1 | tee collect.log

# API 응답 확인
curl -X GET "https://api.artificialanalysis.ai/models" \
  -H "Authorization: Bearer YOUR_API_KEY"

# 재시도 (수동)
npm run collect:models

# 데이터베이스 상태 확인
npm run db:check
```

---

### 6. 캐시 문제

**증상**: 오래된 데이터 표시

**해결**:
```bash
# Redis 캐시 초기화
npm run cache:clear

# Redis 연결 확인
docker exec -it ainus_redis redis-cli ping

# 캐시 통계
npm run cache:stats

# Redis 재시작
docker-compose restart redis
```

---

## 모니터링

### Docker 상태

```bash
# 전체 상태
docker-compose ps

# 리소스 사용량
docker stats

# 로그 (실시간)
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f mysql
docker-compose logs -f elasticsearch
```

---

### MySQL 모니터링

```sql
-- 연결 상태
SHOW PROCESSLIST;

-- 데이터베이스 크기
SELECT table_schema, 
       ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'ai_model_app'
GROUP BY table_schema;

-- 테이블별 레코드 수
SELECT table_name, table_rows
FROM information_schema.tables
WHERE table_schema = 'ai_model_app'
ORDER BY table_rows DESC;
```

---

### Elasticsearch 모니터링

```bash
# 클러스터 상태
curl http://localhost:9200/_cluster/health?pretty

# 인덱스 목록
curl http://localhost:9200/_cat/indices?v

# 검색 성능
curl http://localhost:9200/_cat/thread_pool/search?v
```

---

### Redis 모니터링

```bash
# Redis CLI 접속
docker exec -it ainus_redis redis-cli

# 메모리 사용량
INFO memory

# 키 개수
DBSIZE

# 캐시 히트율
INFO stats
```

---

## 보안 고려사항

### 1. 환경변수 관리

- `.env` 파일은 **절대 Git에 커밋하지 않음**
- `.gitignore`에 `.env` 추가
- 프로덕션 환경에서는 AWS Secrets Manager 등 사용

---

### 2. 비밀번호

- 기본 비밀번호 **반드시 변경**
- 복잡한 비밀번호 사용 (최소 12자, 특수문자 포함)
- 정기적으로 변경 (3개월마다)

---

### 3. API 키

- API 키는 환경변수로만 관리
- Rate Limiting 설정
- IP 화이트리스트 (가능한 경우)

---

### 4. 데이터베이스

- 외부 접근 차단 (방화벽)
- 정기 백업 (일 1회)
- SQL Injection 방지 (Parameterized Query)

---

### 5. Elasticsearch

- X-Pack 보안 활성화 (프로덕션)
- HTTPS 사용
- 인덱스 접근 권한 관리

---

## 추가 문서

- **데이터베이스 구조**: [DATABASE_STRUCTURE.md](docs/DATABASE_STRUCTURE.md)
- **ERD**: [ERD.md](database/ERD.md)
- **NPM 스크립트**: [NPM_SCRIPTS_GUIDE.md](docs/NPM_SCRIPTS_GUIDE.md)
- **팀원 환경 구축**: [TEAM_SETUP_GUIDE.md](docs/TEAM_SETUP_GUIDE.md)
- **API 문서**: [API.md](docs/API.md)

---

## 라이선스

이 프로젝트는 Ainus 팀의 내부 사용을 위한 것입니다.

---

## 연락처

- **팀장**: 최수안
- **백엔드**: 예병성
- **프론트엔드**: 박선우

---

**마지막 업데이트**: 2025-11-15