# Ainus 프로젝트 구조

```
MProject14v2/
│
├── docker-compose.yml              # Docker Compose 메인 설정 파일
├── .env.example                    # 환경변수 템플릿
├── .gitignore                      # Git 제외 파일 목록
├── README.md                       # 프로젝트 설명서
├── Makefile                        # 편리한 명령어 모음
├── start.sh                        # 빠른 시작 스크립트
│
├── config/                         # 서비스 설정 파일
│   ├── mysql/
│   │   └── my.cnf                 # MySQL 설정
│   ├── elasticsearch/
│   │   └── elasticsearch.yml      # Elasticsearch 설정
│   ├── redis/
│   │   └── redis.conf             # Redis 설정
│   └── kibana/
│       └── kibana.yml             # Kibana 설정
│
├── init-scripts/                   # 초기화 스크립트
│   └── mysql/
│       └── 01-schema.sql          # MySQL 초기 스키마
│
└── docs/                           # 문서
    ├── elasticsearch-indices.md   # Elasticsearch 인덱스 설계
    ├── api-integration.md         # API 연동 가이드 (예정)
    └── performance-tuning.md      # 성능 최적화 가이드 (예정)
```

## 파일 설명

### 루트 디렉토리

- **docker-compose.yml**: MySQL, Elasticsearch, Redis, Kibana 서비스 정의
- **.env.example**: 환경변수 템플릿 (복사하여 .env로 사용)
- **README.md**: 프로젝트 개요 및 사용 가이드
- **Makefile**: `make start`, `make logs` 등 편리한 명령어 제공
- **start.sh**: 한 번에 모든 서비스를 시작하는 스크립트

### config/

각 서비스의 설정 파일을 포함합니다:

- **mysql/my.cnf**: MySQL 성능 최적화 및 UTF-8 설정
- **elasticsearch/elasticsearch.yml**: 단일 노드 설정, 보안 비활성화
- **redis/redis.conf**: 캐싱 정책, 메모리 관리
- **kibana/kibana.yml**: Elasticsearch 연결 설정

### init-scripts/

컨테이너 초기 실행 시 자동으로 실행되는 스크립트:

- **mysql/01-schema.sql**: 데이터베이스 및 테이블 생성

### docs/

프로젝트 관련 문서:

- **elasticsearch-indices.md**: Elasticsearch 인덱스 매핑 및 사용법
- **api-integration.md**: Node.js에서 DB 연결 가이드 (예정)
- **performance-tuning.md**: 성능 최적화 팁 (예정)

## 데이터 볼륨

Docker 볼륨은 다음과 같이 자동 생성됩니다:

- `mysql_data/`: MySQL 데이터 파일
- `elasticsearch_data/`: Elasticsearch 인덱스 데이터
- `redis_data/`: Redis RDB 파일

⚠️ 이 볼륨들은 `.gitignore`에 포함되어 있으며, `docker-compose down -v`로 삭제할 수 있습니다.

## 향후 추가 예정

```
MProject14v2/
│
├── src/                            # 백엔드 소스 코드 (예정)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── utils/
│
├── tests/                          # 테스트 코드 (예정)
│   ├── unit/
│   └── integration/
│
└── scripts/                        # 유틸리티 스크립트 (예정)
    ├── seed-data.js               # 초기 데이터 삽입
    └── create-indices.js          # Elasticsearch 인덱스 생성
```
