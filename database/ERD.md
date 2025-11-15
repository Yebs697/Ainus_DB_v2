# Ainus Database ERD

**작성일**: 2025-11-15  
**버전**: 2.0 (통합 스키마)  
**총 테이블**: 30개

---

## 데이터베이스 개요

### 저장소 구성
- **MySQL 8.0**: 정형 데이터 (30개 테이블)
- **Elasticsearch 8.11**: 비정형 데이터 (뉴스 본문, 검색)
- **Redis 7.2**: 캐싱 및 세션
- **Kibana 8.11**: 시각화

---

## 전체 ERD 구조

### SECTION 1-3: 사용자 및 AI 모델 (핵심)

```
┌─────────────────────────┐
│   job_categories        │
│   (직업 카테고리)         │
├─────────────────────────┤
│ job_category_id (PK)    │
│ job_name                │
│ category_code           │
└──────────┬──────────────┘
           │ 1:N
           ▼
┌─────────────────────────┐
│   job_occupations       │
│   (구체적 직업)          │
├─────────────────────────┤
│ job_occupation_id (PK)  │
│ job_category_id (FK)    │
│ occupation_name         │
└──────────┬──────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────┐      ┌─────────────────────────┐
│   users                 │──┐   │   user_sessions         │
│   (사용자)               │  │   │   (세션 관리)            │
├─────────────────────────┤  │   ├─────────────────────────┤
│ user_id (PK)            │  │   │ session_id (PK)         │
│ email                   │  │   │ user_id (FK)            │
│ password_hash           │  │   │ token_hash              │
│ nickname                │  │   │ expires_at              │
│ job_category_id (FK)    │  │   └─────────────────────────┘
└──────────┬──────────────┘  │
           │                 │ 1:N
           │ 1:1             │
           ▼                 │
┌─────────────────────────┐  │
│   user_profiles         │  │
│   (사용자 상세)          │  │
├─────────────────────────┤  │
│ profile_id (PK)         │  │
│ user_id (FK) UNIQUE     │  │
│ job_occupation_id (FK)  │  │
│ bio                     │  │
│ preferences (JSON)      │  │
└─────────────────────────┘  │
                             │
                             │ 1:N
                             ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│ community_posts         │  │   post_likes            │
│ (게시글)                 │──│   (좋아요)               │
├─────────────────────────┤  ├─────────────────────────┤
│ post_id (PK)            │  │ like_id (PK)            │
│ user_id (FK)            │  │ post_id (FK)            │
│ title                   │  │ user_id (FK)            │
│ content                 │  └─────────────────────────┘
│ likes_count             │
│ comments_count          │
└──────────┬──────────────┘
           │ 1:N
           ▼
┌─────────────────────────┐
│ community_comments      │
│ (댓글)                   │
├─────────────────────────┤
│ comment_id (PK)         │
│ post_id (FK)            │
│ user_id (FK)            │
│ content                 │
└─────────────────────────┘
```

---

## AI 모델 관계도 (핵심)

```
┌─────────────────────────────────────┐
│   model_creators                    │
│   (AI 모델 제공사)                   │  현재: 32개
├─────────────────────────────────────┤
│ creator_id (PK) VARCHAR(36)         │  ← Artificial Analysis ID
│ creator_name                        │
│ creator_slug                        │
│ website_url                         │
│ country                             │
│ founded_year                        │
└──────────────┬──────────────────────┘
               │ 1:N
               ▼
┌─────────────────────────────────────┐
│   ai_models                         │
│   (AI 모델 기본 정보)                 │  현재: 326개
├─────────────────────────────────────┤
│ model_id (PK) VARCHAR(36)           │  ← Artificial Analysis ID
│ model_name                          │
│ model_slug                          │
│ creator_id (FK)                     │
│ release_date                        │
│ model_type                          │
│ parameter_size                      │
│ context_length                      │
│ is_open_source                      │
│ raw_data (JSON)                     │
└──────────┬──────────────────────────┘
           │
           ├────────────┐ 1:N (현재: 3,616개)
           │            ▼
           │    ┌──────────────────────────┐
           │    │ model_evaluations        │
           │    │ (벤치마크 점수)           │
           │    ├──────────────────────────┤
           │    │ evaluation_id (PK)       │
           │    │ model_id (FK)            │
           │    │ benchmark_name           │  ← MMLU_PRO, GPQA, etc.
           │    │ score                    │
           │    │ max_score                │
           │    │ normalized_score         │
           │    │ model_rank               │
           │    └──────────────────────────┘
           │
           ├────────────┐ 1:1 (현재: 326개)
           │            ▼
           │    ┌──────────────────────────┐
           │    │ model_overall_scores     │
           │    │ (종합 점수)               │
           │    ├──────────────────────────┤
           │    │ score_id (PK)            │
           │    │ model_id (FK)            │
           │    │ overall_score            │  ← 가중치 기반 (0-100)
           │    │ intelligence_index       │
           │    │ coding_index             │
           │    │ math_index               │
           │    │ reasoning_index          │
           │    │ language_index           │
           │    │ calculated_at            │
           │    │ version                  │
           │    └──────────────────────────┘
           │
           ├────────────┐ 1:N (현재: 326개)
           │            ▼
           │    ┌──────────────────────────┐
           │    │ model_pricing            │
           │    │ (가격 정보)               │
           │    ├──────────────────────────┤
           │    │ pricing_id (PK)          │
           │    │ model_id (FK)            │
           │    │ price_input_1m           │  ← 입력 100만 토큰당
           │    │ price_output_1m          │  ← 출력 100만 토큰당
           │    │ price_blended_3to1       │
           │    │ currency                 │
           │    │ effective_date           │
           │    │ is_current               │
           │    └──────────────────────────┘
           │
           ├────────────┐ 1:N (현재: 326개)
           │            ▼
           │    ┌──────────────────────────┐
           │    │ model_performance        │
           │    │ (성능 지표)               │
           │    ├──────────────────────────┤
           │    │ performance_id (PK)      │
           │    │ model_id (FK)            │
           │    │ median_output_tokens_ps  │
           │    │ median_time_first_token  │
           │    │ latency_p50/p95/p99      │
           │    │ measured_at              │
           │    └──────────────────────────┘
           │
           └────────────┐ 1:N
                        ▼
                ┌──────────────────────────┐
                │ model_updates            │
                │ (업데이트 내역)           │
                ├──────────────────────────┤
                │ update_id (PK)           │
                │ model_id (FK)            │
                │ version_before           │
                │ version_after            │
                │ update_date              │
                │ summary                  │
                │ key_improvements (JSON)  │
                └───────────┬──────────────┘
                            │ 1:N
                            ▼
                    ┌──────────────────────────┐
                    │ model_updates_details    │
                    │ (업데이트 상세)           │
                    ├──────────────────────────┤
                    │ detail_id (PK)           │
                    │ update_id (FK)           │
                    │ benchmark_name           │
                    │ before_score             │
                    │ after_score              │
                    │ improvement_pct          │
                    └──────────────────────────┘
```

---

## AI 이슈 지수 관계도

```
┌─────────────────────────┐
│   ai_categories         │
│   (AI 카테고리)          │
├─────────────────────────┤
│ category_id (PK)        │
│ category_name           │  ← LLM, CV, ML, AI_ETHICS 등
│ category_code           │
│ weight                  │
└──────────┬──────────────┘
           │
           ├────────────┐ 1:N
           │            ▼
           │    ┌──────────────────────────┐
           │    │ issue_index_by_category  │
           │    │ (카테고리별 이슈 지수)     │
           │    ├──────────────────────────┤
           │    │ category_index_id (PK)   │
           │    │ index_date               │
           │    │ category_id (FK)         │
           │    │ score (0-100)            │
           │    │ comparison_prev_week     │
           │    │ article_count            │
           │    └──────────────────────────┘
           │
           └────────────┐ 1:N
                        ▼
                ┌──────────────────────────┐
                │ interest_tags            │
                │ (관심 태그 40개)          │
                ├──────────────────────────┤
                │ interest_tag_id (PK)     │
                │ tag_name                 │  ← GPT, CLAUDE, NLP 등
                │ tag_code                 │
                │ category_id (FK)         │
                └───────────┬──────────────┘
                            │
                            │ N:M
                            ▼
                    ┌──────────────────────────┐
                    │ article_to_tags          │
                    │ (기사-태그 매핑)          │
                    ├──────────────────────────┤
                    │ mapping_id (PK)          │
                    │ article_id (FK)          │
                    │ interest_tag_id (FK)     │
                    │ classification_status    │
                    │ confidence_score         │
                    └──────────────────────────┘


┌─────────────────────────┐
│ issue_index_daily       │
│ (일별 전체 이슈 지수)     │
├─────────────────────────┤
│ index_id (PK)           │
│ index_date UNIQUE       │
│ score (0-100)           │
│ comparison_prev_week    │
│ main_keyword            │
│ trend                   │
│ article_count           │
└─────────────────────────┘
```

---

## 뉴스 관계도

```
┌─────────────────────────────────────┐
│   news_articles                     │
│   (뉴스 기사 메타데이터)              │
├─────────────────────────────────────┤
│ article_id (PK)                     │
│ title                               │
│ url UNIQUE                          │
│ source                              │  ← Naver, 기타
│ published_at                        │
│ collected_at                        │
│ summary                             │
│ impact_score                        │
└──────────┬──────────────────────────┘
           │ N:M
           │
           ▼
┌─────────────────────────┐      ┌─────────────────────────┐
│ article_to_tags         │──────│   interest_tags         │
│ (기사-태그 매핑)         │      │   (관심 태그)            │
├─────────────────────────┤      ├─────────────────────────┤
│ mapping_id (PK)         │      │ interest_tag_id (PK)    │
│ article_id (FK)         │      │ tag_name                │
│ interest_tag_id (FK)    │      │ tag_code                │
│ classification_status   │      │ category_id (FK)        │
│ confidence_score        │      └─────────────────────────┘
└─────────────────────────┘


[Elasticsearch 인덱스: news_articles]
{
  "article_id": "keyword",
  "title": "text",
  "content": "text with korean analyzer (Nori)",
  "published_at": "date",
  "tags": "keyword array",
  "source": "keyword"
}
```

---

## 사용자 관심 관계도

```
┌─────────────────────────┐
│   users                 │
│   (사용자)               │
├─────────────────────────┤
│ user_id (PK)            │
└──────────┬──────────────┘
           │
           ├────────────┐ N:M (사용자 ↔ AI 모델)
           │            ▼
           │    ┌──────────────────────────┐
           │    │ user_interested_models   │
           │    │ (관심 모델)               │
           │    ├──────────────────────────┤
           │    │ interested_id (PK)       │
           │    │ user_id (FK)             │
           │    │ model_id (FK)            │
           │    │ added_at                 │
           │    └──────────────────────────┘
           │            │
           │            │ FK to ai_models
           │            ▼
           │    ┌──────────────────────────┐
           │    │   ai_models              │
           │    └──────────────────────────┘
           │
           └────────────┐ N:M (사용자 ↔ 태그)
                        ▼
                ┌──────────────────────────┐
                │ user_interest_tags       │
                │ (관심 태그)               │
                ├──────────────────────────┤
                │ user_tag_id (PK)         │
                │ user_id (FK)             │
                │ interest_tag_id (FK)     │
                │ added_at                 │
                └──────────────────────────┘
                        │
                        │ FK to interest_tags
                        ▼
                ┌──────────────────────────┐
                │   interest_tags          │
                └──────────────────────────┘
```

---

## 알림 관계도

```
┌─────────────────────────┐
│   users                 │
├─────────────────────────┤
│ user_id (PK)            │
└──────────┬──────────────┘
           │
           ├────────────┐ 1:N
           │            ▼
           │    ┌──────────────────────────┐
           │    │ user_push_notifications  │
           │    │ (푸시 알림 기록)          │
           │    ├──────────────────────────┤
           │    │ notification_id (PK)     │
           │    │ user_id (FK)             │
           │    │ model_update_id (FK)     │  ← 모델 업데이트 알림
           │    │ issue_index_id (FK)      │  ← 이슈 지수 알림
           │    │ notification_type        │
           │    │ title                    │
           │    │ body                     │
           │    │ sent_at                  │
           │    │ read_at                  │
           │    └──────────────────────────┘
           │
           └────────────┐ 1:N
                        ▼
                ┌──────────────────────────┐
                │ fcm_tokens               │
                │ (FCM 토큰)                │
                ├──────────────────────────┤
                │ token_id (PK)            │
                │ user_id (FK)             │
                │ fcm_token                │
                │ device_type              │
                │ is_active                │
                └──────────────────────────┘
```

---

## 커뮤니티 태그 관계도

```
┌─────────────────────────┐
│ community_posts         │
│ (게시글)                 │
├─────────────────────────┤
│ post_id (PK)            │
│ user_id (FK)            │
│ title                   │
│ content                 │
└──────────┬──────────────┘
           │ N:M
           │
           ▼
┌─────────────────────────┐      ┌─────────────────────────┐
│ community_post_tags     │──────│   interest_tags         │
│ (게시글 태그)            │      │   (관심 태그)            │
├─────────────────────────┤      ├─────────────────────────┤
│ tag_id (PK)             │      │ interest_tag_id (PK)    │
│ post_id (FK)            │      │ tag_name                │
│ interest_tag_id (FK)    │      │ tag_code                │
└─────────────────────────┘      └─────────────────────────┘
```

---

## 직업별 추천 가중치

```
┌─────────────────────────┐
│ job_occupations         │
│ (구체적 직업)            │
├─────────────────────────┤
│ job_occupation_id (PK)  │
│ occupation_name         │  ← 백엔드 개발자, UI 디자이너 등
└──────────┬──────────────┘
           │ N:M
           │
           ▼
┌─────────────────────────┐      ┌─────────────────────────┐
│ job_occupation_to_tasks │──────│   interest_tags         │
│ (직업별 태스크 가중치)    │      │   (관심 태그)            │
├─────────────────────────┤      ├─────────────────────────┤
│ mapping_id (PK)         │      │ interest_tag_id (PK)    │
│ job_occupation_id (FK)  │      │ tag_name                │
│ interest_tag_id (FK)    │      │ tag_code                │
│ boost_weight            │      └─────────────────────────┘
└─────────────────────────┘
```

---

## 캐싱 및 로그

```
┌─────────────────────────────────────┐
│ model_comparison_cache              │
│ (모델 비교 결과 캐시)                 │
├─────────────────────────────────────┤
│ cache_id (PK)                       │
│ model_id_1 (FK)                     │
│ model_id_2 (FK)                     │
│ comparison_data (JSON)              │
│ cached_at                           │
│ expires_at                          │
└─────────────────────────────────────┘


┌─────────────────────────────────────┐
│ data_collection_logs                │
│ (데이터 수집 로그)                    │
├─────────────────────────────────────┤
│ log_id (PK)                         │
│ source_type                         │  ← AA, Naver, Trends
│ collection_date                     │
│ status                              │  ← success, failed, partial
│ records_collected                   │
│ errors_count                        │
│ error_details (JSON)                │
│ duration_seconds                    │
└─────────────────────────────────────┘
```

---

## 데이터 흐름

### 1. AI 모델 데이터 파이프라인

```
[Artificial Analysis API]
         ↓
   (수집: Node.js Collector)
         ↓
   ┌──────────────────────┐
   │ MySQL                │
   ├──────────────────────┤
   │ model_creators       │  ← 32개
   │ ai_models            │  ← 326개
   │ model_evaluations    │  ← 3,616개
   │ model_overall_scores │  ← 326개 (계산됨)
   │ model_pricing        │  ← 326개
   │ model_performance    │  ← 326개
   └──────────────────────┘
         ↓
   ┌──────────────────────┐
   │ Redis (캐싱)          │
   ├──────────────────────┤
   │ ranking:overall      │  ← ZSET
   │ ranking:coding       │  ← ZSET
   │ cache:api:top10      │  ← TTL 1h
   └──────────────────────┘
```

---

### 2. 뉴스 데이터 파이프라인

```
[Naver News API]
         ↓
   (수집: Node.js Collector)
         ↓
   ┌──────────────────────┐
   │ MySQL (메타데이터)    │
   ├──────────────────────┤
   │ news_articles        │  ← 제목, URL, 요약
   │ article_to_tags      │  ← 태그 매핑
   └──────────────────────┘
         ↓
   ┌──────────────────────┐
   │ Elasticsearch (본문)  │
   ├──────────────────────┤
   │ news_articles        │  ← 전문 검색용 (Nori)
   └──────────────────────┘
         ↓
   ┌──────────────────────┐
   │ Kibana (시각화)       │
   ├──────────────────────┤
   │ 뉴스 트렌드 대시보드   │
   │ 키워드 분석          │
   └──────────────────────┘
```

---

### 3. 트렌드 데이터 파이프라인

```
[Google Trends API]
         ↓
   (수집: Python Script)
         ↓
   ┌──────────────────────┐
   │ Elasticsearch         │
   ├──────────────────────┤
   │ trends_index         │  ← 시계열 데이터
   └──────────────────────┘
         ↓
   (분석 및 계산)
         ↓
   ┌──────────────────────┐
   │ MySQL                │
   ├──────────────────────┤
   │ issue_index_daily    │  ← 일별 종합 지수
   │ issue_index_category │  ← 카테고리별 지수
   └──────────────────────┘
```

---

## 테이블 크기 예상

| 테이블 | 현재 데이터 | 예상 증가율 | 1년 후 예상 |
|--------|------------|------------|-------------|
| **model_creators** | 32 | +10/년 | ~50 |
| **ai_models** | 326 | +50/월 | ~900 |
| **model_evaluations** | 3,616 | 모델당 15개 | ~13,500 |
| **model_overall_scores** | 326 | 모델당 1개 | ~900 |
| **model_pricing** | 326 | 월 1회 업데이트 | ~4,000 |
| **model_performance** | 326 | 월 1회 업데이트 | ~4,000 |
| **news_articles** | 0 | 일 100개 | ~36,500 |
| **issue_index_daily** | 0 | 일 1개 | ~365 |
| **users** | 0 | 월 1,000명 | ~12,000 |
| **community_posts** | 0 | 일 50개 | ~18,000 |
| **data_collection_logs** | 0 | 일 10개 | ~3,650 |

---

## 인덱스 전략

### MySQL 인덱스 (주요)

```sql
-- AI 모델 검색
CREATE INDEX idx_model_slug ON ai_models(model_slug);
CREATE INDEX idx_creator_id ON ai_models(creator_id);
CREATE INDEX idx_release_date ON ai_models(release_date);

-- 점수 정렬
CREATE INDEX idx_overall_score ON model_overall_scores(overall_score DESC);
CREATE INDEX idx_coding_index ON model_overall_scores(coding_index DESC);

-- 벤치마크 조회
CREATE INDEX idx_benchmark_name ON model_evaluations(benchmark_name);
CREATE INDEX idx_normalized_score ON model_evaluations(normalized_score);

-- 사용자 검색
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_nickname ON users(nickname);

-- 날짜 조회
CREATE INDEX idx_index_date ON issue_index_daily(index_date);
CREATE INDEX idx_published_at ON news_articles(published_at);

-- 세션 관리
CREATE INDEX idx_user_id ON user_sessions(user_id);
CREATE INDEX idx_expires_at ON user_sessions(expires_at);

-- 커뮤니티
CREATE INDEX idx_created_at ON community_posts(created_at);
CREATE INDEX idx_post_id ON community_comments(post_id);
```

---

### Elasticsearch 인덱스

```json
{
  "news_articles": {
    "mappings": {
      "properties": {
        "title": { "type": "text", "analyzer": "korean" },
        "content": { "type": "text", "analyzer": "korean" },
        "published_at": { "type": "date" },
        "source": { "type": "keyword" },
        "tags": { "type": "keyword" },
        "impact_score": { "type": "integer" }
      }
    }
  },
  
  "trends_index": {
    "mappings": {
      "properties": {
        "keyword": { "type": "keyword" },
        "search_date": { "type": "date" },
        "interest_over_time": { "type": "nested" },
        "interest_by_region": { "type": "nested" }
      }
    }
  }
}
```

---

### Redis 키 구조

```
세션:
session:[user_id]:[token_hash] → String (TTL: 7일)

API 캐싱:
cache:api:models:top10 → List (TTL: 1시간)
cache:api:models:[model_id] → Hash (TTL: 24시간)
cache:compare:[id1]:[id2] → Hash (TTL: 24시간)

랭킹:
ranking:overall_score → Sorted Set
ranking:coding_index → Sorted Set
ranking:math_index → Sorted Set

Rate Limiting:
ratelimit:api:[user_id] → String (TTL: 1분)
```

---

## 주요 관계 요약

### 1:N 관계
```
model_creators (1) → ai_models (N)
ai_models (1) → model_evaluations (N)
ai_models (1) → model_pricing (N)
ai_models (1) → model_performance (N)
users (1) → community_posts (N)
community_posts (1) → community_comments (N)
job_categories (1) → job_occupations (N)
ai_categories (1) → interest_tags (N)
```

### 1:1 관계
```
users (1) ↔ user_profiles (1)
ai_models (1) ↔ model_overall_scores (1)
```

### N:M 관계
```
users ↔ ai_models (via user_interested_models)
users ↔ interest_tags (via user_interest_tags)
news_articles ↔ interest_tags (via article_to_tags)
community_posts ↔ interest_tags (via community_post_tags)
job_occupations ↔ interest_tags (via job_occupation_to_tasks)
community_posts ↔ users (via post_likes)
```

---

## 외래키 제약

### ON DELETE CASCADE
```
users → user_profiles
users → user_sessions
users → community_posts
community_posts → community_comments
ai_models → model_evaluations
ai_models → model_overall_scores
ai_models → model_pricing
ai_models → model_performance
```

### ON DELETE SET NULL
```
user_push_notifications.model_update_id
user_push_notifications.issue_index_id
```

---

## 참고 자료

- **스키마 파일**: `database/migrations/integrated_schema.sql`
- **데이터베이스 구조**: `DATABASE_STRUCTURE.md`
- **Docker 설정**: `docker-compose.yml`
- **NPM 스크립트**: `NPM_SCRIPTS_GUIDE.md`

---

**마지막 업데이트**: 2025-11-15  
**작성자**: Ainus 개발팀