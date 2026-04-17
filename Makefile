.PHONY: up down logs shell migrate seed reset build test lint clean help

# Default
all: up

# Start everything (build + run), auto-setup on first clone
up:
	@[ -f .env ] || cp .env.example .env
	@[ -f backend/.env ] || cp backend/.env.example backend/.env
	@echo "🚀 Starting Vulcan stack..."
	docker compose up -d --build
	@echo "⏳ Waiting for backend and database to be ready..."
	@until docker compose exec -T backend sh -c "php artisan key:generate --force --quiet && php artisan migrate --seed --force" > /dev/null 2>&1; do sleep 3; done
	@echo "✅ Migrations complete"
	@echo ""
	@echo "✅ Frontend:   http://localhost:$${FRONTEND_PORT:-5173}"
	@echo "✅ Backend:    http://localhost:$${BACKEND_PORT:-8000}"
	@echo "✅ phpMyAdmin: http://localhost:$${PMA_PORT:-8080}"

# Stop everything
down:
	docker compose down
	@echo "🛑 Stopped Vulcan stack"

# Follow logs
logs:
	docker compose logs -f --tail=50

# Backend shell
shell:
	docker compose exec backend sh

# Frontend shell  
frontend-shell:
	docker compose exec frontend sh

# Laravel migrations
migrate:
	docker compose exec backend php artisan migrate --force

# Fresh migration + seed
reset:
	docker compose exec backend php artisan migrate:fresh --seed --force

# Seed database
seed:
	docker compose exec backend php artisan db:seed --force

# Build for production
build:
	docker compose build --no-cache
	docker compose up -d

# Run tests (PHPUnit + Vitest)
test:
	docker compose exec backend php artisan test
	docker compose exec frontend npm test

# Lint + format
lint:
	docker compose exec backend ./vendor/bin/pint --test
	docker compose exec frontend npm run lint

# Clean everything (volumes + images)
clean:
	docker compose down -v --remove-orphans --rmi all
	docker system prune -f

# Health check
health:
	@echo "🔍 Checking Vulcan health..."
	@curl -s http://localhost:8000/api/health || echo "❌ Backend down"
	@curl -s http://localhost:5173 || echo "❌ Frontend down"

# Help
help:
	@echo "Vulcan Monorepo Commands:"
	@echo "  make up          # 🚀 Start dev stack"
	@echo "  make down        # 🛑 Stop stack"
	@echo "  make logs        # 📋 Follow logs"
	@echo "  make migrate     # 💾 Run migrations"
	@echo "  make reset       # 🔄 Fresh DB + seed"
	@echo "  make shell       # 🖥️ Backend shell"
	@echo "  make test        # 🧪 Run all tests"
	@echo "  make lint        # 🔍 Lint code"
	@echo "  make clean       # 🧹 Clean everything"
	@echo "  make help        # This help"
