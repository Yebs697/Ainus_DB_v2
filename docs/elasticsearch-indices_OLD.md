# Elasticsearch 인덱스 설계

## 개요

Ainus 프로젝트에서 Elasticsearch는 두 가지 주요 목적으로 사용됩니다:
1. **AI 모델 상세 성능 데이터 저장**: 대용량 JSON 문서 (벤치마크, 능력치 등)
2. **커뮤니티 게시글 전문 검색**: 한글 형태소 분석 기반 검색

---

## 1. AI 모델 성능 인덱스

### 인덱스명: `ai_model_performance`

### 매핑 (Mapping)

```json
PUT /ai_model_performance
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "analysis": {
      "analyzer": {
        "standard_analyzer": {
          "type": "standard"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "model_id": {
        "type": "integer"
      },
      "model_name": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      },
      "series_name": {
        "type": "keyword"
      },
      "developer": {
        "type": "keyword"
      },
      "version_name": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      },
      "release_date": {
        "type": "date",
        "format": "yyyy-MM-dd"
      },
      "benchmarks": {
        "type": "nested",
        "properties": {
          "name": {
            "type": "keyword"
          },
          "score": {
            "type": "float"
          },
          "normalized_score": {
            "type": "float"
          },
          "percentile": {
            "type": "float"
          }
        }
      },
      "capabilities": {
        "type": "object",
        "properties": {
          "text_generation": {
            "type": "float"
          },
          "code_generation": {
            "type": "float"
          },
          "reasoning": {
            "type": "float"
          },
          "math": {
            "type": "float"
          },
          "vision": {
            "type": "float"
          }
        }
      },
      "context_window": {
        "type": "integer"
      },
      "max_output_tokens": {
        "type": "integer"
      },
      "pricing": {
        "properties": {
          "input_per_1m": {
            "type": "float"
          },
          "output_per_1m": {
            "type": "float"
          },
          "currency": {
            "type": "keyword"
          }
        }
      },
      "metadata": {
        "properties": {
          "source": {
            "type": "keyword"
          },
          "collected_at": {
            "type": "date"
          },
          "api_version": {
            "type": "keyword"
          }
        }
      },
      "created_at": {
        "type": "date"
      },
      "updated_at": {
        "type": "date"
      }
    }
  }
}
```

### 데이터 저장 예시

```json
POST /ai_model_performance/_doc
{
  "model_id": 1,
  "model_name": "GPT-4o",
  "series_name": "GPT",
  "developer": "OpenAI",
  "version_name": "GPT-4o (2024-05-13)",
  "release_date": "2024-05-13",
  "benchmarks": [
    {
      "name": "MMLU Pro",
      "score": 87.0,
      "normalized_score": 87.0,
      "percentile": 95.2
    },
    {
      "name": "GSM8K",
      "score": 92.5,
      "normalized_score": 92.5,
      "percentile": 97.8
    }
  ],
  "capabilities": {
    "text_generation": 9.5,
    "code_generation": 9.2,
    "reasoning": 9.1,
    "math": 8.8,
    "vision": 9.0
  },
  "context_window": 128000,
  "max_output_tokens": 4096,
  "pricing": {
    "input_per_1m": 5.0,
    "output_per_1m": 15.0,
    "currency": "USD"
  },
  "metadata": {
    "source": "artificial_analysis_api",
    "collected_at": "2024-11-09T10:00:00Z",
    "api_version": "v1"
  },
  "created_at": "2024-11-09T10:00:00Z",
  "updated_at": "2024-11-09T10:00:00Z"
}
```

### 조회 예시

```bash
# Document ID로 조회
GET /ai_model_performance/_doc/{document_id}

# 모델 이름으로 검색
GET /ai_model_performance/_search
{
  "query": {
    "match": {
      "model_name": "GPT-4o"
    }
  }
}

# 벤치마크 점수 범위 검색
GET /ai_model_performance/_search
{
  "query": {
    "nested": {
      "path": "benchmarks",
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "benchmarks.name": "MMLU Pro"
              }
            },
            {
              "range": {
                "benchmarks.normalized_score": {
                  "gte": 85
                }
              }
            }
          ]
        }
      }
    }
  }
}
```

---

## 2. 커뮤니티 게시글 검색 인덱스

### 인덱스명: `community_posts`

### 매핑 (Mapping) - 한글 형태소 분석 포함

```json
PUT /community_posts
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "analysis": {
      "tokenizer": {
        "nori_tokenizer": {
          "type": "nori_tokenizer",
          "decompound_mode": "mixed"
        }
      },
      "analyzer": {
        "korean_analyzer": {
          "type": "custom",
          "tokenizer": "nori_tokenizer",
          "filter": ["lowercase", "nori_part_of_speech"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "post_id": {
        "type": "integer"
      },
      "title": {
        "type": "text",
        "analyzer": "korean_analyzer",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      },
      "content": {
        "type": "text",
        "analyzer": "korean_analyzer"
      },
      "content_preview": {
        "type": "text",
        "analyzer": "korean_analyzer"
      },
      "category": {
        "type": "keyword"
      },
      "author_id": {
        "type": "integer"
      },
      "author_name": {
        "type": "keyword"
      },
      "likes_count": {
        "type": "integer"
      },
      "comments_count": {
        "type": "integer"
      },
      "is_active": {
        "type": "boolean"
      },
      "created_at": {
        "type": "date"
      },
      "updated_at": {
        "type": "date"
      }
    }
  }
}
```

### 데이터 인덱싱 예시

```json
POST /community_posts/_doc
{
  "post_id": 12345,
  "title": "ChatGPT로 블로그 글 10배 빠르게 작성하는 법",
  "content": "# 프롬프트 예시\n\n ChatGPT를 활용하면 블로그 글 작성 시간을 크게 단축할 수 있습니다...",
  "content_preview": "ChatGPT를 활용하면 블로그 글 작성 시간을 크게 단축할 수 있습니다...",
  "category": "prompt_tip",
  "author_id": 1,
  "author_name": "최수안",
  "likes_count": 42,
  "comments_count": 8,
  "is_active": true,
  "created_at": "2024-11-09T10:30:00Z",
  "updated_at": "2024-11-09T10:30:00Z"
}
```

### 검색 예시

```bash
# 전문 검색 (한글 형태소 분석)
GET /community_posts/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "이미지 생성 프롬프트",
            "fields": ["title^2", "content"],
            "type": "best_fields",
            "operator": "or"
          }
        },
        {
          "term": {
            "is_active": true
          }
        }
      ],
      "filter": [
        {
          "term": {
            "category": "prompt_tip"
          }
        }
      ]
    }
  },
  "highlight": {
    "fields": {
      "title": {},
      "content": {}
    },
    "pre_tags": ["<em>"],
    "post_tags": ["</em>"]
  },
  "sort": [
    {
      "_score": {
        "order": "desc"
      }
    },
    {
      "created_at": {
        "order": "desc"
      }
    }
  ],
  "from": 0,
  "size": 20
}

# 인기 게시글 검색
GET /community_posts/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "likes_count": {
        "order": "desc"
      }
    }
  ],
  "from": 0,
  "size": 10
}
```

---

## 3. 인덱스 관리

### 인덱스 생성

```bash
# AI 모델 성능 인덱스 생성
curl -X PUT "localhost:9200/ai_model_performance" -H 'Content-Type: application/json' -d @mappings/ai_model_performance.json

# 커뮤니티 게시글 인덱스 생성
curl -X PUT "localhost:9200/community_posts" -H 'Content-Type: application/json' -d @mappings/community_posts.json
```

### 인덱스 삭제

```bash
curl -X DELETE "localhost:9200/ai_model_performance"
curl -X DELETE "localhost:9200/community_posts"
```

### 인덱스 리인덱싱

```bash
POST /_reindex
{
  "source": {
    "index": "community_posts"
  },
  "dest": {
    "index": "community_posts_v2"
  }
}
```

### 인덱스 별칭 (Alias) 사용

```bash
# 별칭 생성
POST /_aliases
{
  "actions": [
    {
      "add": {
        "index": "community_posts_v2",
        "alias": "community_posts"
      }
    }
  ]
}
```

---

## 4. 성능 최적화

### Bulk API 사용

```bash
# 대량 데이터 인덱싱
POST /_bulk
{ "index": { "_index": "ai_model_performance" } }
{ "model_id": 1, "model_name": "GPT-4o", ... }
{ "index": { "_index": "ai_model_performance" } }
{ "model_id": 2, "model_name": "Claude 3 Opus", ... }
```

### 캐싱 전략

- **Request Cache**: 동일한 쿼리 결과 캐싱
- **Field Data Cache**: 집계 및 정렬에 사용되는 필드 캐싱

### 샤드 및 복제본 설정

```json
{
  "settings": {
    "number_of_shards": 1,     // 소규모: 1, 대규모: 3-5
    "number_of_replicas": 0    // 개발: 0, 프로덕션: 1-2
  }
}
```

---

## 5. 모니터링

### 인덱스 상태 확인

```bash
# 전체 인덱스 목록
GET /_cat/indices?v

# 특정 인덱스 상태
GET /ai_model_performance/_stats

# 검색 성능 확인
GET /community_posts/_search
{
  "profile": true,
  "query": {
    "match": {
      "title": "ChatGPT"
    }
  }
}
```

### 디스크 사용량 확인

```bash
GET /_cat/allocation?v
```

---

## 6. 백업 및 복구

### 스냅샷 저장소 설정

```bash
PUT /_snapshot/backup_repo
{
  "type": "fs",
  "settings": {
    "location": "/usr/share/elasticsearch/backup"
  }
}
```

### 스냅샷 생성

```bash
PUT /_snapshot/backup_repo/snapshot_1
{
  "indices": "ai_model_performance,community_posts",
  "ignore_unavailable": true,
  "include_global_state": false
}
```

### 스냅샷 복구

```bash
POST /_snapshot/backup_repo/snapshot_1/_restore
{
  "indices": "ai_model_performance,community_posts"
}
```

---

## 7. 주의사항

1. **한글 형태소 분석**: Nori 플러그인 설치 필수
   ```bash
   docker exec -it ainus_elasticsearch bin/elasticsearch-plugin install analysis-nori
   ```

2. **메모리 설정**: Elasticsearch는 최소 2GB RAM 권장

3. **문서 ID 관리**: MySQL의 ID와 Elasticsearch document ID는 별도 관리

4. **동기화**: MySQL과 Elasticsearch 간 데이터 일관성 유지 로직 필요

---

## 8. 참고 자료

- [Elasticsearch 공식 문서](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Nori 한글 형태소 분석기](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-nori.html)
- [Elasticsearch Best Practices](https://www.elastic.co/guide/en/elasticsearch/reference/current/general-recommendations.html)
