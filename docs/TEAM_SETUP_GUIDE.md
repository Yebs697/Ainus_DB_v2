# Ainus 프로젝트 환경 구축 가이드 (팀원용)

**작성일**: 2025-11-15  
**대상**: 팀원 (예병성, 사용자)  
**목적**: 통합 스키마(30개 테이블)가 자동 적용되는 Docker 환경 구축

---

## 1. 사전 요구사항

### 필수 소프트웨어
- Docker Desktop 20.10+ (Windows/Mac)
- Docker Compose 2.0+
- Git

### 시스템 요구사항
- RAM: 최소 4GB (권장 8GB)
- 디스크: 최소 10GB 여유 공간

---

## 2. 프로젝트 클론

```bash
# PowerShell 또는 CMD에서 실행
git clone https://github.com/Yebs697/ai-model-app_v2.git
cd ai-model-app_v2
```

---

## 3. 환경 변수 설정

### .env 파일 생성
```bash
# .env.example을 복사
copy .env.example .env

# 또는 Linux/Mac
cp .env.example .env
```

### .env 파일 내용 확인
```env
# MySQL 설정
MYSQL_ROOT_PASSWORD=root_password_here
MYSQL_DATABASE=ai_model_app
MYSQL_USER=ainus_user
MYSQL_PASSWORD=qwer1234
MYSQL_HOST=localhost
MYSQL_PORT=3307

# Elasticsearch 설정
ELASTICSEARCH_NODE=http://localhost:9200

# Redis 설정
REDIS_HOST=localhost
REDIS_PORT=6379

# API Keys (필요시 추가)
ARTIFICIAL_ANALYSIS_API_KEY=your_api_key_here
NAVER_CLIENT_ID=your_client_id_here
NAVER_CLIENT_SECRET=your_client_secret_here
```

---

## 4. Docker 컨테이너 시작

### 4.1. Docker Desktop 실행 확인
```bash
# Docker 버전 확인
docker --version
docker-compose --version
```

### 4.2. 컨테이너 시작
```bash
# 모든 서비스 시작 (백그라운드)
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 4.3. 서비스 상태 확인
```bash
# 실행 중인 컨테이너 확인
docker ps

# 예상 출력:
# ainus_mysql
# ainus_elasticsearch
# ainus_redis
# ainus_kibana
```

---

## 5. 데이터베이스 초기화 확인

### 5.1. MySQL 접속 테스트
```bash
# MySQL 컨테이너 접속
docker exec -it ainus_mysql mysql -u ainus_user -pqwer1234 ai_model_app
```

### 5.2. 테이블 생성 확인
```sql
-- MySQL 프롬프트에서 실행
SHOW TABLES;

-- 예상 출력: 30개 테이블
-- ai_categories
-- ai_models
-- community_comments
-- community_post_tags
-- community_posts
-- data_collection_logs
-- fcm_tokens
-- interest_tags
-- issue_index_by_category
-- issue_index_daily
-- job_categories
-- job_occupation_to_tasks
-- job_occupations
-- model_comparison_cache
-- model_creators
-- model_evaluations
-- model_overall_scores
-- model_performance
-- model_pricing
-- model_updates
-- model_updates_details
-- news_articles
-- article_to_tags
-- post_likes
-- user_interest_tags
-- user_interested_models
-- user_profiles
-- user_push_notifications
-- user_sessions
-- users
```

### 5.3. 테이블 구조 확인 (예시)
```sql
-- ai_models 테이블 확인
DESCRIBE ai_models;

-- 데이터 개수 확인
SELECT COUNT(*) FROM ai_models;
-- 초기 상태: 0개 (데이터 수집 전)

-- MySQL 종료
exit;
```

---

## 6. Elasticsearch 확인

```bash
# Elasticsearch 상태 확인
curl http://localhost:9200/_cluster/health?pretty

# 예상 출력:
# {
#   "cluster_name" : "ainus_cluster",
#   "status" : "green",
#   ...
# }
```

---

## 7. Redis 확인

```bash
# Redis 접속
docker exec -it ainus_redis redis-cli

# Redis 프롬프트에서
PING
# 예상 출력: PONG

# Redis 종료
exit
```

---

## 8. Node.js 프로젝트 설정

### 8.1. 의존성 설치
```bash
# 프로젝트 루트에서
npm install
```

### 8.2. TypeScript 빌드 확인
```bash
npm run build
```

---

## 9. 데이터베이스 연결 테스트

### 9.1. 스크립트 실행
```bash
# 데이터베이스 상태 확인
npm run db:check

# 예상 출력:
# ========================================
# DATABASE STATUS CHECK
# ========================================
# 
# 총 테이블 수: 30
# 
# 테이블별 데이터 개수:
#   ai_categories: 0개
#   ai_models: 0개
#   ...
```

---

## 10. 데이터 수집 (선택사항)

### 10.1. Artificial Analysis 데이터 수집
```bash
# API 키가 설정되어 있어야 함 (.env 파일)
npm run pipeline:aa

# 예상 출력:
# ======================================================================
# ARTIFICIAL ANALYSIS PIPELINE START
# ======================================================================
# Step 1: API 데이터 수집
# ----------------------------------------------------------------------
# ✅ 326개 모델 수집 완료
# 
# Step 2: 데이터베이스 연결
# ----------------------------------------------------------------------
# ✅ MySQL 연결 완료
# 
# Step 3: 모델 데이터 저장
# ----------------------------------------------------------------------
# ✅ 모델 데이터 저장 완료
# 
# Step 4: 종합 점수 계산
# ----------------------------------------------------------------------
# ✅ 종합 점수 계산 완료
```

### 10.2. 데이터 확인
```bash
# 상위 모델 확인
npm run db:check:top

# 예상 출력:
# 상위 10개 모델:
#   1. GPT-5 Codex (high) (OpenAI) - 76.08점
#   2. GPT-5 (high) (OpenAI) - 75.59점
#   ...
```

---

## 11. 서비스 포트 정보

| 서비스 | 포트 | 접속 URL |
|--------|------|----------|
| MySQL | 3307 | localhost:3307 |
| Elasticsearch | 9200 | http://localhost:9200 |
| Redis | 6379 | localhost:6379 |
| Kibana | 5601 | http://localhost:5601 |

---

## 12. 문제 해결

### 포트 충돌
```bash
# 다른 포트 사용 중인 경우 docker-compose.yml 수정
# 예: MySQL 포트를 3308로 변경
ports:
  - "3308:3306"
```

### 컨테이너 재시작
```bash
# 전체 재시작
docker-compose restart

# 특정 서비스만 재시작
docker-compose restart mysql
```

### 데이터베이스 완전 초기화
```bash
# 컨테이너 및 볼륨 삭제 (주의: 모든 데이터 삭제됨)
docker-compose down -v

# 다시 시작
docker-compose up -d
```

### 로그 확인
```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f mysql
docker-compose logs -f elasticsearch
```

---

## 13. 다음 단계

환경 구축이 완료되면:

1. **데이터 수집**: `npm run pipeline:aa`
2. **API 개발**: REST API 엔드포인트 구현
3. **인증 시스템**: JWT 기반 인증 구현
4. **테스트**: 단위 테스트 및 통합 테스트

---

## 14. 추가 자료

- **프로젝트 문서**: `docs/` 디렉토리 참고
- **ERD**: `database/ERD.md`
- **API 문서**: 추후 추가 예정
- **문의**: 팀 채널에서 질문

---

## 15. 주의사항

1. **.env 파일은 절대 커밋하지 마세요**
   - API 키와 비밀번호 포함
   - .gitignore에 이미 추가됨

2. **Docker 볼륨 관리**
   - 볼륨 삭제 시 모든 데이터 손실
   - 중요 데이터는 백업 필수

3. **포트 충돌 주의**
   - 로컬에서 MySQL, Redis 등이 이미 실행 중이면 포트 변경 필요

---

## 체크리스트

환경 구축 완료 확인:

- [ ] Docker Desktop 실행 확인
- [ ] 프로젝트 클론 완료
- [ ] .env 파일 설정 완료
- [ ] docker-compose up -d 성공
- [ ] 4개 컨테이너 실행 중 (mysql, elasticsearch, redis, kibana)
- [ ] MySQL 30개 테이블 생성 확인
- [ ] npm install 완료
- [ ] npm run db:check 성공
- [ ] (선택) npm run pipeline:aa 성공

모든 항목이 체크되면 개발 준비 완료입니다!

---

**문제 발생 시 팀 채널에 공유해주세요.**
