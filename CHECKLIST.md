# ✅ Ainus 프로젝트 DB 설정 완료 체크리스트

## 🎯 프로젝트 개요
- **프로젝트명**: Ainus - AI 모델 정보 및 커뮤니티 플랫폼
- **위치**: `/home/claude/MProject14v2` (Windows: `C:\path\MProject14v2`)
- **완료일**: 2025-11-10

---

## ✅ 완료된 작업

### 1. Docker 환경 구성
- [x] Docker Compose 파일 작성 (`docker-compose.yml`)
- [x] MySQL 8.0 컨테이너 설정
- [x] Elasticsearch 8.11 컨테이너 설정
- [x] Redis 7.2 컨테이너 설정
- [x] Kibana 8.11 컨테이너 설정 (선택사항)
- [x] 네트워크 및 볼륨 구성

### 2. MySQL 설정
- [x] 초기 스키마 파일 작성 (`01-schema.sql`)
- [x] 사용자 테이블 정의 (users, user_social_accounts)
- [x] AI 모델 테이블 정의 (ai_models, model_benchmarks, model_versions, model_updates)
- [x] 커뮤니티 테이블 정의 (community_posts, post_likes)
- [x] 이슈 지수 테이블 정의 (issue_indices)
- [x] 인덱스 및 외래키 제약조건 설정
- [x] UTF-8 문자셋 설정
- [x] 성능 최적화 설정 (`my.cnf`)

### 3. Elasticsearch 설정
- [x] Elasticsearch 설정 파일 (`elasticsearch.yml`)
- [x] 단일 노드 모드 설정
- [x] 보안 비활성화 (개발 환경용)
- [x] 인덱스 설계 문서 작성
  - [x] `ai_model_performance` 인덱스 매핑
  - [x] `community_posts` 인덱스 매핑
  - [x] 한글 형태소 분석기 (Nori) 설정 가이드

### 4. Redis 설정
- [x] Redis 설정 파일 (`redis.conf`)
- [x] 캐싱 정책 설정 (LRU)
- [x] 메모리 관리 설정 (256MB)
- [x] 데이터 지속성 설정

### 5. 문서화
- [x] README.md - 프로젝트 개요 및 사용 가이드
- [x] .env.example - 환경변수 템플릿
- [x] elasticsearch-indices.md - Elasticsearch 인덱스 설계
- [x] PROJECT_STRUCTURE.md - 프로젝트 구조 설명
- [x] .gitignore - Git 제외 파일 목록

### 6. 유틸리티
- [x] start.sh - 빠른 시작 스크립트
- [x] Makefile - 편리한 명령어 모음
- [x] 실행 권한 부여

---

## 📋 다음 단계 (사용자가 해야 할 작업)

### 1. 프로젝트 디렉토리로 이동
```bash
cd /home/claude/MProject14v2
# 또는 Windows: cd C:\path\MProject14v2
```

### 2. 환경변수 설정
```bash
# .env 파일 생성 (템플릿 복사)
cp .env.example .env

# .env 파일 편집 (중요!)
# - MYSQL_PASSWORD 변경
# - MYSQL_ROOT_PASSWORD 변경
# - JWT_SECRET 변경
# - API 키 입력 (ARTIFICIAL_ANALYSIS_API_KEY 등)
```

### 3. Docker 컨테이너 시작
```bash
# 방법 1: 스크립트 사용
./start.sh

# 방법 2: Docker Compose 직접 사용
docker-compose up -d

# 방법 3: Makefile 사용
make start
```

### 4. 서비스 상태 확인
```bash
# 방법 1: Makefile 사용
make status
make test-connections

# 방법 2: Docker Compose 사용
docker-compose ps
docker-compose logs -f
```

### 5. 접속 확인
- **MySQL**: `localhost:3306`
  ```bash
  mysql -h localhost -P 3306 -u ainus_user -p ai_model_app
  ```

- **Elasticsearch**: http://localhost:9200
  ```bash
  curl http://localhost:9200/_cluster/health?pretty
  ```

- **Redis**: `localhost:6379`
  ```bash
  redis-cli -h localhost -p 6379 ping
  ```

- **Kibana**: http://localhost:5601

### 6. Elasticsearch 인덱스 생성
```bash
# ai_model_performance 인덱스 생성
curl -X PUT "localhost:9200/ai_model_performance" \
  -H 'Content-Type: application/json' \
  -d @docs/mappings/ai_model_performance.json

# community_posts 인덱스 생성 (한글 형태소 분석기 설치 후)
# 먼저 Nori 플러그인 설치
docker exec -it ainus_elasticsearch bin/elasticsearch-plugin install analysis-nori
docker-compose restart elasticsearch

# 인덱스 생성
curl -X PUT "localhost:9200/community_posts" \
  -H 'Content-Type: application/json' \
  -d @docs/mappings/community_posts.json
```

---

## 🎓 추가 학습 자료

### MySQL
- [MySQL 8.0 공식 문서](https://dev.mysql.com/doc/refman/8.0/en/)
- [InnoDB 스토리지 엔진](https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html)

### Elasticsearch
- [Elasticsearch 공식 문서](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Nori 한글 형태소 분석기](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-nori.html)
- [Elasticsearch 매핑](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html)

### Redis
- [Redis 공식 문서](https://redis.io/documentation)
- [Redis 캐싱 전략](https://redis.io/docs/manual/patterns/)

### Docker
- [Docker Compose 문서](https://docs.docker.com/compose/)
- [Docker 볼륨 관리](https://docs.docker.com/storage/volumes/)

---

## 🐛 문제 해결

### Elasticsearch가 시작되지 않는 경우
```bash
# vm.max_map_count 설정 (Linux/Mac)
sudo sysctl -w vm.max_map_count=262144

# 영구 적용
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
```

### 포트 충돌 시
```bash
# 사용 중인 포트 확인
netstat -tuln | grep -E '3306|9200|6379|5601'

# docker-compose.yml에서 포트 변경 후 재시작
docker-compose down
docker-compose up -d
```

### MySQL 연결 실패 시
```bash
# 로그 확인
docker-compose logs mysql

# 컨테이너 재시작
docker-compose restart mysql
```

---

## 📞 연락처

문제가 발생하거나 질문이 있으면 프로젝트 담당자에게 문의하세요.

- **백엔드 팀장**: 최수안
- **백엔드 개발**: 예병성

---

## 🎉 프로젝트 준비 완료!

모든 데이터베이스 인프라가 준비되었습니다. 이제 백엔드 API 개발을 시작할 수 있습니다!
