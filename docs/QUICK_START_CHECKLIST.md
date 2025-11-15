# Ainus 프로젝트 환경 구축 빠른 체크리스트

**업데이트 일자**: 2025-11-15  
**예상 소요 시간**: 10-15분

---

## 사전 준비

- [ ] Docker Desktop 설치 확인 (버전 20.10+)
- [ ] Git 설치 확인
- [ ] 최소 4GB RAM 여유 공간
- [ ] 최소 10GB 디스크 공간

---

## Step 1: 프로젝트 받기 (2분)

```bash
# PowerShell 또는 CMD에서 실행
git clone https://github.com/Yebs697/ai-model-app_v2.git
cd ai-model-app_v2
```

- [ ] 프로젝트 클론 완료
- [ ] 프로젝트 디렉토리 이동 완료

---

## Step 2: 환경 변수 설정 (1분)

```bash
# .env.example을 복사
copy .env.example .env

# .env 파일 편집 (메모장으로 열기)
notepad .env
```

**필수 확인 사항**:
```env
MYSQL_ROOT_PASSWORD=root_password_here
MYSQL_DATABASE=ai_model_app
MYSQL_USER=ainus_user
MYSQL_PASSWORD=qwer1234
MYSQL_PORT=3307

# API 키 (나중에 추가 가능)
# ARTIFICIAL_ANALYSIS_API_KEY=your_key_here
```

- [ ] .env 파일 생성 완료
- [ ] MySQL 설정 확인 완료

---

## Step 3: Docker 컨테이너 실행 (3-5분)

```bash
# Docker Desktop이 실행 중인지 확인
docker --version

# 컨테이너 시작 (최초 실행 시 이미지 다운로드)
docker-compose up -d

# 진행 상황 확인
docker-compose logs -f
```

**예상 출력**:
```
Creating ainus_mysql ... done
Creating ainus_elasticsearch ... done
Creating ainus_redis ... done
Creating ainus_kibana ... done
```

- [ ] Docker Desktop 실행 확인
- [ ] docker-compose up -d 성공
- [ ] 4개 컨테이너 실행 중

---

## Step 4: 데이터베이스 확인 (2분)

### 4.1. 컨테이너 상태 확인
```bash
docker ps
```

**확인 사항**:
- ainus_mysql (STATUS: Up)
- ainus_elasticsearch (STATUS: Up)
- ainus_redis (STATUS: Up)
- ainus_kibana (STATUS: Up)

- [ ] 4개 컨테이너 모두 실행 중

### 4.2. 테이블 생성 확인
```bash
# MySQL 접속
docker exec -it ainus_mysql mysql -u ainus_user -pqwer1234 ai_model_app

# MySQL 프롬프트에서
SHOW TABLES;

# 30개 테이블 출력되는지 확인
# exit로 종료
```

- [ ] MySQL 접속 성공
- [ ] 30개 테이블 생성 확인

---

## Step 5: Node.js 설정 (2-3분)

```bash
# 프로젝트 루트에서
npm install

# 빌드 테스트
npm run build
```

- [ ] npm install 성공
- [ ] TypeScript 빌드 성공

---

## Step 6: 데이터베이스 연결 테스트 (1분)

```bash
npm run db:check
```

**예상 출력**:
```
========================================
DATABASE STATUS CHECK
========================================

총 테이블 수: 30

테이블별 데이터 개수:
  ai_categories: 0개
  ai_models: 0개
  ...
```

- [ ] db:check 스크립트 실행 성공
- [ ] 30개 테이블 확인

---

## Step 7: 서비스 접속 확인 (1분)

### MySQL
```bash
# 연결 테스트
docker exec -it ainus_mysql mysql -u ainus_user -pqwer1234 -e "SELECT 1;"
```

### Elasticsearch
```
브라우저에서: http://localhost:9200
```

### Kibana
```
브라우저에서: http://localhost:5601
```

- [ ] MySQL 접속 성공
- [ ] Elasticsearch 접속 성공
- [ ] Kibana 접속 성공

---

## Step 8: (선택사항) 샘플 데이터 수집 (5-10분)

**API 키가 있는 경우**:
```bash
# .env 파일에 API 키 설정 후
npm run pipeline:aa
```

**예상 출력**:
```
======================================================================
ARTIFICIAL ANALYSIS PIPELINE START
======================================================================
✅ 326개 모델 수집 완료
✅ MySQL 연결 완료
✅ 모델 데이터 저장 완료
✅ 종합 점수 계산 완료
```

- [ ] API 키 설정 완료
- [ ] 데이터 수집 성공
- [ ] 326개 모델 저장 확인

---

## 완료 확인

모든 체크박스가 완료되었다면 환경 구축 성공!

### 최종 확인 명령어
```bash
# 전체 상태 확인
docker ps
npm run db:check

# 상위 모델 확인 (데이터가 있는 경우)
npm run db:check:top
```

---

## 문제 발생 시

### 포트 충돌
```
Error: Port 3307 is already in use
```
**해결**: docker-compose.yml에서 포트 변경 (3307 → 3308)

### 컨테이너 시작 실패
```bash
# 로그 확인
docker-compose logs mysql

# 재시작
docker-compose restart mysql
```

### npm install 오류
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
npm install
```

### 데이터베이스 연결 오류
```bash
# 컨테이너 상태 확인
docker ps

# MySQL이 실행 중이 아니면
docker-compose up -d mysql
```

---

## 다음 단계

환경 구축이 완료되면:

1. **API 개발 시작**
   - REST API 엔드포인트 구현
   - 기존 데이터 활용

2. **데이터 수집 설정**
   - Artificial Analysis API 키 등록
   - 네이버 API 키 등록 (선택)

3. **개발 시작**
   - 팀 작업 분담
   - Git 브랜치 전략 수립

---

## 추가 문서

- **상세 가이드**: TEAM_SETUP_GUIDE.md
- **변경사항**: DOCKER_COMPOSE_CHANGELOG.md
- **비교 분석**: COMPARISON_DETAIL.md
- **ERD**: database/ERD.md

---

## 문의

환경 구축 중 문제가 발생하면:
- 팀 채널에 공유
- 에러 메시지 스크린샷 첨부
- docker-compose logs 출력 공유

---

**축하합니다! 개발 환경 구축이 완료되었습니다.**
