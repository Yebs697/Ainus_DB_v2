# Windows 환경 설정 가이드

## 프로젝트 위치
`C:\path\MProject14v2`

---

## 1. 사전 준비사항

### 1.1 필수 소프트웨어 설치

#### Docker Desktop for Windows
1. [Docker Desktop 다운로드](https://www.docker.com/products/docker-desktop)
2. 설치 후 재부팅
3. Docker Desktop 실행
4. WSL 2 백엔드 활성화 (권장)

**확인 방법**:
```powershell
docker --version
docker-compose --version
```

#### Git for Windows (선택사항)
- [Git 다운로드](https://git-scm.com/download/win)

---

## 2. 빠른 시작

### 2.1 PowerShell에서 실행

```powershell
# 프로젝트 디렉토리로 이동
cd C:\path\MProject14v2

# 환경변수 파일 확인 (.env 파일은 이미 생성되어 있음)
Get-Content .env

# PowerShell 시작 스크립트 실행
.\start.ps1

# 또는 Docker Compose 직접 실행
docker-compose up -d
```

### 2.2 서비스 상태 확인

```powershell
# 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그만 확인
docker-compose logs -f mysql
```

---

## 3. 주요 명령어 (PowerShell)

### 3.1 Docker 관리

```powershell
# 서비스 시작
docker-compose up -d

# 서비스 중지
docker-compose stop

# 서비스 재시작
docker-compose restart

# 서비스 제거 (데이터 유지)
docker-compose down

# 서비스 및 데이터 완전 제거
docker-compose down -v

# 로그 확인
docker-compose logs -f
```

### 3.2 MySQL 접속

```powershell
# MySQL CLI 접속
docker exec -it ainus_mysql mysql -u ainus_user -p ai_model_app

# 비밀번호: .env 파일의 MYSQL_PASSWORD 값 입력
```

### 3.3 Redis 접속

```powershell
# Redis CLI 접속
docker exec -it ainus_redis redis-cli

# Redis 내부에서
PING
# 응답: PONG
```

### 3.4 Elasticsearch 상태 확인

```powershell
# 브라우저에서 접속
Start-Process "http://localhost:9200"

# 또는 PowerShell에서 확인
Invoke-WebRequest -Uri "http://localhost:9200/_cluster/health?pretty" -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

## 4. 서비스 접속 정보

| 서비스 | 포트 | URL/주소 |
|--------|------|----------|
| MySQL | 3306 | localhost:3306 |
| Elasticsearch | 9200 | http://localhost:9200 |
| Redis | 6379 | localhost:6379 |
| Kibana | 5601 | http://localhost:5601 |

### 4.1 MySQL 접속 정보
- **호스트**: localhost
- **포트**: 3306
- **데이터베이스**: ai_model_app
- **사용자**: ainus_user
- **비밀번호**: `.env` 파일의 `MYSQL_PASSWORD` 참조

### 4.2 Elasticsearch
- **URL**: http://localhost:9200
- **보안**: 비활성화 (개발 환경)

### 4.3 Redis
- **호스트**: localhost
- **포트**: 6379
- **비밀번호**: 없음 (개발 환경)

---

## 5. 문제 해결

### 5.1 Docker Desktop이 시작되지 않을 때

**증상**: Docker 명령어 실행 시 오류
```
error during connect: ... Is the docker daemon running?
```

**해결방법**:
1. Docker Desktop 앱을 실행
2. 트레이 아이콘에서 Docker가 실행 중인지 확인
3. 재시작이 필요할 수 있음

### 5.2 포트 충돌 발생

**증상**: 
```
Error: port is already allocated
```

**해결방법**:
```powershell
# 사용 중인 포트 확인
netstat -ano | findstr "3306"
netstat -ano | findstr "9200"
netstat -ano | findstr "6379"

# 프로세스 종료 (관리자 권한 필요)
taskkill /PID [프로세스ID] /F
```

### 5.3 WSL 2 설정 오류

**증상**: Docker Desktop 시작 시 WSL 관련 오류

**해결방법**:
1. Windows 기능 켜기/끄기에서 "Linux용 Windows 하위 시스템" 활성화
2. PowerShell 관리자 모드에서 실행:
```powershell
wsl --install
wsl --set-default-version 2
```
3. 재부팅

### 5.4 MySQL 연결 실패

**증상**: 
```
Can't connect to MySQL server
```

**해결방법**:
```powershell
# 컨테이너 로그 확인
docker-compose logs mysql

# 컨테이너 재시작
docker-compose restart mysql

# MySQL 프로세스 확인
docker exec -it ainus_mysql ps aux | findstr mysql
```

### 5.5 Elasticsearch 메모리 부족

**증상**: Elasticsearch 컨테이너가 계속 재시작됨

**해결방법**:
1. Docker Desktop 설정에서 메모리 할당 증가 (최소 4GB 권장)
2. `docker-compose.yml`에서 Elasticsearch 메모리 설정 조정:
```yaml
environment:
  - "ES_JAVA_OPTS=-Xms256m -Xmx256m"  # 512m에서 256m으로 감소
```

---

## 6. 개발 환경 설정

### 6.1 Node.js 설치 (향후 백엔드 개발용)

1. [Node.js 다운로드](https://nodejs.org/) (LTS 버전 권장)
2. 설치 확인:
```powershell
node --version
npm --version
```

### 6.2 데이터베이스 GUI 도구 (선택사항)

**MySQL**:
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
- [DBeaver](https://dbeaver.io/download/)

**Redis**:
- [RedisInsight](https://redis.com/redis-enterprise/redis-insight/)

---

## 7. 환경변수 파일 (.env)

프로젝트에는 이미 `.env` 파일이 생성되어 있으며, 다음 API 키가 설정되어 있습니다:

```env
# Artificial Analysis API
ARTIFICIAL_ANALYSIS_API_KEY=aa_uInrMxtbivCXYIvoYTTfckIiYmFVJYRa

# Naver API (뉴스 수집용)
NAVER_CLIENT_ID=q1aA7IXmMiyuXuyCyXzo
NAVER_CLIENT_SECRET=97G_YlsjEK
```

**보안 주의사항**:
- ⚠️ `.env` 파일은 절대 Git에 커밋하지 마세요!
- ⚠️ API 키를 공개 저장소에 올리지 마세요!
- `.gitignore`에 `.env`가 포함되어 있는지 확인하세요

---

## 8. 다음 단계

환경 설정이 완료되면:

1. ✅ Docker 컨테이너 실행 확인
2. ✅ MySQL 스키마 확인
3. ✅ Elasticsearch 인덱스 생성 (Nori 플러그인 설치)
4. 🚀 백엔드 API 개발 시작

**Nori 플러그인 설치** (한글 형태소 분석):
```powershell
docker exec -it ainus_elasticsearch bin/elasticsearch-plugin install analysis-nori
docker-compose restart elasticsearch
```

---

## 9. 참고 자료

- [Docker Desktop 문서](https://docs.docker.com/desktop/windows/)
- [WSL 2 설치 가이드](https://docs.microsoft.com/ko-kr/windows/wsl/install)
- [PowerShell 7 다운로드](https://github.com/PowerShell/PowerShell/releases)

---

**문의사항이 있으면 팀 채널에 남겨주세요!** 🚀
