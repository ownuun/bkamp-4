#!/bin/bash

# BKAMP Services Vercel Deployment Script
# Usage: ./scripts/deploy.sh [app-name|all]

set -e

APPS=("portal" "marathon" "flipbook" "jansori" "jobhunt" "bluetree" "founders" "webtoon")
PROJECT_PREFIX="bkamp-4"

deploy_app() {
  local app=$1
  local project_name="${PROJECT_PREFIX}"

  if [ "$app" != "portal" ]; then
    project_name="${PROJECT_PREFIX}-${app}"
  fi

  echo "=========================================="
  echo "Deploying $app as $project_name"
  echo "=========================================="

  cd "apps/$app"

  # Link to Vercel project (creates new if not exists)
  vercel link --yes --project "$project_name" 2>/dev/null || \
    vercel link --yes

  # Deploy to production
  vercel deploy --prod

  cd ../..

  echo "Deployed $app successfully!"
  echo ""
}

if [ "$1" == "all" ] || [ -z "$1" ]; then
  echo "Deploying all BKAMP services..."
  for app in "${APPS[@]}"; do
    deploy_app "$app"
  done
  echo "All apps deployed!"
else
  if [[ " ${APPS[@]} " =~ " $1 " ]]; then
    deploy_app "$1"
  else
    echo "Unknown app: $1"
    echo "Available apps: ${APPS[*]}"
    exit 1
  fi
fi
