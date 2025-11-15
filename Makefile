.PHONY: help start stop restart logs clean backup test

help: ## 사용 가능한 명령어 표시
	@echo "Ainus 프로젝트 - 사용 가능한 명령어:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

start: ## Docker 컨테이너 시작
	@echo "🚀 Docker 컨테이너 시작 중..."
	docker-compose up -d
	@echo "✅ 컨테이너가 시작되었습니다."

stop: ## Docker 컨테이너 중지
	@echo "🛑 Docker 컨테이너 중지 중..."
	docker-compose stop
	@echo "✅ 컨테이너가 중지되었습니다."

restart: ## Docker 컨테이너 재시작
	@echo "🔄 Docker 컨테이너 재시작 중..."
	docker-compose restart
	@echo "✅ 컨테이너가 재시작되었습니다."

logs: ## 전체 로그 확인
	docker-compose logs -f

logs-mysql: ## MySQL 로그 확인
	docker-compose logs -f mysql

logs-es: ## Elasticsearch 로그 확인
	docker-compose logs -f elasticsearch

logs-redis: ## Redis 로그 확인
	docker-compose logs -f redis

status: ## 서비스 상태 확인
	@echo "📊 서비스 상태:"
	@docker-compose ps

clean: ## 컨테이너 및 볼륨 제거
	@echo "🗑️  컨테이너 및 볼륨 제거 중..."
	docker-compose down -v
	@echo "✅ 정리가 완료되었습니다."

mysql-cli: ## MySQL CLI 접속
	docker exec -it ainus_mysql mysql -u ainus_user -p ai_model_app

redis-cli: ## Redis CLI 접속
	docker exec -it ainus_redis redis-cli

es-health: ## Elasticsearch 클러스터 상태 확인
	@curl -s http://localhost:9200/_cluster/health?pretty

es-indices: ## Elasticsearch 인덱스 목록
	@curl -s http://localhost:9200/_cat/indices?v

backup-mysql: ## MySQL 데이터베이스 백업
	@echo "💾 MySQL 백업 생성 중..."
	@mkdir -p backups
	docker exec ainus_mysql mysqldump -u root -proot_password_change_me ai_model_app > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ 백업이 생성되었습니다: backups/"

init: ## 초기 설정 (환경변수 파일 복사)
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅ .env 파일이 생성되었습니다. 필요한 값을 수정해주세요."; \
	else \
		echo "⚠️  .env 파일이 이미 존재합니다."; \
	fi

test-connections: ## 모든 서비스 연결 테스트
	@echo "🔍 연결 테스트 중..."
	@echo -n "MySQL: "
	@docker exec ainus_mysql mysqladmin ping -h localhost -u root -proot_password_change_me --silent && echo "✅" || echo "❌"
	@echo -n "Elasticsearch: "
	@curl -s http://localhost:9200/_cluster/health > /dev/null && echo "✅" || echo "❌"
	@echo -n "Redis: "
	@docker exec ainus_redis redis-cli ping > /dev/null && echo "✅" || echo "❌"
