# 🚀 프로젝트 처음부터 시작하기 (완전 가이드)

**프로젝트 위치**: `C:\path\MProject14v2`

빈 폴더에서 프로젝트를 시작하는 **모든 단계**를 순서대로 안내합니다.

---

## 📋 전체 진행 순서 (체크리스트)

```
□ Step 1: 사전 준비 (필수 프로그램 설치)
□ Step 2: 프로젝트 파일 다운로드
□ Step 3: Docker 환경 실행
□ Step 4: 데이터베이스 확인
□ Step 5: Node.js 프로젝트 초기화
□ Step 6: 개발 환경 설정
□ Step 7: 첫 API 개발 시작
```

---

## Step 1: 사전 준비 (필수 프로그램 설치) ⏱️ 30분

### 1.1 Docker Desktop 설치 (필수)

**다운로드**: https://www.docker.com/products/docker-desktop

```powershell
# 설치 후 확인
docker --version
# 출력 예시: Docker version 24.0.6

docker-compose --version
# 출력 예시: Docker Compose version v2.23.0
```

**중요**: 
- WSL 2 백엔드 활성화
- 시스템 재부팅 필요할 수 있음
- Docker Desktop 앱이 실행 중이어야 함

---

### 1.2 Node.js 설치 (백엔드 개발용)

**다운로드**: https://nodejs.org/ (LTS 버전 권장)

```powershell
# 설치 후 확인
node --version
# 출력 예시: v20.10.0

npm --version
# 출력 예시: 10.2.3
```

---

### 1.3 Git 설치 (선택사항)

**다운로드**: https://git-scm.com/download/win

```powershell
# 설치 후 확인
git --version
# 출력 예시: git version 2.43.0
```

---

### 1.4 텍스트 에디터 설치

**Visual Studio Code 다운로드**: https://code.microsoft.com/

또는 원하는 에디터 사용 (Sublime Text, Atom 등)

---

## Step 2: 프로젝트 파일 다운로드 ⏱️ 5분

### 방법 1: 압축 파일 다운로드 (추천)

1. Claude가 생성한 `MProject14v2` 폴더를 다운로드
2. `C:\path\` 경로에 압축 해제
3. 최종 경로: `C:\path\MProject14v2`

---

### 방법 2: 파일 구조 직접 생성 (선택사항)

```powershell
# PowerShell에서 실행
cd C:\path
mkdir MProject14v2
cd MProject14v2

# 디렉토리 구조 생성
mkdir config\mysql, config\elasticsearch, config\redis, config\kibana
mkdir init-scripts\mysql
mkdir docs
mkdir src\controllers, src\models, src\routes, src\utils, src\middleware

# 필요한 파일들을 생성 (다음 단계에서 설명)
```

---

## Step 3: Docker 환경 실행 ⏱️ 10분

### 3.1 프로젝트 디렉토리로 이동

```powershell
cd C:\path\MProject14v2

# 파일 확인
dir

# 예상 출력:
# docker-compose.yml
# .env
# start.ps1
# config/
# docs/
# init-scripts/
```

---

### 3.2 환경변수 파일 확인

```powershell
# .env 파일 내용 확인
Get-Content .env

# API 키가 이미 설정되어 있어야 함:
# ARTIFICIAL_ANALYSIS_API_KEY=aa_uInrMxtbivCXYIvoYTTfckIiYmFVJYRa
# NAVER_CLIENT_ID=q1aA7IXmMiyuXuyCyXzo
# NAVER_CLIENT_SECRET=97G_YlsjEK
```

---

### 3.3 Docker 컨테이너 실행

```powershell
# 방법 1: PowerShell 스크립트 사용 (추천)
.\start.ps1

# 방법 2: Docker Compose 직접 사용
docker-compose up -d

# 실행 중인 컨테이너 확인
docker-compose ps

# 예상 출력:
# NAME                  IMAGE                          STATUS
# ainus_mysql           mysql:8.0                     Up 2 minutes
# ainus_elasticsearch   elasticsearch:8.11.0          Up 2 minutes
# ainus_redis           redis:7.2-alpine              Up 2 minutes
# ainus_kibana          kibana:8.11.0                 Up 2 minutes
```

---

### 3.4 로그 확인

```powershell
# 전체 로그 실시간 확인
docker-compose logs -f

# 특정 서비스만 확인
docker-compose logs -f mysql
docker-compose logs -f elasticsearch

# Ctrl + C로 로그 종료
```

---

## Step 4: 데이터베이스 확인 ⏱️ 10분

### 4.1 MySQL 접속 및 스키마 확인

```powershell
# MySQL CLI 접속
docker exec -it ainus_mysql mysql -u ainus_user -p ai_model_app

# 비밀번호 입력: THT3wbm/VGmLBOC0FrSoyA==
```

**MySQL 내부에서 실행**:
```sql
-- 테이블 목록 확인
SHOW TABLES;

-- 예상 출력:
-- +---------------------------+
-- | Tables_in_ai_model_app    |
-- +---------------------------+
-- | users                     |
-- | user_social_accounts      |
-- | ai_models                 |
-- | model_benchmarks          |
-- | model_versions            |
-- | model_updates             |
-- | community_posts           |
-- | post_likes                |
-- | issue_indices             |
-- +---------------------------+

-- 테이블 구조 확인
DESCRIBE users;
DESCRIBE ai_models;

-- 종료
EXIT;
```

---

### 4.2 Elasticsearch 확인

**브라우저에서 접속**: http://localhost:9200

**PowerShell에서 확인**:
```powershell
# 클러스터 상태 확인
Invoke-WebRequest -Uri "http://localhost:9200/_cluster/health?pretty" -UseBasicParsing

# 예상 출력:
# {
#   "cluster_name" : "ainus_cluster",
#   "status" : "green",
#   "number_of_nodes" : 1
# }
```

---

### 4.3 Redis 확인

```powershell
# Redis CLI 접속
docker exec -it ainus_redis redis-cli

# Redis 내부에서
PING
# 응답: PONG

# 종료
EXIT
```

---

### 4.4 Kibana 확인 (선택사항)

**브라우저에서 접속**: http://localhost:5601

초기 로딩에 약 2-3분 소요

---

## Step 5: Elasticsearch 한글 분석기 설치 ⏱️ 5분

### 5.1 Nori 플러그인 설치

```powershell
# Nori 한글 형태소 분석기 설치
docker exec -it ainus_elasticsearch bin/elasticsearch-plugin install analysis-nori

# 설치 확인 메시지:
# -> Installing analysis-nori
# -> Downloading...
# -> Installed analysis-nori

# Elasticsearch 재시작
docker-compose restart elasticsearch

# 재시작 확인 (약 30초 대기)
docker-compose ps elasticsearch
```

---

### 5.2 플러그인 설치 확인

```powershell
# 설치된 플러그인 목록 확인
docker exec -it ainus_elasticsearch bin/elasticsearch-plugin list

# 출력 예시:
# analysis-nori
```

---

## Step 6: Node.js 프로젝트 초기화 ⏱️ 15분

### 6.1 프로젝트 초기화

```powershell
cd C:\path\MProject14v2

# package.json 생성
npm init -y

# 출력 확인:
# Wrote to C:\path\MProject14v2\package.json
```

---

### 6.2 필수 패키지 설치

```powershell
# 백엔드 의존성 설치
npm install express mysql2 @elastic/elasticsearch redis dotenv cors helmet bcrypt jsonwebtoken

# 개발 의존성 설치
npm install --save-dev typescript @types/node @types/express @types/bcrypt @types/jsonwebtoken nodemon ts-node

# 설치 확인
npm list --depth=0
```

---

### 6.3 TypeScript 설정

```powershell
# tsconfig.json 생성
npx tsc --init

# tsconfig.json 파일이 생성됨
```

**tsconfig.json 수정** (VS Code에서 열기):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### 6.4 package.json 스크립트 추가

**package.json 파일 수정**:
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

### 6.5 디렉토리 구조 생성

```powershell
# src 폴더 및 하위 디렉토리 생성
mkdir src\controllers
mkdir src\models
mkdir src\routes
mkdir src\utils
mkdir src\middleware
mkdir src\config

# logs 폴더 생성
mkdir logs
```

**최종 구조**:
```
C:\path\MProject14v2\
├── src/
│   ├── config/         # 설정 파일
│   ├── controllers/    # API 컨트롤러
│   ├── models/         # 데이터 모델
│   ├── routes/         # 라우트 정의
│   ├── utils/          # 유틸리티 함수
│   ├── middleware/     # 미들웨어
│   └── index.ts        # 진입점 (다음 단계에서 생성)
├── dist/               # 컴파일된 JS 파일
├── logs/               # 로그 파일
├── node_modules/
├── package.json
├── tsconfig.json
└── .env
```

---

## Step 7: 첫 API 서버 생성 ⏱️ 20분

### 7.1 데이터베이스 연결 설정

**파일 생성**: `src/config/database.ts`

```typescript
import mysql from 'mysql2/promise';
import { Client } from '@elastic/elasticsearch';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// MySQL 연결 풀
export const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3307,
  user: process.env.MYSQL_USER || 'ainus_user',
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || 'ai_model_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Elasticsearch 클라이언트
export const esClient = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200'
});

// Redis 클라이언트
export const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

redisClient.on('error', (err) => console.error('Redis Error:', err));
redisClient.connect();

// 연결 테스트 함수
export async function testConnections() {
  try {
    // MySQL 테스트
    const [rows] = await mysqlPool.query('SELECT 1');
    console.log('✅ MySQL 연결 성공');

    // Elasticsearch 테스트
    const esHealth = await esClient.cluster.health();
    console.log('✅ Elasticsearch 연결 성공:', esHealth.status);

    // Redis 테스트
    await redisClient.ping();
    console.log('✅ Redis 연결 성공');
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error);
    throw error;
  }
}
```

---

### 7.2 Express 서버 생성

**파일 생성**: `src/index.ts`

```typescript
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnections } from './config/database';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 헬스 체크 엔드포인트
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 루트 엔드포인트
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Ainus API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1'
    }
  });
});

// 서버 시작
async function startServer() {
  try {
    // 데이터베이스 연결 테스트
    await testConnections();

    // 서버 시작
    app.listen(PORT, () => {
      console.log(`
========================================
🚀 Ainus API Server 시작
========================================
📡 포트: ${PORT}
🌐 URL: http://localhost:${PORT}
📅 시작 시간: ${new Date().toLocaleString('ko-KR')}
========================================
      `);
    });
  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
}

startServer();
```

---

### 7.3 서버 실행

```powershell
# 개발 모드로 실행
npm run dev

# 예상 출력:
# ========================================
# 🚀 Ainus API Server 시작
# ========================================
# ✅ MySQL 연결 성공
# ✅ Elasticsearch 연결 성공
# ✅ Redis 연결 성공
# 📡 포트: 3000
# 🌐 URL: http://localhost:3000
# ========================================
```

---

### 7.4 API 테스트

**브라우저에서**: http://localhost:3000

**PowerShell에서**:
```powershell
# 루트 엔드포인트 테스트
Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing

# 헬스 체크
Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing

# 응답 예시:
# {
#   "status": "ok",
#   "timestamp": "2025-11-10T09:00:00.000Z",
#   "uptime": 123.456
# }
```

---

## Step 8: 다음 단계 (기능 #1 개발) 🎯

### 8.1 첫 번째 API 라우트 생성

**파일 생성**: `src/routes/models.routes.ts`

```typescript
import express, { Router, Request, Response } from 'express';
import { mysqlPool } from '../config/database';

const router: Router = express.Router();

// 모델 목록 조회
router.get('/models', async (req: Request, res: Response) => {
  try {
    const [rows] = await mysqlPool.query(
      'SELECT model_id, model_name, series_name, developer, overall_score FROM ai_models LIMIT 10'
    );

    res.json({
      success: true,
      data: rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('모델 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '서버 오류가 발생했습니다',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

export default router;
```

---

### 8.2 라우트 등록

**src/index.ts 수정**:
```typescript
import modelsRouter from './routes/models.routes';

// ... 기존 코드 ...

// 라우트 등록
app.use('/api/v1', modelsRouter);

// ... 기존 코드 ...
```

---

### 8.3 API 테스트

```powershell
# 서버 재시작 (nodemon이 자동으로 재시작)

# 모델 목록 조회
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/models" -UseBasicParsing
```

---

## ✅ 완료 체크리스트

프로젝트가 성공적으로 시작되었는지 확인하세요:

```
✅ Docker Desktop 설치 및 실행 중
✅ Node.js 설치 완료
✅ 프로젝트 파일 다운로드 완료
✅ Docker 컨테이너 실행 중 (mysql, elasticsearch, redis)
✅ MySQL 테이블 생성 확인
✅ Elasticsearch Nori 플러그인 설치
✅ Node.js 프로젝트 초기화 완료
✅ TypeScript 설정 완료
✅ Express 서버 실행 중
✅ 데이터베이스 연결 성공
✅ 첫 API 엔드포인트 작동 확인
```

---

## 🎯 다음 작업 (내일부터)

### Week 1 (11/10-11/16): 기능 #1 개발
- [ ] DB 스키마 보완 (benchmark_normalization 테이블 추가)
- [ ] Artificial Analysis API 연동
- [ ] 타임라인 API 개발
- [ ] 벤치마크 정규화 로직 구현

---

## 🐛 문제 해결

### Docker가 시작되지 않을 때
```powershell
# Docker Desktop 재시작
# Windows 시작 메뉴 → Docker Desktop

# WSL 업데이트
wsl --update

# 시스템 재부팅
```

### MySQL 연결 실패
```powershell
# 컨테이너 상태 확인
docker-compose ps mysql

# 로그 확인
docker-compose logs mysql

# 재시작
docker-compose restart mysql
```

### Node.js 서버 실행 오류
```powershell
# node_modules 재설치
rm -r node_modules
npm install

# 캐시 삭제
npm cache clean --force
```

---

## 📚 참고 문서

프로젝트 폴더 내 문서들:
- `README.md` - 프로젝트 개요
- `QUICKSTART_WINDOWS.md` - Windows 빠른 시작
- `docs/WINDOWS_SETUP.md` - Windows 상세 설정
- `docs/API_KEYS_SETUP.md` - API 키 확인
- `docs/elasticsearch-indices.md` - Elasticsearch 설계

---

**축하합니다! 프로젝트가 성공적으로 시작되었습니다!** 🎉

이제 본격적으로 기능 개발을 시작할 수 있습니다!
