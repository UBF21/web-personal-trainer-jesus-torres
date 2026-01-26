# ============================================
# Personal Trainer Web - Makefile
# ============================================

.PHONY: help dev build start stop restart logs shell clean prune install lint

# Default target
.DEFAULT_GOAL := help

# Variables
APP_NAME := personal-trainer
DEV_CONTAINER := personal-trainer-dev
PROD_CONTAINER := personal-trainer-prod

# ============================================
# Help
# ============================================
help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ============================================
# Development
# ============================================
dev: ## Start development server with hot reload
	docker compose --profile dev up --build

dev-d: ## Start development server in background
	docker compose --profile dev up --build -d

dev-stop: ## Stop development server
	docker compose --profile dev down

# ============================================
# Production
# ============================================
build: ## Build production Docker image
	docker compose build app

up: ## Start production server (foreground)
	docker compose up app

start: ## Start production server (background)
	docker compose up -d app

stop: ## Stop production server
	docker compose down

restart: stop start ## Restart production server

# ============================================
# Logs & Shell
# ============================================
logs: ## Show production container logs
	docker logs -f $(PROD_CONTAINER)

logs-dev: ## Show development container logs
	docker logs -f $(DEV_CONTAINER)

shell: ## Open shell in production container
	docker exec -it $(PROD_CONTAINER) /bin/sh

shell-dev: ## Open shell in development container
	docker exec -it $(DEV_CONTAINER) /bin/sh

# ============================================
# Local Development (without Docker)
# ============================================
install: ## Install dependencies locally
	npm ci

run: ## Run development server locally
	npm run dev

lint: ## Run linter
	npm run lint

build-local: ## Build for production locally
	npm run build

preview: ## Preview production build locally
	npm run preview

# ============================================
# Cleanup
# ============================================
clean: ## Stop all containers and remove volumes
	docker compose --profile dev down -v --remove-orphans

prune: ## Remove unused Docker resources
	docker system prune -f
	docker image prune -f

clean-all: clean prune ## Full cleanup (containers + unused resources)

# ============================================
# Maintenance Mode
# ============================================
maintenance-on: ## Enable maintenance mode and rebuild
	@sed -i '' 's/VITE_MAINTENANCE_MODE=false/VITE_MAINTENANCE_MODE=true/' .env
	@echo "Maintenance mode ENABLED"

maintenance-off: ## Disable maintenance mode and rebuild
	@sed -i '' 's/VITE_MAINTENANCE_MODE=true/VITE_MAINTENANCE_MODE=false/' .env
	@echo "Maintenance mode DISABLED"

maintenance-status: ## Check current maintenance mode status
	@grep VITE_MAINTENANCE_MODE .env

deploy-maintenance: maintenance-on build start ## Deploy in maintenance mode
	@echo "Deployed in MAINTENANCE mode"

deploy-live: maintenance-off build start ## Deploy in normal mode
	@echo "Deployed in LIVE mode"

# ============================================
# Status
# ============================================
status: ## Show container status
	@echo "=== Docker Containers ==="
	@docker ps -a --filter "name=$(APP_NAME)" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	@echo ""
	@echo "=== Docker Images ==="
	@docker images --filter "reference=*$(APP_NAME)*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
	@echo ""
	@echo "=== Maintenance Mode ==="
	@grep VITE_MAINTENANCE_MODE .env 2>/dev/null || echo "VITE_MAINTENANCE_MODE not set"
