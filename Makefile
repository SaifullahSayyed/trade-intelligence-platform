.PHONY: help up down up-dagster up-monitoring up-all ps logs reset migrate test clean

help:
	@echo "Trade Intelligence Platform - Commands:"
	@echo "  make up            - Start core datastores (PostgreSQL, ClickHouse, OpenSearch, Keycloak, MinIO)"
	@echo "  make up-dagster    - Start core + Dagster orchestration"
	@echo "  make up-monitoring - Start core + Prometheus + Grafana"
	@echo "  make up-all        - Start all services"
	@echo "  make down          - Stop all running services"
	@echo "  make ps            - Check container status"
	@echo "  make logs          - Tail container logs"
	@echo "  make migrate       - Run database migrations"
	@echo "  make test          - Run automated tests"
	@echo "  make reset         - Wipe all volumes and reset containers"

up:
	docker compose up -d postgres clickhouse opensearch opensearch-dashboards keycloak minio minio-init

up-dagster:
	docker compose --profile dagster up -d

up-monitoring:
	docker compose --profile monitoring up -d

up-all:
	docker compose --profile all up -d

down:
	docker compose --profile all down

ps:
	docker compose ps

logs:
	docker compose logs -f

migrate:
	@echo "Running PostgreSQL migrations..."
	@docker compose exec -T postgres psql -U ti_user -d trade_intelligence -f /docker-entrypoint-initdb.d/001_canonical_schema.sql
	@docker compose exec -T postgres psql -U ti_user -d trade_intelligence -f /docker-entrypoint-initdb.d/002_auth_schema.sql
	@docker compose exec -T postgres psql -U ti_user -d trade_intelligence -f /docker-entrypoint-initdb.d/003_audit_log.sql
	@echo "Migrations complete."

test:
	pytest tests/ -v

reset:
	docker compose --profile all down -v
