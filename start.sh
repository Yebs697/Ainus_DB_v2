#!/bin/bash

# Ainus 프로젝트 빠른 시작 스크립트

set -e

echo "=========================================="
echo "Ainus 프로젝트 Docker 환경 시작"
echo "=========================================="

# 환경변수 파일 확인
if [ ! -f .env ]; then
    echo "⚠️  .env 파일이 없습니다. .env.example을 복사합니다..."
    cp .env.example .env
    echo "✅ .env 파일이 생성되었습니다. 필요한 값을 수정해주세요."
fi

# Docker 및 Docker Compose 확인
if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되어 있지 않습니다."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose가 설치되어 있지 않습니다."
    exit 1
fi

echo ""
echo "🚀 Docker 컨테이너 시작 중..."
docker-compose up -d

echo ""
echo "⏳ 서비스 초기화 대기 중 (약 30초)..."
sleep 30

echo ""
echo "=========================================="
echo "✅ 서비스 상태 확인"
echo "=========================================="

# MySQL 상태 확인
echo -n "MySQL: "
if docker exec ainus_mysql mysqladmin ping -h localhost -u root -p${MYSQL_ROOT_PASSWORD:-root_password_change_me} --silent 2>/dev/null; then
    echo "✅ 정상"
else
    echo "❌ 연결 실패"
fi

# Elasticsearch 상태 확인
echo -n "Elasticsearch: "
if curl -s http://localhost:9200/_cluster/health > /dev/null 2>&1; then
    echo "✅ 정상"
else
    echo "❌ 연결 실패"
fi

# Redis 상태 확인
echo -n "Redis: "
if docker exec ainus_redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ 정상"
else
    echo "❌ 연결 실패"
fi

echo ""
echo "=========================================="
echo "📌 접속 정보"
echo "=========================================="
echo "MySQL:         localhost:3306"
echo "Elasticsearch: http://localhost:9200"
echo "Redis:         localhost:6379"
echo "Kibana:        http://localhost:5601"
echo ""
echo "=========================================="
echo "🎉 모든 서비스가 시작되었습니다!"
echo "=========================================="
echo ""
echo "💡 유용한 명령어:"
echo "  - 로그 확인:       docker-compose logs -f"
echo "  - 서비스 중지:     docker-compose stop"
echo "  - 서비스 재시작:   docker-compose restart"
echo "  - 완전 제거:       docker-compose down -v"
