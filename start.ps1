# Ainus 프로젝트 빠른 시작 스크립트 (Windows PowerShell)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Ainus 프로젝트 Docker 환경 시작" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 환경변수 파일 확인
if (-Not (Test-Path .env)) {
    Write-Host "⚠️  .env 파일이 없습니다. .env.example을 복사합니다..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env 파일이 생성되었습니다." -ForegroundColor Green
    Write-Host "⚠️  .env 파일을 열어 필요한 값을 수정해주세요." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "엔터를 눌러 계속..."
}

# Docker 확인
Write-Host "🔍 Docker 환경 확인 중..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker가 설치되어 있지 않거나 실행 중이 아닙니다." -ForegroundColor Red
    Write-Host "Docker Desktop을 설치하고 실행해주세요: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Read-Host "엔터를 눌러 종료..."
    exit 1
}

try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose가 설치되어 있지 않습니다." -ForegroundColor Red
    Read-Host "엔터를 눌러 종료..."
    exit 1
}

Write-Host ""
Write-Host "🚀 Docker 컨테이너 시작 중..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker 컨테이너 시작 실패" -ForegroundColor Red
    Read-Host "엔터를 눌러 종료..."
    exit 1
}

Write-Host ""
Write-Host "⏳ 서비스 초기화 대기 중 (약 30초)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ 서비스 상태 확인" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# MySQL 상태 확인
Write-Host -NoNewline "MySQL: "
try {
    $mysqlCheck = docker exec ainus_mysql mysqladmin ping -h localhost --silent 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 정상" -ForegroundColor Green
    } else {
        Write-Host "❌ 연결 실패" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 연결 실패" -ForegroundColor Red
}

# Elasticsearch 상태 확인
Write-Host -NoNewline "Elasticsearch: "
try {
    $esCheck = Invoke-WebRequest -Uri "http://localhost:9200/_cluster/health" -Method Get -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($esCheck.StatusCode -eq 200) {
        Write-Host "✅ 정상" -ForegroundColor Green
    } else {
        Write-Host "❌ 연결 실패" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 연결 실패" -ForegroundColor Red
}

# Redis 상태 확인
Write-Host -NoNewline "Redis: "
try {
    $redisCheck = docker exec ainus_redis redis-cli ping 2>&1
    if ($redisCheck -eq "PONG") {
        Write-Host "✅ 정상" -ForegroundColor Green
    } else {
        Write-Host "❌ 연결 실패" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 연결 실패" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📌 접속 정보" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "MySQL:         localhost:3306" -ForegroundColor White
Write-Host "Elasticsearch: http://localhost:9200" -ForegroundColor White
Write-Host "Redis:         localhost:6379" -ForegroundColor White
Write-Host "Kibana:        http://localhost:5601" -ForegroundColor White
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎉 모든 서비스가 시작되었습니다!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 유용한 명령어:" -ForegroundColor Yellow
Write-Host "  - 로그 확인:       docker-compose logs -f" -ForegroundColor White
Write-Host "  - 서비스 중지:     docker-compose stop" -ForegroundColor White
Write-Host "  - 서비스 재시작:   docker-compose restart" -ForegroundColor White
Write-Host "  - 완전 제거:       docker-compose down -v" -ForegroundColor White
Write-Host ""

Read-Host "엔터를 눌러 종료..."
