# 🚀 Windows 환경 빠른 시작 체크리스트

**프로젝트 위치**: `C:\path\MProject14v2`

---

## ✅ 완료된 설정

### 1. 환경변수 파일 (.env)
- [x] `.env` 파일 자동 생성 완료
- [x] Artificial Analysis API 키 설정 완료
- [x] Naver API 키 설정 완료
- [x] JWT Secret 자동 생성 완료
- [x] MySQL 비밀번호 자동 생성 완료

### 2. 프로젝트 구조
- [x] Docker Compose 설정 완료
- [x] MySQL 초기 스키마 준비
- [x] Elasticsearch 설정 완료
- [x] Redis 설정 완료
- [x] 문서화 완료

### 3. Windows 전용 파일
- [x] `start.ps1` - PowerShell 시작 스크립트
- [x] `WINDOWS_SETUP.md` - Windows 설정 가이드
- [x] `API_KEYS_SETUP.md` - API 키 확인 문서

---

## 📋 지금 해야 할 작업

### Step 1: Docker Desktop 실행 (필수)
```
1. Docker Desktop 앱 실행
2. 트레이 아이콘에서 Docker가 실행 중인지 확인
3. WSL 2 백엔드가 활성화되어 있는지 확인
```

### Step 2: PowerShell에서 프로젝트 디렉토리로 이동
```powershell
# PowerShell 열기 (관리자 권한 권장)
cd C:\path\MProject14v2

# 파일 확인
dir
```

### Step 3: Docker 컨테이너 시작
```powershell
# 방법 1: PowerShell 스크립트 실행 (추천)
.\start.ps1

# 방법 2: Docker Compose 직접 실행
docker-compose up -d
```

### Step 4: 서비스 상태 확인
```powershell
# 컨테이너 상태 확인
docker-compose ps

# 서비스별 로그 확인
docker-compose logs -f mysql
docker-compose logs -f elasticsearch
docker-compose logs -f redis
```

### Step 5: 접속 테스트

**MySQL 접속**:
```powershell
docker exec -it ainus_mysql mysql -u ainus_user -p ai_model_app
# 비밀번호: THT3wbm/VGmLBOC0FrSoyA==

# MySQL 내부에서
SHOW TABLES;
```

**Elasticsearch 접속**:
- 브라우저에서: http://localhost:9200
- PowerShell에서:
```powershell
Invoke-WebRequest -Uri "http://localhost:9200/_cluster/health?pretty" -UseBasicParsing
```

**Redis 접속**:
```powershell
docker exec -it ainus_redis redis-cli
# Redis 내부에서
PING
# 응답: PONG
```

**Kibana 접속**:
- 브라우저에서: http://localhost:5601

---

## 🎯 다음 개발 단계

### 1. Elasticsearch Nori 플러그인 설치 (한글 형태소 분석)
```powershell
docker exec -it ainus_elasticsearch bin/elasticsearch-plugin install analysis-nori
docker-compose restart elasticsearch
```

### 2. Node.js 프로젝트 초기화
```powershell
# Node.js 설치 확인
node --version
npm --version

# 프로젝트 초기화
mkdir src
cd src
mkdir controllers models routes utils middleware
cd ..

npm init -y

# 필수 패키지 설치
npm install express mysql2 redis @elastic/elasticsearch dotenv bcrypt jsonwebtoken cors helmet
npm install --save-dev typescript @types/node @types/express @types/bcrypt @types/jsonwebtoken nodemon ts-node
```

### 3. TypeScript 설정
```powershell
# tsconfig.json 생성
npx tsc --init

# package.json에 scripts 추가
# "dev": "nodemon --exec ts-node src/index.ts"
# "build": "tsc"
# "start": "node dist/index.js"
```

### 4. 기능 #1 개발 시작 (AI 모델 타임라인)
```
착수일: 2025-11-10 (내일)
담당: 예병성
우선순위: 최상

Week 1 작업:
- [ ] DB 스키마 보완 (benchmark_normalization 테이블)
- [ ] API 엔드포인트 설계
- [ ] Artificial Analysis API 연동 테스트
```

---

## 🔧 유용한 명령어 모음

### Docker 관리
```powershell
# 전체 재시작
docker-compose restart

# 특정 서비스만 재시작
docker-compose restart mysql

# 로그 실시간 확인
docker-compose logs -f

# 컨테이너 중지
docker-compose stop

# 컨테이너 및 볼륨 제거
docker-compose down -v
```

### 데이터베이스 백업
```powershell
# MySQL 백업
mkdir backups
docker exec ainus_mysql mysqldump -u root -pXMkbWpvh34H9/eTkVFXpZg== ai_model_app > backups/backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql
```

### 환경변수 확인
```powershell
# .env 파일 내용 보기
Get-Content .env

# 특정 환경변수만 보기
Get-Content .env | Select-String "API_KEY"
```

---

## 🐛 문제 해결 빠른 가이드

### Docker가 시작되지 않을 때
```
1. Docker Desktop 재시작
2. WSL 2 업데이트: wsl --update
3. 시스템 재부팅
```

### 포트 충돌 시
```powershell
# 포트 사용 중인 프로세스 확인
netstat -ano | findstr "3306"
netstat -ano | findstr "9200"

# 프로세스 종료 (관리자 권한)
taskkill /PID [프로세스ID] /F
```

### MySQL 연결 실패 시
```powershell
# 컨테이너 상태 확인
docker ps

# MySQL 로그 확인
docker-compose logs mysql

# 컨테이너 재시작
docker-compose restart mysql
```

---

## 📚 참고 문서

- `README.md` - 프로젝트 전체 개요
- `docs/WINDOWS_SETUP.md` - Windows 상세 설정 가이드
- `docs/API_KEYS_SETUP.md` - API 키 설정 확인
- `docs/elasticsearch-indices.md` - Elasticsearch 인덱스 설계
- `CHECKLIST.md` - 전체 프로젝트 체크리스트

---

## 🎉 준비 완료!

모든 설정이 완료되었습니다. 이제 개발을 시작할 수 있습니다!

**다음 작업**:
1. ✅ Docker 실행 → `.\start.ps1`
2. ✅ 서비스 확인 → `docker-compose ps`
3. 🚀 백엔드 개발 시작!

**질문이나 문제가 있으면 팀 채널에 남겨주세요!** 💪

---

**업데이트**: 2025-11-10  
**상태**: 개발 준비 완료 ✅
