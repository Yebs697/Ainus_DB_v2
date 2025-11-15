# Ainus 데이터베이스 구조 설명서

**작성일**: 2025-11-15  
**버전**: 2.0  
**스키마 파일**: `database/migrations/integrated_schema.sql`

---

## 개요

Ainus 프로젝트는 Docker Compose 기반의 마이크로서비스 아키텍처로 구성되어 있으며, **4개의 핵심 데이터 저장소**와 **30개의 MySQL 테이블**을 사용합니다.

---

## 인프라 구성 (Docker)

### 아키텍처 다이어그램
```
┌─────────────────────────────────────────────────────────┐
│                    Ainus Platform                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │   Node.js    │  │   Node.js    │  │   Python    │  │
│  │   Backend    │  │  Collectors  │  │   Scripts   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘  │
│         │                 │                 │          │
└─────────┼─────────────────┼─────────────────┼──────────┘
          │                 │                 │
    ┌─────┴─────────────────┴─────────────────┴─────┐
    │           Docker Network (ainus_network)      │
    └─────┬──────────┬──────────┬──────────┬────────┘
          │          │          │          │
    ┌─────▼────┐ ┌──▼────┐ ┌───▼────┐ ┌──▼─────┐
    │  MySQL   │ │ Elastic│ │ Redis  │ │ Kibana │
    │  8.0     │ │ 8.11   │ │ 7.2    │ │ 8.11   │
    └──────────┘ └────────┘ └────────┘ └────────┘
```

---

## 1. MySQL 8.0 (주 데이터베이스)

### 컨테이너 정보
```yaml
Container Name: ainus_mysql
Image: mysql:8.0
Port: 3307 (외부) → 3306 (내부)
Network: ainus_network
Volume: mysql_data (영구 저장)
```

### 역할 및 용도
**정형 데이터의 중앙 저장소**
- 사용자 정보 및 인증 데이터
- AI 모델 기본 정보 및 메타데이터
- 벤치마크 점수 및 종합 평가
- 가격 정보 및 성능 지표
- 커뮤니티 게시글 및 댓글
- 뉴스 메타데이터 (본문 제외)

### 주요 설정
```yaml
Character Set: utf8mb4_unicode_ci (한글 완벽 지원)
Collation: utf8mb4_unicode_ci
Authentication: mysql_native_password
Timezone: Asia/Seoul
Max Connections: 151 (기본값)
```

### 헬스체크
```bash
# 10초마다 헬스체크 실행
mysqladmin ping -h localhost -u root -p[password]
# 5초 타임아웃, 5회 재시도
```

### 성능 최적화
- InnoDB 엔진 사용 (트랜잭션 지원)
- 외래키 제약 조건으로 데이터 무결성 보장
- 인덱스를 통한 쿼리 성능 향상
- 자동 증가 ID (AUTO_INCREMENT)

### 백업 전략
```bash
# 수동 백업
docker exec ainus_mysql mysqldump -u root -p ai_model_app > backup.sql

# 복원
docker exec -i ainus_mysql mysql -u root -p ai_model_app < backup.sql
```

### 접속 방법
```bash
# 컨테이너 내부 접속
docker exec -it ainus_mysql mysql -u ainus_user -pqwer1234 ai_model_app

# 외부에서 접속 (호스트)
mysql -h localhost -P 3307 -u ainus_user -pqwer1234 ai_model_app
```

### 데이터 현황 (2025-11-15 기준)
```
총 테이블: 30개
데이터가 있는 테이블: 6개
- model_creators: 32개
- ai_models: 326개
- model_evaluations: 3,616개
- model_overall_scores: 326개
- model_pricing: 326개
- model_performance: 326개

총 레코드 수: 4,952개
사용 중인 디스크: 약 50MB
```

---

## 2. Elasticsearch 8.11 (검색 엔진)

### 컨테이너 정보
```yaml
Container Name: ainus_elasticsearch
Image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
Port: 9200 (REST API), 9300 (Node Communication)
Network: ainus_network
Volume: elasticsearch_data (영구 저장)
Memory: 512MB (JVM Heap)
```

### 역할 및 용도
**전문 검색 및 분석 엔진**
- 뉴스 기사 본문 전문 검색 (Full-text Search)
- AI 모델 상세 성능 데이터 저장
- 한글 형태소 분석 (Nori Plugin)
- 복합 검색 쿼리 지원
- 실시간 검색 인덱싱

### 주요 설정
```yaml
Cluster Name: ainus_cluster
Node Name: ainus_node
Discovery Type: single-node (개발 환경)
Security: Disabled (개발 환경)
Bootstrap Memory Lock: true (성능 향상)
```

### Nori Plugin (한글 형태소 분석기)
```json
{
  "analyzer": {
    "korean": {
      "type": "custom",
      "tokenizer": "nori_tokenizer",
      "filter": ["lowercase", "nori_readingform"]
    }
  }
}
```

**예시**:
```
입력: "ChatGPT는 대화형 AI 모델입니다"
토큰: ["chatgpt", "대화형", "ai", "모델"]
```

### 인덱스 구조
```
news_articles (뉴스 인덱스)
├── title (제목) - keyword + text
├── content (본문) - text with korean analyzer
├── published_at (발행일) - date
├── source (출처) - keyword
└── tags (태그) - keyword array

model_performance_detail (모델 성능 상세)
├── model_id - keyword
├── benchmark_scores - nested
├── historical_data - nested
└── raw_metrics - object
```

### 헬스체크
```bash
# 클러스터 상태 확인
curl http://localhost:9200/_cluster/health?pretty

# 예상 출력:
{
  "cluster_name" : "ainus_cluster",
  "status" : "green",  # green/yellow/red
  "number_of_nodes" : 1,
  "number_of_data_nodes" : 1
}
```

### 검색 예시
```bash
# 뉴스 검색 (한글)
curl -X POST "localhost:9200/news_articles/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "match": {
      "content": "ChatGPT"
    }
  }
}'

# 복합 검색
curl -X POST "localhost:9200/news_articles/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "bool": {
      "must": [
        { "match": { "content": "AI" }},
        { "range": { "published_at": { "gte": "2025-01-01" }}}
      ]
    }
  }
}'
```

### 성능 최적화
- Heap Size: 512MB (전체 RAM의 50% 이하 권장)
- File Descriptors: 65536 (많은 파일 동시 처리)
- Memory Lock: 활성화 (스왑 방지)
- Refresh Interval: 1초 (실시간 검색)

### 접속 방법
```bash
# REST API
curl http://localhost:9200

# 인덱스 목록
curl http://localhost:9200/_cat/indices?v

# 특정 인덱스 확인
curl http://localhost:9200/news_articles
```

### 데이터 현황 (예정)
```
news_articles: 0개 (준비 중)
model_performance_detail: 0개 (준비 중)

예상 저장 데이터:
- 뉴스 기사: 일 100개 × 365일 = 36,500개/년
- 모델 성능 상세: 326개 모델 × 시계열 데이터
```

---

## 3. Redis 7.2 (캐싱 & 세션)

### 컨테이너 정보
```yaml
Container Name: ainus_redis
Image: redis:7.2-alpine
Port: 6379
Network: ainus_network
Volume: redis_data (영구 저장)
```

### 역할 및 용도
**고속 인메모리 데이터 저장소**
- 사용자 세션 관리 (JWT 토큰)
- API 응답 캐싱
- 모델 비교 결과 캐싱
- 실시간 랭킹 데이터
- Rate Limiting (API 속도 제한)

### 주요 설정
```conf
maxmemory: 256mb (최대 메모리)
maxmemory-policy: allkeys-lru (LRU 캐시 제거)
appendonly: yes (영구 저장)
save: 900 1, 300 10, 60 10000 (스냅샷)
```

### 데이터 구조
```
세션 관리:
session:[user_id]:[token_hash] → { user_id, expires_at, ... }
TTL: 7일

API 캐싱:
cache:api:models:top10 → [ model_id_1, model_id_2, ... ]
TTL: 1시간

모델 비교 캐싱:
cache:compare:[model_id_1]:[model_id_2] → { comparison_data }
TTL: 24시간

랭킹:
ranking:overall_score → ZSET(model_id, score)
ranking:coding_index → ZSET(model_id, score)
```

### Redis 명령어 예시
```bash
# 세션 저장
SET session:123:abc123 '{"user_id":123,"expires_at":"2025-11-22"}' EX 604800

# 캐시 조회
GET cache:api:models:top10

# 랭킹 조회 (상위 10개)
ZREVRANGE ranking:overall_score 0 9 WITHSCORES

# TTL 확인
TTL cache:api:models:top10
```

### 헬스체크
```bash
# PING 명령
redis-cli ping
# 예상: PONG

# 정보 확인
redis-cli info
```

### 성능 최적화
- 인메모리 저장 (매우 빠른 읽기/쓰기)
- LRU 캐시 제거 정책 (메모리 효율)
- AOF(Append Only File) 영구 저장
- 정기적 스냅샷 (데이터 보존)

### 접속 방법
```bash
# 컨테이너 내부 접속
docker exec -it ainus_redis redis-cli

# 외부에서 접속
redis-cli -h localhost -p 6379
```

### 메모리 사용 예상
```
세션 데이터: 100 users × 1KB = 100KB
API 캐싱: 50 endpoints × 10KB = 500KB
모델 비교 캐시: 1000 pairs × 5KB = 5MB
랭킹: 326 models × 0.1KB = 33KB

총 예상: 약 6MB (256MB 한도 내)
```

---

## 4. Kibana 8.11 (데이터 시각화)

### 컨테이너 정보
```yaml
Container Name: ainus_kibana
Image: docker.elastic.co/kibana/kibana:8.11.0
Port: 5601
Network: ainus_network
Depends On: Elasticsearch (헬스체크 완료 후 시작)
```

### 역할 및 용도
**Elasticsearch 데이터 시각화 및 관리 도구**
- Elasticsearch 인덱스 관리
- 검색 쿼리 테스트
- 실시간 데이터 시각화
- 대시보드 생성
- 로그 분석

### 주요 기능

#### 1. Discover (탐색)
```
- 뉴스 기사 실시간 검색
- 필터링 및 정렬
- 필드별 분석
```

#### 2. Dashboard (대시보드)
```
AI 뉴스 트렌드 대시보드:
├── 일별 기사 수 (Line Chart)
├── 카테고리별 분포 (Pie Chart)
├── 주요 키워드 (Tag Cloud)
└── 출처별 통계 (Bar Chart)

모델 성능 대시보드:
├── 점수 분포 (Histogram)
├── 제공사별 모델 수 (Bar Chart)
├── 성능 트렌드 (Time Series)
└── 벤치마크 비교 (Multi-axis)
```

#### 3. Dev Tools (개발 도구)
```json
// 인덱스 생성
PUT /news_articles
{
  "settings": {
    "analysis": {
      "analyzer": {
        "korean": {
          "type": "custom",
          "tokenizer": "nori_tokenizer"
        }
      }
    }
  }
}

// 검색 쿼리 테스트
GET /news_articles/_search
{
  "query": {
    "match": { "content": "ChatGPT" }
  }
}
```

### 헬스체크
```bash
curl http://localhost:5601/api/status

# 예상 출력:
{
  "status": {
    "overall": {
      "state": "green"
    }
  }
}
```

### 접속 방법
```
브라우저: http://localhost:5601

초기 화면:
┌─────────────────────────────┐
│     Kibana Dashboard        │
├─────────────────────────────┤
│ - Discover                  │
│ - Dashboard                 │
│ - Dev Tools                 │
│ - Management                │
└─────────────────────────────┘
```

### 사용 시나리오

#### 뉴스 분석
```
1. Discover 탭 선택
2. news_articles 인덱스 선택
3. 시간 범위 설정 (예: 최근 7일)
4. 검색어 입력 (예: "ChatGPT")
5. 결과 확인 및 필터링
```

#### 대시보드 생성
```
1. Dashboard 탭 선택
2. Create dashboard 클릭
3. Add visualization 클릭
4. 차트 타입 선택 (Line, Bar, Pie 등)
5. 데이터 필드 설정
6. 저장
```

---

## 데이터 흐름 (Data Flow)

### 1. AI 모델 데이터 수집
```
Artificial Analysis API
         ↓
  Node.js Collector
         ↓
    ┌────┴────┐
    │         │
  MySQL    Elasticsearch
  (메타)    (상세 성능)
```

### 2. 뉴스 데이터 수집
```
Naver News API
         ↓
  Node.js Collector
         ↓
    ┌────┴────┐
    │         │
  MySQL    Elasticsearch
  (메타)      (본문)
         ↓
      Kibana
    (시각화)
```

### 3. 사용자 요청 처리
```
User Request
      ↓
  Express API
      ↓
   Redis (캐시 확인)
      ↓ (miss)
    MySQL (데이터 조회)
      ↓
   Redis (캐시 저장)
      ↓
  Response
```

### 4. 검색 요청 처리
```
Search Request
       ↓
   Express API
       ↓
  Elasticsearch (전문 검색)
       ↓
    Response
```

---

## 리소스 사용량

### 메모리
```
MySQL:        512MB (기본)
Elasticsearch: 512MB (JVM Heap)
Redis:        256MB (최대)
Kibana:       512MB (기본)
Node.js:      256MB (추정)
────────────────────────
총 예상:      2GB
```

### 디스크
```
MySQL:        500MB (현재 50MB)
Elasticsearch: 2GB (예상)
Redis:        100MB (스냅샷)
Kibana:       100MB (캐시)
────────────────────────
총 예상:      3GB
```

### 네트워크 포트
```
3307: MySQL (외부)
9200: Elasticsearch REST API
9300: Elasticsearch Node
6379: Redis
5601: Kibana Web UI
```

---

## MySQL 테이블 구조 (30개)

(나머지 테이블 설명은 이전과 동일하게 유지...)

---

## 백업 및 복구 전략

### MySQL 백업
```bash
# 전체 백업
docker exec ainus_mysql mysqldump -u root -p ai_model_app > backup_full.sql

# 테이블별 백업
docker exec ainus_mysql mysqldump -u root -p ai_model_app ai_models > backup_models.sql

# 복원
docker exec -i ainus_mysql mysql -u root -p ai_model_app < backup_full.sql
```

### Elasticsearch 스냅샷
```bash
# 스냅샷 저장소 생성
curl -X PUT "localhost:9200/_snapshot/backup_repo" -H 'Content-Type: application/json' -d'
{
  "type": "fs",
  "settings": {
    "location": "/usr/share/elasticsearch/backups"
  }
}'

# 스냅샷 생성
curl -X PUT "localhost:9200/_snapshot/backup_repo/snapshot_1?wait_for_completion=true"

# 복원
curl -X POST "localhost:9200/_snapshot/backup_repo/snapshot_1/_restore"
```

### Redis 백업
```bash
# 수동 저장
docker exec ainus_redis redis-cli SAVE

# dump.rdb 파일 백업
docker cp ainus_redis:/data/dump.rdb ./backup_redis.rdb

# 복원
docker cp ./backup_redis.rdb ainus_redis:/data/dump.rdb
docker-compose restart redis
```

---

## 모니터링 및 헬스체크

### Docker Compose 헬스체크
```bash
# 전체 상태 확인
docker-compose ps

# 예상 출력:
NAME                 STATUS
ainus_mysql          Up (healthy)
ainus_elasticsearch  Up (healthy)
ainus_redis          Up (healthy)
ainus_kibana         Up (healthy)
```

### 개별 서비스 헬스체크
```bash
# MySQL
docker exec ainus_mysql mysqladmin ping -u root -p

# Elasticsearch
curl http://localhost:9200/_cluster/health?pretty

# Redis
docker exec ainus_redis redis-cli ping

# Kibana
curl http://localhost:5601/api/status
```

---

## 참고 자료

- **ERD**: `database/ERD.md`
- **스키마 파일**: `database/migrations/integrated_schema.sql`
- **Docker 설정**: `docker-compose.yml`
- **NPM 스크립트**: `NPM_SCRIPTS_GUIDE.md`
- **환경 구축**: `TEAM_SETUP_GUIDE.md`

---

**마지막 업데이트**: 2025-11-15  
**작성자**: Ainus 개발팀
